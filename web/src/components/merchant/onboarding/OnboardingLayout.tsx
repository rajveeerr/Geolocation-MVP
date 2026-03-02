import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

const INPUT_SELECTORS = 'input, textarea, select, [contenteditable="true"]';

interface OnboardingLayoutProps {
  children: ReactNode;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextDisabledReason?: string;
  showFooter?: boolean;
  /** Single progress 0–100 (legacy) */
  progress?: number;
  /** Per-chapter progress [c1, c2, c3, c4] 0–100 each. Takes precedence over progress. */
  chapterProgress?: [number, number, number] | [number, number, number, number];
}

export const OnboardingLayout = ({
  children,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  nextDisabledReason,
  showFooter = true,
  progress = 0,
  chapterProgress,
}: OnboardingLayoutProps) => {
  const { toast } = useToast();

  const handleNextClick = useCallback(() => {
    if (nextDisabled && nextDisabledReason) {
      toast({
        title: 'Complete this step',
        description: nextDisabledReason,
        variant: 'warn',
      });
      return;
    }
    onNext?.();
  }, [nextDisabled, nextDisabledReason, onNext, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping = active?.matches?.(INPUT_SELECTORS);
      if (isTyping) return;

      if (e.key === 'Enter' && !e.shiftKey && onNext) {
        e.preventDefault();
        handleNextClick();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextClick, onBack]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Minimal navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            to={PATHS.MERCHANT_DASHBOARD}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Save & exit
          </Link>
        </div>
      </header>

      {/* Main content - scrolls when tall (e.g. map) so footer stays visible */}
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>

      {/* Footer with progress bar */}
      {showFooter && (
        <footer className="sticky bottom-0 bg-white">
          <div className="flex h-2 w-full gap-1 rounded-sm">
            {chapterProgress ? (
              chapterProgress.map((pct, i) => (
                <div
                  key={i}
                  className="relative flex-1 overflow-hidden rounded-sm bg-neutral-200"
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-l-sm bg-neutral-900"
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              ))
            ) : (
              <div className="flex flex-1 overflow-hidden">
                <motion.div
                  className="h-full rounded-l-sm bg-neutral-900"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-4 md:px-6">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              Back
            </button>
            {onNext && (
              <Button
                onClick={handleNextClick}
                variant="primary"
                className="rounded-full px-6"
              >
                {nextLabel}
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

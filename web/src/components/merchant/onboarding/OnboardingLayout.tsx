import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';
import { TOTAL_STEPS, getStepLabel } from '@/context/MerchantOnboardingContext';

const INPUT_SELECTORS = 'input, textarea, select, [contenteditable="true"]';

interface OnboardingLayoutProps {
  children: ReactNode;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextDisabledReason?: string;
  showFooter?: boolean;
  currentStep: number;
}

export const OnboardingLayout = ({
  children,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  nextDisabledReason,
  showFooter = true,
  currentStep,
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

  const progressPercent = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Minimal navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-500 sm:block">
            Step {currentStep + 1} of {TOTAL_STEPS} — {getStepLabel(currentStep)}
          </span>
          <Link
            to={PATHS.MERCHANT_DASHBOARD}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Save & exit
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>

      {/* Footer with progress bar */}
      {showFooter && (
        <footer className="sticky bottom-0 bg-white">
          <div className="flex h-2 w-full overflow-hidden rounded-sm bg-neutral-200">
            <motion.div
              className="h-full rounded-l-sm bg-neutral-900"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-4 md:px-6">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500 sm:hidden">
                {currentStep + 1}/{TOTAL_STEPS}
              </span>
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
          </div>
        </footer>
      )}
    </div>
  );
};

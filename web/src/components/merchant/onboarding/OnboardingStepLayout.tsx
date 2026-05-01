// src/components/merchant/onboarding/OnboardingStepLayout.tsx
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void | Promise<void>;
  onBack: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  progress: number; // e.g., 33 for 33%
  nextButtonText?: string;
  contentClassName?: string;
}

export const OnboardingStepLayout = ({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  isNextDisabled,
  isLoading = false,
  progress,
  nextButtonText,
  contentClassName,
}: Props) => {
  return (
    <div className="relative -mx-4 -my-5 flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden bg-[#f5f5f7] sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,2,3,0.12),transparent_44%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.06),transparent_40%),linear-gradient(180deg,#fbfbfc_0%,#f7f7f9_52%,#f5f5f7_100%)]" />
        <div className="absolute left-[-10rem] top-24 h-72 w-72 rounded-full bg-[hsl(var(--brand-100))]/45 blur-3xl" />
        <div className="absolute right-[-7rem] top-8 h-80 w-80 rounded-full bg-slate-200/55 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative flex flex-grow items-center justify-center px-4 py-8 pb-32 sm:px-6 sm:pb-36 lg:px-8"
      >
        <div className={contentClassName ?? 'w-full max-w-3xl'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="mb-6 text-left"
          >
            <h1 className="max-w-[16ch] text-balance font-serif text-[2rem] font-semibold leading-[0.95] tracking-tight text-neutral-900 sm:text-[2.3rem] lg:max-w-none lg:text-[2.55rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 max-w-3xl text-[14px] leading-6 text-neutral-600 sm:text-[15px] lg:text-base">
                {subtitle}
              </p>
            ) : null}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200/80 bg-white/92 backdrop-blur-xl shadow-[0_-14px_30px_rgba(15,23,42,0.10)] lg:left-[320px] lg:w-[calc(100%-320px)]">
        <div className="h-1.5 bg-neutral-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-1.5 bg-[hsl(var(--brand-primary))]"
          />
        </div>
        <div className="mx-auto flex h-24 w-full max-w-screen-xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Button
            variant="secondary"
            onClick={onBack}
            className="h-11 rounded-2xl border-neutral-300 bg-white px-6 text-neutral-700 shadow-none hover:border-neutral-400 hover:bg-neutral-50"
            disabled={isLoading}
          >
            Back
          </Button>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-500 sm:block">
              {progress}% Complete
            </div>
            <Button
              variant="ghost"
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className="flex min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-[hsl(var(--brand-primary))] px-6 text-white shadow-[0_14px_30px_hsl(var(--brand-primary)/0.33)] hover:bg-[hsl(var(--brand-primary-hover))] hover:text-white disabled:opacity-100 disabled:bg-neutral-200 disabled:text-neutral-700 disabled:shadow-none disabled:hover:bg-neutral-200 disabled:hover:text-neutral-700"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                nextButtonText || 'Next'
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

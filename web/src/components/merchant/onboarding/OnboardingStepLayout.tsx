// src/components/merchant/onboarding/OnboardingStepLayout.tsx
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

export type WizardStep = {
  /** 1-based index of the current step */
  current: number;
  total: number;
};

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void | Promise<void>;
  onBack: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  /** When set, shows a step indicator above the title (omit on one-off screens like deal type picker). */
  wizardStep?: WizardStep;
  nextButtonText?: string;
  contentClassName?: string;
}

function WizardStepper({ current, total }: WizardStep) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);

  return (
    <div
      className="mb-6 rounded-2xl border border-neutral-200/80 bg-white/90 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-sm ring-1 ring-neutral-900/[0.03]"
      role="navigation"
      aria-label={`Deal setup, step ${safeCurrent} of ${safeTotal}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[13px] font-semibold tracking-tight text-neutral-800">
          Step {safeCurrent} of {safeTotal}
        </p>
        <p className="text-[12px] font-medium text-neutral-500">
          {safeCurrent >= safeTotal
            ? 'Final step'
            : `${safeTotal - safeCurrent} step${safeTotal - safeCurrent === 1 ? '' : 's'} left`}
        </p>
      </div>
      <div
        className="mt-3.5 flex gap-1 sm:gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-label="Progress through deal setup steps"
      >
        {Array.from({ length: safeTotal }, (_, i) => {
          const stepNum = i + 1;
          const isComplete = stepNum < safeCurrent;
          const isCurrent = stepNum === safeCurrent;
          return (
            <div
              key={stepNum}
              className={cn(
                'h-2 min-h-[6px] min-w-[4px] flex-1 rounded-full transition-all duration-300 ease-out',
                stepNum <= safeCurrent
                  ? 'bg-[hsl(var(--brand-primary))]'
                  : 'bg-neutral-200/80',
                isCurrent && 'ring-2 ring-[hsl(var(--brand-primary))]/30 ring-offset-2 ring-offset-white',
                isComplete && 'opacity-90',
              )}
              title={`Step ${stepNum}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export const OnboardingStepLayout = ({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  isNextDisabled,
  isLoading = false,
  wizardStep,
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
        className="relative flex flex-grow items-center justify-center px-4 py-8 pb-28 sm:px-6 sm:pb-32 lg:px-8"
      >
        <div className={contentClassName ?? 'w-full max-w-3xl'}>
          {wizardStep ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <WizardStepper current={wizardStep.current} total={wizardStep.total} />
            </motion.div>
          ) : null}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: wizardStep ? 0.08 : 0.2, duration: 0.45 }}
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
            transition={{ delay: wizardStep ? 0.16 : 0.3, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200/80 bg-white/92 backdrop-blur-xl shadow-[0_-14px_30px_rgba(15,23,42,0.10)] lg:left-[320px] lg:w-[calc(100%-320px)]">
        <div className="mx-auto flex min-h-[5.5rem] w-full max-w-screen-xl items-center justify-between gap-4 px-4 py-4 sm:min-h-[6rem] sm:px-6 lg:px-8">
          <Button
            variant="secondary"
            onClick={onBack}
            className="h-11 rounded-2xl border-neutral-300 bg-white px-6 text-neutral-700 shadow-none hover:border-neutral-400 hover:bg-neutral-50"
            disabled={isLoading}
          >
            Back
          </Button>
          <div className="flex items-center gap-3 sm:gap-4">
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

// src/components/merchant/create-deal/quick-form/QuickFormLayout.tsx
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import type { WizardStep } from '../../onboarding/OnboardingStepLayout';

interface QuickFormLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Optional 1-based wizard step indicator. */
  wizardStep?: WizardStep;
  onBack: () => void;
  /** Primary action (Continue / Publish). */
  primary: {
    label: string;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    isLoading?: boolean;
  };
  /** Secondary action (Save Draft). Hidden when omitted. */
  secondary?: {
    label: string;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
  };
  contentClassName?: string;
}

function WizardStepper({ current, total }: WizardStep) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  return (
    <div
      className="mb-4 rounded-[1.45rem] border border-neutral-200/80 bg-white/95 px-5 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.045)]"
      role="navigation"
      aria-label={`Deal setup, step ${safeCurrent} of ${safeTotal}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[12px] font-semibold tracking-tight text-neutral-800">
          Step {safeCurrent} of {safeTotal}
        </p>
        <p className="text-[11px] font-medium text-neutral-500">
          {safeCurrent >= safeTotal
            ? 'Final step'
            : `${safeTotal - safeCurrent} left`}
        </p>
      </div>
      <div
        className="mt-2.5 flex gap-1"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
      >
        {Array.from({ length: safeTotal }, (_, i) => {
          const stepNum = i + 1;
          return (
            <div
              key={stepNum}
              className={cn(
                'h-1.5 min-w-[4px] flex-1 rounded-full transition-all duration-300',
                stepNum <= safeCurrent ? 'bg-[hsl(var(--brand-primary))]' : 'bg-neutral-200/80',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Wrapper for the new long-form deal creation flow. Footer supports a
 * primary action ("Publish deal" on the final step / "Continue" earlier)
 * plus an optional secondary "Save as draft" CTA — matching the mockup.
 */
export const QuickFormLayout = ({
  title,
  subtitle,
  children,
  wizardStep,
  onBack,
  primary,
  secondary,
  contentClassName,
}: QuickFormLayoutProps) => {
  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] flex-col">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative flex flex-grow justify-center px-3 py-3 pb-24 sm:px-4 sm:py-4 sm:pb-24"
      >
        <div className={cn(contentClassName ?? 'w-full max-w-6xl', 'mx-auto')}>
          {wizardStep ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WizardStepper current={wizardStep.current} total={wizardStep.total} />
            </motion.div>
          ) : null}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.35 }}
            className="mb-5 text-left"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Deals
            </div>
            <h1 className="mt-1.5 text-balance text-[1.65rem] font-semibold leading-tight tracking-tight text-neutral-900 sm:text-[1.85rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-neutral-600 sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200/80 bg-white/95 backdrop-blur-xl shadow-[0_-6px_20px_rgba(15,23,42,0.06)] lg:left-[320px] lg:w-[calc(100%-320px)]">
        <div className="mx-auto flex min-h-[3.75rem] w-full max-w-screen-xl items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
          <Button
            variant="secondary"
            onClick={onBack}
            className="h-9 rounded-xl border-neutral-300 bg-white px-4 text-[13px] text-neutral-700 shadow-none hover:border-neutral-400 hover:bg-neutral-50"
            disabled={primary.isLoading}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            {secondary ? (
              <Button
                variant="secondary"
                onClick={secondary.onClick}
                disabled={secondary.disabled || primary.isLoading}
                className="h-9 rounded-xl border-neutral-300 bg-white px-3.5 text-[13px] text-neutral-700 shadow-none hover:border-neutral-400 hover:bg-neutral-50"
              >
                {secondary.label}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={primary.onClick}
              disabled={primary.disabled || primary.isLoading}
              className="flex h-9 min-w-[130px] items-center justify-center gap-1.5 rounded-xl bg-[hsl(var(--brand-primary))] px-4 text-[13px] font-semibold text-white shadow-[0_6px_18px_hsl(var(--brand-primary)/0.28)] hover:bg-[hsl(var(--brand-primary-hover))] hover:text-white disabled:opacity-100 disabled:bg-neutral-200 disabled:text-neutral-700 disabled:shadow-none disabled:hover:bg-neutral-200 disabled:hover:text-neutral-700"
            >
              {primary.isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Working…</span>
                </>
              ) : (
                primary.label
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

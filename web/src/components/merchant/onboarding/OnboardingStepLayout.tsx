// src/components/merchant/onboarding/OnboardingStepLayout.tsx
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Layers3, Sparkles } from 'lucide-react';
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
    <div className="relative flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden bg-[#f7f1e8]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(circle_at_top_left,rgba(255,132,93,0.22),transparent_42%),radial-gradient(circle_at_top_right,rgba(33,74,117,0.16),transparent_38%),linear-gradient(180deg,#fff8f1_0%,#f7f1e8_58%,#f4ede3_100%)]" />
        <div className="absolute left-[-8rem] top-40 h-64 w-64 rounded-full bg-[#ffb08a]/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-20 h-72 w-72 rounded-full bg-[#8bb8d9]/18 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative flex flex-grow items-center justify-center px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className={contentClassName ?? 'w-full max-w-3xl'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-[0_24px_70px_rgba(70,52,37,0.10)] backdrop-blur-xl sm:p-7 lg:p-8"
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px] xl:items-start xl:justify-between">
              <div className="min-w-0 max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f0d6c8] bg-[#fff6f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b85b3f]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Commerce Flow
                </div>
                <h1 className="mt-4 max-w-[12ch] text-balance font-serif text-[2.15rem] font-semibold leading-[0.9] tracking-tight text-[#1f3147] sm:text-[2.45rem] lg:max-w-none lg:text-[2.7rem]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5e6c7f] sm:text-base lg:text-lg">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="w-full rounded-[1.5rem] border border-[#eadfd3] bg-white/85 p-4 text-left shadow-[0_10px_30px_rgba(70,52,37,0.07)] sm:max-w-sm xl:ml-auto xl:max-w-[240px]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93a0af]">
                  Active Section
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,#24384f_0%,#1b2c40_100%)] text-white shadow-[0_10px_22px_rgba(31,49,71,0.22)] ring-1 ring-white/40">
                    <Layers3 className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold leading-5 text-[#1f3147]">Deal setup</div>
                    <div className="mt-1 text-sm leading-7 text-[#6d7b8d]">
                      Shape the offer, fine-tune the details, and publish with confidence.
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
      <footer className="sticky bottom-0 z-20 border-t border-[#eadfd3] bg-[rgba(255,248,241,0.88)] backdrop-blur-xl shadow-[0_-12px_30px_rgba(51,37,25,0.08)]">
        <div className="h-1.5 bg-[#efe4d8]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-1.5 bg-gradient-to-r from-[#ff8a66] via-[#ff6b57] to-[#f2545b]"
          />
        </div>
        <div className="mx-auto flex h-24 w-full max-w-screen-xl items-center justify-between gap-4 px-4 sm:px-6">
          <Button
            variant="secondary"
            onClick={onBack}
            className="h-11 rounded-2xl border-[#efcfc1] bg-white/90 px-6 text-[#3f4b5f] shadow-none hover:border-[#e8b9a2] hover:bg-[#fff5ee]"
            disabled={isLoading}
          >
            Back
          </Button>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden rounded-full border border-[#ecdccf] bg-white/80 px-4 py-2 text-sm font-medium text-[#64748b] sm:block">
              {progress}% Complete
            </div>
            <Button
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className="flex min-w-[118px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff8a66] via-[#ff6f61] to-[#f45b69] px-6 text-white shadow-[0_14px_30px_rgba(244,91,105,0.28)] hover:from-[#ff7c55] hover:via-[#ff6555] hover:to-[#eb4f62]"
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

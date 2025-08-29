// src/components/merchant/onboarding/OnboardingStepLayout.tsx
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Props {
  title: string;
  children: ReactNode;
  onNext: () => void;
  onBack: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  progress: number; // e.g., 33 for 33%
}

export const OnboardingStepLayout = ({
  title,
  children,
  onNext,
  onBack,
  isNextDisabled,
  isLoading = false,
  progress,
}: Props) => {
  return (
    <div className="flex h-full min-h-[calc(100vh-5rem)] flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-grow items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 text-center text-3xl font-bold text-neutral-800"
          >
            {title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white shadow-lg">
        <div className="h-2 bg-neutral-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-2 bg-gradient-to-r from-brand-primary-400 to-brand-primary-600"
          />
        </div>
        <div className="container mx-auto flex h-20 max-w-screen-xl items-center justify-between px-6">
          <Button
            variant="secondary"
            onClick={onBack}
            className="rounded-lg px-6"
            disabled={isLoading}
          >
            Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-600">
              {progress}% Complete
            </span>
            <Button
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className="flex min-w-[100px] items-center justify-center gap-2 rounded-lg px-6"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

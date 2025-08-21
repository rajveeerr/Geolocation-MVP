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

export const OnboardingStepLayout = ({ title, children, onNext, onBack, isNextDisabled, isLoading = false, progress }: Props) => {
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-5rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-grow flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-lg">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold text-neutral-800 mb-8 text-center"
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
      <footer className="sticky bottom-0 bg-white border-t border-neutral-200 shadow-lg">
        <div className="h-2 bg-neutral-200">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-2 bg-gradient-to-r from-brand-primary-400 to-brand-primary-600"
          />
        </div>
        <div className="container mx-auto max-w-screen-xl px-6 h-20 flex items-center justify-between">
          <Button 
            variant="secondary" 
            onClick={onBack} 
            className="rounded-lg px-6"
            disabled={isLoading}
          >
            Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 font-medium">
              {progress}% Complete
            </span>
            <Button 
              onClick={onNext} 
              disabled={isNextDisabled || isLoading} 
              className="rounded-lg px-6 min-w-[100px] flex items-center justify-center gap-2"
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

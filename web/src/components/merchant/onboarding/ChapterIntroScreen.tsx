import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { OnboardingLayout } from './OnboardingLayout';
import { getChapterProgress, getChapterStepNumber } from '@/context/MerchantOnboardingContext';

interface ChapterIntroScreenProps {
  title: string;
  description: string;
  illustration?: ReactNode;
  step: number;
  onNext: () => void;
  onBack: () => void;
}

export const ChapterIntroScreen = ({
  title,
  description,
  illustration,
  step,
  onNext,
  onBack,
}: ChapterIntroScreenProps) => {
  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={onBack}
      onNext={onNext}
      nextLabel="Next"
      nextDisabled={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-2xl px-6 py-12 md:py-16"
      >
        {getChapterStepNumber(step) != null && (
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Step {getChapterStepNumber(step)}
          </p>
        )}
        <h1 className="mt-2 font-heading text-3xl font-black leading-tight text-neutral-900 md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-neutral-600">{description}</p>

        {illustration && (
          <div className="mt-12 flex w-full justify-center px-2">{illustration}</div>
        )}
      </motion.div>
    </OnboardingLayout>
  );
};

import { motion } from 'framer-motion';
import { Store, Image, CheckCircle, MapPin } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';

const CHAPTERS = [
  {
    title: 'Tell us about your business',
    description: 'Share your business details. We’ll help you get discovered by customers looking for deals.',
    icon: Store,
  },
  {
    title: 'Make it stand out',
    description: 'Add your logo, description, and photos. Venues that stand out get more check-ins and deal saves.',
    icon: Image,
  },
  {
    title: 'Finish up and publish',
    description: "Add contact info so customers can reach you. Then add your location and we'll review everything before submitting.",
    icon: CheckCircle,
  },
  {
    title: 'Add your location',
    description: 'Tell us about this venue — address, hours, and details. Need more locations? Create or manage them anytime from Settings → Stores.',
    icon: MapPin,
  },
];

export const WelcomeScreen = ({ onNext }: { onNext: () => void }) => {
  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(0)}
      onBack={() => {}}
      showFooter={true}
      onNext={onNext}
      nextLabel="Get started"
      nextDisabled={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl px-6 py-12 md:py-16"
      >
        <h1 className="font-heading text-3xl font-black leading-tight text-neutral-900 md:text-4xl">
          It&apos;s easy to get started on Yohop
        </h1>

        <div className="mt-10 space-y-6">
          {CHAPTERS.map((chapter, i) => (
            <motion.div
              key={chapter.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (i + 1), duration: 0.4 }}
              className="flex items-start gap-4"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary-50">
                <chapter.icon className="h-6 w-6 text-brand-primary-600" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-neutral-900">
                  {i + 1}. {chapter.title}
                </h2>
                <p className="mt-0.5 text-neutral-600">{chapter.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </OnboardingLayout>
  );
};

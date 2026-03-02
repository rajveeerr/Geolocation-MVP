import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { Textarea } from '@/components/ui/textarea';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';

export const BusinessAboutStep = () => {
  const { state, dispatch } = useOnboarding();
  const step = 6;

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={() => dispatch({ type: 'SET_STEP', payload: step - 1 })}
      onNext={() => dispatch({ type: 'SET_STEP', payload: step + 1 })}
      nextLabel="Next"
      nextDisabled={false}
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Describe your venue
        </h1>
        <p className="mt-2 text-neutral-600">
          This appears on your profile and deal pages when customers discover you.
        </p>

        <div className="mt-8">
          <Textarea
            value={state.description}
            onChange={(e) =>
              dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })
            }
            placeholder="What makes your place special? Cuisine, atmosphere, happy hours, events..."
            className="min-h-[160px] rounded-2xl border-neutral-300 text-base focus:border-brand-primary-500 focus:ring-brand-primary-500"
            rows={6}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

/**
 * Single step of store registration wrapped in OnboardingLayout.
 * Used in merchant onboarding flow.
 */
import { OnboardingLayout } from '../onboarding/OnboardingLayout';
import { StoreRegistrationStepContent } from './StoreRegistrationStepContent';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { useWhitelistedCities } from '@/hooks/useWhitelistedCities';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';
import { getDefaultFirstStore } from './storeRegistrationTypes';

interface StoreRegistrationStepProps {
  stepIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  merchantPhone?: string;
  merchantEmail?: string;
}

export function StoreRegistrationStep({
  stepIndex,
  onNext,
  onBack,
  canProceed,
  merchantPhone,
  merchantEmail,
}: StoreRegistrationStepProps) {
  const { state, dispatch } = useOnboarding();
  const { data: citiesData } = useWhitelistedCities();
  const cities = citiesData?.cities ?? [];

  const storeData = state.firstStore ?? getDefaultFirstStore();

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(13 + stepIndex)}
      onBack={onBack}
      onNext={onNext}
      nextLabel={stepIndex === 11 ? 'Continue to review' : 'Next'}
      nextDisabled={!canProceed}
      nextDisabledReason={
        stepIndex === 0
          ? 'Search and select an address in a supported city.'
          : stepIndex === 1
            ? 'Confirm your address and location on the map.'
            : stepIndex === 2
              ? 'Position the pin at the correct spot.'
              : stepIndex === 3
                ? 'Enter a name for this location.'
                : stepIndex === 4
                  ? 'Select the store type.'
                  : stepIndex === 5
                    ? 'Enter the store phone number.'
                    : undefined
      }
      showFooter
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <StoreRegistrationStepContent
          stepIndex={stepIndex}
          data={storeData}
          onUpdate={(data) => dispatch({ type: 'SET_FIRST_STORE', payload: data })}
          cities={cities}
          merchantPhone={merchantPhone}
          merchantEmail={merchantEmail}
        />
      </div>
    </OnboardingLayout>
  );
}

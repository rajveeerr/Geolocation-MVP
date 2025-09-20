import { OnboardingProvider, useOnboarding } from '@/context/MerchantOnboardingContext';
import { CitySelectionStep } from '@/components/merchant/onboarding/CitySelectionStep';
import { BusinessInfoStep } from '@/components/merchant/onboarding/BusinessInfoStep';
import { BusinessCategoryStep } from '@/components/merchant/onboarding/BusinessCategoryStep';
import { BusinessDetailsStep } from '@/components/merchant/onboarding/BusinessDetailsStep';
import { MapAddressStep } from '@/components/merchant/onboarding/MapAddressStep';
import { FinalReviewStep } from '@/components/merchant/onboarding/FinalReviewStep';

const OnboardingFlow = () => {
  const { state } = useOnboarding();
  switch (state.step) {
    case 1: return <CitySelectionStep />;
    case 2: return <BusinessInfoStep />;
    case 3: return <BusinessCategoryStep />;
    case 4: return <BusinessDetailsStep />;
    case 5: return <MapAddressStep />;
    case 6: return <FinalReviewStep />;
    default: return <CitySelectionStep />;
  }
};

export const MerchantOnboardingPage = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

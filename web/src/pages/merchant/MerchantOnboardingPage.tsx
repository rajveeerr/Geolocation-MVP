import { OnboardingProvider, useOnboarding } from '@/context/MerchantOnboardingContext';
import { BusinessInfoStep } from '@/components/merchant/onboarding/BusinessInfoStep';
import { BusinessCategoryStep } from '@/components/merchant/onboarding/BusinessCategoryStep';
import { MapAddressStep } from '@/components/merchant/onboarding/MapAddressStep';
import { FinalReviewStep } from '@/components/merchant/onboarding/FinalReviewStep';
import { BusinessDetailsStep } from '@/components/merchant/onboarding/BusinessDetailsStep';

const OnboardingFlow = () => {
  const { state } = useOnboarding();
  switch (state.step) {
    case 1: return <BusinessInfoStep />;      
    case 2: return <BusinessCategoryStep />;  
    case 3: return <BusinessDetailsStep />;   
    case 4: return <MapAddressStep />;        
    case 5: return <FinalReviewStep />;       
    default: return <BusinessInfoStep />;
  }
};

export const MerchantOnboardingPage = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

// src/pages/merchant/MerchantOnboardingPage.tsx
import {
  OnboardingProvider,
  useOnboarding,
} from '@/context/MerchantOnboardingContext';
import { BusinessInfoStep } from '@/components/merchant/onboarding/BusinessInfoStep';
import { AddressStep } from '@/components/merchant/onboarding/AddressStep';
import { MapConfirmationStep } from '@/components/merchant/onboarding/MapConfirmationStep';
import { BusinessDetailsStep } from '@/components/merchant/onboarding/BusinessDetailsStep';

// A new component to render the current step
const OnboardingFlow = () => {
  const { state } = useOnboarding();

  switch (state.step) {
    case 1:
      return <BusinessInfoStep />;
    case 2:
      return <AddressStep />;
    case 3:
      return <BusinessDetailsStep />;
    case 4:
      return <MapConfirmationStep />;
    default:
      return <BusinessInfoStep />; // Default to first step
  }
};

export const MerchantOnboardingPage = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

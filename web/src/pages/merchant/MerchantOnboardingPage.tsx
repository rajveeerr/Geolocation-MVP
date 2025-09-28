import { OnboardingProvider, useOnboarding } from '@/context/MerchantOnboardingContext';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { BusinessInfoStep } from '@/components/merchant/onboarding/BusinessInfoStep';
import { BusinessCategoryStep } from '@/components/merchant/onboarding/BusinessCategoryStep';
import { BusinessDetailsStep } from '@/components/merchant/onboarding/BusinessDetailsStep';
import { MapAddressStep } from '@/components/merchant/onboarding/MapAddressStep';
import { FinalReviewStep } from '@/components/merchant/onboarding/FinalReviewStep';

const OnboardingFlow = () => {
  const { state } = useOnboarding();
  // New 5-step flow: 1=BusinessInfo, 2=BusinessCategory, 3=BusinessDetails, 4=MapAddress, 5=FinalReview
  switch (state.step) {
    case 1:
      return <BusinessInfoStep />;
    case 2:
      return <BusinessCategoryStep />;
    case 3:
      return <BusinessDetailsStep />;
    case 4:
      return <MapAddressStep />;
    case 5:
      return <FinalReviewStep />;
    default:
      return <BusinessInfoStep />;
  }
};

export const MerchantOnboardingPage = () => {
  const { data: merchantData, isLoading } = useMerchantStatus();
  const navigate = useNavigate();

  useEffect(() => {
    const status = merchantData?.data?.merchant?.status;
    if (!isLoading && status === 'APPROVED') {
      navigate(PATHS.MERCHANT_DASHBOARD);
    }
  }, [merchantData, isLoading, navigate]);

  // If approved, don't render the onboarding flow (we navigate away).
  if (merchantData?.data?.merchant?.status === 'APPROVED') {
    return null;
  }

  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

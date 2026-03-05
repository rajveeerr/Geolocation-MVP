import { OnboardingProvider, useOnboarding } from '@/context/MerchantOnboardingContext';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { BusinessProfileScreen } from '@/components/merchant/onboarding/screens/BusinessProfileScreen';
import { StoreDetailsScreen } from '@/components/merchant/onboarding/screens/StoreDetailsScreen';
import { ReviewPublishScreen } from '@/components/merchant/onboarding/screens/ReviewPublishScreen';

const OnboardingFlow = () => {
  const { state } = useOnboarding();

  switch (state.step) {
    case 0:
      return <BusinessProfileScreen />;
    case 1:
      return <StoreDetailsScreen />;
    case 2:
      return <ReviewPublishScreen />;
    default:
      return <BusinessProfileScreen />;
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

  if (merchantData?.data?.merchant?.status === 'APPROVED') {
    return null;
  }

  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

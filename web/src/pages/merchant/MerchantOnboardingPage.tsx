import { OnboardingProvider, useOnboarding } from '@/context/MerchantOnboardingContext';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { WelcomeScreen } from '@/components/merchant/onboarding/WelcomeScreen';
import { ChapterIntroScreen } from '@/components/merchant/onboarding/ChapterIntroScreen';
import { BusinessInfoStep } from '@/components/merchant/onboarding/BusinessInfoStep';
import { BusinessCategoryStep } from '@/components/merchant/onboarding/BusinessCategoryStep';
import { BusinessTypeStep } from '@/components/merchant/onboarding/BusinessTypeStep';
import { BusinessAboutStep } from '@/components/merchant/onboarding/BusinessAboutStep';
import { VibeTagsStep } from '@/components/merchant/onboarding/VibeTagsStep';
import { AmenitiesStep } from '@/components/merchant/onboarding/AmenitiesStep';
import { MediaStep } from '@/components/merchant/onboarding/MediaStep';
import { ContactSocialStep } from '@/components/merchant/onboarding/ContactSocialStep';
import { FinalReviewStep } from '@/components/merchant/onboarding/FinalReviewStep';
import { OnboardingStepIllustration } from '@/components/merchant/onboarding/OnboardingStepIllustration';

const OnboardingFlow = () => {
  const { state, dispatch } = useOnboarding();

  switch (state.step) {
    case 0:
      return <WelcomeScreen onNext={() => dispatch({ type: 'SET_STEP', payload: 1 })} />;
    case 1:
      return (
        <ChapterIntroScreen
          title="Tell us about your business"
          description="Share your business name, type, and category. This helps us surface your deals to the right customers."
          step={1}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 2 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 0 })}
          illustration={<OnboardingStepIllustration variant="business" />}
        />
      );
    case 2:
      return <BusinessInfoStep />;
    case 3:
      return <BusinessCategoryStep />;
    case 4:
      return <BusinessTypeStep />;
    case 5:
      return (
        <ChapterIntroScreen
          title="Make it stand out"
          description="Add your logo, description, and photos. Venues that stand out get more check-ins and deal saves."
          step={5}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 6 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 4 })}
          illustration={<OnboardingStepIllustration variant="standout" />}
        />
      );
    case 6:
      return <BusinessAboutStep />;
    case 7:
      return <VibeTagsStep />;
    case 8:
      return <AmenitiesStep />;
    case 9:
      return <MediaStep />;
    case 10:
      return (
        <ChapterIntroScreen
          title="Finish up and publish"
          description="Add contact info so customers can reach you. Then review and submit — you'll add locations from the dashboard after approval."
          step={10}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 11 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 9 })}
          illustration={<OnboardingStepIllustration variant="finish" />}
        />
      );
    case 11:
      return <ContactSocialStep />;
    case 12:
      return <FinalReviewStep />;
    default:
      return <WelcomeScreen onNext={() => dispatch({ type: 'SET_STEP', payload: 1 })} />;
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

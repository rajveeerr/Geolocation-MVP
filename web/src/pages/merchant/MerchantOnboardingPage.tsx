import { OnboardingProvider, useOnboarding } from '@/context/MerchantOnboardingContext';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { StoreRegistrationStep } from '@/components/merchant/store-registration/StoreRegistrationStep';
import { MapPin } from 'lucide-react';

const OnboardingFlow = () => {
  const { state, dispatch } = useOnboarding();

  // Pre-fill first store with merchant business name and phone when entering store flow
  useEffect(() => {
    if (state.step >= 12 && state.firstStore === null) {
      dispatch({
        type: 'SET_FIRST_STORE',
        payload: {
          businessName: state.businessName,
          phoneNumber: state.phoneNumber,
        },
      });
    }
  }, [state.step, state.firstStore, state.businessName, state.phoneNumber, dispatch]);

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
          description="Add contact info so customers can reach you. Then we'll add your first location and review everything before submitting."
          step={10}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 11 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 9 })}
          illustration={<OnboardingStepIllustration variant="finish" />}
        />
      );
    case 11:
      return <ContactSocialStep />;
    case 12:
      return (
        <ChapterIntroScreen
          title="Add your location"
          description="Tell us about this venue — address, hours, and details. Customers will use this to find you and use your deals."
          hint={
            <>
              Have multiple locations?{' '}
              <Link to={PATHS.MERCHANT_STORES} className="font-medium text-brand-primary-600 hover:underline">
                Create or manage stores
              </Link>{' '}
              anytime from the dashboard.
            </>
          }
          step={12}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 13 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 11 })}
          illustration={
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-brand-primary-50">
              <MapPin className="h-16 w-16 text-brand-primary-600" />
            </div>
          }
        />
      );
    case 13:
      return (
        <StoreRegistrationStep
          stepIndex={0}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 14 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 12 })}
          canProceed={
            !!(
              state.firstStore?.address &&
              state.firstStore?.cityId &&
              state.firstStore?.latitude &&
              state.firstStore?.longitude
            )
          }
          merchantPhone={state.phoneNumber}
          merchantEmail={undefined}
        />
      );
    case 14:
      return (
        <StoreRegistrationStep
          stepIndex={1}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 15 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 13 })}
          canProceed={
            !!(
              state.firstStore?.address &&
              state.firstStore?.cityId &&
              state.firstStore?.latitude &&
              state.firstStore?.longitude
            )
          }
          merchantPhone={state.phoneNumber}
          merchantEmail={undefined}
        />
      );
    case 15:
      return (
        <StoreRegistrationStep
          stepIndex={2}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 16 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 14 })}
          canProceed={
            !!(state.firstStore?.latitude && state.firstStore?.longitude)
          }
          merchantPhone={state.phoneNumber}
          merchantEmail={undefined}
        />
      );
    case 16:
      return (
        <StoreRegistrationStep
          stepIndex={3}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 17 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 15 })}
          canProceed={!!state.firstStore?.businessName}
          merchantPhone={state.phoneNumber}
          merchantEmail={undefined}
        />
      );
    case 17:
      return (
        <StoreRegistrationStep
          stepIndex={4}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 18 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 16 })}
          canProceed={!!state.firstStore?.storeType}
          merchantPhone={state.phoneNumber}
          merchantEmail={undefined}
        />
      );
    case 18:
      return (
        <StoreRegistrationStep
          stepIndex={5}
          onNext={() => dispatch({ type: 'SET_STEP', payload: 19 })}
          onBack={() => dispatch({ type: 'SET_STEP', payload: 17 })}
          canProceed={!!state.firstStore?.phoneNumber}
          merchantPhone={state.phoneNumber}
          merchantEmail={undefined}
        />
      );
    case 19:
      return (
        <StoreRegistrationStep stepIndex={6} onNext={() => dispatch({ type: 'SET_STEP', payload: 20 })} onBack={() => dispatch({ type: 'SET_STEP', payload: 18 })} canProceed={true} merchantPhone={state.phoneNumber} merchantEmail={undefined} />
      );
    case 20:
      return (
        <StoreRegistrationStep stepIndex={7} onNext={() => dispatch({ type: 'SET_STEP', payload: 21 })} onBack={() => dispatch({ type: 'SET_STEP', payload: 19 })} canProceed={true} merchantPhone={state.phoneNumber} merchantEmail={undefined} />
      );
    case 21:
      return (
        <StoreRegistrationStep stepIndex={8} onNext={() => dispatch({ type: 'SET_STEP', payload: 22 })} onBack={() => dispatch({ type: 'SET_STEP', payload: 20 })} canProceed={true} merchantPhone={state.phoneNumber} merchantEmail={undefined} />
      );
    case 22:
      return (
        <StoreRegistrationStep stepIndex={9} onNext={() => dispatch({ type: 'SET_STEP', payload: 23 })} onBack={() => dispatch({ type: 'SET_STEP', payload: 21 })} canProceed={true} merchantPhone={state.phoneNumber} merchantEmail={undefined} />
      );
    case 23:
      return (
        <StoreRegistrationStep stepIndex={10} onNext={() => dispatch({ type: 'SET_STEP', payload: 24 })} onBack={() => dispatch({ type: 'SET_STEP', payload: 22 })} canProceed={true} merchantPhone={state.phoneNumber} merchantEmail={undefined} />
      );
    case 24:
      return (
        <StoreRegistrationStep stepIndex={11} onNext={() => dispatch({ type: 'SET_STEP', payload: 25 })} onBack={() => dispatch({ type: 'SET_STEP', payload: 23 })} canProceed={true} merchantPhone={state.phoneNumber} merchantEmail={undefined} />
      );
    case 25:
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

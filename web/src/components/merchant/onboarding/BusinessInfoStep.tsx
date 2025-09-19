import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

export const BusinessInfoStep = () => {
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();

  return (
    <OnboardingStepLayout
      title="Tell us about your business"
      onNext={() => dispatch({ type: 'SET_STEP', payload: state.step + 1 })}
      onBack={() => navigate(PATHS.HOME)}
      isNextDisabled={!state.businessName}
      progress={20}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="businessName" className="text-lg font-semibold">
            Business Name
          </Label>
          <p className="mb-2 text-neutral-500">
            This will be your public name on CitySpark.
          </p>
          <Input
            id="businessName"
            value={state.businessName}
            onChange={(e) =>
              dispatch({ type: 'SET_BUSINESS_NAME', payload: e.target.value })
            }
            className="h-14 text-lg"
          />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

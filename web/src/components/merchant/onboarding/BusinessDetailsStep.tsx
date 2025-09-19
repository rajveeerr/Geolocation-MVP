import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export const BusinessDetailsStep = () => {
  const { state, dispatch } = useOnboarding();

  const handleNext = () => {
    dispatch({ type: 'SET_STEP', payload: state.step + 1 });
  };

  return (
    <OnboardingStepLayout
      title="Add a few more details"
      onNext={handleNext}
      onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
      progress={60}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Business Description</Label>
          <p className="mb-2 text-neutral-500">
            Tell customers what makes your business special.
          </p>
          <Textarea
            id="description"
            value={state.description}
            onChange={(e) =>
              dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })
            }
            placeholder="A short description customers will see on your profile"
            className="min-h-[120px]"
          />
        </div>
        <div>
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <Input
            id="logoUrl"
            value={state.logoUrl}
            onChange={(e) =>
              dispatch({ type: 'SET_LOGO_URL', payload: e.target.value })
            }
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

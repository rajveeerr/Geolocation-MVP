import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useToast } from '@/hooks/use-toast';

export const BusinessDetailsStep = () => {
  const { state, dispatch } = useOnboarding();
  const { toast } = useToast();

  const handleNext = () => {
    dispatch({ type: 'SET_STEP', payload: state.step + 1 });
  };

  const handleLogoUpload = (url: string | null) => {
    dispatch({ type: 'SET_LOGO_URL', payload: url || '' });
  };

  const handleLogoError = (error: string) => {
    toast({
      title: 'Upload Error',
      description: error,
      variant: 'destructive',
    });
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
        <ImageUpload
          value={state.logoUrl || undefined}
          onChange={handleLogoUpload}
          onError={handleLogoError}
          label="Business Logo (Optional)"
          description="Upload your business logo. This will be displayed on your merchant profile and deals."
          context="business_logo"
          maxSize={5}
          acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
        />
      </div>
    </OnboardingStepLayout>
  );
};

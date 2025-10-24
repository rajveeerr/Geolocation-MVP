import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, MapPin } from 'lucide-react';

export const BusinessDetailsStep = () => {
  const { state, dispatch } = useOnboarding();
  const { toast } = useToast();

  // Debug logging
  console.log('BusinessDetailsStep - businessType:', state.businessType);

  const handleNext = () => {
    if (!state.businessType) {
      toast({
        title: 'Business Type Required',
        description: 'Please select your business type to continue.',
        variant: 'destructive',
      });
      return;
    }
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
      isNextDisabled={!state.businessType}
      progress={60}
    >
      <div className="space-y-6">
        {/* Business Type Selection */}
        <div className="space-y-3">
          <Label htmlFor="businessType" className="text-lg font-semibold text-neutral-800">
            Business Type
          </Label>
          <p className="text-neutral-500">
            Help us understand your business structure for better targeting and analytics.
          </p>
          <Select 
            value={state.businessType || ''} 
            onValueChange={(value) => dispatch({ type: 'SET_BUSINESS_TYPE', payload: value as 'NATIONAL' | 'LOCAL' })}
            required
          >
            <SelectTrigger className="h-14 text-lg border-neutral-300 focus:border-brand-primary-500 focus:ring-brand-primary-500 hover:border-neutral-400 transition-colors">
              <SelectValue placeholder="Select your business type" />
            </SelectTrigger>
            <SelectContent className="z-50 max-h-[300px] overflow-y-auto">
              <SelectItem value="LOCAL">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 p-2">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Local Business</div>
                    <div className="text-sm text-neutral-500">Independent, single-location business</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="NATIONAL">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 p-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">National Chain</div>
                    <div className="text-sm text-neutral-500">Multi-location business or franchise</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-lg font-semibold text-neutral-800">Business Description</Label>
          <p className="text-neutral-500">
            Tell customers what makes your business special.
          </p>
          <Textarea
            id="description"
            value={state.description}
            onChange={(e) =>
              dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })
            }
            placeholder="A short description customers will see on your profile"
            className="min-h-[120px] border-neutral-300 focus:border-brand-primary-500 focus:ring-brand-primary-500"
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

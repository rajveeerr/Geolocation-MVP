// src/components/merchant/onboarding/BusinessInfoStep.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

export const BusinessInfoStep = () => {
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiPost('/merchants/register', {
          businessName: state.businessName,
          address: state.address,
          description: 'Default description', // Add these to your form later
          logoUrl: '',
      });

      if (response.success) {
          toast({ 
            title: "Application Submitted!", 
            description: "Your merchant profile is now pending approval.",
            duration: 5000
          });
          navigate(PATHS.MERCHANT_DASHBOARD);
      } else {
          toast({ 
            title: "Error", 
            description: response.error || "Something went wrong. Please try again.", 
            variant: 'destructive' 
          });
      }
    } catch (error) {
      toast({ 
        title: "Network Error", 
        description: "Please check your connection and try again.", 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <OnboardingStepLayout
      title="First, let's get your business on the map"
      onNext={handleNext}
      onBack={() => navigate(PATHS.HOME)}
      isNextDisabled={!state.businessName || !state.address}
      isLoading={isSubmitting}
      progress={50}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="businessName" className="text-lg font-semibold">Business Name</Label>
          <p className="text-neutral-500 mb-2">This will be your public name on CitySpark.</p>
          <Input 
            id="businessName"
            value={state.businessName}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'businessName', value: e.target.value })}
            className="h-14 text-lg"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="address" className="text-lg font-semibold">Business Address</Label>
          <p className="text-neutral-500 mb-2">This helps users find you on the map.</p>
          <Input 
            id="address"
            value={state.address}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'address', value: e.target.value })}
            className="h-14 text-lg"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

// src/components/merchant/onboarding/BusinessInfoStep.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button'; // Import Button
import { MapPin, CheckCircle, Loader2 } from 'lucide-react'; // Import icons
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

export const BusinessInfoStep = () => {
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // This is a placeholder for your chosen geocoding service call.
  // In a real app, you'd replace this with a call to Google Maps, Mapbox, etc.
  async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!address || address.trim().length < 10) return null;
    console.log(`Geocoding address: ${address}`);
    // --- MOCK API CALL ---
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
    return { lat: 40.7128, lng: -74.0060 }; // Mocked coordinates for New York City
  }

  const handleGeocode = async () => {
    setIsGeocoding(true);
    const result = await geocodeAddress(state.address);
    setIsGeocoding(false);

    if (result) {
      dispatch({ type: 'UPDATE_FIELD', field: 'latitude', value: result.lat });
      dispatch({ type: 'UPDATE_FIELD', field: 'longitude', value: result.lng });
      toast({
        title: 'Location Found!',
        description: `We've pinned your business on the map.`,
      });
    } else {
      toast({
        title: 'Could Not Find Address',
        description: 'Please try a more specific address.',
        variant: 'destructive',
      });
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;

    // --- VALIDATION: Ensure location has been set before proceeding ---
    if (!state.latitude || !state.longitude) {
      toast({
        title: 'Location Required',
        description: 'Please verify your business address to pin it on the map.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiPost('/merchants/register', {
        businessName: state.businessName,
        address: state.address,
        // --- NEW: Send coordinates to the backend ---
        latitude: state.latitude,
        longitude: state.longitude,
      });

      if (response.success) {
        toast({
          title: 'Application Submitted!',
          description: 'Your merchant profile is now pending approval.',
        });
        navigate(PATHS.MERCHANT_DASHBOARD);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Something went wrong.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Network Error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // The "Next" button should be disabled if we don't have coordinates.
  const isNextDisabled = !state.businessName || !state.address || !state.latitude;

  return (
    <OnboardingStepLayout
      title="First, let's get your business on the map"
      onNext={handleNext}
      onBack={() => navigate(PATHS.HOME)}
      isNextDisabled={isNextDisabled}
      isLoading={isSubmitting}
      progress={50}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="businessName" className="text-lg font-semibold">
            Business Name
          </Label>
          <p className="mb-2 text-neutral-500">This will be your public name on CitySpark.</p>
          <Input
            id="businessName"
            value={state.businessName}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'businessName', value: e.target.value })}
            className="h-14 text-lg"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="address" className="text-lg font-semibold">
            Business Address
          </Label>
          <p className="mb-2 text-neutral-500">Enter your full address to help users find you.</p>
          <div className="flex items-center gap-2">
            <Input
              id="address"
              value={state.address}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'address', value: e.target.value })}
              className="h-14 text-lg"
              disabled={isSubmitting || isGeocoding}
              placeholder="e.g., 123 Main St, New York, NY 10001"
            />
            <Button onClick={handleGeocode} disabled={isGeocoding || !state.address} className="h-14 flex-shrink-0">
              {isGeocoding ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
            </Button>
          </div>
          {state.latitude && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Location verified and saved!</p>
            </div>
          )}
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

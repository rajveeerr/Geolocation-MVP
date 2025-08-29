import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { LocationPickerMap } from './LocationPickerMap';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

// Placeholder for reverse geocoding
async function reverseGeocode(coords: { lat: number; lng: number }): Promise<string> {
  console.log('Reverse geocoding:', coords);
  await new Promise(resolve => setTimeout(resolve, 500));
  return `Approx. ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
}

export const MapConfirmationStep = () => {
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationChange = async (coords: { lat: number; lng: number }) => {
      dispatch({ type: 'SET_COORDINATES', payload: coords });
      // You can optionally call reverseGeocode here to update the address fields
      const approxAddress = await reverseGeocode(coords);
      toast({ title: "Location Updated", description: approxAddress });
  };

  const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
          const fullAddress = `${state.address.street}, ${state.address.city}, ${state.address.state} ${state.address.zip}`;
          const response = await apiPost('/merchants/register', {
              businessName: state.businessName,
              address: fullAddress,
              latitude: state.coordinates.lat,
              longitude: state.coordinates.lng,
          });

          if (response.success) {
              toast({ title: 'Application Submitted!', description: 'Your profile is pending approval.' });
              localStorage.removeItem('merchantOnboardingState'); // Clear persisted state
              navigate(PATHS.MERCHANT_DASHBOARD);
          } else {
              toast({ title: 'Error', description: response.error || 'Something went wrong.', variant: 'destructive' });
          }
      } catch (error) {
          toast({ title: 'Network Error', description: 'Please try again.', variant: 'destructive' });
      } finally {
          setIsSubmitting(false);
      }
  };
  
  // A fallback in case the page is loaded directly on this step without coordinates
  const initialCenter = {
    lat: state.coordinates.lat ?? 40.7128,
    lng: state.coordinates.lng ?? -74.0060,
  };

  return (
    <OnboardingStepLayout
      title="Show us your specific location"
      onNext={handleSubmit}
      onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
      isLoading={isSubmitting}
      progress={100}
    >
      <p className="mb-4 text-center text-neutral-600">Drag the pin to the exact location of your business entrance.</p>
      <LocationPickerMap center={initialCenter} onLocationChange={handleLocationChange} />
    </OnboardingStepLayout>
  );
};

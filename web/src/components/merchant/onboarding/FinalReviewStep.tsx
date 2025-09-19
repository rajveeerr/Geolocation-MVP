import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhitelistedCities } from '@/hooks/useWhitelistedCities';
import { CheckCircle, XCircle } from 'lucide-react';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

async function reverseGeocode(coords: { lat: number; lng: number }): Promise<Partial<any> | null> {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
        const data = await res.json();
        if (data && data.address) {
            return {
                street: `${data.address.house_number || ''} ${data.address.road || ''}`.trim(),
                city: data.address.city || data.address.town || data.address.village || '',
                state: data.address.state || '',
                zip: data.address.postcode || '',
                country: data.address.country || '',
            };
        }
        return null;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
}

export const FinalReviewStep = () => {
  const { state, dispatch } = useOnboarding();
  const { data: whitelistedCitiesSet } = useWhitelistedCities();
  const [isCityWhitelisted, setIsCityWhitelisted] = useState<boolean | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (state.coordinates.lat !== null && state.coordinates.lng !== null) {
      reverseGeocode({ lat: state.coordinates.lat, lng: state.coordinates.lng }).then(addressDetails => {
        if (addressDetails) {
          dispatch({ type: 'SET_FULL_ADDRESS', payload: addressDetails });
          const city = (addressDetails.city || '').toLowerCase().trim();
          if (city && whitelistedCitiesSet) {
            setIsCityWhitelisted(whitelistedCitiesSet.has(city));
          }
        }
      });
    }
  }, [state.coordinates, dispatch, whitelistedCitiesSet]);
  
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fullAddress = `${state.address.street}, ${state.address.city}, ${state.address.state} ${state.address.zip}`;
      const payload = {
        businessName: state.businessName,
        address: fullAddress,
        latitude: state.coordinates.lat,
        longitude: state.coordinates.lng,
        description: state.description || undefined,
        logoUrl: state.logoUrl || undefined,
      };

      const response = await apiPost('/merchants/register', payload);
      if (response.success) {
        toast({ title: 'Application Submitted!', description: 'Your profile is now pending approval.' });
        localStorage.removeItem('merchantOnboardingState');
        navigate(PATHS.MERCHANT_DASHBOARD);
      } else {
        throw new Error(response.error || 'Something went wrong.');
      }
    } catch (err) {
      toast({ title: 'Submission Failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingStepLayout
      title="Confirm your address"
      onNext={handleFinalSubmit}
      onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
      isNextDisabled={isCityWhitelisted === false || isCityWhitelisted === null || isSubmitting}
      isLoading={isSubmitting}
      progress={100}
      nextButtonText={isSubmitting ? 'Submitting...' : 'Finish & Submit'}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="street">Street address</Label>
          <Input id="street" value={state.address.street} onChange={(e) => dispatch({ type: 'SET_ADDRESS_FIELD', payload: { field: 'street', value: e.target.value } })} />
        </div>
        <div>
          <Label htmlFor="city">City/town</Label>
          <Input id="city" value={state.address.city} onChange={(e) => dispatch({ type: 'SET_ADDRESS_FIELD', payload: { field: 'city', value: e.target.value } })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" value={state.address.state} onChange={(e) => dispatch({ type: 'SET_ADDRESS_FIELD', payload: { field: 'state', value: e.target.value } })} />
          </div>
          <div>
            <Label htmlFor="zip">PIN code</Label>
            <Input id="zip" value={state.address.zip} onChange={(e) => dispatch({ type: 'SET_ADDRESS_FIELD', payload: { field: 'zip', value: e.target.value } })} />
          </div>
        </div>
      </div>
      {isCityWhitelisted === true && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
              <CheckCircle className="h-6 w-6" />
              <p className="font-semibold">Great! Your city is supported.</p>
          </div>
      )}
      {isCityWhitelisted === false && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-50 p-4 text-amber-800 border border-amber-200">
              <XCircle className="h-6 w-6" />
              <p className="font-semibold">We're not in your city yet, but we're expanding soon!</p>
          </div>
      )}
    </OnboardingStepLayout>
  );
};

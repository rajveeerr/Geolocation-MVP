import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhitelistedCities } from '@/hooks/useWhitelistedCities';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

type AddressDetails = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

async function reverseGeocode(coords: { lat: number; lng: number }): Promise<Partial<AddressDetails> | null> {
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
      } as Partial<AddressDetails>;
        }
        return null;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
}

export const FinalReviewStep = () => {
  const { state, dispatch } = useOnboarding();
  const { data: citiesData } = useWhitelistedCities();
  
  // Debug logging to see what we're getting
  console.log('FinalReviewStep - citiesData:', citiesData);
  
  // Ensure we have an array
  const cities = Array.isArray(citiesData?.cities) ? citiesData.cities : [];
  const whitelistedSet = cities.reduce<Set<string>>((acc, c) => {
    acc.add((c.name || '').toLowerCase().trim());
    return acc;
  }, new Set<string>());

  const [isCityWhitelisted, setIsCityWhitelisted] = useState<boolean | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If we have a cityId, validate it directly
    if (state.cityId !== null && cities) {
      const found = cities.some(c => c.id === state.cityId && c.active);
      setIsCityWhitelisted(found);
      return;
    }

    // If we have an address city, try to match it with whitelisted cities
    if (state.address.city) {
      const raw = state.address.city.toLowerCase().trim();
      // Accept variants like "new york" and "new york city"
      const base = raw.replace(/\s*city$/,'').trim();
      const variants = new Set([raw, base, `${base} city`]);
      const accepted = Array.from(variants).some(v => whitelistedSet.has(v));
      
      // If city is whitelisted but we don't have a cityId, try to find and set it
      if (accepted && cities && state.cityId === null) {
        const matchingCity = cities.find(c => {
          const cityName = c.name.toLowerCase().trim();
          return variants.has(cityName) || variants.has(cityName.replace(/\s*city$/,'').trim());
        });
        if (matchingCity) {
          dispatch({ type: 'SET_CITY_ID', payload: matchingCity.id });
        }
      }
      
      setIsCityWhitelisted(accepted);
      return;
    }

    // Fallback: if no address.city we can still try reverse geocoding from coordinates
    if (state.coordinates.lat !== null && state.coordinates.lng !== null) {
      reverseGeocode({ lat: state.coordinates.lat, lng: state.coordinates.lng }).then(addressDetails => {
        if (addressDetails) {
          dispatch({ type: 'SET_FULL_ADDRESS', payload: addressDetails });
          const raw = (addressDetails.city || '').toLowerCase().trim();
          if (raw) {
            const base = raw.replace(/\s*city$/,'').trim();
            const variants = new Set([raw, base, `${base} city`]);
            const accepted = Array.from(variants).some(v => whitelistedSet.has(v));
            
            // If city is whitelisted but we don't have a cityId, try to find and set it
            if (accepted && cities && state.cityId === null) {
              const matchingCity = cities.find(c => {
                const cityName = c.name.toLowerCase().trim();
                return variants.has(cityName) || variants.has(cityName.replace(/\s*city$/,'').trim());
              });
              if (matchingCity) {
                dispatch({ type: 'SET_CITY_ID', payload: matchingCity.id });
              }
            }
            
            setIsCityWhitelisted(accepted);
          }
        }
      });
    }
  }, [state.address.city, state.cityId, state.coordinates, dispatch, whitelistedSet, cities]);
  
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Final submit - Current state:', {
        cityId: state.cityId,
        addressCity: state.address.city,
        isCityWhitelisted,
        cities: cities?.length
      });

      // Last attempt to find cityId if it's missing
      let finalCityId = state.cityId;
      if (!finalCityId && state.address.city && cities) {
        const raw = state.address.city.toLowerCase().trim();
        const base = raw.replace(/\s*city$/,'').trim();
        const variants = new Set([raw, base, `${base} city`]);
        
        const matchingCity = cities.find(c => {
          const cityName = c.name.toLowerCase().trim();
          return variants.has(cityName) || variants.has(cityName.replace(/\s*city$/,'').trim());
        });
        
        if (matchingCity) {
          finalCityId = matchingCity.id;
          dispatch({ type: 'SET_CITY_ID', payload: matchingCity.id });
          console.log('Found matching city:', matchingCity);
        }
      }

      const fullAddress = `${state.address.street}, ${state.address.city}, ${state.address.state} ${state.address.zip}`;
      const payload = {
        businessName: state.businessName,
        address: fullAddress,
        cityId: finalCityId,
        latitude: state.coordinates.lat,
        longitude: state.coordinates.lng,
        description: state.description || undefined,
        logoUrl: state.logoUrl || undefined,
      };

      console.log('Final payload:', payload);

      // Validation: ensure cityId is present or city is whitelisted
      if (!payload.cityId && isCityWhitelisted !== true) {
        toast({ 
          title: 'Submission Failed', 
          description: 'A city must be selected and must be in our service area. Please go back and select a valid city.', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

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

  const cityFilled = !!state.address.city && state.address.city.trim().length > 0;

  return (
    <OnboardingStepLayout
      title="Confirm your address"
      onNext={handleFinalSubmit}
      onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
      isNextDisabled={isSubmitting || !cityFilled || isCityWhitelisted === false || isCityWhitelisted === null}
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
      {cityFilled && isCityWhitelisted === true && (
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
        <CheckCircle className="h-6 w-6" />
        <p className="font-semibold">Great! Your city is supported.</p>
      </div>
    )}
      {cityFilled && isCityWhitelisted === null && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-blue-800 border border-blue-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="font-medium">Checking city availability...</p>
        </div>
      )}
    {cityFilled && isCityWhitelisted === false && (
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-50 p-4 text-amber-800 border border-amber-200">
        <XCircle className="h-6 w-6" />
        <p className="font-semibold">We're not in your city yet, but we're expanding soon!</p>
      </div>
    )}
    </OnboardingStepLayout>
  );
};

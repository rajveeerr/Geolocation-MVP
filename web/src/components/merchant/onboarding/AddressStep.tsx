import { useState } from 'react';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// This is the placeholder for your geocoding service call.
async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  // Replace with actual geocoding API call
  // Use the provided address variable to avoid unused param lint errors while
  // this placeholder simulates a network call.

  console.log('Geocoding address:', address);
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { lat: 40.7128, lng: -74.006 };
}

export const AddressStep = () => {
  const { state, dispatch } = useOnboarding();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();

  const handleNext = async () => {
    setIsGeocoding(true);
    const fullAddress = `${state.address.street}, ${state.address.city}, ${state.address.state} ${state.address.zip}`;
    const result = await geocodeAddress(fullAddress);
    setIsGeocoding(false);

    if (result) {
      dispatch({ type: 'SET_COORDINATES', payload: result });
      dispatch({ type: 'SET_STEP', payload: state.step + 1 });
    } else {
      toast({
        title: 'Could Not Find Address',
        description: 'Please try a more specific address.',
        variant: 'destructive',
      });
    }
  };

  const isNextDisabled =
    !state.address.street ||
    !state.address.city ||
    !state.address.state ||
    !state.address.zip;

  return (
    <OnboardingStepLayout
      title="Confirm your address"
      onNext={handleNext}
      onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
      isNextDisabled={isNextDisabled || isGeocoding}
      isLoading={isGeocoding}
      progress={50}
      /* OnboardingStepLayout handles button label internally; pass through loading state */
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="street">Street address</Label>
          <Input
            id="street"
            value={state.address.street}
            onChange={(e) =>
              dispatch({
                type: 'SET_ADDRESS_FIELD',
                payload: { field: 'street', value: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="city">City/town</Label>
          <Input
            id="city"
            value={state.address.city}
            onChange={(e) =>
              dispatch({
                type: 'SET_ADDRESS_FIELD',
                payload: { field: 'city', value: e.target.value },
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={state.address.state}
              onChange={(e) =>
                dispatch({
                  type: 'SET_ADDRESS_FIELD',
                  payload: { field: 'state', value: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="zip">PIN code</Label>
            <Input
              id="zip"
              value={state.address.zip}
              onChange={(e) =>
                dispatch({
                  type: 'SET_ADDRESS_FIELD',
                  payload: { field: 'zip', value: e.target.value },
                })
              }
            />
          </div>
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { LocationPickerMap } from './LocationPickerMap';
import { reverseGeocodeCoordinates } from '@/services/geocoding';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';


export const MapAddressStep = () => {
  const { state, dispatch } = useOnboarding();
  const { toast } = useToast();

  const handleLocationChange = async (coords: { lat: number; lng: number }) => {
      // 1. Update the coordinates in our global state
      dispatch({ type: 'SET_COORDINATES', payload: coords });
      
      // 2. Call the reverse geocoding service
      const addressDetails = await reverseGeocodeCoordinates(coords);
      
      // 3. If we get an address, update the context with the new address fields
      if (addressDetails) {
          dispatch({ type: 'SET_FULL_ADDRESS', payload: addressDetails });
          toast({ title: "Address Updated", description: `${addressDetails.street}, ${addressDetails.city}` });
      }
  };

  // On first load, if we have coordinates but no street, perform an initial geocode
  useEffect(() => {
    if (
      state.coordinates.lat !== null &&
      state.coordinates.lng !== null &&
      !state.address.street
    ) {
        handleLocationChange({ lat: state.coordinates.lat, lng: state.coordinates.lng });
    }
  }, []); // Run only once

  return (
    <OnboardingStepLayout
      title="Where's your place located?"
      onNext={() => dispatch({ type: 'SET_STEP', payload: state.step + 1 })}
      onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
      isNextDisabled={!state.coordinates.lat}
      progress={80}
    >
      <div className="relative h-[60vh] w-full rounded-lg overflow-hidden">
        <LocationPickerMap 
          center={
            state.coordinates.lat !== null && state.coordinates.lng !== null
              ? { lat: state.coordinates.lat, lng: state.coordinates.lng }
              : { lat: 40.7128, lng: -74.0060 }
          }
          onLocationChange={(coords) => handleLocationChange(coords)}
        />

      </div>
    </OnboardingStepLayout>
  );
};

import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { LocationPickerMap } from './LocationPickerMap';


export const MapAddressStep = () => {
  const { state, dispatch } = useOnboarding();

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
          onLocationChange={(coords) => dispatch({ type: 'SET_COORDINATES', payload: coords })}
        />

      </div>
    </OnboardingStepLayout>
  );
};

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { LocationPickerMap } from './LocationPickerMap';
import { LocationSearchModal } from './LocationSearchModal'; // <-- Import new modal
import { reverseGeocodeCoordinates } from '@/services/geocoding';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const MapAddressStep = () => {
  const { state, dispatch } = useOnboarding();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const lat = state.coordinates.lat;
    const lng = state.coordinates.lng;
    if (lat === null || lng === null) return;

    let cancelled = false;
    const fetchAddress = async () => {
      try {
        const addressDetails = await reverseGeocodeCoordinates({ lat, lng });
        if (!cancelled && addressDetails) {
          dispatch({ type: 'SET_FULL_ADDRESS', payload: addressDetails });
        }
      } catch (err) {
        console.error('Reverse geocode failed for map coordinates', err);
      }
    };

    const id = setTimeout(fetchAddress, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [state.coordinates.lat, state.coordinates.lng, dispatch]);
  
  const initialCenter = (state.coordinates.lat !== null && state.coordinates.lng !== null)
    ? { lat: state.coordinates.lat, lng: state.coordinates.lng }
    : { lat: 40.7128, lng: -74.0060 };

  const handleLocationSelectFromModal = (coords: { lat: number; lng: number }) => {
    dispatch({ type: 'SET_COORDINATES', payload: coords });
    toast({ title: "Location Updated", description: "You can drag the pin to refine the position." });
  };

  return (
    <>
      <OnboardingStepLayout
        title="Where's your place located?"
        onNext={() => dispatch({ type: 'SET_STEP', payload: state.step + 1 })}
        onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
        isNextDisabled={!(state.coordinates.lat !== null && state.coordinates.lng !== null)}
        progress={80}
      >
        <div className="space-y-4">
          {/* Search control moved outside the map to prevent overlapping */}
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden">
              <Input
                readOnly
                value={state.address.street || ''}
                placeholder="Enter your address"
                className="h-12 pl-4 text-base border-0 focus:ring-0 cursor-pointer"
                onClick={() => setIsModalOpen(true)}
                onFocus={() => setIsModalOpen(true)}
              />
              <div className="flex items-center gap-2 pr-2 pl-1">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!navigator.geolocation) {
                      toast({ title: 'Location Unavailable', description: 'Geolocation is not supported by your browser.' });
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        dispatch({ type: 'SET_COORDINATES', payload: coords });
                        toast({ title: 'Using current location', description: 'You can drag the pin to refine the position.' });
                      },
                      (err) => {
                        toast({ title: 'Unable to get location', description: err.message, variant: 'destructive' });
                      },
                      { enableHighAccuracy: true, timeout: 10000 }
                    );
                  }}
                  aria-label="Use my location"
                  className="flex items-center justify-center h-10 w-10 rounded-md text-neutral-600 hover:bg-neutral-100"
                >
                  <MapPin className="h-5 w-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }}
                  aria-label="Search address"
                  className="flex items-center justify-center h-10 w-10 rounded-md text-neutral-600 hover:bg-neutral-100"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Map container without overlapping elements */}
          <div className="relative">
            <LocationPickerMap 
                center={initialCenter}
                onLocationChange={(coords) => dispatch({ type: 'SET_COORDINATES', payload: coords })}
            />
          </div>
        </div>
      </OnboardingStepLayout>

      <LocationSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLocationSelect={handleLocationSelectFromModal}
        initialQuery={state.address.street || ''}
      />
    </>
  );
};


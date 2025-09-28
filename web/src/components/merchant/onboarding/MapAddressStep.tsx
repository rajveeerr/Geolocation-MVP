import { useState, useEffect } from 'react';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { LocationPickerMap } from './LocationPickerMap';
import { reverseGeocodeCoordinates, searchAddresses } from '@/services/geocoding';
import type { AddressSuggestion } from '@/services/geocoding';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

export const MapAddressStep = () => {
  const { state, dispatch } = useOnboarding();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- Debounce the search input ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms delay
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  // --- Fetch suggestions when the debounced query changes ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      // We need the city name from the selected cityId. This would ideally be in the context.
      // For now, we'll use a placeholder.
      const selectedCityName = "New York"; // LATER: Get this from state.selectedCity.name
      const results = await searchAddresses(debouncedQuery, selectedCityName);
      setSuggestions(results);
      setIsSearching(false);
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    const coords = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    
    // 1. Update coordinates in the global state, which will re-center the map
    dispatch({ type: 'SET_COORDINATES', payload: coords });

    // 2. Reverse geocode these new coordinates to get a structured address
    const addressDetails = await reverseGeocodeCoordinates(coords);
    if (addressDetails) {
        dispatch({ type: 'SET_FULL_ADDRESS', payload: addressDetails });
    }
    
    // 3. Clear the search and suggestions
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    
    toast({ title: "Location Pinned!", description: suggestion.display_name });
  };

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

  return (
    <OnboardingStepLayout
      title="Where's your place located?"
      onNext={() => dispatch({ type: 'SET_STEP', payload: state.step + 1 })}
      onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
  isNextDisabled={!(state.coordinates.lat !== null && state.coordinates.lng !== null)}
  progress={80}
    >
      <div className="relative">
        <div className="relative mb-4 z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 z-50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your address..."
              className="h-12 pl-10 text-base"
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
          </div>

          {suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full text-left p-3 hover:bg-neutral-100 border-b last:border-b-0"
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <LocationPickerMap 
            center={initialCenter}
            // The map doesn't need to do reverse geocoding anymore
            onLocationChange={(coords) => dispatch({ type: 'SET_COORDINATES', payload: coords })}
        />
      </div>
    </OnboardingStepLayout>
  );
};


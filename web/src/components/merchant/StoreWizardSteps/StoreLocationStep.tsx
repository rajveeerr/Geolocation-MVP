import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { MapPin, Search, CheckCircle, AlertCircle, Loader2, ChevronDown, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoreLocationMap } from './StoreLocationMap';
import { StoreLocationSearchModal } from './StoreLocationSearchModal';
// Local types to avoid import issues
interface StoreWizardData {
  businessName: string;
  address: string;
  phoneNumber: string;
  email?: string;
  storeType: string;
  cityId: number;
  latitude?: number;
  longitude?: number;
  verifiedAddress?: string;
  businessHours: any;
  description?: string;
  features: string[];
  storeImages: File[];
  active: boolean;
}

interface City {
  id: number;
  name: string;
  state: string;
  active: boolean;
}

interface StoreLocationStepProps {
  data: StoreWizardData;
  onUpdate: (data: Partial<StoreWizardData>) => void;
  cities: City[];
}

interface AddressSuggestion {
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  formatted: string;
}

export const StoreLocationStep = ({ data, onUpdate, cities }: StoreLocationStepProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLocationSearchOpen, setIsLocationSearchOpen] = useState(false);

  const handleInputChange = (field: keyof StoreWizardData, value: any) => {
    onUpdate({ [field]: value });
    if (field === 'address') {
      setValidationError(null);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleCityChange = (cityId: number) => {
    const selectedCity = cities.find(city => city.id === cityId);
    if (selectedCity) {
      onUpdate({ cityId });
      setCitySearchTerm(`${selectedCity.name}, ${selectedCity.state}`);
      setShowCityDropdown(false);
    }
  };

  // Filter cities based on search term
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
    `${city.name}, ${city.state}`.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  // Get selected city name for display
  const selectedCity = cities.find(city => city.id === data.cityId);

  // Initialize city search term when city is selected
  useEffect(() => {
    if (selectedCity && !citySearchTerm) {
      setCitySearchTerm(`${selectedCity.name}, ${selectedCity.state}`);
    }
  }, [selectedCity, citySearchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.city-dropdown-container')) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simulate address validation and geocoding
  const validateAddress = async (address: string) => {
    if (!address.trim()) return;

    setIsValidating(true);
    setValidationError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock address validation - in real implementation, use Google Maps API or similar
      const mockSuggestions: AddressSuggestion[] = [
        {
          address: address,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
          city: 'New York',
          state: 'NY',
          formatted: `${address}, New York, NY`
        }
      ];

      setAddressSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      setValidationError('Failed to validate address. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const selectAddress = (suggestion: AddressSuggestion) => {
    onUpdate({
      address: suggestion.formatted,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      verifiedAddress: suggestion.formatted,
    });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onUpdate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setValidationError('Unable to get your current location. Please enter the address manually.');
        }
      );
    } else {
      setValidationError('Geolocation is not supported by this browser.');
    }
  };

  // Get map center coordinates
  const getMapCenter = () => {
    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lng: data.longitude };
    }
    // Default to New York if no coordinates
    return { lat: 40.7128, lng: -74.0060 };
  };

  const handleMapLocationChange = (coords: { lat: number; lng: number }) => {
    onUpdate({
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleLocationSearchSelect = (coords: { lat: number; lng: number }, address: string) => {
    onUpdate({
      latitude: coords.lat,
      longitude: coords.lng,
      address: address,
      verifiedAddress: address,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-100">
          <MapPin className="h-8 w-8 text-brand-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Location & Address</h2>
        <p className="mt-2 text-neutral-600">
          Set your store's location and verify the address for customers to find you
        </p>
      </div>

      {/* Address Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address" className="text-lg font-semibold text-neutral-800">
            Store Address *
          </Label>
          <p className="mb-4 text-neutral-500">
            Enter the exact address where customers can find your store
          </p>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden">
            <Input
              id="address"
              placeholder="Enter your store address"
              value={data.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="h-12 pl-4 text-base border-0 focus:ring-0 flex-1"
            />
            <div className="flex items-center gap-2 pr-2 pl-1">
              <button
                onClick={() => validateAddress(data.address)}
                disabled={!data.address.trim() || isValidating}
                aria-label="Validate address"
                className="flex items-center justify-center h-10 w-10 rounded-md text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
              >
                {isValidating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={() => setIsLocationSearchOpen(true)}
                aria-label="Search location"
                className="flex items-center justify-center h-10 w-10 rounded-md text-neutral-600 hover:bg-neutral-100"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Address Suggestions */}
        {showSuggestions && addressSuggestions.length > 0 && (
          <div className="mt-2 rounded-lg border border-neutral-200 bg-white shadow-lg">
            {addressSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectAddress(suggestion)}
                className="w-full p-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  <div>
                    <p className="font-medium text-neutral-900">{suggestion.formatted}</p>
                    <p className="text-sm text-neutral-500">
                      {suggestion.latitude.toFixed(4)}, {suggestion.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {validationError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {validationError}
          </div>
        )}
      </div>

      {/* City Selection */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="city" className="text-lg font-semibold text-neutral-800">
            City *
          </Label>
          <p className="mb-4 text-neutral-500">
            Select the city where your store is located
          </p>
        </div>
        
        <div className="relative city-dropdown-container">
          <div className="relative">
            <Input
              id="city"
              placeholder="Search for a city..."
              value={citySearchTerm}
              onChange={(e) => {
                setCitySearchTerm(e.target.value);
                setShowCityDropdown(true);
                if (!e.target.value) {
                  onUpdate({ cityId: 0 });
                }
              }}
              onFocus={() => setShowCityDropdown(true)}
              className="h-12 pl-4 pr-10 text-base"
            />
            <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          </div>
          
          {/* Loading State */}
          {cities.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-md border border-neutral-300">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading cities...
              </div>
            </div>
          )}
          
          {/* City Dropdown */}
          {showCityDropdown && cities.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg max-h-60 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCityChange(city.id)}
                    className={cn(
                      'w-full p-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors',
                      data.cityId === city.id && 'bg-brand-primary-50 text-brand-primary-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-neutral-500" />
                      <div>
                        <p className="font-medium text-neutral-900">{city.name}</p>
                        <p className="text-sm text-neutral-500">{city.state}</p>
                      </div>
                      {data.cityId === city.id && (
                        <CheckCircle className="h-4 w-4 text-brand-primary-600 ml-auto" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-neutral-500">
                  No cities found matching "{citySearchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            {cities.length > 0 
              ? `${cities.length} cities available` 
              : 'Loading available cities...'
            }
          </span>
          {data.cityId && selectedCity && (
            <span className="text-green-600 font-medium">
              ✓ {selectedCity.name}, {selectedCity.state}
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold text-neutral-800">
            Location Map
          </Label>
          <p className="mb-4 text-neutral-500">
            Drag the marker to set your exact store location
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={useCurrentLocation}
            className="flex items-center gap-2 rounded-lg"
          >
            <Navigation className="h-4 w-4" />
            Use Current Location
          </Button>
        </div>
        
        <StoreLocationMap
          center={getMapCenter()}
          onLocationChange={handleMapLocationChange}
        />
        
        {/* Location Status */}
        {data.latitude && data.longitude && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Location Set</p>
              <p className="text-green-600">
                {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Coordinates */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold text-neutral-800">
            Manual Coordinates (Optional)
          </Label>
          <p className="mb-4 text-neutral-500">
            You can manually enter coordinates or use the map above to set your location
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude" className="text-sm font-medium text-neutral-600">
              Latitude
            </Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="40.7128"
              value={data.latitude || ''}
              onChange={(e) => handleInputChange('latitude', e.target.value ? Number(e.target.value) : undefined)}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude" className="text-sm font-medium text-neutral-600">
              Longitude
            </Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="-74.0060"
              value={data.longitude || ''}
              onChange={(e) => handleInputChange('longitude', e.target.value ? Number(e.target.value) : undefined)}
              className="h-12 text-base"
            />
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h4 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Status
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Address</span>
            <div className="flex items-center gap-2">
              {data.address ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Provided</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-600">Required</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">City</span>
            <div className="flex items-center gap-2">
              {data.cityId ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    {selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : 'Selected'}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-600">Required</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">Coordinates</span>
            <div className="flex items-center gap-2">
              {data.latitude && data.longitude ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Set</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-600">Recommended</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Search Modal */}
      <StoreLocationSearchModal
        isOpen={isLocationSearchOpen}
        onClose={() => setIsLocationSearchOpen(false)}
        onLocationSelect={handleLocationSearchSelect}
        selectedCity={selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : ''}
        initialQuery={data.address}
      />
    </div>
  );
};

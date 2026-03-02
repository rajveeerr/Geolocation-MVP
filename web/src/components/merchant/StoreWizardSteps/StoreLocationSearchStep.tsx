/**
 * Airbnb-style location search: map-first, search input, "Use my location".
 * User searches or uses GPS → selects from results → proceeds to confirm step.
 */
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Search, Loader2, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchAddresses } from '@/services/geocoding';
import type { AddressSuggestion, AddressComponents } from '@/services/geocoding';
import { addressMatchesCity, getCityFromAddress, getStateFromAddress } from '@/services/geocoding';
import { StoreLocationMap } from './StoreLocationMap';
import { cn } from '@/lib/utils';

interface City {
  id: number;
  name: string;
  state: string;
  active?: boolean;
}

interface StoreWizardData {
  address: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostcode?: string;
  cityId: number;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

interface StoreLocationSearchStepProps {
  data: StoreWizardData;
  onUpdate: (data: Partial<StoreWizardData>) => void;
  cities: City[];
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India center

function findMatchingCity(
  addr: AddressComponents | undefined,
  cities: City[]
): City | null {
  if (!addr) return null;
  const addrCity = getCityFromAddress(addr);
  const addrState = getStateFromAddress(addr);
  for (const c of cities) {
    if (addressMatchesCity(addr, c.name, c.state)) return c;
    if (
      addrCity &&
      addrCity.toLowerCase().includes(c.name.toLowerCase()) &&
      (!c.state || !addrState || addrState.toLowerCase().includes(c.state.toLowerCase()))
    )
      return c;
  }
  return null;
}

export const StoreLocationSearchStep = ({ data, onUpdate, cities }: StoreLocationSearchStepProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchSuggestions = useCallback(async () => {
    if (debouncedQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchAddresses(debouncedQuery, '');
      setSuggestions(results);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleSelect = (s: AddressSuggestion) => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);
    const addr = s.address;
    const street = addr?.road
      ? [addr.house_number, addr.road].filter(Boolean).join(' ')
      : undefined;
    const city = getCityFromAddress(addr);
    const state = getStateFromAddress(addr);
    const postcode = addr?.postcode;

    const matchingCity = findMatchingCity(addr, cities);

    onUpdate({
      latitude: lat,
      longitude: lon,
      address: s.display_name,
      addressStreet: street,
      addressCity: city,
      addressState: state,
      addressPostcode: postcode,
      cityId: matchingCity?.id ?? 0,
      verifiedAddress: s.display_name,
    });
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const displayFallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          { headers: { 'User-Agent': 'Yohop-Geolocation-MVP/1.0' } }
        )
          .then((r) => r.json())
          .then((data) => {
            const addr = data?.address;
            const displayName = data?.display_name || displayFallback;
            const street = addr?.road
              ? [addr.house_number, addr.road].filter(Boolean).join(' ')
              : undefined;
            const city = addr?.city || addr?.town || addr?.village || '';
            const state = addr?.state || addr?.state_district || '';
            const postcode = addr?.postcode;

            const matchingCity = findMatchingCity(addr, cities);

            onUpdate({
              latitude: lat,
              longitude: lng,
              address: displayName,
              addressStreet: street,
              addressCity: city,
              addressState: state,
              addressPostcode: postcode,
              cityId: matchingCity?.id ?? 0,
              verifiedAddress: displayName,
            });
            setSearchQuery('');
            setShowSuggestions(false);
          })
          .catch(() => {
            onUpdate({
              latitude: lat,
              longitude: lng,
              address: displayFallback,
              cityId: 0,
            });
          })
          .finally(() => setIsLocating(false));
      },
      () => setIsLocating(false)
    );
  };

  const mapCenter =
    data.latitude != null && data.longitude != null
      ? { lat: data.latitude, lng: data.longitude }
      : DEFAULT_CENTER;

  const cityNotAvailable = data.latitude != null && data.longitude != null && !data.cityId && cities.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">Where is your store?</h2>
        <p className="mt-1 text-neutral-600">
          Search for your address or use your current location. We only serve areas in our supported cities.
        </p>
      </div>

      {/* Search bar - Airbnb style */}
      <div className="relative">
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border bg-white shadow-sm transition-all',
            inputFocused || showSuggestions
              ? 'border-brand-primary-400 ring-2 ring-brand-primary-100'
              : 'border-neutral-200'
          )}
        >
          <MapPin className="ml-4 h-5 w-5 flex-shrink-0 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setInputFocused(true);
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setInputFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Search for an address..."
            className="h-14 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          />
          {isSearching && (
            <Loader2 className="mr-4 h-5 w-5 animate-spin text-neutral-400" />
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (suggestions.length > 0 || debouncedQuery.length >= 3) && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-brand-primary-600" />
                <span className="text-sm text-neutral-500">Searching...</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((s) => {
                const mc = findMatchingCity(s.address, cities);
                return (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="flex w-full items-start gap-3 p-3 text-left hover:bg-neutral-50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                        {s.display_name}
                      </p>
                      {mc ? (
                        <p className="text-xs text-green-600">Available in {mc.name}</p>
                      ) : cities.length > 0 ? (
                        <p className="text-xs text-amber-600">Not in a supported city yet</p>
                      ) : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-neutral-500">
                No results. Try a different search.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Use my location */}
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={isLocating}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
      >
        {isLocating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Navigation className="h-5 w-5" />
        )}
        Use my current location
      </button>

      {/* Map preview */}
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <StoreLocationMap
          center={mapCenter}
          onLocationChange={(coords) => onUpdate({ latitude: coords.lat, longitude: coords.lng })}
          draggable={!!(data.latitude != null && data.longitude != null)}
        />
      </div>

      {/* Coming soon - city not available */}
      {cityNotAvailable && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900">Coming soon to your area</p>
            <p className="mt-1 text-sm text-amber-800">
              We're not in this city yet. Search for an address in one of our supported cities to continue.
            </p>
          </div>
        </div>
      )}

      {data.address && data.cityId > 0 && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <span className="font-medium">Selected:</span> {data.address}
        </div>
      )}
    </div>
  );
}

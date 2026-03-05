/**
 * Merged location section: address search + confirm fields + draggable map pin.
 * Reuses logic from StoreLocationSearchStep but presented inline.
 */
import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { searchAddresses } from '@/services/geocoding';
import type { AddressSuggestion, AddressComponents } from '@/services/geocoding';
import { addressMatchesCity, getCityFromAddress, getStateFromAddress } from '@/services/geocoding';
import { StoreLocationMap } from '@/components/merchant/StoreWizardSteps/StoreLocationMap';
import { cn } from '@/lib/utils';

interface City {
  id: number;
  name: string;
  state: string;
  active?: boolean;
}

interface LocationData {
  address: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPostcode?: string;
  cityId: number;
  latitude?: number;
  longitude?: number;
  verifiedAddress?: string;
}

interface LocationSectionProps {
  data: LocationData;
  onUpdate: (data: Partial<LocationData>) => void;
  cities: City[];
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

function findMatchingCity(addr: AddressComponents | undefined, cities: City[]): City | null {
  if (!addr) return null;
  const addrCity = getCityFromAddress(addr);
  const addrState = getStateFromAddress(addr);
  for (const c of cities) {
    if (addressMatchesCity(addr, c.name, c.state)) return c;
    if (addrCity && addrCity.toLowerCase().includes(c.name.toLowerCase()) && (!c.state || !addrState || addrState.toLowerCase().includes(c.state.toLowerCase())))
      return c;
  }
  return null;
}

export const LocationSection = ({ data, onUpdate, cities }: LocationSectionProps) => {
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
    if (debouncedQuery.trim().length < 3) { setSuggestions([]); return; }
    setIsSearching(true);
    try {
      const results = await searchAddresses(debouncedQuery, '');
      setSuggestions(results);
      setShowSuggestions(true);
    } catch { setSuggestions([]); }
    finally { setIsSearching(false); }
  }, [debouncedQuery]);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const handleSelect = (s: AddressSuggestion) => {
    const lat = parseFloat(s.lat);
    const lon = parseFloat(s.lon);
    const addr = s.address;
    const street = addr?.road ? [addr.house_number, addr.road].filter(Boolean).join(' ') : undefined;
    const city = getCityFromAddress(addr);
    const state = getStateFromAddress(addr);
    const postcode = addr?.postcode;
    const matchingCity = findMatchingCity(addr, cities);
    onUpdate({
      latitude: lat, longitude: lon, address: s.display_name,
      addressStreet: street, addressCity: city, addressState: state, addressPostcode: postcode,
      cityId: matchingCity?.id ?? 0, verifiedAddress: s.display_name,
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
        const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, { headers: { 'User-Agent': 'Yohop-Geolocation-MVP/1.0' } })
          .then((r) => r.json())
          .then((res) => {
            const addr = res?.address;
            const displayName = res?.display_name || fallback;
            const street = addr?.road ? [addr.house_number, addr.road].filter(Boolean).join(' ') : undefined;
            const city = addr?.city || addr?.town || addr?.village || '';
            const state = addr?.state || addr?.state_district || '';
            const postcode = addr?.postcode;
            const matchingCity = findMatchingCity(addr, cities);
            onUpdate({
              latitude: lat, longitude: lng, address: displayName,
              addressStreet: street, addressCity: city, addressState: state, addressPostcode: postcode,
              cityId: matchingCity?.id ?? 0, verifiedAddress: displayName,
            });
            setSearchQuery('');
            setShowSuggestions(false);
          })
          .catch(() => { onUpdate({ latitude: lat, longitude: lng, address: fallback, cityId: 0 }); })
          .finally(() => setIsLocating(false));
      },
      () => setIsLocating(false)
    );
  };

  const mapCenter = data.latitude != null && data.longitude != null
    ? { lat: data.latitude, lng: data.longitude }
    : DEFAULT_CENTER;

  const hasLocation = data.latitude != null && data.longitude != null;
  const cityNotAvailable = hasLocation && !data.cityId && cities.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-neutral-700">Store location</h3>
        <p className="text-xs text-neutral-500">Search for your address or use your current location</p>
      </div>

      {/* Search bar */}
      <div className="relative z-30">
        <div className={cn(
          'flex items-center gap-3 rounded-xl border bg-white shadow-sm transition-all',
          inputFocused || showSuggestions ? 'border-brand-primary-400 ring-2 ring-brand-primary-100' : 'border-neutral-200'
        )}>
          <MapPin className="ml-4 h-5 w-5 shrink-0 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { setInputFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => { setInputFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
            placeholder="Search for an address..."
            className="h-12 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
          />
          {isSearching && <Loader2 className="mr-4 h-5 w-5 animate-spin text-neutral-400" />}
        </div>

        {showSuggestions && (suggestions.length > 0 || debouncedQuery.length >= 3) && (
          <div className="absolute left-0 right-0 top-full z-[1100] mt-1 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-brand-primary-600" />
                <span className="text-sm text-neutral-500">Searching...</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((s) => {
                const mc = findMatchingCity(s.address, cities);
                return (
                  <button key={s.place_id} type="button" onClick={() => handleSelect(s)} className="flex w-full items-start gap-3 p-3 text-left hover:bg-neutral-50">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 line-clamp-2">{s.display_name}</p>
                      {mc ? <p className="text-xs text-green-600">Available in {mc.name}</p> : cities.length > 0 ? <p className="text-xs text-amber-600">Not in a supported city yet</p> : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-neutral-500">No results. Try a different search.</div>
            )}
          </div>
        )}
      </div>

      {/* Use my location */}
      <button type="button" onClick={useCurrentLocation} disabled={isLocating} className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">
        {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        Use my current location
      </button>

      {/* Selected address */}
      {data.address && data.cityId > 0 && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <span className="font-medium">Selected:</span> {data.address}
        </div>
      )}

      {cityNotAvailable && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900">Coming soon to your area</p>
            <p className="text-xs text-amber-800">We&apos;re not in this city yet. Search for an address in one of our supported cities.</p>
          </div>
        </div>
      )}

      {/* Confirm address fields */}
      {hasLocation && data.cityId > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-neutral-500">Street</Label>
            <Input value={data.addressStreet || ''} onChange={(e) => onUpdate({ addressStreet: e.target.value })} className="mt-1 h-10 text-sm" placeholder="Street address" />
          </div>
          <div>
            <Label className="text-xs text-neutral-500">City</Label>
            <Input value={data.addressCity || ''} onChange={(e) => onUpdate({ addressCity: e.target.value })} className="mt-1 h-10 text-sm" placeholder="City" />
          </div>
          <div>
            <Label className="text-xs text-neutral-500">State</Label>
            <Input value={data.addressState || ''} onChange={(e) => onUpdate({ addressState: e.target.value })} className="mt-1 h-10 text-sm" placeholder="State" />
          </div>
          <div>
            <Label className="text-xs text-neutral-500">Postcode</Label>
            <Input value={data.addressPostcode || ''} onChange={(e) => onUpdate({ addressPostcode: e.target.value })} className="mt-1 h-10 text-sm" placeholder="Postcode" />
          </div>
        </div>
      )}

      {/* Map with draggable pin */}
      <div className="relative z-0 overflow-hidden rounded-xl border border-neutral-200">
        <StoreLocationMap
          center={mapCenter}
          onLocationChange={(coords) => onUpdate({ latitude: coords.lat, longitude: coords.lng })}
          draggable={hasLocation}
        />
      </div>
    </div>
  );
};

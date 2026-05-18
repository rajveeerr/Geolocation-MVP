import { useEffect, useState, useCallback } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TwelveHourTimeField } from '@/components/common/TwelveHourTimeField';
import { StoreLocationMap } from '@/components/merchant/StoreWizardSteps/StoreLocationMap';
import { searchAddresses, type AddressSuggestion } from '@/services/geocoding';
import { cn } from '@/lib/utils';
import type { ScheduledStop } from '@/types/truckSchedule';

export interface TruckStopFieldsValue {
  address: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

interface TruckStopFieldsProps {
  value: TruckStopFieldsValue;
  onChange: (next: TruckStopFieldsValue) => void;
  /** Where on the map to center when the user has not picked an address yet. */
  defaultCenter?: { lat: number; lng: number };
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

export const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const isoToDateInput = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const isoToTimeInput = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const combineDateAndTime = (date: string, time: string): string | null => {
  if (!date || !time) return null;
  const [hh, mm] = time.split(':').map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  const [yyyy, mo, dd] = date.split('-').map(Number);
  return new Date(yyyy, mo - 1, dd, hh, mm, 0, 0).toISOString();
};

export const initialStopFields = (stop?: ScheduledStop | null): TruckStopFieldsValue => {
  if (stop) {
    return {
      address: stop.address,
      latitude: stop.latitude,
      longitude: stop.longitude,
      date: isoToDateInput(stop.startsAt),
      startTime: isoToTimeInput(stop.startsAt),
      endTime: isoToTimeInput(stop.endsAt),
      notes: stop.notes ?? '',
    };
  }
  return {
    address: '',
    latitude: null,
    longitude: null,
    date: todayIso(),
    startTime: '12:00',
    endTime: '15:00',
    notes: '',
  };
};

export const TruckStopFields = ({ value, onChange, defaultCenter }: TruckStopFieldsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

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

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    onChange({
      ...value,
      address: s.display_name,
      latitude: parseFloat(s.lat),
      longitude: parseFloat(s.lon),
    });
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          { headers: { 'User-Agent': 'Yohop-Geolocation-MVP/1.0' } },
        )
          .then((r) => r.json())
          .then((res) => {
            onChange({
              ...value,
              latitude: lat,
              longitude: lng,
              address: res?.display_name || fallback,
            });
          })
          .catch(() => {
            onChange({ ...value, latitude: lat, longitude: lng, address: fallback });
          })
          .finally(() => setIsLocating(false));
      },
      () => setIsLocating(false),
    );
  };

  const mapCenter =
    value.latitude != null && value.longitude != null
      ? { lat: value.latitude, lng: value.longitude }
      : defaultCenter ?? DEFAULT_CENTER;
  const hasLocation = value.latitude != null && value.longitude != null;

  return (
    <div className="space-y-5">
      {/* Address search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neutral-700">Where will you be?</Label>
        <div className="relative">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl border bg-white shadow-sm transition-all',
              showSuggestions ? 'border-brand-primary-400 ring-2 ring-brand-primary-100' : 'border-neutral-200',
            )}
          >
            <MapPin className="ml-3 h-4 w-4 shrink-0 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search address or landmark..."
              className="h-11 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
            />
            {isSearching && <Loader2 className="mr-3 h-4 w-4 animate-spin text-neutral-400" />}
          </div>
          {showSuggestions && (suggestions.length > 0 || debouncedQuery.length >= 3) && (
            <div className="absolute left-0 right-0 top-full z-[1100] mt-1 max-h-56 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
              {suggestions.length > 0 ? (
                suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="flex w-full items-start gap-3 p-3 text-left hover:bg-neutral-50"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="line-clamp-2 text-sm text-neutral-900">{s.display_name}</span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-neutral-500">No results.</div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
        >
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Use my current location
        </button>

        {value.address && (
          <div className="rounded-lg bg-neutral-50 p-2.5 text-xs text-neutral-700">
            <span className="font-medium">Selected:</span> {value.address}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <StoreLocationMap
          center={mapCenter}
          draggable={hasLocation}
          onLocationChange={(coords) =>
            onChange({ ...value, latitude: coords.lat, longitude: coords.lng })
          }
          className="h-56"
        />
      </div>

      {/* Date + time */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="stop-date" className="text-sm font-medium text-neutral-700">Date</Label>
          <Input
            id="stop-date"
            type="date"
            lang="en-US"
            value={value.date}
            min={todayIso()}
            onChange={(e) => onChange({ ...value, date: e.target.value })}
            className="h-11 sm:max-w-xs"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">Starts</Label>
            <TwelveHourTimeField
              value={value.startTime}
              onChange={(v) => onChange({ ...value, startTime: v })}
              className="space-y-0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-neutral-700">Ends</Label>
            <TwelveHourTimeField
              value={value.endTime}
              onChange={(v) => onChange({ ...value, endTime: v })}
              className="space-y-0"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="stop-notes" className="text-sm font-medium text-neutral-700">
          Notes <span className="text-xs font-normal text-neutral-500">(optional)</span>
        </Label>
        <Textarea
          id="stop-notes"
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="e.g. Around the corner from the brewery"
          rows={2}
          maxLength={200}
          className="resize-none"
        />
      </div>
    </div>
  );
};

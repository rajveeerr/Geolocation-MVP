import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Popular cities ───────────────────────────────────────────── */

const POPULAR_CITIES = [
  { name: 'New York', state: 'NY' },
  { name: 'Los Angeles', state: 'CA' },
  { name: 'Chicago', state: 'IL' },
  { name: 'Houston', state: 'TX' },
  { name: 'San Francisco', state: 'CA' },
  { name: 'Miami', state: 'FL' },
  { name: 'Austin', state: 'TX' },
  { name: 'Nashville', state: 'TN' },
  { name: 'Seattle', state: 'WA' },
  { name: 'Las Vegas', state: 'NV' },
  { name: 'Mumbai', state: 'IN' },
  { name: 'Delhi', state: 'IN' },
  { name: 'Bangalore', state: 'IN' },
  { name: 'London', state: 'UK' },
];

/* ─── City search (Nominatim) ──────────────────────────────────── */

interface CityResult {
  place_id: number;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

async function searchCities(query: string): Promise<CityResult[]> {
  if (query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&featuretype=city`,
    );
    if (!res.ok) return [];
    const data: CityResult[] = await res.json();
    // Deduplicate by city name
    const seen = new Set<string>();
    return data.filter((d) => {
      const cityName =
        d.address?.city || d.address?.town || d.address?.village || d.name;
      if (seen.has(cityName)) return false;
      seen.add(cityName);
      return true;
    });
  } catch {
    return [];
  }
}

/* ─── Props ────────────────────────────────────────────────────── */

interface CityPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  currentCity: string;
  detectedCity?: string | null;
  isDetecting?: boolean;
  onDetectLocation?: () => void;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CityPickerModal
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function CityPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentCity,
  detectedCity,
  isDetecting,
  onDetectLocation,
}: CityPickerModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced city search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const data = await searchCities(query);
      setResults(data);
      setIsSearching(false);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (city: string) => {
    onSelect(city);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-4 top-[8vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[420px] z-50 max-h-[84vh] flex flex-col"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200/60 overflow-hidden flex flex-col max-h-[84vh]">
              {/* Header */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-heading text-lg font-black text-[#1a1a2e] tracking-tight">
                    Select Location
                  </h2>
                  <button
                    onClick={onClose}
                    className="h-8 w-8 rounded-lg bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search city..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-[#1a1a2e] placeholder-neutral-400 focus:outline-none focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]/10 transition-all"
                  />
                  {query && (
                    <button
                      onClick={() => {
                        setQuery('');
                        setResults([]);
                        inputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-4">
                {/* Detect location */}
                <button
                  onClick={() => {
                    if (detectedCity) {
                      handleSelect(detectedCity);
                    } else {
                      onDetectLocation?.();
                    }
                  }}
                  disabled={isDetecting}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all active:scale-[0.98]',
                    detectedCity
                      ? 'border-[#B91C1C]/20 bg-[#B91C1C]/5'
                      : 'border-neutral-200 hover:border-[#B91C1C]/20 hover:bg-[#B91C1C]/[0.02]',
                  )}
                >
                  <div
                    className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      detectedCity ? 'bg-[#B91C1C]/10' : 'bg-neutral-100',
                    )}
                  >
                    {isDetecting ? (
                      <Loader2 className="w-4 h-4 text-[#B91C1C] animate-spin" />
                    ) : (
                      <Navigation
                        className={cn(
                          'w-4 h-4',
                          detectedCity ? 'text-[#B91C1C]' : 'text-neutral-400',
                        )}
                      />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        detectedCity ? 'text-[#B91C1C]' : 'text-[#1a1a2e]',
                      )}
                    >
                      {isDetecting
                        ? 'Detecting...'
                        : detectedCity
                          ? detectedCity
                          : 'Use current location'}
                    </p>
                    {!isDetecting && (
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {detectedCity
                          ? 'Tap to use detected city'
                          : 'Auto-detect via GPS'}
                      </p>
                    )}
                  </div>
                  {detectedCity && (
                    <Check className="w-4 h-4 text-[#B91C1C] flex-shrink-0" />
                  )}
                </button>

                {/* Search results */}
                {query.length >= 2 && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      Results
                    </p>
                    {isSearching ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-4 h-4 text-neutral-300 animate-spin" />
                      </div>
                    ) : results.length > 0 ? (
                      <div className="space-y-0.5">
                        {results.map((r) => {
                          const cityName =
                            r.address?.city ||
                            r.address?.town ||
                            r.address?.village ||
                            r.name;
                          const subtitle = [
                            r.address?.state,
                            r.address?.country,
                          ]
                            .filter(Boolean)
                            .join(', ');
                          const isActive =
                            cityName.toLowerCase() ===
                            currentCity.toLowerCase();

                          return (
                            <button
                              key={r.place_id}
                              onClick={() => handleSelect(cityName)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left active:scale-[0.98]',
                                isActive
                                  ? 'bg-[#B91C1C]/5'
                                  : 'hover:bg-neutral-50',
                              )}
                            >
                              <MapPin
                                className={cn(
                                  'w-3.5 h-3.5 flex-shrink-0',
                                  isActive
                                    ? 'text-[#B91C1C]'
                                    : 'text-neutral-300',
                                )}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    'text-sm font-medium truncate',
                                    isActive
                                      ? 'text-[#B91C1C]'
                                      : 'text-[#1a1a2e]',
                                  )}
                                >
                                  {cityName}
                                </p>
                                {subtitle && (
                                  <p className="text-[10px] text-neutral-400 truncate">
                                    {subtitle}
                                  </p>
                                )}
                              </div>
                              {isActive && (
                                <Check className="w-3.5 h-3.5 text-[#B91C1C] flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-xs text-neutral-400 py-4">
                        No cities found for "{query}"
                      </p>
                    )}
                  </div>
                )}

                {/* Popular cities — only show when not searching */}
                {query.length < 2 && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      Popular
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {POPULAR_CITIES.map((c) => {
                        const isActive =
                          c.name.toLowerCase() === currentCity.toLowerCase();
                        return (
                          <button
                            key={c.name}
                            onClick={() => handleSelect(c.name)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left active:scale-[0.98]',
                              isActive
                                ? 'bg-[#B91C1C]/5'
                                : 'hover:bg-neutral-50',
                            )}
                          >
                            <MapPin
                              className={cn(
                                'w-3.5 h-3.5 flex-shrink-0',
                                isActive
                                  ? 'text-[#B91C1C]'
                                  : 'text-neutral-300',
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  'text-sm font-medium truncate',
                                  isActive
                                    ? 'text-[#B91C1C]'
                                    : 'text-[#1a1a2e]',
                                )}
                              >
                                {c.name}
                              </p>
                              <p className="text-[10px] text-neutral-400">
                                {c.state}
                              </p>
                            </div>
                            {isActive && (
                              <Check className="w-3.5 h-3.5 text-[#B91C1C] flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Clear city option */}
                {currentCity && (
                  <button
                    onClick={() => handleSelect('')}
                    className="w-full text-center text-[11px] text-neutral-400 hover:text-[#B91C1C] font-medium py-1.5 transition-colors"
                  >
                    Clear location filter
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

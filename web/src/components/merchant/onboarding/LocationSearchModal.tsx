// web/src/components/merchant/onboarding/LocationSearchModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useWhitelistedCities } from '@/hooks/useWhitelistedCities';
import type { City } from '@/hooks/useWhitelistedCities';
import { searchAddresses } from '@/services/geocoding';
import type { AddressSuggestion } from '@/services/geocoding';
import { useState, useEffect } from 'react';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  initialQuery?: string;
}

export const LocationSearchModal = ({ isOpen, onClose, onLocationSelect, initialQuery = '' }: LocationSearchModalProps) => {
  const { data: popularCities, isLoading: isLoadingCities } = useWhitelistedCities();
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  // Prefill search when modal opens (or when initialQuery changes)
  useEffect(() => {
    if (isOpen && initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Fetch address suggestions
  useEffect(() => {
    if (debouncedQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      setIsSearching(true);
      const results = await searchAddresses(debouncedQuery, ''); // Search globally for now
      setSuggestions(results);
      setIsSearching(false);
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSelect = (lat: string, lon: string) => {
    onLocationSelect({ lat: parseFloat(lat), lng: parseFloat(lon) });
    onClose();
  };

  const handleCityClick = async (city: City) => {
    // Try to find coordinates for the city using the geocoding service
    try {
      const results = await searchAddresses(city.name, '');
      if (results && results.length > 0) {
        const first = results[0];
        onLocationSelect({ lat: parseFloat(first.lat), lng: parseFloat(first.lon) });
        onClose();
      } else {
        // Nothing found - fallback to toast via console (no toast hook here)
        console.warn('No geocoding results for city', city.name);
      }
    } catch (err) {
      console.error('Failed to geocode city', city.name, err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-[10vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-2xl"
          >
            <div className="relative p-4 border-b">
              <MapPin className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all locations..."
                className="h-12 pl-10 text-base"
              />
              <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-neutral-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {isSearching ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> :
               suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map(s => (
                    <button key={s.place_id} onClick={() => handleSelect(s.lat, s.lon)} className="w-full text-left p-3 hover:bg-neutral-100 rounded-md">
                      {s.display_name}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-neutral-500 mb-4">Popular Cities</h3>
                  {isLoadingCities ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                      {popularCities?.map((city: City) => (
                        <button key={city.id} onClick={() => handleCityClick(city)} className="text-left p-2 hover:bg-neutral-100 rounded-md font-medium text-neutral-800">
                          {city.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

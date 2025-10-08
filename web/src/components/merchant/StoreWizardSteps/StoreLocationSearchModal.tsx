import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/common/Button';
import { searchAddresses } from '@/services/geocoding';
import type { AddressSuggestion } from '@/services/geocoding';
import { useState, useEffect } from 'react';

interface StoreLocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (coords: { lat: number; lng: number }, address: string) => void;
  selectedCity?: string;
  initialQuery?: string;
}

export const StoreLocationSearchModal = ({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  selectedCity = '',
  initialQuery = '' 
}: StoreLocationSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  // Prefill search when modal opens
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
      try {
        // Use the selected city to narrow down search results
        const results = await searchAddresses(debouncedQuery, selectedCity);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedQuery, selectedCity]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    onLocationSelect(
      { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) },
      suggestion.display_name
    );
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSuggestions([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-[10vh]">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50" 
            onClick={handleClose} 
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-neutral-200">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-100">
                  <Search className="h-6 w-6 text-brand-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900">Search Location</h3>
                  <p className="text-base text-neutral-500">
                    {selectedCity ? `Searching in ${selectedCity}` : 'Search for your store location'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                className="absolute right-4 top-4 p-2 text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-neutral-200">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter address, landmark, or business name..."
                  className="pl-12 h-14 text-lg border-0 focus:ring-0"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
                  <span className="ml-2 text-sm text-neutral-500">Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                    Found {suggestions.length} location{suggestions.length !== 1 ? 's' : ''}
                  </h4>
                  <div className="space-y-1">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        onClick={() => handleSelect(suggestion)}
                        className="w-full text-left p-3 hover:bg-neutral-50 rounded-lg border border-transparent hover:border-neutral-200 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-neutral-900 line-clamp-2">
                              {suggestion.display_name}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {suggestion.lat}, {suggestion.lon}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : debouncedQuery.trim().length >= 3 ? (
                <div className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-neutral-700 mb-1">No locations found</h4>
                  <p className="text-sm text-neutral-500">
                    Try searching with different keywords or check your spelling
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-neutral-700 mb-1">Search for your location</h4>
                  <p className="text-sm text-neutral-500">
                    Enter at least 3 characters to search for addresses and landmarks
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500">
                  Powered by OpenStreetMap
                </p>
                <Button variant="secondary" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

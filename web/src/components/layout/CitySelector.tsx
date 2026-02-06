import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { usePublicCities } from '@/hooks/usePublicCities';
import { useCity } from '@/context/CityContext';

export const CitySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = usePublicCities();
  const { selectedCity, setSelectedCity } = useCity();

  const cities = data?.cities ?? [];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-select first city if none selected and cities loaded
  useEffect(() => {
    if (!selectedCity && cities.length > 0) {
      setSelectedCity({
        id: cities[0].id,
        name: cities[0].name,
        state: cities[0].state,
        country: cities[0].country,
        isActive: cities[0].active,
      });
    }
  }, [cities, selectedCity, setSelectedCity]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <MapPin className="h-3.5 w-3.5 text-neutral-500" />
        <span className="max-w-[100px] truncate">
          {isLoading ? 'Loading...' : selectedCity?.name || 'Select City'}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto py-1">
            {cities.length === 0 && !isLoading && (
              <div className="px-4 py-3 text-sm text-neutral-400">No cities available</div>
            )}
            {isLoading && (
              <div className="px-4 py-3 text-sm text-neutral-400">Loading cities...</div>
            )}
            {cities.map((city) => {
              const isSelected = selectedCity?.id === city.id;
              return (
                <button
                  key={city.id}
                  onClick={() => {
                    setSelectedCity({
                      id: city.id,
                      name: city.name,
                      state: city.state,
                      country: city.country,
                      isActive: city.active,
                    });
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-brand-primary-50 text-brand-primary-700 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className={`h-3.5 w-3.5 ${isSelected ? 'text-brand-primary-500' : 'text-neutral-400'}`} />
                    <span>{city.name}</span>
                    <span className="text-xs text-neutral-400">{city.state}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-brand-primary-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

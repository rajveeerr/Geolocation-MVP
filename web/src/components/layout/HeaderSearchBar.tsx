import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Tag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '@/services/api';
import { useCity } from '@/context/CityContext';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  offerDisplay: string;
  dealType: string;
  merchant: {
    id: number;
    businessName: string;
    address: string;
    logoUrl: string | null;
  };
}

interface DealsResponse {
  deals: SearchResult[];
  total: number;
}

export const HeaderSearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchDeals = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ search: searchTerm.trim() });
      if (selectedCity?.id) {
        params.append('cityId', selectedCity.id.toString());
      }
      const response = await apiGet<DealsResponse>(`/deals?${params.toString()}`);
      if (response.success && response.data) {
        setResults(response.data.deals?.slice(0, 6) ?? []);
        setIsOpen(true);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceTimer.current = setTimeout(() => searchDeals(value), 350);
  };

  const handleResultClick = (deal: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/deals/${deal.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && query.trim().length >= 2) {
      setIsOpen(false);
      navigate(`/deals?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex items-center gap-2 rounded-full border bg-neutral-50/80 px-3 py-2 transition-all duration-200 ${
          isFocused
            ? 'border-brand-primary-300 bg-white shadow-sm ring-2 ring-brand-primary-100'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <Search className="h-4 w-4 shrink-0 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search restaurants"
          className="w-full min-w-0 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
        />
        {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-400" />}
        {query && !isLoading && (
          <button
            onClick={clearSearch}
            className="shrink-0 rounded-full p-0.5 hover:bg-neutral-100"
          >
            <X className="h-3.5 w-3.5 text-neutral-400" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length === 0 && query.trim().length >= 2 && !isLoading && (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
              <Search className="h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-500">No deals found for "{query}"</p>
              <p className="text-xs text-neutral-400">Try a different search term</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Deals
                </p>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {results.map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => handleResultClick(deal)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-neutral-50"
                  >
                    {deal.imageUrl ? (
                      <img
                        src={deal.imageUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary-50">
                        <Tag className="h-4 w-4 text-brand-primary-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800">
                        {deal.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-neutral-400" />
                        <p className="truncate text-xs text-neutral-500">
                          {deal.merchant.businessName}
                        </p>
                      </div>
                    </div>
                    {deal.offerDisplay && (
                      <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {deal.offerDisplay}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {query.trim().length >= 2 && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate(`/deals?search=${encodeURIComponent(query.trim())}`);
                  }}
                  className="flex w-full items-center justify-center gap-2 border-t border-neutral-100 px-4 py-3 text-sm font-medium text-brand-primary-600 transition-colors hover:bg-brand-primary-50"
                >
                  <Search className="h-3.5 w-3.5" />
                  View all results for "{query}"
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

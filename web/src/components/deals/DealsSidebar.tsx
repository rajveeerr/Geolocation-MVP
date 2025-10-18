// web/src/components/deals/DealsSidebar.tsx

import { Input } from '@/components/ui/input';
import { Button } from '@/components/common/Button';
import {
  Search,
  Filter,
  MapPin,
  Loader2,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DealResultCard } from './DealResultCard';
import type { DealWithLocation } from '@/data/deals';
import { Pagination } from '../common/Pagination';
import { useDealCategories } from '@/hooks/useDealCategories';
import { useActiveCities } from '@/hooks/useActiveCities';
import { useState } from 'react';

// --- NEW: Define radius options ---
const radiusOptions = [
  { value: 5, label: '5 mi' },
  { value: 10, label: '10 mi' },
  { value: 25, label: '25 mi' },
];

interface DealsSidebarProps {
  deals: DealWithLocation[];
  hoveredDealId: string | null;
  setHoveredDealId: (id: string | null) => void;
  // --- Props for filters ---
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  isLoading: boolean;
  // --- Props for search (lifted to parent) ---
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  // Toggle to show all deals (no geo filter) vs nearby
  showAllDeals?: boolean;
  setShowAllDeals?: (v: boolean) => void;
  // --- NEW: Additional filters ---
  selectedCityId?: number | null;
  setSelectedCityId?: (cityId: number | null) => void;
  selectedDealType?: string;
  setSelectedDealType?: (dealType: string) => void;
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  // --- NEW: Error handling ---
  error?: string | null;
}

// Deal type options
const dealTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'RECURRING', label: 'Recurring' },
  { value: 'HAPPY_HOUR', label: 'Happy Hour' },
];

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'distance', label: 'Distance' },
  { value: 'expiring', label: 'Expiring Soon' },
];

export const DealsSidebar = ({
  deals,
  hoveredDealId,
  setHoveredDealId,
  activeCategory,
  setActiveCategory,
  searchRadius,
  setSearchRadius,
  isLoading,
  searchTerm = '',
  setSearchTerm = () => {},
  showAllDeals = false,
  setShowAllDeals = () => {},
  selectedCityId = null,
  setSelectedCityId = () => {},
  selectedDealType = '',
  setSelectedDealType = () => {},
  sortBy = 'newest',
  setSortBy = () => {},
  error = null,
}: DealsSidebarProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Fetch categories and cities from backend
  const { data: categoriesData, isLoading: categoriesLoading } = useDealCategories();
  const { data: citiesData, isLoading: citiesLoading } = useActiveCities();
  
  const categories = categoriesData?.categories || [];
  const cities = citiesData?.cities || [];
  return (
    <div className="flex h-full flex-col bg-neutral-50/50">
      <div className="flex-shrink-0 border-b border-neutral-200/80 bg-white">
        <div className="p-4 pb-3 sm:p-6 sm:pb-4 lg:p-8 lg:pb-6">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center lg:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl">
                Discover Deals
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600">
                <MapPin className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                <span className="truncate">Deals Near You</span>
              </div>
            </div>

            {/* Right column: Toggle buttons above the count banner */}
            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex items-center rounded-full bg-neutral-100/60 p-1">
                <Button
                  size="sm"
                  variant={showAllDeals ? 'ghost' : 'primary'}
                  onClick={() => setShowAllDeals?.(false)}
                  aria-pressed={!showAllDeals}
                  className={cn(
                    'rounded-full px-4 py-1 text-sm font-semibold',
                    !showAllDeals ? 'shadow-sm' : '',
                  )}
                >
                  Nearby
                </Button>
                <Button
                  size="sm"
                  variant={showAllDeals ? 'primary' : 'ghost'}
                  onClick={() => setShowAllDeals?.(true)}
                  aria-pressed={!!showAllDeals}
                  className={cn(
                    'rounded-full px-4 py-1 text-sm font-semibold',
                    showAllDeals ? 'shadow-sm' : '',
                  )}
                >
                  All
                </Button>
              </div>

              <div className="relative rounded-md border border-neutral-200 bg-white/90 px-2 py-1">
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <>
                      <span className="text-sm font-bold text-primary">
                        {deals.length}
                      </span>
                      <span className="text-xs font-medium text-neutral-500">
                        results
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search
                className="absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2"
                style={{ color: 'hsl(var(--brand-primary-600))' }}
              />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm?.(e.target.value)}
                placeholder="Search restaurants, cuisines, areas..."
                className="h-11 rounded-xl border-neutral-200/80 bg-white/80 pl-12 text-sm font-medium backdrop-blur-sm placeholder:text-neutral-400 focus:border-primary/50 focus:ring-primary/10 sm:h-12 sm:text-base"
              />
            </div>
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200/80 bg-white/80 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-white sm:h-12 sm:w-12"
            >
              <Filter className="h-5 w-5 text-brand-primary-600" />
              <span className="ml-2 sm:hidden">Filters</span>
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
          {/* Categories Section */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-neutral-700">Categories</h3>
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto p-2 pb-2">
              {categoriesLoading ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading categories...
                </div>
              ) : (
                <>
                  {/* All Categories Button */}
                  <Button
                    key="ALL"
                    onClick={() => setActiveCategory('')}
                    variant={activeCategory === '' ? 'primary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm',
                      activeCategory === ''
                        ? 'scale-105 shadow-md'
                        : 'border-neutral-200/80 bg-white/80 text-neutral-700 hover:border-primary/30 hover:bg-white hover:text-primary',
                    )}
                  >
                    <span className="text-current">🌟</span>
                    <span className="hidden sm:inline">All Categories</span>
                    <span className="sm:hidden">All</span>
                  </Button>
                  
                  {/* Individual Category Buttons */}
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      variant={activeCategory === cat.value ? 'primary' : 'ghost'}
                      size="sm"
                      className={cn(
                        'flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm',
                        activeCategory === cat.value
                          ? 'scale-105 shadow-md'
                          : 'border-neutral-200/80 bg-white/80 text-neutral-700 hover:border-primary/30 hover:bg-white hover:text-primary',
                      )}
                    >
                      <span className="text-current">{cat.icon}</span>
                      <span className="hidden sm:inline">{cat.label}</span>
                      <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                    </Button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Radius Filter */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-neutral-700">Search Radius</h3>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/50 p-2">
              {radiusOptions.map((opt) => (
                <Button
                  key={opt.value}
                  onClick={() => setSearchRadius(opt.value)}
                  variant={searchRadius === opt.value ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'flex-1 rounded-lg text-xs',
                    searchRadius === opt.value && 'font-bold shadow-sm',
                  )}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="space-y-4 border-t border-neutral-200/80 pt-4">
              {/* City Filter */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-neutral-700">City</h3>
                <select
                  value={selectedCityId || ''}
                  onChange={(e) => setSelectedCityId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                  disabled={citiesLoading}
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deal Type Filter */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-neutral-700">Deal Type</h3>
                <select
                  value={selectedDealType}
                  onChange={(e) => setSelectedDealType(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                >
                  {dealTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-neutral-700">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              <Button
                onClick={() => {
                  setActiveCategory(''); // Reset to "All Categories"
                  setSearchRadius(10);
                  setSelectedCityId(null);
                  setSelectedDealType('');
                  setSortBy('newest');
                  setSearchTerm('');
                }}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-neutral-600 hover:text-neutral-800"
              >
                <X className="mr-2 h-3 w-3" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODIFIED: Content List with Error and Empty State --- */}
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:space-y-8 lg:p-6 xl:p-8">
          {/* Error State */}
          {error ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">
                Unable to Load Deals
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                We're having trouble connecting to our servers. Please try refreshing the page or check your internet connection.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          ) : isLoading && deals.length === 0 ? (
            /* Loading State */
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">
                Loading Deals...
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Finding the best deals near you
              </p>
            </div>
          ) : deals.length === 0 ? (
            /* Empty State */
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50">
                <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-800">
                No Deals Found
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            /* Deals List */
            deals.map((deal) => (
              <div
                key={deal.id}
                className={cn(
                  // allow the card to take full available width and give a little horizontal padding
                  'w-full px-2 transition-all duration-200',
                  hoveredDealId === deal.id && 'rounded-2xl ring-2 ring-primary/20',
                )}
              >
                <DealResultCard
                  deal={deal}
                  isHovered={hoveredDealId === deal.id}
                  onMouseEnter={(id: string) => setHoveredDealId(id)}
                  onMouseLeave={() => setHoveredDealId(null)}
                />
              </div>
            ))
          )}
        </div>

        {/* Pagination: Only show if there are deals to paginate */}
        {deals.length > 0 && (
          <div className="border-t border-neutral-200/80 bg-white/80 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
            <Pagination />
          </div>
        )}
      </div>
    </div>
  );
};

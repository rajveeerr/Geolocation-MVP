// web/src/components/deals/DealsSidebar.tsx

 
import { Input } from '@/components/ui/input';
import { Button } from '@/components/common/Button';
import {
  Search,
  Utensils,
  Hotel,
  Fuel,
  Coffee,
  Filter,
  MapPin,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumV2DealCard } from './PremiumV2DealCard';
import type { DealWithLocation } from '@/data/deals';
import { Pagination } from '../common/Pagination';

const categoryFilters = [
  { id: 'FOOD_AND_BEVERAGE', label: 'Restaurants', icon: <Utensils className="h-4 w-4" /> },
  { id: 'TRAVEL', label: 'Hotels', icon: <Hotel className="h-4 w-4" /> },
  { id: 'RETAIL', label: 'Retail', icon: <Fuel className="h-4 w-4" /> }, // Example, adjust as needed
  { id: 'OTHER', label: 'Cafés', icon: <Coffee className="h-4 w-4" /> }, // Example
];

// --- NEW: Define radius options ---
const radiusOptions = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
];

interface DealsSidebarProps {
  deals: DealWithLocation[];
  hoveredDealId: string | null;
  setHoveredDealId: (id: string | null) => void;
  // --- NEW: Props for filters ---
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  isLoading: boolean;
  // --- NEW: Props for search (lifted to parent) ---
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  // Toggle to show all deals (no geo filter) vs nearby
  showAllDeals?: boolean;
  setShowAllDeals?: (v: boolean) => void;
}

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
}: DealsSidebarProps) => {

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
                  className={cn('rounded-full px-4 py-1 text-sm font-semibold', !showAllDeals ? 'shadow-sm' : '')}
                >
                  Nearby
                </Button>
                <Button
                  size="sm"
                  variant={showAllDeals ? 'primary' : 'ghost'}
                  onClick={() => setShowAllDeals?.(true)}
                  aria-pressed={!!showAllDeals}
                  className={cn('rounded-full px-4 py-1 text-sm font-semibold', showAllDeals ? 'shadow-sm' : '')}
                >
                  All
                </Button>
              </div>

              <div className="relative rounded-md bg-white/90 border border-neutral-200 px-2 py-1">
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <>
                      <span className="text-sm font-bold text-primary">{deals.length}</span>
                      <span className="text-xs font-medium text-neutral-500">results</span>
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
            <button className="flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200/80 bg-white/80 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-white sm:h-12 sm:w-12">
              <Filter className="h-5 w-5 text-brand-primary-600" />
              <span className="ml-2 sm:hidden">Filters</span>
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto p-2 pb-2">
            {categoryFilters.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                variant={activeCategory === cat.id ? 'primary' : 'ghost'}
                size="sm"
                className={cn(
                  'flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:px-4 sm:py-2.5 sm:text-sm',
                  activeCategory === cat.id
                    ? 'scale-105 shadow-md'
                    : 'border-neutral-200/80 bg-white/80 text-neutral-700 hover:border-primary/30 hover:bg-white hover:text-primary',
                )}
              >
                <span className="text-current">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>

          {/* --- NEW: Radius Filter UI --- */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/50 p-2">
            <span className="pl-2 text-xs font-bold text-neutral-600">Radius:</span>
            {radiusOptions.map((opt) => (
              <Button
                key={opt.value}
                onClick={() => setSearchRadius(opt.value)}
                variant={searchRadius === opt.value ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'flex-1 rounded-lg text-xs',
                  searchRadius === opt.value && 'font-bold shadow-sm'
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODIFIED: Content List with Empty State --- */}
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:space-y-8 lg:p-6 xl:p-8">
          {/* Conditional rendering based on loading and deals count */}
          {!isLoading && deals.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold text-neutral-800">No Deals Found</h3>
              <p className="mt-2 text-sm text-neutral-500">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
            ) : (
            deals.map((deal) => (
              <div
                key={deal.id}
                onMouseEnter={() => setHoveredDealId(deal.id)}
                onMouseLeave={() => setHoveredDealId(null)}
                className={cn(
                  // allow the card to take full available width and give a little horizontal padding
                  'transition-all duration-200 w-full px-2',
                  hoveredDealId === deal.id && 'rounded-2xl ring-2 ring-primary/20',
                )}
              >
                <PremiumV2DealCard deal={deal} />
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

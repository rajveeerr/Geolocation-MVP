// web/src/components/deals/DealsSidebar.tsx

import { useState } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumDealCard } from './PremiumDealCard';
import type { DealWithLocation } from '@/data/deals';
import { Pagination } from '../common/Pagination';

const categoryFilters = [
  {
    id: 'restaurant',
    label: 'Restaurants',
    icon: <Utensils className="h-4 w-4" />,
  },
  { id: 'hotel', label: 'Hotels', icon: <Hotel className="h-4 w-4" /> },
  { id: 'gas', label: 'Gas Stations', icon: <Fuel className="h-4 w-4" /> },
  { id: 'coffee', label: 'Cafés', icon: <Coffee className="h-4 w-4" /> },
];

interface DealsSidebarProps {
  deals: DealWithLocation[];
  hoveredDealId: string | null;
  setHoveredDealId: (id: string | null) => void;
}

export const DealsSidebar = ({
  deals,
  hoveredDealId,
  setHoveredDealId,
}: DealsSidebarProps) => {
  const [activeCategory, setActiveCategory] = useState('restaurant');

  return (
    <div className="flex h-full flex-col bg-neutral-50/50">
      {/* Header with responsive premium styling */}
      <div className="flex-shrink-0 border-b border-neutral-200/80 bg-white">
        <div className="p-4 pb-3 sm:p-6 sm:pb-4 lg:p-8 lg:pb-6">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center lg:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-3xl">
                Discover Deals
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-600">
                <MapPin className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                <span className="truncate">San Francisco, CA</span>
              </div>
            </div>
            <div className="flex-shrink-0 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-2">
              <span className="whitespace-nowrap text-sm font-semibold text-primary">
                {deals.length} deals
              </span>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search 
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 z-10" 
                style={{ color: 'hsl(var(--brand-primary-600))' }}
              />
              <Input
                placeholder="Search restaurants, cuisines, areas..."
                className="h-11 rounded-xl border-neutral-200/80 bg-white/80 pl-12 text-sm font-medium backdrop-blur-sm placeholder:text-neutral-400 focus:border-primary/50 focus:ring-primary/10 sm:h-12 sm:text-base"
              />
            </div>
            <button className="flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200/80 bg-white/80 backdrop-blur-sm hover:border-primary/30 hover:bg-white sm:h-12 sm:w-12 transition-colors">
              <Filter className="h-5 w-5 text-brand-primary-600" />
              <span className="ml-2 sm:hidden">Filters</span>
            </button>
          </div>
        </div>

        {/* Category Filters with responsive design */}
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
                    ? 'scale-105'
                    : 'border-neutral-200/80 bg-white/80 text-neutral-700 hover:border-primary/30 hover:bg-white hover:text-primary',
                )}
              >
                <span className="text-current">{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content List with responsive spacing */}
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 lg:space-y-8 lg:p-6 xl:p-8">
          {deals.map((deal) => (
            <PremiumDealCard
              key={deal.id}
              deal={deal}
              isHovered={hoveredDealId === deal.id}
              onMouseEnter={setHoveredDealId}
              onMouseLeave={() => setHoveredDealId(null)}
            />
          ))}
        </div>

        {/* Pagination with responsive spacing */}
        <div className="border-t border-neutral-200/80 bg-white/80 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
          <Pagination />
        </div>
      </div>
    </div>
  );
};

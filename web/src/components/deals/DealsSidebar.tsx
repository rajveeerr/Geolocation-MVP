// web/src/components/deals/DealsSidebar.tsx

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/common/Button';
import { Search, Utensils, Hotel, Fuel, Coffee, Filter, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumDealCard } from './PremiumDealCard';
import type { DealWithLocation } from '@/data/deals';
import { Pagination } from '../common/Pagination';

const categoryFilters = [
    { id: 'restaurant', label: 'Restaurants', icon: <Utensils className="h-4 w-4" /> },
    { id: 'hotel', label: 'Hotels', icon: <Hotel className="h-4 w-4" /> },
    { id: 'gas', label: 'Gas Stations', icon: <Fuel className="h-4 w-4" /> },
    { id: 'coffee', label: 'Cafés', icon: <Coffee className="h-4 w-4" /> },
];

interface DealsSidebarProps {
  deals: DealWithLocation[];
  hoveredDealId: string | null;
  setHoveredDealId: (id: string | null) => void;
}

export const DealsSidebar = ({ deals, hoveredDealId, setHoveredDealId }: DealsSidebarProps) => {
    const [activeCategory, setActiveCategory] = useState('restaurant');
    
    return (
        <div className="h-full flex flex-col bg-neutral-50/50">
            {/* Header with responsive premium styling */}
            <div className="bg-white border-b border-neutral-200/80 flex-shrink-0">
                <div className="p-4 sm:p-6 lg:p-8 pb-3 sm:pb-4 lg:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 gap-3">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight">Discover Deals</h1>
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-600">
                                <MapPin className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                                <span className="truncate">San Francisco, CA</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl px-3 py-2 flex-shrink-0">
                            <span className="text-sm font-semibold text-primary whitespace-nowrap">{deals.length} deals</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                            <Input 
                                placeholder="Search restaurants, cuisines, areas..." 
                                className="pl-12 h-11 sm:h-12 rounded-xl border-neutral-200/80 focus:border-primary/50 focus:ring-primary/10 bg-white/80 backdrop-blur-sm font-medium placeholder:text-neutral-400 text-sm sm:text-base" 
                            />
                        </div>
                        <Button 
                            variant="ghost" 
                            size="lg" 
                            className="h-11 sm:h-12 w-full sm:w-12 rounded-xl border border-neutral-200/80 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-primary/30"
                        >
                            <Filter className="w-5 h-5 text-blue-500" />
                            <span className="ml-2 sm:hidden">Filters</span>
                        </Button>
                    </div>
                </div>

                {/* Category Filters with responsive design */}
                <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {categoryFilters.map(cat => (
                            <Button
                                key={cat.id} 
                                onClick={() => setActiveCategory(cat.id)}
                                variant={activeCategory === cat.id ? "primary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 border whitespace-nowrap",
                                    activeCategory === cat.id 
                                        ? "shadow-lg shadow-primary/20 scale-105" 
                                        : "border-neutral-200/80 bg-white/80 text-neutral-700 hover:bg-white hover:border-primary/30 hover:text-primary"
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
                <div className="p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 lg:space-y-8 ">
                    {deals.map(deal => (
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
                <div className="bg-white/80 backdrop-blur-sm border-t border-neutral-200/80 p-4 sm:p-6 lg:p-8">
                    <Pagination />
                </div>
            </div>
        </div>
    );
};
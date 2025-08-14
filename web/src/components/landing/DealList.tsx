import { Search } from 'lucide-react';
import { DealItem } from './DealItem';

interface DealListProps {
  deals: Array<{
    id: number;
    name: string;
    business: string;
    distance: string;
    position: L.LatLngExpression;
    category: string;
  }>;
  hoveredDealId: number | null;
  setHoveredDealId: (id: number | null) => void;
}

export const DealList = ({
  deals,
  hoveredDealId,
  setHoveredDealId,
}: DealListProps) => {
  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-br from-brand-primary-50/50 via-white to-cyan-50/30 p-3 sm:w-1/2 sm:p-6">
      <div>
        <h3 className="text-neutral-text-primary text-lg font-semibold sm:text-xl">
          Live Deals Near You
        </h3>
        <div className="relative mt-3 sm:mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary-400 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="Search deals, places..."
            className="w-full rounded-lg border border-brand-primary-200/60 bg-white/80 py-2 pl-9 pr-4 text-sm outline-none backdrop-blur-sm transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-400/50 sm:pl-10 sm:text-base"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 sm:mt-4">
          <button className="rounded-full bg-gradient-to-r from-brand-primary-400 to-brand-primary-600 px-3 py-1 text-xs text-white shadow-sm transition-all hover:shadow-md sm:text-sm">
            All
          </button>
          <button className="rounded-full border border-brand-primary-200/60 bg-white/70 px-3 py-1 text-xs text-brand-primary-600 backdrop-blur-sm transition-all hover:border-brand-primary-300 hover:bg-brand-primary-50 sm:text-sm">
            Food
          </button>
          <button className="rounded-full border border-brand-primary-200/60 bg-white/70 px-3 py-1 text-xs text-brand-primary-600 backdrop-blur-sm transition-all hover:border-brand-primary-300 hover:bg-brand-primary-50 sm:text-sm">
            Drinks
          </button>
        </div>
      </div>

      <div className="-mr-2 mt-3 flex-grow space-y-2 overflow-y-auto pr-1 sm:mt-4 sm:space-y-3">
        {deals.map((deal) => (
          <DealItem
            key={deal.id}
            deal={deal}
            isHovered={hoveredDealId === deal.id}
            onMouseEnter={setHoveredDealId}
            onMouseLeave={() => setHoveredDealId(null)}
          />
        ))}
      </div>

      <div className="mt-3 flex-shrink-0 sm:mt-4">
        <button className="w-full rounded-lg bg-brand-primary-light py-2 text-center text-sm font-semibold text-brand-primary-main transition-all duration-300 hover:bg-brand-primary-main hover:text-white">
          See all deals
        </button>
      </div>
    </div>
  );
};

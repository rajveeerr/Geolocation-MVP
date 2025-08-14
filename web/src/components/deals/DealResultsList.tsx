// web/src/components/deals/DealResultsList.tsx
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { DealResultCard } from './DealResultCard';
import type { DealWithLocation } from '@/data/deals';
import { useNavigate } from 'react-router-dom'; // <-- THE FIX: Import useNavigate

interface DealResultsListProps {
  deals: DealWithLocation[];
  hoveredDealId: string | null;
  setHoveredDealId: (id: string | null) => void;
}

export const DealResultsList = ({ deals, hoveredDealId, setHoveredDealId }: DealResultsListProps) => {
  const navigate = useNavigate(); // <-- THE FIX: Initialize the navigate function

  return (
    <div className="pr-4">
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-primary mb-2">
          <ArrowLeft className="w-4 h-4" /> All Results
        </button>
        <h2 className="text-3xl font-bold text-neutral-800">New on CitySpark</h2>
        <p className="text-neutral-600 mt-1">These deals just dropped. Be the first to check them out!</p>
      </div>

      <div className="flex items-center gap-2 my-4">
        <button className="px-3 py-1.5 text-sm font-semibold text-white bg-primary rounded-full">Today</button>
        <button className="px-3 py-1.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-full hover:bg-neutral-100">All Day</button>
        <button className="px-3 py-1.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-full hover:bg-neutral-100 flex items-center gap-1">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>
      
      <div className="my-4 p-4 rounded-lg bg-yellow-100 border border-yellow-200">
        <h3 className="font-bold text-yellow-800">Today's Daily Drop</h3>
        <p className="text-sm text-yellow-700">Unlock a massive, one-time discount. Refreshes every day!</p>
        <button className="mt-2 w-full text-center py-2 bg-yellow-400 text-yellow-900 font-bold rounded-md hover:bg-yellow-500">
          Click to Unlock
        </button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-200/80">
        {deals.map(deal => (
          <DealResultCard
            key={deal.id}
            deal={deal}
            isHovered={hoveredDealId === deal.id}
            onMouseEnter={setHoveredDealId}
            onMouseLeave={() => setHoveredDealId(null)}
          />
        ))}
      </div>
    </div>
  );
};
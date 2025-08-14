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

export const DealResultsList = ({
  deals,
  hoveredDealId,
  setHoveredDealId,
}: DealResultsListProps) => {
  const navigate = useNavigate(); // <-- THE FIX: Initialize the navigate function

  return (
    <div className="pr-4">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> All Results
        </button>
        <h2 className="text-3xl font-bold text-neutral-800">
          New on CitySpark
        </h2>
        <p className="mt-1 text-neutral-600">
          These deals just dropped. Be the first to check them out!
        </p>
      </div>

      <div className="my-4 flex items-center gap-2">
        <button className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-white">
          Today
        </button>
        <button className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
          All Day
        </button>
        <button className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-100 p-4">
        <h3 className="font-bold text-yellow-800">Today's Daily Drop</h3>
        <p className="text-sm text-yellow-700">
          Unlock a massive, one-time discount. Refreshes every day!
        </p>
        <button className="mt-2 w-full rounded-md bg-yellow-400 py-2 text-center font-bold text-yellow-900 hover:bg-yellow-500">
          Click to Unlock
        </button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-200/80">
        {deals.map((deal) => (
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

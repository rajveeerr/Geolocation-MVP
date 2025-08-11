// web/src/components/deals/DealResultsList.tsx
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { DealResultCard } from './DealResultCard';
import { Button } from '../common/Button';
import type { DealWithLocation } from '@/data/deals';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  return (
    <div className="pr-4">
      <div className="mb-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="mb-4 px-0 text-neutral-700 hover:text-primary"
          icon={<ArrowLeft className="h-4 w-4" />}
          iconPosition="left"
        >
          All Results
        </Button>
        <h2 className="text-3xl font-bold text-neutral-800">
          New on CitySpark
        </h2>
        <p className="mt-2 text-neutral-600">
          These deals just dropped. Be the first to check them out!
        </p>
      </div>

      <div className="my-6 flex flex-wrap items-center gap-3">
        <Button size="sm" className="rounded-xl">
          Today
        </Button>
        <Button variant="secondary" size="sm" className="rounded-xl">
          All Day
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-xl"
          icon={<SlidersHorizontal className="h-4 w-4" />}
          iconPosition="left"
        >
          Filters
        </Button>
      </div>

      <div className="my-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-amber-800">Today's Daily Drop</h3>
        <p className="mb-4 mt-1 text-sm text-amber-700">
          Unlock a massive, one-time discount. Refreshes every day!
        </p>
        <Button
          size="md"
          className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 font-bold text-amber-900 shadow-lg hover:from-amber-500 hover:to-yellow-500 hover:shadow-xl"
        >
          Click to Unlock
        </Button>
      </div>

      <div className="flex flex-col divide-y divide-neutral-200/50">
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

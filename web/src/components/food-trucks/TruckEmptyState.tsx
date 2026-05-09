import { Truck } from 'lucide-react';
import { TruckListCard } from './TruckListCard';
import type { TruckSummary } from '@/types/truckSchedule';

interface TruckEmptyStateProps {
  upcoming?: TruckSummary[];
  onSelectTruck?: (truck: TruckSummary) => void;
}

export const TruckEmptyState = ({ upcoming = [], onSelectTruck }: TruckEmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <Truck className="h-6 w-6 text-amber-600" aria-hidden />
      </div>
      <h3 className="mt-3 text-base font-semibold text-neutral-900">
        No food trucks live near you right now
      </h3>
      <p className="mt-1 text-sm text-neutral-500">
        {upcoming.length > 0
          ? "Here's what's coming up next:"
          : 'Try expanding your search radius or check back soon.'}
      </p>

      {upcoming.length > 0 && (
        <div className="mt-5 space-y-2 text-left">
          {upcoming.slice(0, 5).map((t) => (
            <TruckListCard key={t.storeId} truck={t} onClick={onSelectTruck} />
          ))}
        </div>
      )}
    </div>
  );
};

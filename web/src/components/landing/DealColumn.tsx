// web/src/components/landing/DealColumn.tsx

import { Link } from 'react-router-dom';
import { DealCard } from './DealCard';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import type { Deal } from '@/data/deals';

interface DealColumnProps {
  title: string;
  icon: React.ReactNode;
  deals: Deal[];
}

export const DealColumn = ({ title, icon, deals }: DealColumnProps) => {
  return (
    <div className="flex h-[600px] min-w-[300px] max-w-[400px] flex-1 flex-col rounded-2xl border border-neutral-200/80 bg-white shadow-md">
      <div className="relative flex-shrink-0 py-6 text-center">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
          {title}
        </h3>
      </div>

      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div className="scrollbar-hide h-full divide-y divide-neutral-200/60 overflow-y-auto">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-neutral-200/60 p-4 text-center">
        <Link to={PATHS.ALL_DEALS}>
          <Button variant="secondary" size="md" className="font-semibold">
            See All
          </Button>
        </Link>
      </div>
    </div>
  );
};

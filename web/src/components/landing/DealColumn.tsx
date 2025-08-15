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
    <div className="min-w-[300px] flex-1 rounded-2xl border border-neutral-200/80 bg-white shadow-md">
      <div className="relative py-6 text-center">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
            {icon}
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">{title}</h3>
      </div>

      <div className="px-4 pb-4">
        <div className="divide-y divide-neutral-200/60">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-200/60 p-4 text-center">
        <Link to={PATHS.ALL_DEALS}>
          <Button variant="secondary" size="md" className="font-semibold">
            See All
          </Button>
        </Link>
      </div>
    </div>
  );
};

// web/src/components/landing/DealColumn.tsx

import { DealCard, type Deal } from './DealCard';
import { Button } from '@/components/common/Button';

interface DealColumnProps {
  title: string;
  icon: React.ReactNode;
  deals: Deal[];
}

export const DealColumn = ({ title, icon, deals }: DealColumnProps) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-md flex-1 min-w-[300px]">
        <div className="relative text-center py-6">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <h3 className="text-2xl font-bold text-neutral-800">{title}</h3>
        </div>

        <div className="px-4 pb-4">
            <div className="divide-y divide-neutral-200/60">
                {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                ))}
            </div>
        </div>

        <div className="p-4 border-t border-neutral-200/60 text-center">
            <Button variant="secondary" size="md" className="font-semibold">
                See All
            </Button>
        </div>
    </div>
  );
};
// web/src/components/deals/cards/RecurringDealCard.tsx
import { Repeat } from 'lucide-react';
import { UnifiedDealCard } from '../UnifiedDealCard';
import type { DealCardProps } from '@/utils/dealCardUtils';
import { cn } from '@/lib/utils';

interface RecurringDealCardProps {
  deal: DealCardProps;
  className?: string;
  onCardClick?: () => void;
}

export const RecurringDealCard = ({ deal, className, onCardClick }: RecurringDealCardProps) => {
  const recurringDays = deal.recurringDays || [];
  const daysDisplay = recurringDays.length > 0
    ? recurringDays.join(', ')
    : 'Recurring Deal';

  return (
    <div className={cn('relative', className)}>
      <UnifiedDealCard deal={deal} className={className} onCardClick={onCardClick} />
      {recurringDays.length > 0 && (
        <div className="absolute top-16 left-3 z-10 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg">
          <Repeat className="h-3 w-3" />
          <span>{daysDisplay}</span>
        </div>
      )}
    </div>
  );
};


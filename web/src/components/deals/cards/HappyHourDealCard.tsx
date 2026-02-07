// web/src/components/deals/cards/HappyHourDealCard.tsx
import { Clock } from 'lucide-react';
import { UnifiedDealCard } from '../UnifiedDealCard';
import type { DealCardProps } from '@/utils/dealCardUtils';
import { cn } from '@/lib/utils';

interface HappyHourDealCardProps {
  deal: DealCardProps;
  className?: string;
  timeRange?: { start: string; end: string };
  onCardClick?: () => void;
}

export const HappyHourDealCard = ({ deal, className, timeRange, onCardClick }: HappyHourDealCardProps) => {
  return (
    <div className={cn('relative', className)}>
      <UnifiedDealCard deal={deal} className={className} onCardClick={onCardClick} />
      {timeRange && (
        <div className="absolute top-16 left-3 z-10 bg-red-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg">
          <Clock className="h-3 w-3" />
          <span>{timeRange.start} - {timeRange.end}</span>
        </div>
      )}
    </div>
  );
};


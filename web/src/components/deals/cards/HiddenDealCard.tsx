// web/src/components/deals/cards/HiddenDealCard.tsx
import { Lock, Key } from 'lucide-react';
import { UnifiedDealCard } from '../UnifiedDealCard';
import type { DealCardProps } from '@/utils/dealCardUtils';
import { cn } from '@/lib/utils';

interface HiddenDealCardProps {
  deal: DealCardProps;
  className?: string;
  onCardClick?: () => void;
}

export const HiddenDealCard = ({ deal, className, onCardClick }: HiddenDealCardProps) => {
  const accessCodeHint = deal.accessCode
    ? `Code: ${deal.accessCode.substring(0, 4)}...`
    : 'Access Code Required';

  return (
    <div className={cn('relative', className)}>
      <UnifiedDealCard deal={deal} className={className} onCardClick={onCardClick} />
      <div className="absolute top-16 left-3 z-10 bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg">
        <Lock className="h-3 w-3" />
        <span>Hidden Deal</span>
      </div>
      {deal.accessCode && (
        <div className="absolute bottom-20 left-3 z-10 bg-neutral-700/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
          <Key className="h-3 w-3" />
          <span>{accessCodeHint}</span>
        </div>
      )}
    </div>
  );
};


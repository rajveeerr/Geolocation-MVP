// web/src/components/deals/cards/RedeemNowDealCard.tsx
import { Zap, AlertCircle } from 'lucide-react';
import { UnifiedDealCard } from '../UnifiedDealCard';
import type { DealCardProps } from '@/utils/dealCardUtils';
import { cn } from '@/lib/utils';

interface RedeemNowDealCardProps {
  deal: DealCardProps;
  className?: string;
  onCardClick?: () => void;
}

export const RedeemNowDealCard = ({ deal, className, onCardClick }: RedeemNowDealCardProps) => {
  const isUrgent = deal.isFlashSale && deal.maxRedemptions;
  const spotsLeft = isUrgent && deal.maxRedemptions && deal.currentRedemptions
    ? deal.maxRedemptions - deal.currentRedemptions
    : null;

  return (
    <div className={cn('relative', className)}>
      <UnifiedDealCard deal={deal} className={className} onCardClick={onCardClick} />
      {isUrgent && spotsLeft !== null && spotsLeft < 10 && (
        <div className="absolute top-16 left-3 z-10 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
          <AlertCircle className="h-3 w-3" />
          <span>Only {spotsLeft} left!</span>
        </div>
      )}
      {deal.isFlashSale && (
        <div className="absolute top-16 right-3 z-10 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
          <Zap className="h-3 w-3" />
          <span>Flash Sale</span>
        </div>
      )}
    </div>
  );
};


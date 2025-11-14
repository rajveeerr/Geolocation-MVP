// web/src/components/deals/cards/BountyDealCard.tsx
import { Trophy, Users } from 'lucide-react';
import { UnifiedDealCard } from '../UnifiedDealCard';
import type { DealCardProps } from '@/utils/dealCardUtils';
import { cn } from '@/lib/utils';

interface BountyDealCardProps {
  deal: DealCardProps;
  className?: string;
  onCardClick?: () => void;
}

export const BountyDealCard = ({ deal, className, onCardClick }: BountyDealCardProps) => {
  const rewardAmount = deal.bountyRewardAmount || 0;
  const minReferrals = deal.minReferralsRequired || 1;

  return (
    <div className={cn('relative', className)}>
      <UnifiedDealCard deal={deal} className={className} onCardClick={onCardClick} />
      {rewardAmount > 0 && (
        <div className="absolute top-16 left-3 z-10 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
          <Trophy className="h-3 w-3" />
          <span>${rewardAmount} per friend</span>
        </div>
      )}
      {minReferrals > 1 && (
        <div className="absolute top-28 left-3 z-10 bg-yellow-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>Bring {minReferrals}+ friends</span>
        </div>
      )}
    </div>
  );
};


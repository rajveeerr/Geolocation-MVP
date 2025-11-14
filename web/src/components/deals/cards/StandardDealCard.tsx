// web/src/components/deals/cards/StandardDealCard.tsx
import { UnifiedDealCard } from '../UnifiedDealCard';
import type { DealCardProps } from '@/utils/dealCardUtils';

interface StandardDealCardProps {
  deal: DealCardProps;
  className?: string;
  onCardClick?: () => void;
}

export const StandardDealCard = ({ deal, className, onCardClick }: StandardDealCardProps) => {
  // Standard deals use the base UnifiedDealCard without additional overlays
  return <UnifiedDealCard deal={deal} className={className} onCardClick={onCardClick} />;
};


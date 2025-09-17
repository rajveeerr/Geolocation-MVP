import { motion } from 'framer-motion';
import { Heart, Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DealWithLocation } from '@/data/deals';
import { Button } from '../common/Button';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';

interface DealResultCardProps {
  deal: DealWithLocation;
  isHovered: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export const DealResultCard = ({
  deal,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: DealResultCardProps) => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const { savedDealIds, saveDeal, unsaveDeal, isSaving, isUnsaving } = useSavedDeals();

  const isSaved = savedDealIds.has(deal.id);
  const isLikeButtonLoading = isSaving || isUnsaving;

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      openModal();
      return;
    }

    if (isSaved) {
      await unsaveDeal(deal.id);
    } else {
      await saveDeal(deal.id);
    }
  };
  return (
    <motion.div
      onMouseEnter={() => onMouseEnter(deal.id)}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex cursor-pointer gap-4 p-4 border-b border-neutral-200/60 last:border-b-0 transition-all duration-300',
        isHovered && 'bg-neutral-50/80',
      )}
    >
      {/* Deal Image */}
      <div className="relative flex-shrink-0">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-24 w-24 rounded-xl object-cover border border-neutral-200/60"
        />
      </div>

      {/* Deal Content */}
      <div className="min-w-0 flex-grow space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-lg text-neutral-900">
              {deal.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-amber-400" />
                <span className="font-medium">{deal.rating}</span>
              </div>
              <span>&middot;</span>
              <span className="text-brand-primary-600 font-medium">{deal.category}</span>
              <span>&middot;</span>
              <span className="font-bold text-brand-primary-600">{deal.price}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="border-brand-primary-200/60 bg-brand-primary-50/80 text-brand-primary-600 hover:border-brand-primary-300 hover:bg-brand-primary-100 font-bold text-xs px-3 py-1.5"
            >
              DEAL
            </Button>
            <button 
              onClick={handleSaveClick}
              disabled={isLikeButtonLoading}
              className="p-2 rounded-full text-neutral-400 hover:text-brand-primary-500 hover:bg-brand-primary-50 transition-all duration-200 disabled:opacity-50"
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-all duration-200", 
                  isSaved ? "fill-brand-primary-500 text-brand-primary-500" : "hover:scale-110"
                )} 
              />
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-neutral-500">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{deal.location}</span>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-neutral-600 leading-relaxed">
          {deal.description}
        </p>
      </div>
    </motion.div>
  );
};

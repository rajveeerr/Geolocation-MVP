import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DealWithLocation } from '@/data/deals';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';

interface DealResultCardProps {
  deal: DealWithLocation;
  isHovered: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export const DealResultCard = ({ deal, isHovered, onMouseEnter, onMouseLeave }: DealResultCardProps) => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const { savedDealIds, saveDeal, unsaveDeal, isSaving, isUnsaving } = useSavedDeals();

  const isSaved = savedDealIds.has(deal.id);
  // Prevent multiple clicks while an operation is in progress
  const isLikeButtonLoading = isSaving || isUnsaving;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the parent Link from navigating
    e.stopPropagation();

    if (!user) {
      openModal(); // Prompt login if user is not authenticated
      return;
    }

    if (isLikeButtonLoading) return;

    if (isSaved) {
      unsaveDeal(deal.id);
    } else {
      saveDeal(deal.id);
    }
  };

  return (
    <Link to={`/deals/${deal.id}`} className="block w-full">
      <motion.div
        onMouseEnter={() => onMouseEnter(deal.id)}
        onMouseLeave={onMouseLeave}
        className={cn(
          'flex cursor-pointer gap-4 p-4 transition-colors duration-200',
          isHovered && 'bg-brand-primary-50/50'
        )}
      >
        <img
          src={deal.image}
          alt={deal.name}
          className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-grow">
          {/* Top row with title and save button */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-bold text-lg text-neutral-800">{deal.name}</h3>
            <button
              onClick={handleSaveClick}
              disabled={isLikeButtonLoading}
              className="flex-shrink-0 p-2 text-neutral-400 transition-colors hover:text-brand-primary-500 rounded-full hover:bg-brand-primary-100/50"
              aria-label={isSaved ? "Unsave deal" : "Save deal"}
            >
              {isLikeButtonLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart className={cn("h-5 w-5 transition-all", isSaved && "fill-brand-primary-500 text-brand-primary-500")} />
              )}
            </button>
          </div>

          {/* Info-rich metadata row */}
          <div className="-mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-600">
            <div className="flex items-center gap-0.5">
              <Star className="h-4 w-4 fill-current text-brand-primary-500" />
              <span className="font-semibold">{deal.rating}</span>
            </div>
            <span className="text-neutral-300">&middot;</span>
            <span className="truncate">
              {typeof deal.category === 'string' 
                ? deal.category 
                : deal.category?.label || deal.category?.name || 'Category'}
            </span>
            <span className="text-neutral-300">&middot;</span>
            <span className="font-semibold text-neutral-800">{deal.price}</span>
          </div>

          {/* Location */}
          <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{deal.location}</span>
          </div>

          {/* Offer display */}
          <p className="mt-2 font-semibold text-status-live line-clamp-1">{deal.dealValue}</p>
        </div>
      </motion.div>
    </Link>
  );
};

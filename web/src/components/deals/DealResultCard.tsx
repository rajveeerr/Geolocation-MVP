import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DealWithLocation } from '@/data/deals';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import { useState } from 'react';

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
  
  // Handle multiple images
  const images = deal.images && deal.images.length > 0 ? deal.images : [deal.image];
  const hasMultipleImages = images.length > 1;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
          'group flex cursor-pointer gap-4 p-4 transition-colors duration-200',
          isHovered && 'bg-brand-primary-50/50'
        )}
      >
        <div className="relative h-24 w-24 flex-shrink-0">
          <img
            src={images[currentImageIndex]}
            alt={deal.name}
            className="h-24 w-24 rounded-xl object-cover"
          />
          {hasMultipleImages && (
            <>
              {/* Image indicators - always visible */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      idx === currentImageIndex ? "w-4 bg-white shadow-sm" : "w-1.5 bg-white/60"
                    )}
                  />
                ))}
                {images.length > 5 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white/40 text-[8px] leading-none flex items-center justify-center">
                    +
                  </div>
                )}
              </div>
              {/* Navigation buttons - visible on hover */}
              <button
                onClick={prevImage}
                className="absolute left-0.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Previous image"
                type="button"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Next image"
                type="button"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
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

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import type { DealWithLocation } from '@/data/deals';

interface PremiumDealCardProps {
  deal: DealWithLocation;
  isHovered: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export const PremiumDealCard = ({
  deal,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: PremiumDealCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Generate multiple images for carousel (in real app, this would come from API)
  const images = [
    deal.image,
    `${deal.image}&seed=${deal.id}1`,
    `${deal.image}&seed=${deal.id}2`,
    `${deal.image}&seed=${deal.id}3`,
  ];

  const isOpen = !deal.bookingInfo.toLowerCase().includes('sorry');

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <motion.div
      onMouseEnter={() => onMouseEnter(deal.id)}
      onMouseLeave={onMouseLeave}
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-300',
        'rounded-2xl border border-neutral-200/80 bg-white',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5',
        isHovered
          ? 'shadow-primary/8 -translate-y-0.5 border-primary/40 shadow-xl'
          : 'shadow-sm',
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Carousel Section */}
      <div className="relative h-40 overflow-hidden bg-neutral-100 sm:h-44 md:h-48 lg:h-56">
        {/* Images */}
        <div className="relative h-full w-full">
          {images.map((image, index) => (
            <motion.img
              key={index}
              src={image}
              alt={`${deal.name} - Image ${index + 1}`}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
                index === currentImageIndex ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:p-3">
          <button
            onClick={prevImage}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:bg-white sm:h-8 sm:w-8"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-neutral-700 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={nextImage}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:bg-white sm:h-8 sm:w-8"
          >
            <ChevronRight className="h-3.5 w-3.5 text-neutral-700 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 sm:bottom-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                'h-1 w-1 rounded-full transition-all duration-200 sm:h-1.5 sm:w-1.5',
                index === currentImageIndex
                  ? 'w-4 bg-white sm:w-6'
                  : 'bg-white/60 hover:bg-white/80',
              )}
            />
          ))}
        </div>

        {/* Heart Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4',
              isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-600',
            )}
          />
        </button>

        {/* Status Badge */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold backdrop-blur-sm sm:px-2.5 sm:py-1',
              isOpen
                ? 'border-green-200/80 bg-green-100/80 text-green-700'
                : 'border-red-200/80 bg-red-100/80 text-red-700',
            )}
          >
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 lg:p-5">
        {/* Header */}
        <div className="mb-2 sm:mb-3">
          <div className="mb-1 flex items-start justify-between sm:mb-2">
            <h3 className="line-clamp-2 pr-2 text-base font-bold leading-tight text-neutral-900 sm:text-lg">
              {deal.name}
            </h3>
            <div className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2 py-0.5 sm:px-2.5 sm:py-1">
              <Star className="h-3 w-3 fill-current text-amber-500 sm:h-3.5 sm:w-3.5" />
              <span className="text-xs font-semibold text-amber-700 sm:text-sm">
                {deal.rating}
              </span>
            </div>
          </div>

          <p className="mb-1 text-xs font-medium text-neutral-600 sm:text-sm">
            {deal.category}
          </p>
          <div className="flex items-center gap-1 text-xs text-neutral-500 sm:text-sm">
            <MapPin className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
            <span className="truncate">{deal.location}</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="mb-3 space-y-1 sm:mb-4 sm:space-y-2">
          <div className="flex items-center gap-3 text-xs text-neutral-600 sm:gap-4 sm:text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>5-10 min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>2-8 people</span>
            </div>
          </div>
        </div>

        {/* Deal Highlight */}
        <div className="mb-3 rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-2.5 sm:mb-4 sm:p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 sm:h-2 sm:w-2" />
              <span className="text-xs font-semibold text-green-700 sm:text-sm">
                Deal Available
              </span>
            </div>
            <span className="text-base font-bold text-sky-600 sm:text-lg">
              {deal.price}
            </span>
          </div>
          <p className="mt-1 text-xs text-green-600">
            Save up to 30% on your visit
          </p>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="sm"
          className="h-9 w-full rounded-xl text-sm font-semibold sm:h-10 sm:text-base"
          onClick={(e) => e.stopPropagation()}
        >
          View Deal
        </Button>
      </div>
    </motion.div>
  );
};

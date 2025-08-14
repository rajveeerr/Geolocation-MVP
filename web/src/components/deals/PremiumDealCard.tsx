import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react';
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
  onMouseLeave 
}: PremiumDealCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  // Generate multiple images for carousel (in real app, this would come from API)
  const images = [
    deal.image,
    `${deal.image}&seed=${deal.id}1`,
    `${deal.image}&seed=${deal.id}2`,
    `${deal.image}&seed=${deal.id}3`
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
        "group cursor-pointer overflow-hidden transition-all duration-300",
        "bg-white rounded-2xl border border-neutral-200/80",
        "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5",
        isHovered ? "border-primary/40 shadow-xl shadow-primary/8 -translate-y-0.5" : "shadow-sm"
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Carousel Section */}
      <div className="relative h-56 overflow-hidden bg-neutral-100">
        {/* Images */}
        <div className="relative h-full w-full">
          {images.map((image, index) => (
            <motion.img
              key={index}
              src={image}
              alt={`${deal.name} - Image ${index + 1}`}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
        </div>
        
        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={prevImage}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-700" />
          </button>
          <button
            onClick={nextImage}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all"
          >
            <ChevronRight className="h-4 w-4 text-neutral-700" />
          </button>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-200",
                index === currentImageIndex 
                  ? "bg-white w-6" 
                  : "bg-white/60 hover:bg-white/80"
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
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-lg transition-all hover:bg-white hover:scale-110"
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors",
              isLiked ? "fill-red-500 text-red-500" : "text-neutral-600"
            )} 
          />
        </button>

        {/* Status Badge */}
        <div className="absolute left-3 top-3">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border",
            isOpen 
              ? "bg-green-100/80 text-green-700 border-green-200/80" 
              : "bg-red-100/80 text-red-700 border-red-200/80"
          )}>
            {isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="text-lg font-bold text-neutral-900 leading-tight pr-2 line-clamp-2">
              {deal.name}
            </h3>
            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 border border-amber-100">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
              <span className="text-sm font-semibold text-amber-700">{deal.rating}</span>
            </div>
          </div>
          
          <p className="text-sm font-medium text-neutral-600 mb-1">{deal.category}</p>
          <div className="flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{deal.location}</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>5-10 min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>2-8 people</span>
            </div>
          </div>
        </div>

        {/* Deal Highlight */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-3 border border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-700">Deal Available</span>
            </div>
            <span className="text-lg font-bold text-primary">{deal.price}</span>
          </div>
          <p className="text-xs text-green-600 mt-1">Save up to 30% on your visit</p>
        </div>

        {/* Action Button */}
        <Button 
          variant="primary" 
          size="md" 
          className="w-full rounded-xl font-semibold"
          onClick={(e) => e.stopPropagation()}
        >
          View Deal
        </Button>
      </div>
    </motion.div>
  );
};

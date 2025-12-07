// web/src/components/deals/UnifiedDealCard.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ChevronLeft, ChevronRight, MapPin, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DealTypeBadge } from './DealTypeBadge';
import { formatDealValue, calculateTimeRemaining, type DealCardProps } from '@/utils/dealCardUtils';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

interface UnifiedDealCardProps {
  deal: DealCardProps;
  className?: string;
  onCardClick?: () => void;
}

export const UnifiedDealCard = ({ deal, className, onCardClick }: UnifiedDealCardProps) => {
  const { savedDealIds, saveDeal, unsaveDeal } = useSavedDeals();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(deal.endTime || ''));

  const isSaved = savedDealIds.has(deal.id.toString());
  const images = deal.images && deal.images.length > 0 ? deal.images : [deal.image];
  const hasMultipleImages = images.length > 1;

  // Update countdown timer
  useEffect(() => {
    if (!deal.endTime) return;

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deal.endTime!));
    }, 1000);

    return () => clearInterval(interval);
  }, [deal.endTime]);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      unsaveDeal(deal.id.toString());
    } else {
      saveDeal(deal.id.toString());
    }
  };

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

  const dealValue = formatDealValue(deal.discountPercentage, deal.discountAmount, deal.dealType);
  const categoryLabel = typeof deal.category === 'string'
    ? deal.category
    : deal.category?.label || deal.category?.name || 'Category';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl',
        className
      )}
    >
      <Link
        to={`${PATHS.DEALS}/${deal.id}`}
        onClick={onCardClick}
        className="block"
      >
        {/* Image Section */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-neutral-200">
          <img
            src={images[currentImageIndex] || deal.image}
            alt={deal.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.slice(0, 5).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      idx === currentImageIndex ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/60'
                    )}
                  />
                ))}
                {images.length > 5 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                )}
              </div>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Previous image"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Next image"
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Deal Type Badge */}
          <div className="absolute top-3 left-3 z-10">
            <DealTypeBadge dealType={deal.dealType} size="sm" />
          </div>

          {/* Discount Badge */}
          {dealValue && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                {dealValue}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveClick}
            className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
            aria-label={isSaved ? 'Unsave deal' : 'Save deal'}
            type="button"
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                isSaved ? 'fill-red-600 text-red-600' : 'text-neutral-600'
              )}
            />
          </button>

          {/* Countdown Timer (for time-sensitive deals) */}
          {deal.endTime && !timeRemaining.isExpired && (
            <div className="absolute bottom-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Clock className="h-3 w-3 inline mr-1" />
              {timeRemaining.formatted}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title and Rating */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-neutral-900 line-clamp-2 flex-1 pr-2">
              {deal.title}
            </h3>
            {deal.rating && (
              <div className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 flex-shrink-0">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-sm font-semibold text-amber-700">
                  {deal.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Category and Location */}
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
            <span>{categoryLabel}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{deal.location}</span>
            </div>
          </div>

          {/* Merchant Name */}
          <p className="text-sm font-medium text-neutral-700 mb-3">{deal.merchantName}</p>

          {/* Social Proof */}
          {deal.socialProof && (deal.socialProof.totalSaves > 0 || deal.socialProof.totalCheckIns > 0) && (
            <div className="flex items-center gap-2 mb-3">
              {deal.socialProof.recentUsers && deal.socialProof.recentUsers.length > 0 && (
                <div className="flex -space-x-2">
                  {deal.socialProof.recentUsers.slice(0, 3).map((user, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white"
                      style={{
                        backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  ))}
                </div>
              )}
              <span className="text-xs text-neutral-600">
                {deal.socialProof.totalSaves || 0} saved
                {deal.socialProof.totalCheckIns > 0 && ` • ${deal.socialProof.totalCheckIns} check-ins`}
              </span>
            </div>
          )}

          {/* Deal-specific indicators */}
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-neutral-100">
            {deal.dealType === 'BOUNTY' && deal.bountyRewardAmount && (
              <div className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                <span>💰</span>
                <span>${deal.bountyRewardAmount} per friend</span>
              </div>
            )}
            {deal.dealType === 'RECURRING' && deal.recurringDays && deal.recurringDays.length > 0 && (
              <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                <Clock className="h-3 w-3" />
                <span>{deal.recurringDays.join(', ')}</span>
              </div>
            )}
            {deal.isFlashSale && deal.maxRedemptions && (
              <div className="flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                <Users className="h-3 w-3" />
                <span>
                  {deal.currentRedemptions || 0}/{deal.maxRedemptions} redeemed
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};


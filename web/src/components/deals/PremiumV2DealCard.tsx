// web/src/components/deals/PremiumV2DealCard.tsx
import { useState, useEffect } from 'react';
import { Heart, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Deal } from '@/data/deals';
import { useCountdown } from '@/hooks/useCountdown';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarStack } from '@/components/common/AvatarStack';

// Extended type to include multiple images and other properties
interface PremiumDeal extends Deal {
  images?: string[];
  subtitle?: string;
  tapInCount?: number;
  priceValue?: number;
  offerTerms?: string;
  claimedBy?: { totalCount: number; visibleUsers: { avatarUrl: string }[] };
}

export const PremiumV2DealCard = ({ deal }: { deal: PremiumDeal }) => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const { savedDealIds, saveDeal, unsaveDeal, isSaving, isUnsaving } =
    useSavedDeals();

  const [isHovered, setIsHovered] = useState(false);
  const isSaved = savedDealIds.has(deal.id);
  const isLikeButtonLoading = isSaving || isUnsaving;

  const imagesToShow =
    deal.images && deal.images.length > 0 ? deal.images : [deal.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const countdown = useCountdown(deal.expiresAt || '');
  // Format countdown to show HH.MM.SS format like 06.45.22
  const formattedCountdown = `${String(countdown.hours).padStart(2, '0')}.${String(countdown.minutes).padStart(2, '0')}.${String(countdown.seconds).padStart(2, '0')}`;

  const normalizedDealType = String(deal.dealType).toLowerCase();
  const isHappyHour = normalizedDealType.includes('happy');
  const showCountdown =
    isHappyHour &&
    deal.expiresAt &&
    (countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0);

  // Auto-scrolling image carousel effect
  useEffect(() => {
    if (isHovered && imagesToShow.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % imagesToShow.length,
        );
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(timer);
    }
  }, [isHovered, imagesToShow.length]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openModal();
      return;
    }
    if (isLikeButtonLoading) return;
    isSaved ? unsaveDeal(deal.id) : saveDeal(deal.id);
  };

  const imageVariants = {
    enter: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  return (
    <div
      className="w-full max-w-[340px] flex-shrink-0 font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card Container */}
      <div className="relative transform overflow-hidden rounded-[2.5rem] bg-white shadow-xl transition-transform duration-300">
        <Link to={`/deals/${deal.id}`} className="block">
          {/* Image Carousel */}
          <div className="relative h-[450px]">
            <AnimatePresence initial={false}>
              <motion.img
                key={currentImageIndex}
                src={imagesToShow[currentImageIndex]}
                alt={deal.name}
                variants={imageVariants}
                initial="exit"
                animate="enter"
                exit="exit"
                className="absolute h-full w-full object-cover"
              />
            </AnimatePresence>
            {/* Gradient overlay always present but stronger on hover */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-t transition-opacity duration-300',
                isHovered
                  ? 'from-black/80 via-black/30 to-transparent opacity-100'
                  : 'from-black/40 via-transparent to-transparent opacity-80',
              )}
            />
          </div>

          {/* Conditional Overlays: Revealed on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Timer - Top Center */}
                {showCountdown && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2">
                    <div className="text-md flex items-center gap-2 rounded-b-full bg-brand-primary-main px-8 py-2 font-bold text-white shadow-lg">
                      <Clock className="h-6 w-6" />
                      <span>{formattedCountdown}</span>
                    </div>
                  </div>
                )}

                {/* Deal Type - Top Left */}
                {/* <div className="absolute left-6 top-6">
                  {deal.name && (
                    <div className="rounded-full bg-brand-primary-main px-4 py-2 text-sm font-bold text-white shadow-lg">
                      {deal.dealType || '2-for-1 Drinks'}
                    </div>
                  )}
                </div> */}

                {/* Discount Percentage - Top Right */}
                <div className="absolute right-0 top-[50%]">
                  {deal.dealValue && (
                    <div className="rounded-tl-2xl bg-brand-primary-main px-4 py-2 text-base font-bold text-white shadow-md">
                      {deal.dealValue}
                    </div>
                  )}
                </div>

                {/* Restaurant Info - Bottom Left */}
                <div className="absolute bottom-6 left-6 right-20 text-white">
                  <h3 className="text-3xl font-bold leading-tight">
                    {deal.name}
                  </h3>
                  <p className="mt-1.5 text-base text-neutral-300">
                    {deal.subtitle || 'Cyber Hub sdfsv sdsd'}
                  </p>
                  <div className="mt-4 font-semibold text-brand-primary-400">
                    {deal.claimedBy && deal.claimedBy.totalCount > 0 ? (
                      <AvatarStack
                        count={deal.claimedBy.totalCount}
                        users={deal.claimedBy.visibleUsers}
                      />
                    ) : (
                      <p className="text-white/80">Be the first to claim</p>
                    )}
                  </div>
                </div>

                {/* Heart Button - Bottom Right */}
                <button
                  onClick={handleLikeClick}
                  disabled={isLikeButtonLoading}
                  className="absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/25 shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                  aria-label={isSaved ? 'Unsave deal' : 'Save deal'}
                >
                  <Heart
                    className={cn(
                      'h-8 w-8 transition-colors',
                      isSaved
                        ? 'fill-brand-primary-400 text-brand-primary-400'
                        : 'text-white/80',
                    )}
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Action Bar */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <AnimatePresence>
          {isHovered ? (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '65%' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex-grow"
            >
              <Link to={`/deals/${deal.id}`} className="block">
                <button className="flex h-14 w-full items-center justify-between rounded-full bg-brand-primary-main p-1.5 font-bold text-white shadow-lg">
                  <span className="pl-5 text-lg">Buy Now</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/30">
                    <ArrowRight className="h-6 w-6 -rotate-45" />
                  </div>
                </button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Link to={`/deals/${deal.id}`} className="block">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary-main text-white shadow-lg">
                  <ArrowRight className="h-6 w-6 -rotate-45" />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex h-14 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 px-6 text-lg font-bold text-neutral-900 shadow-lg">
          ${deal.priceValue || 50}
        </div>
      </div>
    </div>
  );
};

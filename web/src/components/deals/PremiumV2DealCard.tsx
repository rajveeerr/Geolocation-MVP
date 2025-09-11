// web/src/components/deals/PremiumV2DealCard.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Phone, ChevronDown, ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import type { Deal } from '@/data/deals';
import { AvatarStack } from '@/components/common/AvatarStack';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useCountdown } from '@/hooks/useCountdown';

// A small, reusable component for colored tags
const DealTag = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded bg-orange-100 px-2 py-1 text-xs font-bold text-orange-600">
    {children}
  </div>
);

// Define an extended type for this component to understand new optional fields
interface PremiumDeal extends Deal {
  images?: string[];
  offers?: { title: string; time: string }[];
  tapInCount?: number;
}

// Mock data for new features until the backend provides it
const mockOffers = [
    { title: "2-for-1 Cocktails", time: "5-7 PM" },
    { title: "50% Off Appetizers", time: "5-6 PM" },
    { title: "$5 Draft Beers", time: "All Night" },
];

export const PremiumV2DealCard = ({ deal }: { deal: PremiumDeal }) => {
  const [offersVisible, setOffersVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Smartly handle single or multiple images.
  const imagesToShow = (deal.images && deal.images.length > 0) ? deal.images : [deal.image];

  // --- NEW: state & helpers for Framer Motion image slider ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasMultipleImages = imagesToShow.length > 1;

  // Autoplay settings
  const AUTOPLAY_INTERVAL = 3500; // ms

  // --- Countdown functionality ---
  const countdown = useCountdown(deal.expiresAt || '');
  const { days, hours, minutes, seconds } = countdown;
  const showCountdown = deal.expiresAt && (days > 0 || hours > 0 || minutes > 0 || seconds > 0);
  const isExpiringSoon = days === 0 && hours < 2;

  // --- useSavedDeals hook integration ---
  const { savedDealIds, saveDeal, unsaveDeal, isSaving, isUnsaving } = useSavedDeals();
  const isSaved = savedDealIds.has(deal.id);
  const isLikeButtonLoading = isSaving || isUnsaving;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLikeButtonLoading) return;

    if (isSaved) {
      unsaveDeal(deal.id);
    } else {
      saveDeal(deal.id);
    }
  };

  // Autoplay effect with pause-on-hover
  useEffect(() => {
    if (!hasMultipleImages) return;
    if (isHovered) return; // pause when hovered

    const timer = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imagesToShow.length);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [isHovered, hasMultipleImages, imagesToShow.length]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imagesToShow.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imagesToShow.length) % imagesToShow.length);
  };

  const imageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="block">
      <div className="group w-full max-w-sm cursor-pointer overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
      {/* --- Image Slider & Overlays (Framer Motion) --- */}
      <div
        className="relative aspect-[4/3]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={currentImageIndex}
            src={imagesToShow[currentImageIndex]}
            alt={`${deal.name} view ${currentImageIndex + 1}`}
            variants={imageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute h-full w-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
        
        {/* Arrow navigation */}
        {hasMultipleImages && (
          <>
            <Button
              onClick={prevImage}
              variant="ghost" size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
            >
              <ChevronLeft className="w-6" />
            </Button>
            <Button
              onClick={nextImage}
              variant="ghost" size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Indicator dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imagesToShow.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all duration-300',
                  currentImageIndex === idx ? 'w-4 bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}

        {/* Overlay Buttons (Call & Like) */}
        <Button variant="ghost" size="sm" className="absolute left-3 top-3 h-9 w-9 bg-black/30 text-white hover:bg-black/50 hover:text-white rounded-full">
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          title={isSaved ? 'Unsave Deal' : 'Save Deal'}
          aria-label={isSaved ? 'Unsave this deal' : 'Save this deal'}
          onClick={handleLikeClick}
          disabled={isLikeButtonLoading}
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 h-9 w-9 bg-black/30 text-white hover:bg-red-500/80 hover:text-white rounded-full flex items-center justify-center"
        >
          {isLikeButtonLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={cn('h-4 w-4 transition-all', isSaved && 'fill-current text-red-500')} />
          )}
        </Button>
      </div>

      {/* --- Main Content --- */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-neutral-900 line-clamp-2">{deal.name}</h3>
        <p className="mt-1 text-base text-neutral-600">{deal.location}</p>

        {/* Countdown Timer - Display at top center */}
        {showCountdown && (
          <div className="mt-3 flex items-center justify-center">
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
              isExpiringSoon 
                ? "bg-red-50 text-red-700 border border-red-200" 
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}>
              <Clock className="h-4 w-4" />
              <span>
                {days > 0 && `${days}d `}
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                {isExpiringSoon && " left"}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Tags from deal data */}
        <div className="mt-3 flex items-center gap-2">
            {deal.dealType && <DealTag>{deal.dealType}</DealTag>}
            {deal.dealValue && <DealTag>{deal.dealValue}</DealTag>}
            <DealTag>$5 Kickback</DealTag> 
        </div>

        {/* Social Proof with AvatarStack */}
        <div className="mt-4">
            <AvatarStack count={deal.tapInCount || 342} />
        </div>
      </div>
      
      {/* --- Actions & Expandable Offers --- */}
      <div className="px-4 pb-4">
        <button 
            onClick={() => setOffersVisible(!offersVisible)}
            className="flex items-center justify-center w-full mb-3 text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-800"
        >
            <span>View All Offers</span>
            <ChevronDown className={cn("h-5 w-5 ml-1 transition-transform", offersVisible && "rotate-180")} />
        </button>
        <AnimatePresence>
        {offersVisible && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
            >
                {/* Countdown in dropdown */}
                {showCountdown && (
                  <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-red-50 to-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">Deal Expires In:</span>
                      </div>
                      <div className={cn(
                        "text-sm font-bold",
                        isExpiringSoon ? "text-red-700" : "text-amber-700"
                      )}>
                        {days > 0 && `${days}d `}
                        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                )}

                <div className="scrollbar-hide flex gap-3 pb-2 overflow-x-auto">
                    {(deal.offers || mockOffers).map(offer => (
                        <div key={offer.title} className="flex-shrink-0 w-36 rounded-lg border p-3 text-center bg-neutral-50">
                           <p className="font-bold text-sm text-neutral-800">{offer.title}</p>
                           <p className="text-xs text-neutral-500 mt-1">{offer.time}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Primary CTA with new text and color - only this navigates */}
        <Link to={`/deals/${deal.id}`} className="block w-full">
          <Button size="lg" className="w-full bg-accent-resy-orange font-bold text-white hover:bg-accent-resy-orange/90">
            Tap in
          </Button>
        </Link>
      </div>
      </div>
    </div>
  );
};

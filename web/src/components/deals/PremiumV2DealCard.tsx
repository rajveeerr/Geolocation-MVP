// web/src/components/deals/PremiumV2DealCard.tsx
import { useState, useEffect } from 'react';
import { Heart, Clock, ArrowRight, Phone, ChevronDown, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { Deal, Offer } from '@/data/deals';
import { useCountdown } from '@/hooks/useCountdown';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarStack } from '@/components/common/AvatarStack';
import { Button } from '@/components/common/Button';

// Extended type to include multiple images and other properties
interface PremiumDeal extends Deal {
  images?: string[];
  subtitle?: string;
  tapInCount?: number;
  priceValue?: number;
  offerTerms?: string;
  claimedBy?: { totalCount: number; visibleUsers: { avatarUrl: string }[] };
  isBooking?: boolean;
  discountPercentage?: number | null;
  bookingInfo?: string;
}

export const PremiumV2DealCard = ({ deal }: { deal: PremiumDeal }) => {
  // If there's no discount or offer to render, don't render the card
  const hasDiscount = Boolean(
    deal.dealValue ||
      deal.discountPercentage ||
      deal.discountAmount ||
      (deal as any).discountedPrice ||
      (deal as any).discountValue,
  );
  if (!hasDiscount) return null;

  const { user } = useAuth();
  const { openModal } = useModal();
  const { toast } = useToast();
  const { savedDealIds, saveDeal, unsaveDeal, isSaving, isUnsaving } =
    useSavedDeals();

  // Always show the full card details (no hover required)
  const isHovered = true;
  const isSaved = savedDealIds.has(deal.id);
  const isLikeButtonLoading = isSaving || isUnsaving;

  const imagesToShow =
    deal.images && deal.images.length > 0 ? deal.images : [deal.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Mock data for offers until the backend provides it
  const mockOffers: Offer[] = [
    { title: '2-for-1 Cocktails', time: '5-7 PM' },
    { title: '50% Off Appetizers', time: '5-6 PM' },
    { title: '$5 Draft Beers', time: 'All Night' },
  ];

  // Mock claimed users for kickback deals when backend data isn't available
  const mockClaimedUsers = [
    { avatarUrl: 'https://github.com/shadcn.png' },
    { avatarUrl: 'https://github.com/vercel.png' },
    { avatarUrl: 'https://github.com/react.png' },
  ];

  // State to control visibility of offers dropdown/list
  const [offersVisible, setOffersVisible] = useState(false);

  const countdown = useCountdown(deal.expiresAt || '');
  // Format countdown to show HH.MM.SS format like 06.45.22
  const formattedCountdown = `${String(countdown.hours).padStart(2, '0')}.${String(countdown.minutes).padStart(2, '0')}.${String(countdown.seconds).padStart(2, '0')}`;

  const normalizedDealType = String(deal.dealType).toLowerCase();
  const isHappyHour = normalizedDealType.includes('happy');
  const showCountdown =
    isHappyHour &&
    deal.expiresAt &&
    (countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0);

  const isHighValueDiscount = (deal.discountPercentage ?? 0) >= 50;
  
  let ctaText = 'Tap in';
  let ctaIcon = <ArrowRight className="h-6 w-6 -rotate-45" />;
  let ctaVariant = 'primary';

  if (deal.isBooking) {
    ctaText = 'Pre-buy';
    ctaIcon = <ArrowRight className="h-5 w-5 -rotate-45" />;
    ctaVariant = 'primary';
  } else if (isHighValueDiscount) {
    ctaText = 'REDEEM NOW';
    ctaIcon = null as any; 
  }

  // Auto-scrolling image carousel effect
  useEffect(() => {
    if (imagesToShow.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % imagesToShow.length,
        );
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(timer);
    }
  }, [imagesToShow.length]);

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
    <div className="w-full max-w-[340px] flex-shrink-0 font-sans">
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
            {/* Gradient overlay always present (strong) */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-t transition-opacity duration-300',
                'from-black/80 via-black/30 to-transparent opacity-100',
              )}
            />
          </div>

          {/* Conditional Overlays: Revealed on Hover */}
          {/* Overlays - always visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

                <div className='absolute right-3 top-3 flex flex-col gap-2'>
                  <Button
                    variant="secondary"
                    size="md"
                    className="h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus:ring-0 ring-0 ring-offset-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const maybePhone = String(deal.bookingInfo || '');
                      if (/\+?\d[\d\s\-()]{4,}/.test(maybePhone)) {
                        window.location.href = `tel:${maybePhone.replace(/[^\d+]/g, '')}`;
                      }
                    }}
                    icon={<Phone className="h-4 w-4 text-neutral-900" />}
                    aria-label="Call restaurant"
                  />

                  {/* Share button below the phone button */}
                  <Button
                    variant="secondary"
                    size="md"
                    className="h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus:ring-0 ring-0 ring-offset-0"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const url = `${window.location.origin}/deals/${deal.id}`;
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: deal.name, url });
                          toast({ title: 'Shared deal' });
                        } else if (navigator.clipboard) {
                          await navigator.clipboard.writeText(url);
                          toast({ title: 'Link copied to clipboard' });
                        } else {
                          // fallback: select and copy
                          const textArea = document.createElement('textarea');
                          textArea.value = url;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          toast({ title: 'Link copied to clipboard' });
                        }
                      } catch (err) {
                        toast({ title: 'Unable to share', description: String(err), variant: 'destructive' });
                      }
                    }}
                    icon={<Share2 className="h-4 w-4 text-neutral-900" />}
                    aria-label="Share deal"
                  />
                  {/* Like (save) button below share */}
                  <Button
                    variant="secondary"
                    size="md"
                    className="h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus:ring-0 ring-0 ring-offset-0"
                    onClick={(e) => handleLikeClick(e)}
                    disabled={isLikeButtonLoading}
                    icon={
                      <Heart
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isSaved
                            ? 'fill-brand-primary-400 text-brand-primary-400'
                            : 'text-neutral-900',
                        )}
                      />
                    }
                    aria-label={isSaved ? 'Unsave deal' : 'Save deal'}
                  />
                </div>

            <div className="absolute right-0 top-[50%]">
              {deal.dealValue && (
                <div className="rounded-tl-2xl px-4 py-2 text-base font-bold text-white shadow-md bg-brand-primary-main/20 backdrop-blur-sm border border-white/10">
                  {deal.dealValue}
                </div>
              )}
            </div>

            {/* Restaurant Info - Bottom Left */}
            <div className="absolute bottom-6 left-6 right-20 text-white">
              <h3 className="text-3xl font-bold leading-tight">
                {deal.name}
              </h3>
              <p className="mt-1.5 text-base text-white/90">
                {deal.subtitle || 'Cyber Hub is a part of the DLF Cyber City complex'}
              </p>
              <div className="mt-4 font-semibold text-brand-primary-400">
                {deal.claimedBy && deal.claimedBy.totalCount > 0 ? (
                  <AvatarStack
                    count={deal.claimedBy.totalCount}
                    users={deal.claimedBy.visibleUsers}
                    textClassName="text-white/90"
                  />
                ) : (
                  // Show placeholder avatars for cards without backend claimedBy data
                  <div className="opacity-90">
                    <AvatarStack
                      count={mockClaimedUsers.length}
                      users={mockClaimedUsers}
                      textClassName="text-white/90 ml-4"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Heart Button - Bottom Right */}
            {/* <button
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
            </button> */}
          </motion.div>
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
                <div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOffersVisible(!offersVisible);
                    }}
                    className="flex items-center justify-center w-full mb-3 text-sm font-semibold text-brand-primary-600 hover:text-brand-primary-800"
                  >
                    <span>View All Offers</span>
                    <ChevronDown className={cn('h-5 w-5 ml-1 transition-transform', offersVisible && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {offersVisible && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="scrollbar-hide flex gap-3 pb-4 overflow-x-auto">
                          {(deal.offers || mockOffers).map((offer) => (
                            <div key={offer.title} className="flex-shrink-0 w-36 rounded-lg border border-neutral-200 p-3 text-center bg-neutral-50">
                              <p className="font-bold text-sm text-neutral-800">{offer.title}</p>
                              <p className="text-xs text-neutral-500 mt-1">{offer.time}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Link to={`/deals/${deal.id}`} className="block">
                    <Button
                      size="lg"
                      variant={isHighValueDiscount ? 'primary' : ctaVariant as any}
                      className={cn(
                        'w-full rounded-full font-bold',
                        isHighValueDiscount && '!bg-red-600 hover:!bg-red-700 text-white'
                      )}
                    >
                      {ctaIcon && <span className="mr-3">{ctaIcon}</span>}
                      <span className="text-lg">{ctaText}</span>
                    </Button>
                  </Link>
                </div>
            </motion.div>
          ) : (
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Link to={`/deals/${deal.id}`} className="block">
                <Button
                  size="md"
                  variant={isHighValueDiscount ? 'primary' : ctaVariant as any}
                  className={cn(
                    'h-14 w-14 rounded-full shadow-lg p-0',
                    isHighValueDiscount
                      ? 'bg-red-600 text-white'
                      : deal.isBooking
                      ? 'bg-amber-500 text-white'
                      : 'bg-brand-primary-main text-white'
                  )}
                  icon={ctaIcon ?? <ArrowRight className="h-6 w-6 -rotate-45" />}
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {
          (() => {
            const priceDisplay =
              (deal as any).discountedPrice
                ? `$${(deal as any).discountedPrice}`
                : (deal as any).discountValue
                ? `$${(deal as any).discountValue}`
                : deal.discountAmount
                ? `$${deal.discountAmount}`
                : deal.discountPercentage
                ? `${deal.discountPercentage}% OFF`
                : (deal as any).originalPrice
                ? `$${(deal as any).originalPrice}`
                : null;

            return priceDisplay ? (
                  <div className="flex h-14 flex-shrink-0 items-center justify-center rounded-full px-6 text-lg font-bold text-neutral-900 shadow-lg bg-neutral-100/70 backdrop-blur-sm border border-white/10">
                    {priceDisplay}
                  </div>
            ) : null;
          })()
        }
      </div>
    </div>
  );
};

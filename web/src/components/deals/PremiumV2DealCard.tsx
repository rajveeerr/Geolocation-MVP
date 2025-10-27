// web/src/components/deals/PremiumV2DealCard.tsx
import { useState, useEffect, useMemo, memo } from 'react';
import { Heart, Clock, ArrowRight, Phone, ChevronDown, Share2, Eye, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { Deal, Offer } from '@/data/deals';
import { useCountdown } from '@/hooks/useCountdown';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import { motion, AnimatePresence } from 'framer-motion';
// AvatarStack component inline to avoid import issues
import { Button } from '@/components/common/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvailableTablesList } from '@/components/table-booking/AvailableTablesList';
import { TimeSlotQuickCard } from '@/components/table-booking/TimeSlotQuickCard';
import { TableBookingModal } from '@/components/table-booking/TableBookingModal';
import { useTodayAvailability } from '@/hooks/useTableBooking';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

// Inline AvatarStack component
interface AvatarStackProps {
  count: number;
  users?: { avatarUrl?: string | null }[];
  textClassName?: string;
}

const AvatarStack = ({ count, users, textClassName }: AvatarStackProps) => {
  // Only show avatars if we have real users and a count > 0
  const shouldShowAvatars = count > 0 && users && users.length > 0;
  
  // Limit the number of avatars shown to a reasonable number (max 5)
  const maxAvatarsToShow = Math.min(count, 5);
  const avatarsToShow = shouldShowAvatars ? users.slice(0, maxAvatarsToShow) : [];

  return (
    <div className="flex items-center">
      {shouldShowAvatars && (
        <div className="flex -space-x-3">
          {avatarsToShow.map((user, index) => (
            <Avatar key={index} className="h-8 w-8 border-2 border-white">
              <AvatarImage 
                src={user.avatarUrl || undefined} 
                alt={`User ${index + 1}`}
                onError={() => {
                  // The AvatarFallback will show instead
                }}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                {user.avatarUrl ? 'U' : '?'}
              </AvatarFallback>
            </Avatar>
          ))}
          {/* Show a "+X more" indicator if there are more users than we can display */}
          {count > maxAvatarsToShow && (
            <div className="h-8 w-8 rounded-full border-2 border-white bg-neutral-600 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">+{count - maxAvatarsToShow}</span>
            </div>
          )}
        </div>
      )}
      <span className={textClassName ?? 'ml-3 text-sm font-semibold text-neutral-700'}>
        {count === 1 ? '1 person tapped in' : `${count} people tapped in`}
      </span>
    </div>
  );
};

// Extended type to include multiple images and other properties
interface PremiumDeal extends Deal {
  images?: string[];
  subtitle?: string;
  tapInCount?: number;
  offerTerms?: string;
  claimedBy?: { totalCount: number; visibleUsers: { avatarUrl: string }[] };
  isBooking?: boolean;
  discountPercentage?: number | null;
  bookingInfo?: string;
  description?: string;
}

export const PremiumV2DealCard = ({ deal }: { deal: PremiumDeal }) => {
  // If there's no discount or offer to render, don't render the card
  const hasDiscount = Boolean(
    deal.dealValue ||
      deal.discountPercentage ||
      deal.discountAmount
  );
  if (!hasDiscount) return null;

  const { user } = useAuth();
  const { openModal } = useModal();
  const { toast } = useToast();
  const { savedDealIds, saveDeal, unsaveDeal, isSaving, isUnsaving } =
    useSavedDeals();

  // Fetch today's availability for this merchant
  // Only fetch availability if merchantId is defined
  const shouldFetchAvailability = deal.merchantId !== undefined && deal.merchantId !== null;
  
  const { data: todayAvailability, isLoading: isLoadingAvailability, error: availabilityError } = useTodayAvailability(
    deal.merchantId || 0, // Use 0 if undefined (will not fetch due to enabled condition)
    2 // default party size
  );

  // State for booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedTimeSlot, setPreselectedTimeSlot] = useState<any>(null);

  // Always show the full card details (no hover required)
  const isHovered = true;
  const isSaved = savedDealIds.has(deal.id);
  const isLikeButtonLoading = isSaving || isUnsaving;

  const imagesToShow = useMemo(() => {
    if (deal.images && deal.images.length > 0) {
      return deal.images;
    }
    // Use deal image, then merchant logo, then fallback
    const imageSources = [deal.image];
    if (deal.merchantLogo) {
      imageSources.push(deal.merchantLogo);
    }
    imageSources.push('https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80');
    return imageSources;
  }, [deal.images, deal.image, deal.merchantLogo]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use real backend data only - no fallback to mock data
  const realOffers: Offer[] = deal.offers || [];
  const offerImageFallback = deal.merchantLogo || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80';

  // Use real claimed users from backend data - no fallback to mock data
  const realClaimedUsers = deal.claimedBy?.visibleUsers || [];
  const realClaimedCount = deal.claimedBy?.totalCount || 0;
  
  // Use real data only - no fake data
  const finalClaimedCount = realClaimedCount;
  const finalClaimedUsers = realClaimedUsers;

  // State to control visibility of offers dropdown/list
  const [offersVisible, setOffersVisible] = useState(true);
  
  // Get unique categories from real offers and always add Tables
  const availableCategories = useMemo(() => {
    const categories = realOffers.map(offer => offer.category).filter(Boolean);
    // Always include Drinks, Bites, and Tables tabs
    const defaultCategories = ['Drinks', 'Bites', 'Tables'];
    
    return [...new Set([...defaultCategories, ...categories])];
  }, [realOffers]);
  
  const [activeOfferTab, setActiveOfferTab] = useState<string>('Drinks');

  // Ensure active tab is always valid
  useEffect(() => {
    if (!availableCategories.includes(activeOfferTab)) {
      setActiveOfferTab('Drinks');
    }
  }, [availableCategories, activeOfferTab]);

  // --- NEW: Memoize the filtered offers to prevent re-calculation on every render ---
  const filteredOffers = useMemo(() => {
    // If Tables tab is selected, return empty array as tables are handled separately
    if (activeOfferTab === 'Tables') {
      return [];
    }
    return realOffers.filter((offer) => offer.category === activeOfferTab);
  }, [realOffers, activeOfferTab]);

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

  // Handle different deal types
  if (deal.isBooking) {
    ctaText = 'Pre-buy';
    ctaIcon = <ArrowRight className="h-5 w-5 -rotate-45" />;
    ctaVariant = 'primary';
  } else if (deal.dealType === 'Redeem Now' || deal.dealType === 'REDEEM_NOW') {
    ctaText = 'REDEEM NOW';
    ctaIcon = null as any;
    ctaVariant = 'primary';
  } else if (deal.dealType === 'Hidden Deal' || deal.dealType === 'HIDDEN') {
    ctaText = 'Unlock Deal';
    ctaIcon = <Eye className="h-5 w-5" />;
    ctaVariant = 'secondary';
  } else if (deal.dealType === 'Bounty Deal' || deal.dealType === 'BOUNTY') {
    ctaText = 'Earn Rewards';
    ctaIcon = <Trophy className="h-5 w-5" />;
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

  const handleTimeSlotBook = (timeSlot: any) => {
    setPreselectedTimeSlot(timeSlot);
    setIsBookingModalOpen(true);
  };

  const handleViewAllTimes = () => {
    setPreselectedTimeSlot(null);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setPreselectedTimeSlot(null);
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
            {/* Deal Type Badge - Top Left */}
            {(deal.dealType === 'Redeem Now' || deal.dealType === 'REDEEM_NOW' || 
              deal.dealType === 'Hidden Deal' || deal.dealType === 'HIDDEN' || 
              deal.dealType === 'Bounty Deal' || deal.dealType === 'BOUNTY') && (
              <div className="absolute left-3 top-3">
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold shadow-lg",
                  deal.dealType === 'Redeem Now' || deal.dealType === 'REDEEM_NOW' 
                    ? "bg-red-500 text-white" 
                    : deal.dealType === 'Hidden Deal' || deal.dealType === 'HIDDEN'
                    ? "bg-purple-500 text-white"
                    : "bg-yellow-500 text-black"
                )}>
                  {deal.dealType === 'Redeem Now' || deal.dealType === 'REDEEM_NOW' ? '⚡ REDEEM NOW' :
                   deal.dealType === 'Hidden Deal' || deal.dealType === 'HIDDEN' ? '🔒 HIDDEN' :
                   '🏆 BOUNTY'}
                </div>
              </div>
            )}

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
                    variant="ghost"
                    size="md"
                    className="h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus:ring-0 ring-0 ring-offset-0 group transition-colors duration-200 bg-white hover:!bg-brand-primary-main"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const maybePhone = String(deal.bookingInfo || '');
                      if (/\+?\d[\d\s\-()]{4,}/.test(maybePhone)) {
                        window.location.href = `tel:${maybePhone.replace(/[^\d+]/g, '')}`;
                      }
                    }}
                    icon={<Phone className="h-4 w-4 transition-colors text-neutral-900 group-hover:text-white" />}
                    aria-label="Call restaurant"
                  />

                  {/* Share button below the phone button */}
                  <Button
                    variant="ghost"
                    size="md"
                    className="h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus:ring-0 ring-0 ring-offset-0 group transition-colors duration-200 bg-white hover:!bg-brand-primary-main"
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
                    icon={<Share2 className="h-4 w-4 transition-colors text-neutral-900 group-hover:text-white" />}
                    aria-label="Share deal"
                  />
                  {/* Like (save) button below share */}
                  <Button
                    variant="ghost"
                    size="md"
                    className="h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus:ring-0 ring-0 ring-offset-0 group transition-colors duration-200 bg-white hover:!bg-brand-primary-main"
                    onClick={(e) => handleLikeClick(e)}
                    disabled={isLikeButtonLoading}
                    icon={
                      <Heart
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isSaved
                            ? 'fill-brand-primary-400 text-brand-primary-400'
                            : 'text-neutral-900',
                          'group-hover:fill-white group-hover:text-white'
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
              <p className="text-base text-white/90">
                {deal.merchantName || deal.location || 'Great deals await you'}
              </p>
              <div className="mt-4 font-semibold text-brand-primary-400">
                {finalClaimedCount > 0 ? (
                  <AvatarStack
                    count={finalClaimedCount}
                    users={finalClaimedUsers}
                    textClassName="text-white/90"
                  />
                ) : (
                  <div className="text-white/70 text-sm">
                    Be the first to tap in!
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
                    <span>View All Offers/Tables</span>
                    {/* Blinking dot */}
                    <div className="w-1 h-1 bg-brand-primary-600 rounded-full ml-2 animate-pulse"></div>
                    <ChevronDown className={cn('h-5 w-5 ml-1 transition-transform', offersVisible && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {offersVisible && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            {/* --- Tab Selector for Offers --- */}
                            {availableCategories.length > 0 && (
                              <div className="flex items-center gap-2 rounded-full bg-neutral-100 p-1 mb-3">
                                {availableCategories.map((category) => (
                                  <button 
                                    key={category}
                                    onClick={(e) => {e.preventDefault(); e.stopPropagation(); setActiveOfferTab(category)}} 
                                    className={cn("flex-1 rounded-full py-1.5 text-sm font-semibold", activeOfferTab === category ? 'bg-black text-white shadow' : 'text-neutral-600')}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* --- NEW: Richer Offer Cards --- */}
                            <div className="space-y-2">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={activeOfferTab}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {activeOfferTab === 'Tables' ? (
                                    <div className="space-y-3">
                                      {!deal.merchantId ? (
                                        <div className="text-center py-8">
                                          <div className="text-neutral-400 mb-2">
                                            <Calendar className="h-12 w-12 mx-auto" />
                                          </div>
                                          <h3 className="text-lg font-semibold text-neutral-600 mb-2">Table Booking Not Available</h3>
                                          <p className="text-sm text-neutral-500">
                                            This merchant hasn't set up table booking yet.
                                          </p>
                                        </div>
                                      ) : (
                                        <>
                                          {/* Today's Quick Time Slots */}
                                          <div>
                                            <div className="flex items-center justify-between mb-3">
                                              <h4 className="text-sm font-semibold text-neutral-800">Available Today</h4>
                                              <span className="text-xs text-neutral-500">
                                                {format(new Date(), 'MMM dd')}
                                              </span>
                                            </div>
                                            
                                            {isLoadingAvailability ? (
                                              <div className="space-y-2">
                                                {[1, 2, 3].map((i) => (
                                                  <div key={i} className="animate-pulse">
                                                    <div className="h-12 bg-neutral-200 rounded-lg"></div>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : todayAvailability?.availableTimeSlots && todayAvailability.availableTimeSlots.length > 0 ? (
                                              <div className="space-y-2">
                                                {todayAvailability.availableTimeSlots.slice(0, 3).map((slot) => (
                    <TimeSlotQuickCard
                      key={slot.id}
                      merchantId={deal.merchantId!}
                      merchantName={deal.merchantName || deal.name}
                      slot={slot}
                      date={todayAvailability.date}
                      onBook={() => handleTimeSlotBook(slot)}
                      compact={true}
                    />
                                                ))}
                                                
                                                {/* View All Times Button */}
                                                {todayAvailability.availableTimeSlots.length > 3 && (
                                                  <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full mt-2"
                                                    onClick={handleViewAllTimes}
                                                  >
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    View All Times ({todayAvailability.availableTimeSlots.length - 3} more)
                                                  </Button>
                                                )}
                                              </div>
                                            ) : todayAvailability?.availableTables && todayAvailability.availableTables.length === 0 ? (
                                              <div className="text-center py-6">
                                                <div className="text-neutral-400 mb-2">
                                                  <Clock className="h-10 w-10 mx-auto" />
                                                </div>
                                                <h3 className="text-base font-semibold text-neutral-600 mb-1">No Tables Available</h3>
                                                <p className="text-sm text-neutral-500">
                                                  This merchant hasn't configured their tables yet.
                                                </p>
                                              </div>
                                            ) : (
                                              <div className="text-center py-4 text-neutral-500">
                                                <Clock className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                                                <p className="text-sm">No availability today</p>
                                                <Button
                                                  variant="secondary"
                                                  size="sm"
                                                  className="mt-2"
                                                  onClick={handleViewAllTimes}
                                                >
                                                  Check Other Days
                                                </Button>
                                              </div>
                                            )}
                                          </div>

                                          {/* Tables Section (Collapsed) - Only show if tables exist */}
                                          {todayAvailability?.availableTables && todayAvailability.availableTables.length > 0 && (
                                            <details className="group">
                                              <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors">
                                                Browse All Tables
                                                <ChevronDown className="inline h-3 w-3 ml-1 group-open:rotate-180 transition-transform" />
                                              </summary>
                                              <div className="mt-2">
                  <AvailableTablesList
                    merchantId={deal.merchantId!}
                    merchantName={deal.merchantName || deal.name}
                  />
                                              </div>
                                            </details>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  ) : filteredOffers.length > 0 ? (
                                    filteredOffers.map(offer => (
                                        <div key={offer.title} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 border border-neutral-200/60">
                                            <img
                                              src={offer.imageUrl || offerImageFallback}
                                              alt={offer.title}
                                              onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).onerror = null;
                                                (e.currentTarget as HTMLImageElement).src = offerImageFallback;
                                              }}
                                              className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-bold text-sm text-neutral-800">{offer.title}</p>
                                                <p className="text-xs text-neutral-500 mt-1">{offer.time}</p>
                                            </div>
                                        </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-6 text-neutral-500">
                                      <div className="text-neutral-400 mb-2">
                                        <Trophy className="h-8 w-8 mx-auto" />
                                      </div>
                                      <p className="text-sm">No {activeOfferTab.toLowerCase()} offers available</p>
                                      <p className="text-xs text-neutral-400 mt-1">
                                        Check back later for new deals
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-3">
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

      </div>

      {/* Table Booking Modal */}
      {isBookingModalOpen && (
        <TableBookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          merchantId={deal.merchantId!}
          merchantName={deal.merchantName || deal.name}
          preselectedTimeSlot={preselectedTimeSlot}
        />
      )}
    </div>
  );
};

export default memo(PremiumV2DealCard);

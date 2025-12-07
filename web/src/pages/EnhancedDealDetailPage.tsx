import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useDealDetail, type DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { MerchantLogo } from '@/components/common/MerchantLogo';
import { useLoyaltyBalance, useLoyaltyProgram } from '@/hooks/useLoyalty';
import { formatDealTypeForDisplay } from '@/utils/dealTypeUtils';

// Icons
import {
  Heart,
  Navigation,
  Clock,
  XCircle,
  MapPin,
  Loader2,
  Share2,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Timer,
  Menu,
  Building,
  TrendingUp,
  Zap,
} from 'lucide-react';

// Types are now imported from the hook

// Components
const ImageCarousel = ({ images, title }: { images: string[]; title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images.length) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Square container - maintains aspect ratio */}
      <div className="relative w-full aspect-square max-w-full max-h-full overflow-hidden bg-neutral-100 rounded-2xl shadow-xl">
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-2.5 text-neutral-900 hover:bg-white shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-2.5 text-neutral-900 hover:bg-white shadow-lg transition-all hover:scale-110 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="absolute top-4 right-4 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white z-10">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

const CountdownTimer = ({ timeRemaining }: { timeRemaining: { hours: number; minutes: number; formatted: string } }) => {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        } else {
          return { hours: 0, minutes: 0, formatted: "0h 0m" };
        }
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-2">
      <Timer className="h-4 w-4 text-red-600" />
      <span className="text-sm font-semibold text-red-600">
        {time.hours}h {time.minutes}m left
      </span>
    </div>
  );
};

const MenuItemsSection = ({ menuItems }: { menuItems: DetailedDeal['menuItems'] }) => {
  if (!menuItems.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Menu className="h-5 w-5 text-brand-primary-600" />
        <h3 className="text-lg font-semibold text-neutral-900">Menu Items</h3>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {menuItems.map((item) => {
          const hasDiscount = item.discountedPrice < item.originalPrice;
          const discountPercent = hasDiscount 
            ? Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100)
            : 0;

          return (
            <div key={item.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-3">
                {item.imageUrl && (
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-neutral-900">{item.name}</h4>
                    {hasDiscount && (
                      <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-sm text-neutral-400 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                        <span className="font-bold text-lg text-green-600">
                          ${item.discountedPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-neutral-900">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {item.category && (
                    <span className="mt-2 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const SocialProofSection = ({ socialProof }: { socialProof: DetailedDeal['socialProof'] }) => {
  if (!socialProof.totalSaves) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-brand-primary-600" />
        <h3 className="text-sm font-semibold text-neutral-900">Saved by others</h3>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
          {socialProof.recentSavers.slice(0, 4).map((saver) => (
            <div
              key={saver.id}
              className="h-6 w-6 rounded-full border-2 border-white bg-neutral-200 overflow-hidden"
            >
              {saver.avatarUrl ? (
                <img
                  src={saver.avatarUrl}
                  alt={saver.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-brand-primary-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-brand-primary-600">
                    {saver.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <span className="text-xs text-neutral-600">
          {socialProof.totalSaves} saves
        </span>
      </div>
    </div>
  );
};

const MerchantInfoSection = ({ merchant }: { merchant: DetailedDeal['merchant'] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <MerchantLogo 
          src={merchant.logoUrl} 
          name={merchant.businessName} 
          size="lg" 
          className="flex-shrink-0"
        />
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{merchant.businessName}</h3>
          {merchant.description && (
            <p className="text-sm text-neutral-600 mb-3">{merchant.description}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-500" />
              <span className="text-sm text-neutral-700">{merchant.address}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-neutral-500" />
              <span className="text-sm text-neutral-700">
                {merchant.totalDeals} deals • {merchant.totalStores} location{merchant.totalStores > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {merchant.stores.length > 1 && (
        <div>
          <h4 className="font-semibold text-neutral-900 mb-3">All locations</h4>
          <div className="space-y-2">
            {merchant.stores.map((store) => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{store.address}</p>
                  <p className="text-xs text-neutral-600">{store.city.name}, {store.city.state}</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  store.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {store.active ? "Active" : "Inactive"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const EnhancedDealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const { savedDealIds, saveDeal, unsaveDeal } = useSavedDeals();
  const { isCheckingIn, checkIn } = useCheckIn();
  const { toast } = useToast();
  const { canGoBack, goBack } = useNavigationHistory();

  const {
    data: deal,
    isLoading,
    error,
  } = useDealDetail(dealId || '');

  // Not found / error UI
  const NotFoundDeal = ({ id, message }: { id?: string; message?: unknown }) => {
    const messageStr = message ? String(message) : undefined;
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="max-w-xl rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Deal not found</h2>
          <p className="mt-3 text-neutral-600">
            We couldn't find the deal{id ? ` with id "${id}"` : ''}.
          </p>
          {messageStr && (
            <p className="mt-2 text-sm text-neutral-500">Error: {messageStr}</p>
          )}
          <div className="mt-6 flex justify-center">
            <Button 
              size="md" 
              variant="primary"
              onClick={canGoBack ? goBack : () => window.history.back()}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <LoadingOverlay message="Loading deal details..." />;
  if (error || !deal) return <NotFoundDeal id={dealId} message={error} />;

  const isSaved = savedDealIds.has(deal.id.toString());
  const handleSaveClick = () =>
    isSaved ? unsaveDeal(deal.id.toString()) : saveDeal(deal.id.toString());

  const handleCheckIn = () => {
    // The useCheckIn hook handles all toast notifications internally
    // based on the API response (success, too far, error, etc.)
    checkIn(deal.id.toString());
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deal.title,
          text: deal.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Deal link has been copied to your clipboard.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="sticky top-20 z-20 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={canGoBack ? goBack : () => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="rounded-full"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveClick}
                className={cn(
                  "rounded-full",
                  isSaved && "text-red-600 hover:text-red-700"
                )}
              >
                <Heart className={cn("h-4 w-4 mr-2", isSaved && "fill-current")} />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Split Layout: Content Left, Image Right */}
        <div className="grid gap-0 lg:grid-cols-2 mt-4 bg-white rounded-2xl overflow-hidden shadow-lg">
          {/* Left Side: Deal Details */}
          <div className="p-8 lg:p-12 space-y-10">
            {/* Deal Title and Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {deal.category.icon && (
                  <span className="text-2xl" role="img" aria-label={deal.category.label}>
                    {deal.category.icon}
                  </span>
                )}
                <span className="text-sm font-medium text-neutral-600">{deal.category.label}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-8 leading-tight">{deal.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {deal.socialProof.totalSaves > 0 && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-neutral-500">⭐</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {((deal.socialProof.totalSaves + (deal as any).popularity?.totalCheckIns || 0) / 100).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-neutral-500">
                        ({deal.socialProof.totalSaves + ((deal as any).popularity?.totalCheckIns || 0)} reviews)
                      </span>
                    </div>
                    <span className="text-neutral-300">•</span>
                  </>
                )}
                <span className="text-sm text-neutral-600">{deal.category.label}</span>
                {deal.category.description && (
                  <>
                    <span className="text-neutral-300">•</span>
                    <span className="text-sm text-neutral-500">{deal.category.description}</span>
                  </>
                )}
                <span className="text-neutral-300">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-sm text-neutral-600">{deal.merchant.address.split(',')[0]}</span>
                </div>
                {deal.merchant.phoneNumber && (
                  <>
                    <span className="text-neutral-300">•</span>
                    <a 
                      href={`tel:${deal.merchant.phoneNumber}`}
                      className="text-sm text-brand-primary-600 hover:text-brand-primary-700"
                    >
                      {deal.merchant.phoneNumber}
                    </a>
                  </>
                )}
              </div>

              {/* Status and Type Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                  deal.status.isActive && "bg-green-100 text-green-700",
                  deal.status.isExpired && "bg-red-100 text-red-700",
                  deal.status.isUpcoming && "bg-blue-100 text-blue-700"
                )}>
                  {deal.status.isActive && <CheckCircle className="h-4 w-4" />}
                  {deal.status.isExpired && <XCircle className="h-4 w-4" />}
                  {deal.status.isUpcoming && <Clock className="h-4 w-4" />}
                  {deal.status.isActive && "Active"}
                  {deal.status.isExpired && "Expired"}
                  {deal.status.isUpcoming && "Upcoming"}
                </div>
                
                <div className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700">
                  <Zap className="h-4 w-4" />
                  {formatDealTypeForDisplay(deal.dealType)}
                </div>
                
                {deal.context.isPopular && (
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </div>
                )}
                {(deal as any).popularity?.isTrending && (
                  <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700">
                    <Zap className="h-4 w-4" />
                    Trending
                  </div>
                )}
                {deal.kickbackEnabled && (
                  <div className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700">
                    <Users className="h-4 w-4" />
                    Kickback Enabled
                  </div>
                )}
              </div>

              {/* Price and Offer - Prominent Display */}
              <div className="mb-10 pb-10 border-b border-neutral-200">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl font-bold text-neutral-900">{deal.offerDisplay}</span>
                  {deal.offerTerms && (
                    <span className="text-sm text-neutral-500">({deal.offerTerms})</span>
                  )}
                  {deal.discountPercentage && (
                    <span className="text-lg font-semibold text-green-600">
                      {deal.discountPercentage}% OFF
                    </span>
                  )}
                  {deal.discountAmount && !deal.discountPercentage && (
                    <span className="text-lg font-semibold text-green-600">
                      ${deal.discountAmount} OFF
                    </span>
                  )}
                </div>
                
                {deal.status.isActive && (
                  <div className="mb-4">
                    <CountdownTimer timeRemaining={deal.status.timeRemaining} />
                  </div>
                )}

                {/* Hosted by */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-sm text-neutral-600">Hosted by</span>
                  <span className="font-semibold text-neutral-900">{deal.merchant.businessName}</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-sm text-neutral-600">{deal.merchant.totalDeals} deals</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-sm text-neutral-600">{deal.socialProof.totalSaves} saves</span>
                  {(deal as any).popularity?.totalCheckIns > 0 && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-sm text-neutral-600">
                        {(deal as any).popularity.totalCheckIns} check-ins
                      </span>
                    </>
                  )}
                  {(deal as any).popularity?.totalEngagement > 0 && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-sm font-medium text-brand-primary-600">
                        {(deal as any).popularity.totalEngagement} total engagement
                      </span>
                    </>
                  )}
                </div>
                
                {/* Deal Type Description */}
                {typeof deal.dealType === 'object' && deal.dealType.description && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">{deal.dealType.description}</p>
                  </div>
                )}
                
                {/* Time Information */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <div>
                      <div className="text-xs text-neutral-500">Starts</div>
                      <div className="font-medium text-neutral-900">
                        {new Date(deal.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {new Date(deal.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-400" />
                    <div>
                      <div className="text-xs text-neutral-500">Ends</div>
                      <div className="font-medium text-neutral-900">
                        {new Date(deal.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs text-neutral-600">
                        {new Date(deal.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Deal Highlights */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {deal.hasMenuItems && (
                    <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                      <Menu className="h-3.5 w-3.5" />
                      Menu Items Available
                    </div>
                  )}
                  {deal.context.isRecurring && deal.recurringDays.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                      <Clock className="h-3.5 w-3.5" />
                      Repeats {deal.recurringDays.length} day{deal.recurringDays.length > 1 ? 's' : ''} per week
                    </div>
                  )}
                  {deal.kickbackEnabled && (
                    <div className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
                      <Users className="h-3.5 w-3.5" />
                      Earn Rewards
                    </div>
                  )}
                  {deal.merchant.totalStores > 1 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700">
                      <Building className="h-3.5 w-3.5" />
                      {deal.merchant.totalStores} Locations
                    </div>
                  )}
                </div>
              </div>

              {/* Loyalty Program Summary */}
              <LoyaltySummary merchantId={deal.merchant.id} />

              {/* Deal Description */}
              <div className="pt-10 border-t border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">About this deal</h2>
                <p className="text-neutral-700 leading-relaxed text-base">{deal.description}</p>
              </div>

              {/* Menu Items */}
              {deal.hasMenuItems && (
                <div className="pt-10 border-t border-neutral-200">
                  <MenuItemsSection menuItems={deal.menuItems} />
                </div>
              )}

              {/* Redemption Instructions */}
              {deal.redemptionInstructions && (
                <div className="pt-10 border-t border-neutral-200">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-6">How to redeem</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-700 whitespace-pre-line leading-relaxed text-base">
                      {deal.redemptionInstructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Merchant Info */}
              <div className="pt-10 border-t border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Meet your host</h2>
                <MerchantInfoSection merchant={deal.merchant} />
              </div>

              {/* Social Proof */}
              <div className="pt-10 border-t border-neutral-200">
                <SocialProofSection socialProof={deal.socialProof} />
              </div>

              {/* Things to Know */}
              <div className="pt-10 border-t border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">Things to know</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Deal details</h3>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li><strong>Starts:</strong> {new Date(deal.startTime).toLocaleString()}</li>
                      <li><strong>Ends:</strong> {new Date(deal.endTime).toLocaleString()}</li>
                      <li><strong>Type:</strong> {typeof deal.dealType === 'string' ? deal.dealType : deal.dealType.name}</li>
                      <li><strong>Category:</strong> {deal.category.label}</li>
                      {deal.recurringDays.length > 0 && (
                        <li><strong>Recurring:</strong> {deal.recurringDays.join(', ')}</li>
                      )}
                      {deal.kickbackEnabled && (
                        <li><strong>Kickback:</strong> Enabled</li>
                      )}
                      <li><strong>Created:</strong> {new Date(deal.createdAt).toLocaleDateString()}</li>
                      <li><strong>Updated:</strong> {new Date(deal.updatedAt).toLocaleDateString()}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Location & Contact</h3>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li>{deal.merchant.address}</li>
                      {deal.merchant.phoneNumber && (
                        <li>
                          <a href={`tel:${deal.merchant.phoneNumber}`} className="text-brand-primary-600 hover:underline">
                            {deal.merchant.phoneNumber}
                          </a>
                        </li>
                      )}
                      <li>{deal.merchant.totalStores} location{deal.merchant.totalStores > 1 ? 's' : ''}</li>
                      {deal.merchant.latitude && deal.merchant.longitude && (
                        <li>
                          <a 
                            href={`https://maps.google.com/?q=${deal.merchant.latitude},${deal.merchant.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary-600 hover:underline"
                          >
                            View on Map
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Engagement & Popularity</h3>
                    <ul className="space-y-2 text-sm text-neutral-700">
                      <li><strong>Saves:</strong> {deal.socialProof.totalSaves}</li>
                      {(deal as any).popularity?.totalCheckIns > 0 && (
                        <li><strong>Check-ins:</strong> {(deal as any).popularity.totalCheckIns}</li>
                      )}
                      {(deal as any).popularity?.totalEngagement > 0 && (
                        <li><strong>Total Engagement:</strong> {(deal as any).popularity.totalEngagement}</li>
                      )}
                      {(deal as any).popularity?.engagementScore > 0 && (
                        <li><strong>Engagement Score:</strong> {(deal as any).popularity.engagementScore}%</li>
                      )}
                      {deal.context.isPopular && <li><strong>Status:</strong> Popular</li>}
                      {(deal as any).popularity?.isTrending && <li><strong>Status:</strong> Trending</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Image Carousel - Sticky & Square */}
          {deal.images.length > 0 && (
            <div className="lg:sticky lg:top-20 lg:h-screen lg:overflow-y-auto order-first lg:order-last flex flex-col">
              {/* Image Carousel */}
              <div className="flex items-center justify-center p-6 lg:p-8 min-h-[60vh] lg:min-h-0">
                <div className="w-full max-w-md">
                  <ImageCarousel images={deal.images} title={deal.title} />
                </div>
              </div>
              
              {/* Quick Actions: Check-in, Directions */}
              <div className="p-6 lg:p-8 border-t border-neutral-200 bg-gradient-to-br from-white to-neutral-50 space-y-4">
                {/* Check In Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
                  onClick={handleCheckIn}
                  disabled={isCheckingIn || !deal.status.isActive}
                >
                  {isCheckingIn ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  {deal.status.isActive ? "Check In" : "Deal Not Active"}
                </Button>
                
                {/* Get Directions Button */}
                {deal.merchant.latitude && deal.merchant.longitude && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full rounded-full h-12 font-semibold"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${deal.merchant.latitude},${deal.merchant.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <Navigation className="h-5 w-5 mr-2" />
                    Get Directions
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoyaltySummary = ({ merchantId }: { merchantId: number }) => {
  const { data: program } = useLoyaltyProgram(merchantId);
  const { balance, isLoading } = useLoyaltyBalance(merchantId);

  if (!program?.program?.isActive) return null;

  return (
    <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-900">Loyalty Program</div>
          <div className="text-xs text-neutral-500">Earn {program.program.pointsPerDollar} pts per $1</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-500">Your balance</div>
          <div className="text-sm font-bold text-neutral-900">{isLoading ? '...' : `${balance?.currentBalance ?? 0} pts`}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-neutral-600">Redeem {program.program.minimumRedemption} pts = ${program.program.redemptionValue.toFixed(0)} off</div>
    </div>
  );
};

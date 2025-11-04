import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useDealDetail, type DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { MerchantLogo } from '@/components/common/MerchantLogo';
import { useLoyaltyBalance, useLoyaltyProgram } from '@/hooks/useLoyalty';

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
  QrCode,
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
    <div className="relative">
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
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
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  index === currentIndex ? "bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
          
          <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
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
        {menuItems.map((item) => (
          <div key={item.id} className="rounded-lg border border-neutral-200 p-4">
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
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900">{item.name}</h4>
                {item.description && (
                  <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-neutral-500 line-through">
                    ${item.originalPrice.toFixed(2)}
                  </span>
                  <span className="font-semibold text-brand-primary-600">
                    ${item.discountedPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QRCodeSection = ({ dealId, merchantName }: { dealId: number; merchantName: string }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `${window.location.origin}/deals/${dealId}`
  )}`;

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <QrCode className="h-4 w-4 text-brand-primary-600" />
        <h3 className="text-sm font-semibold text-neutral-900">QR Code</h3>
      </div>
      
      <div className="mx-auto mb-3 h-32 w-32 rounded-lg border border-neutral-200 bg-white p-2">
        <img
          src={qrCodeUrl}
          alt={`QR Code for ${merchantName}`}
          className="h-full w-full object-contain"
        />
      </div>
      
      <p className="text-xs text-neutral-600 mb-3">
        Show at {merchantName} to redeem
      </p>
      
      <Button
        variant="secondary"
        size="sm"
        className="w-full"
        onClick={() => {
          const link = document.createElement('a');
          link.href = qrCodeUrl;
          link.download = `qr-code-${merchantName.replace(/\s+/g, '-').toLowerCase()}.png`;
          link.click();
        }}
      >
        Download
      </Button>
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

      <div className="container mx-auto px-4 pt-24 pb-6">
        <div className="grid gap-8 lg:grid-cols-3 mt-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Deal Title and Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {deal.category.icon && (
                  <span className="text-2xl" role="img" aria-label={deal.category.label}>
                    {deal.category.icon}
                  </span>
                )}
                <span className="text-sm text-neutral-600">{deal.category.label}</span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">{deal.title}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-neutral-600">Hosted by</span>
                  <span className="font-semibold text-neutral-900">{deal.merchant.businessName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-neutral-600">•</span>
                  <span className="text-sm text-neutral-600">{deal.merchant.totalDeals} deals</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-neutral-600">•</span>
                  <span className="text-sm text-neutral-600">{deal.socialProof.totalSaves} saves</span>
                </div>
              </div>

              {/* Status and Type Badges */}
              <div className="flex items-center gap-2 mb-6">
                <div className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
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
                
                <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  <Zap className="h-4 w-4" />
                  {deal.dealType.name}
                </div>
                
                {deal.context.isPopular && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </div>
                )}
              </div>
            </div>

            {/* Image Carousel */}
            {deal.images.length > 0 && (
              <div>
                <ImageCarousel images={deal.images} title={deal.title} />
              </div>
            )}

            {/* Deal Description */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">About this deal</h2>
              <p className="text-neutral-700 leading-relaxed">{deal.description}</p>
            </div>

            {/* Menu Items */}
            {deal.hasMenuItems && (
              <div>
                <MenuItemsSection menuItems={deal.menuItems} />
              </div>
            )}

            {/* Redemption Instructions */}
            {deal.redemptionInstructions && (
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">How to redeem</h2>
                <div className="prose prose-neutral max-w-none">
                  <p className="text-neutral-700 whitespace-pre-line leading-relaxed">
                    {deal.redemptionInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Merchant Info */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Meet your host</h2>
              <MerchantInfoSection merchant={deal.merchant} />
            </div>

            {/* Things to Know */}
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">Things to know</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Deal details</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li>Valid until: {new Date(deal.endTime).toLocaleDateString()}</li>
                    <li>Type: {deal.dealType.name}</li>
                    <li>Category: {deal.category.label}</li>
                    {deal.recurringDays.length > 0 && (
                      <li>Recurring: {deal.recurringDays.join(', ')}</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Location</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li>{deal.merchant.address}</li>
                    <li>{deal.merchant.totalStores} location{deal.merchant.totalStores > 1 ? 's' : ''}</li>
                    <li>Easy to find</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Cancellation</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li>Free cancellation</li>
                    <li>Valid until deal expires</li>
                    <li>No hidden fees</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:sticky lg:top-36 lg:h-fit">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              {/* Price and Offer */}
              <div className="mb-8">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-neutral-900">{deal.offerDisplay}</span>
                  {deal.offerTerms && (
                    <span className="text-sm text-neutral-600">({deal.offerTerms})</span>
                  )}
                </div>
                
                {deal.status.isActive && (
                  <div className="mb-4">
                    <CountdownTimer timeRemaining={deal.status.timeRemaining} />
                  </div>
                )}
              </div>

              {/* Loyalty Program Summary */}
              <LoyaltySummary merchantId={deal.merchant.id} />

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
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
                
                {deal.merchant.latitude && deal.merchant.longitude && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
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

              {/* QR Code */}
              <div className="mb-6">
                <QRCodeSection dealId={deal.id} merchantName={deal.merchant.businessName} />
              </div>

              {/* Social Proof */}
              <SocialProofSection socialProof={deal.socialProof} />
            </div>
          </div>
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

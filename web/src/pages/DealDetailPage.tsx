// src/pages/DealDetailPage.tsx
import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useDealDetail } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { Heart, ChevronLeft, Share2, Package, Truck, Calendar, MapPin, Phone, Users, Instagram, Facebook, Youtube, Music, Coins, Building } from 'lucide-react';
import { useCheckIn } from '@/hooks/useCheckIn';
import { CheckInModal } from '@/components/deals/CheckInModal';
import { TableBookingModal } from '@/components/table-booking/TableBookingModal';
import { MenuTab } from '@/components/deals/detail-tabs/MenuTab';
import { LeaderboardTab } from '@/components/deals/detail-tabs/LeaderboardTab';
import { TableReservationsTab } from '@/components/deals/detail-tabs/TableReservationsTab';
import { OverviewTab } from '@/components/deals/detail-tabs/OverviewTab';
import { ShopTab } from '@/components/deals/detail-tabs/ShopTab';
import { EventsTab } from '@/components/deals/detail-tabs/EventsTab';
import { JobsTab } from '@/components/deals/detail-tabs/JobsTab';
import { GalleryTab } from '@/components/deals/detail-tabs/GalleryTab';
import { PodcastTab } from '@/components/deals/detail-tabs/PodcastTab';
import { NewsTab } from '@/components/deals/detail-tabs/NewsTab';
import { BookRoomsTab } from '@/components/deals/detail-tabs/BookRoomsTab';
import { ReviewsTab } from '@/components/deals/detail-tabs/ReviewsTab';
import { SocialTab } from '@/components/deals/detail-tabs/SocialTab';

const TABS = [
  { id: 'menu', label: 'MENU', enabled: true },
  { id: 'leaderboard', label: 'LEADERBOARD', enabled: true },
  { id: 'table-reservations', label: 'TABLE RESERVATIONS', enabled: true },
  { id: 'shop', label: 'SHOP', enabled: false },
  { id: 'overview', label: 'OVERVIEW', enabled: true },
  { id: 'events', label: 'EVENTS', enabled: false },
  { id: 'jobs', label: 'JOBS', enabled: false },
  { id: 'gallery', label: 'GALLERY', enabled: false },
  { id: 'podcast', label: 'PODCAST', enabled: false },
  { id: 'news', label: 'NEWS', enabled: false },
  { id: 'book-rooms', label: 'BOOK ROOMS', enabled: false },
  { id: 'reviews', label: 'REVIEWS', enabled: false },
  { id: 'social', label: 'SOCIAL', enabled: false },
] as const;

type TabId = typeof TABS[number]['id'];

export const DealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const location = useLocation();
  const { canGoBack, goBack } = useNavigationHistory();
  const { savedDealIds, saveDeal, unsaveDeal } = useSavedDeals();
  // Initialize with first enabled tab
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const firstEnabledTab = TABS.find(tab => tab.enabled);
    return firstEnabledTab?.id || 'menu';
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{ pointsEarned: number } | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const { isCheckingIn, checkIn } = useCheckIn({
    onSuccess: (data) => {
      if (data.withinRange) {
        setCheckInResult({ pointsEarned: data.pointsEarned });
        setShowCheckInModal(true);
      }
    },
  });

  const {
    data: deal,
    isLoading,
    error,
  } = useDealDetail(dealId || '');

  // Sync active tab with URL hash
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash && TABS.some(tab => tab.id === hash && tab.enabled)) {
      setActiveTab(hash as TabId);
    }
  }, [location.hash]);

  // Update URL hash when tab changes
  const handleTabChange = (tabId: TabId) => {
    const tab = TABS.find(t => t.id === tabId);
    if (!tab || !tab.enabled) return; // Prevent switching to disabled tabs
    setActiveTab(tabId);
    window.history.replaceState(null, '', `#${tabId}`);
    // Don't scroll to top - keep user's current scroll position
  };

  if (isLoading) return <LoadingOverlay message="Loading deal details..." />;
  if (error || !deal) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="max-w-xl rounded-2xl border bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900">Deal not found</h2>
          <p className="mt-3 text-neutral-600">
            We couldn't find the deal{dealId ? ` with id "${dealId}"` : ''}.
          </p>
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
  }

  const isSaved = savedDealIds.has(deal.id.toString());
  const handleSaveClick = () =>
    isSaved ? unsaveDeal(deal.id.toString()) : saveDeal(deal.id.toString());

  const primaryImage = deal.imageUrl || deal.images?.[0] || '';
  const allImages = deal.images && deal.images.length > 0 ? deal.images : (primaryImage ? [primaryImage] : []);
  const thumbnailImages = allImages.slice(1, 4);
  
  // Dynamic data from backend
  const isOpen = deal.status.isActive; // Deal is active/open
  const followerCount = deal.socialProof?.totalSaves || 0;
  const totalCheckIns = (deal.socialProof as any)?.totalCheckIns || 0;
  const popularity = (deal as any).popularity;
  
  // Format follower count for display
  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Back Button - Top Left */}
      <div className="container mx-auto max-w-7xl px-4 pt-6">
          <Button
            variant="ghost"
          size="sm"
            onClick={canGoBack ? goBack : () => window.history.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
      {/* Main Header Section */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Restaurant Information */}
          <div className="space-y-6">
            {/* Header with Name and Status */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-neutral-900">{deal.merchant.businessName}</h1>
                  {isOpen && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Open Now
                    </span>
                  )}
                </div>
                {/* Engagement Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  {totalCheckIns > 0 && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-neutral-600" />
                      <span className="text-neutral-600">{totalCheckIns.toLocaleString()} check-ins</span>
                    </div>
                  )}
                  {followerCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-neutral-600" />
                      <span className="text-neutral-600">{formatFollowerCount(followerCount)} saved</span>
                    </div>
                  )}
                  {popularity?.isPopular && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      Popular
                    </span>
                  )}
                  {popularity?.isTrending && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                      Trending
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const shareUrl = window.location.href;
                    const shareData = {
                      title: `${deal.title} - ${deal.merchant.businessName}`,
                      text: deal.description || `Check out this deal at ${deal.merchant.businessName}`,
                      url: shareUrl,
                    };
                    
                    try {
                      if (navigator.share) {
                        await navigator.share(shareData);
                      } else {
                        // Fallback: Copy to clipboard
                        await navigator.clipboard.writeText(shareUrl);
                        // You could show a toast here
                      }
                    } catch (err) {
                      // User cancelled or error occurred
                      console.log('Share failed:', err);
                    }
                  }}
                  className="hover:bg-neutral-100"
                  aria-label="Share deal"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveClick}
                  className={cn(isSaved && 'text-red-600', 'hover:bg-neutral-100')}
                  aria-label={isSaved ? 'Unsave deal' : 'Save deal'}
                >
                  <Heart className={cn('h-5 w-5', isSaved && 'fill-current')} />
                </Button>
              </div>
        </div>

            {/* Description */}
            <p className="text-neutral-700 leading-relaxed">
              {deal.merchant.description || deal.description || 'Contemporary American cuisine with a focus on locally-sourced ingredients and innovative techniques. Experience culinary artistry in an atmosphere of refined elegance. Our seasonal menu showcases the finest ingredients from regional farmers and artisan producers.'}
            </p>
            
            {/* Deal Title */}
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-1">{deal.title}</h2>
              {deal.offerDisplay && (
                <p className="text-lg font-semibold text-red-600">{deal.offerDisplay}</p>
              )}
              {deal.description && deal.description !== deal.merchant.description && (
                <p className="text-sm text-neutral-600 mt-2">{deal.description}</p>
              )}
            </div>

            {/* Category and Deal Type Tags */}
            <div className="flex flex-wrap gap-2">
              {typeof deal.category === 'object' && deal.category?.label ? (
                <span className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium">
                  {deal.category.label}
                </span>
              ) : null}
              {typeof deal.dealType === 'object' && deal.dealType?.name && !deal.context?.isHappyHour ? (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  {deal.dealType.name}
                </span>
              ) : null}
              {deal.context?.isHappyHour && (
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                  Happy Hour
                </span>
              )}
              {deal.kickbackEnabled && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                  Kickback Enabled
                </span>
              )}
              {deal.context?.isRecurring && !deal.context?.isHappyHour && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                  Recurring Deal
                </span>
              )}
          </div>

          {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white opacity-50 cursor-not-allowed"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Order Pickup
                </Button>
            <Button
                  variant="primary"
              size="lg"
                  disabled
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white opacity-50 cursor-not-allowed"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Order Delivery
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={cn(
                    'flex-1 border transition-colors',
                    isFollowing
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50'
                  )}
                >
                  <Heart className={cn('h-4 w-4 mr-2', isFollowing && 'fill-current')} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1 bg-white border border-neutral-200 hover:bg-neutral-50 cursor-default"
                  disabled
                >
                  <Users className="h-4 w-4 mr-2" />
                  {formatFollowerCount(followerCount)} Followers
                </Button>
              </div>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setShowBookingModal(true)}
                        className="w-full bg-black text-white hover:bg-neutral-800"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Make a Reservation
                    </Button>
          </div>

            {/* Contact Information */}
            <div className="space-y-2">
              {deal.merchant.phoneNumber && (
                <a
                  href={`tel:${deal.merchant.phoneNumber.replace(/\D/g, '')}`}
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all group"
                >
                  <Phone className="h-5 w-5 text-neutral-600 group-hover:text-green-600 transition-colors" />
                  <span className="text-neutral-900 group-hover:text-green-700 transition-colors">{deal.merchant.phoneNumber}</span>
                </a>
              )}
              {deal.merchant.logoUrl && (
                <div className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-lg">
                  <img 
                    src={deal.merchant.logoUrl} 
                    alt={deal.merchant.businessName}
                    className="h-8 w-8 rounded object-cover"
                  />
                  <span className="text-neutral-900">{deal.merchant.businessName}</span>
                </div>
              )}
              {deal.merchant.totalStores > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-lg">
                  <Building className="h-5 w-5 text-neutral-600" />
                  <span className="text-neutral-900">{deal.merchant.totalStores} {deal.merchant.totalStores === 1 ? 'Location' : 'Locations'}</span>
                </div>
              )}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(deal.merchant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all group"
              >
                <MapPin className="h-5 w-5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
                <span className="text-neutral-900 group-hover:text-blue-700 transition-colors">{deal.merchant.address}</span>
              </a>
            </div>

            {/* Social Media Links */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Follow Us</h3>
              <div className="flex gap-2">
                {/* Instagram */}
                <a
                  href={`https://instagram.com/${deal.merchant.businessName.toLowerCase().replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all group"
                  aria-label={`Follow ${deal.merchant.businessName} on Instagram`}
                >
                  <Instagram className="h-5 w-5 text-neutral-700 group-hover:text-pink-600 transition-colors" />
                </a>
                {/* Facebook */}
                <a
                  href={`https://facebook.com/${deal.merchant.businessName.toLowerCase().replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all group"
                  aria-label={`Follow ${deal.merchant.businessName} on Facebook`}
                >
                  <Facebook className="h-5 w-5 text-neutral-700 group-hover:text-blue-600 transition-colors" />
                </a>
                {/* YouTube */}
                <a
                  href={`https://youtube.com/@${deal.merchant.businessName.toLowerCase().replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all group"
                  aria-label={`Follow ${deal.merchant.businessName} on YouTube`}
                >
                  <Youtube className="h-5 w-5 text-neutral-700 group-hover:text-red-600 transition-colors" />
                </a>
                {/* TikTok */}
                <a
                  href={`https://tiktok.com/@${deal.merchant.businessName.toLowerCase().replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-lg bg-white border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 hover:border-neutral-300 transition-all group"
                  aria-label={`Follow ${deal.merchant.businessName} on TikTok`}
                >
                  <Music className="h-5 w-5 text-neutral-700 group-hover:text-black transition-colors" />
                </a>
              </div>
          </div>

            {/* Earn & Steal Coins Section */}
            <div className="border-2 border-yellow-400 bg-yellow-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Coins className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Earn & Steal Coins!</h3>
                  <p className="text-sm text-neutral-700">
                    Check in, order, and compete with friends. Steal their coins or protect yours with locks! Top earners become the Restaurant BOSS.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Image Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            {/* Main Image */}
            {primaryImage && (
              <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-200">
                <img
                  src={primaryImage}
                  alt={deal.merchant.businessName}
                  className="w-full h-full object-cover"
                />
            </div>
          )}
            {/* Thumbnail Images */}
            {thumbnailImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {thumbnailImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full aspect-square overflow-hidden rounded-lg bg-neutral-200"
                  >
                    <img
                      src={img}
                      alt={`${deal.merchant.businessName} - Image ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-[73px] z-40 bg-white border-b border-neutral-200 shadow-sm">
        <div className="w-full">
          <div className="relative">
            <div className="flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide px-4" style={{ 
              WebkitOverflowScrolling: 'touch'
            }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => tab.enabled && handleTabChange(tab.id)}
                  disabled={!tab.enabled}
                  className={cn(
                    'px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 flex-shrink-0 min-w-fit',
                    !tab.enabled && 'cursor-not-allowed opacity-50',
                    activeTab === tab.id && tab.enabled
                      ? 'border-black text-black bg-neutral-50'
                      : tab.enabled
                      ? 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      : 'border-transparent text-neutral-400'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Scroll indicator gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {activeTab === 'menu' && <MenuTab deal={deal} onNavigateToTab={handleTabChange} />}
        {activeTab === 'leaderboard' && <LeaderboardTab deal={deal} />}
        {activeTab === 'table-reservations' && <TableReservationsTab deal={deal} />}
        {activeTab === 'overview' && <OverviewTab deal={deal} />}
        {activeTab === 'shop' && <ShopTab deal={deal} />}
        {activeTab === 'events' && <EventsTab deal={deal} />}
        {activeTab === 'jobs' && <JobsTab deal={deal} />}
        {activeTab === 'gallery' && <GalleryTab deal={deal} />}
        {activeTab === 'podcast' && <PodcastTab deal={deal} />}
        {activeTab === 'news' && <NewsTab deal={deal} />}
        {activeTab === 'book-rooms' && <BookRoomsTab deal={deal} />}
        {activeTab === 'reviews' && <ReviewsTab deal={deal} />}
        {activeTab === 'social' && <SocialTab deal={deal} />}
        </div>

      {/* Floating "Tap in NOW" Button */}
      <div className="fixed bottom-24 left-6 z-50">
        <div className="relative">
          {/* Pulsating circles effect */}
          <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
          
          <button
            onClick={() => {
              if (dealId) {
                checkIn(dealId);
              }
            }}
            disabled={isCheckingIn}
            className={cn(
              'relative flex flex-col items-center justify-center w-24 h-24 rounded-full bg-red-600 text-white shadow-2xl hover:bg-red-700 transition-all border-4 border-red-700',
              isCheckingIn && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Tap in NOW"
          >
            <span className="text-xs font-bold uppercase leading-tight mb-0.5">Tap in</span>
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 my-0.5 border border-white" />
            <span className="text-xs font-bold uppercase leading-tight mt-0.5">NOW</span>
          </button>
        </div>
      </div>

      {/* Check-In Modal */}
      {showCheckInModal && deal && (
        <CheckInModal
          isOpen={showCheckInModal}
          onClose={() => {
            setShowCheckInModal(false);
            setCheckInResult(null);
          }}
          deal={deal}
          pointsEarned={checkInResult?.pointsEarned || 50}
          onCheckOut={() => {
            setShowCheckInModal(false);
            setCheckInResult(null);
          }}
        />
      )}

      {/* Table Booking Modal */}
      {showBookingModal && deal && deal.merchant.id && (
        <TableBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          merchantId={deal.merchant.id}
          merchantName={deal.merchant.businessName}
        />
      )}

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 text-white">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">Ready to dine with us? Reserve your table now</p>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-neutral-800"
                disabled
              >
                <Package className="h-4 w-4 mr-2" />
                Pickup
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-neutral-800"
                disabled
              >
                <Truck className="h-4 w-4 mr-2" />
                Delivery
              </Button>
              <Button 
                    variant="primary" 
                    size="sm" 
                    className="bg-white text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setShowBookingModal(true)}
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    Make a Reservation
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

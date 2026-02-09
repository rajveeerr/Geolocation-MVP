import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useDealDetail } from '@/hooks/useDealDetail';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';
import {
  Heart, ChevronLeft, ChevronRight, Share2, Phone, MapPin, Star,
  ShoppingCart, ExternalLink, Play, Lock, AlertCircle, Pencil,
  ThumbsUp, Check, Search, SlidersHorizontal,
} from 'lucide-react';
import { useCheckIn } from '@/hooks/useCheckIn';
import { CheckInModal } from '@/components/deals/CheckInModal';
import { TableBookingModal } from '@/components/table-booking/TableBookingModal';
import { LeaderboardTab } from '@/components/deals/detail-tabs/LeaderboardTab';
import { EventsTab } from '@/components/deals/detail-tabs/EventsTab';
import { ImageSlideshow } from '@/components/landing/ImageSlideshow';
import {
  placeholderReviews, placeholderRatingsSummary, placeholderArticles,
  placeholderVibeTags, placeholderHours, placeholderThingsToKnow,
} from '@/data/detail-page-placeholders';

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */
type LeftTab = 'info' | 'reviews' | 'media';
type RightTab = 'menu' | 'events' | 'catering' | 'merch' | 'rides' | 'leaders' | 'games';

const LEFT_TABS: { id: LeftTab; label: string; enabled: boolean }[] = [
  { id: 'info', label: 'INFO', enabled: true },
  { id: 'reviews', label: 'REVIEWS', enabled: true },
  { id: 'media', label: 'MEDIA', enabled: true },
];
const RIGHT_TABS: { id: RightTab; label: string; enabled: boolean; comingSoon?: boolean }[] = [
  { id: 'menu', label: 'MENU', enabled: true },
  { id: 'events', label: 'EVENTS', enabled: true },
  { id: 'catering', label: 'CATERING', enabled: false, comingSoon: true },
  { id: 'merch', label: 'MERCH', enabled: false, comingSoon: true },
  { id: 'rides', label: 'RIDES', enabled: false, comingSoon: true },
  { id: 'leaders', label: 'LEADERS', enabled: true },
  { id: 'games', label: 'GAMES', enabled: false, comingSoon: true },
];

const fmtCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

/* ------------------------------------------------------------------ */
/*  Hero Gallery – dark bg, VERIFIED VENUE, play btn, square aspect   */
/* ------------------------------------------------------------------ */
const HeroGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [idx, setIdx] = useState(0);

  if (!images.length) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-neutral-900 flex items-center justify-center">
        <span className="text-neutral-500 text-sm">No images available</span>
      </div>
    );
  }

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black">
        <img
          src={images[idx]}
          alt={`${title} ${idx + 1}`}
          className="w-full h-full object-cover"
        />

        {/* VERIFIED VENUE badge */}
        <div className="absolute top-4 left-4 bg-[#8B1A1A] text-white rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg">
          Verified Venue
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-bold drop-shadow-md">
          {idx + 1}/{images.length}
        </div>

        {/* Nav arrows (always visible) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-800" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-neutral-800" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.slice(0, 5).map((src, i) => {
            const isLastShown = i === 4 && images.length > 5;
            return (
              <button
                key={i}
                onClick={() => setIdx(isLastShown ? 5 : i)}
                className={cn(
                  'relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all',
                  idx === i ? 'ring-2 ring-[#8B1A1A]' : 'opacity-80 hover:opacity-100',
                )}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
                {isLastShown && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold leading-tight text-center">
                      +{images.length - 5}<br />MORE
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Bounty / Earn Card – Figma layout with stat boxes                 */
/* ------------------------------------------------------------------ */
const BountyEarnCard = ({
  deal,
  onCheckIn,
  isCheckingIn,
}: {
  deal: any;
  onCheckIn: () => void;
  isCheckingIn: boolean;
}) => {
  const bountyAmount = deal.bountyRewardAmount ?? deal.bounty?.rewardAmount ?? null;
  const minReferrals = deal.minReferralsRequired ?? deal.bounty?.minReferrals ?? null;
  const isBounty = bountyAmount !== null && bountyAmount > 0;
  const totalCheckIns = deal.socialProof?.totalCheckIns ?? deal.popularity?.totalCheckIns ?? 0;
  const totalSaves = deal.socialProof?.totalSaves ?? 0;
  const liveCrowd = totalCheckIns + totalSaves;
  const { hours, minutes, seconds } = useCountdown(deal.endTime);
  const hasCountdown = deal.status?.isActive && (hours > 0 || minutes > 0 || seconds > 0);

  const endTimeFormatted = deal.endTime
    ? new Date(deal.endTime)
        .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        .toUpperCase()
    : null;

  const recentSavers = deal.socialProof?.recentSavers || [];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-5 sm:p-6 md:p-8 text-white shadow-xl">
      {/* Stacks vertically on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row gap-5 md:gap-6">
        {/* ---- Left content ---- */}
        <div className="flex-1 min-w-0">
          {/* Top badges */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-wrap">
            {endTimeFormatted && (
              <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#B91C1C]/40 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">
                Ends at {endTimeFormatted}
              </span>
            )}
            {deal.status?.isActive && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#B91C1C] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/70">
                  Live Offer
                </span>
              </div>
            )}
          </div>

          {/* Main offer heading */}
          {isBounty ? (
            <>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tight leading-[1.1] mb-1.5 sm:mb-2">
                EARN ${bountyAmount}{' '}
                <span className="text-[#B91C1C]">/</span>{' '}
                <span className="not-italic">FRIEND</span>
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-white/50 mb-0.5 leading-relaxed">
                Boost your nightlife bank.
              </p>
              {minReferrals && (
                <p className="text-xs sm:text-sm md:text-base text-white/50 leading-relaxed">
                  Invite {minReferrals} friends for an instant{' '}
                  <span className="font-bold text-white">
                    ${(bountyAmount * minReferrals).toFixed(0)} bonus
                  </span>
                  .
                </p>
              )}
            </>
          ) : (
            <>
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-1.5 sm:mb-2">
                {deal.offerDisplay || `${deal.discountPercentage ?? 0}% OFF`}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-white/50">{deal.title}</p>
            </>
          )}

          {/* Stat boxes — show inline on small screens only (hidden md+) */}
          <div className="flex gap-2.5 mt-4 md:hidden overflow-x-auto scrollbar-hide">
            {/* Live Crowd – compact */}
            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center min-w-[100px] flex-1">
              <span className="text-[8px] text-white/40 uppercase tracking-[0.15em] font-bold block mb-1">
                Live Crowd
              </span>
              <span className="text-2xl font-bold block leading-none">{fmtCount(liveCrowd)}+</span>
              {(recentSavers.length > 0 || liveCrowd > 0) && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  {recentSavers.slice(0, 2).map((s: any, i: number) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-[#2a2a4a] flex items-center justify-center text-[7px] font-bold text-white/60"
                    >
                      {(s.name || '?').slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {liveCrowd > 2 && (
                    <div className="w-5 h-5 rounded-full bg-[#2a2a4a] flex items-center justify-center text-[7px] font-bold text-white/50">
                      +{fmtCount(liveCrowd - 2)}
                    </div>
                  )}
                </div>
              )}
              <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#B91C1C] rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Ends In – compact */}
            {hasCountdown && (
              <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center min-w-[100px] flex-1">
                <span className="text-[8px] text-white/40 uppercase tracking-[0.15em] font-bold block mb-1">
                  Ends In
                </span>
                <span className="text-2xl font-bold text-[#B91C1C] block leading-none">
                  {String(hours).padStart(2, '0')}
                  <span className="text-white/30">:</span>
                  {String(minutes).padStart(2, '0')}
                </span>
                <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all"
                    style={{
                      width: `${Math.max(5, 100 - ((hours * 3600 + minutes * 60 + seconds) / 864) * 10)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CTA button + avatars */}
          <div className="flex items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              onClick={onCheckIn}
              disabled={isCheckingIn || !deal.status?.isActive}
              className={cn(
                'px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base uppercase tracking-wide transition-all',
                deal.status?.isActive
                  ? 'bg-[#B91C1C] hover:bg-[#9B2020] active:scale-[0.98] shadow-lg shadow-red-900/30'
                  : 'bg-neutral-600 cursor-not-allowed opacity-60',
              )}
            >
              {isCheckingIn ? 'CHECKING IN\u2026' : 'CHECK IN NOW'}
            </button>

            {/* Avatar strip – inline with CTA */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex -space-x-1.5">
                {recentSavers.slice(0, 2).map((s: any, i: number) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#1a1a2e] overflow-hidden bg-[#2a2a4a]"
                  >
                    {s.avatarUrl ? (
                      <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white/70">
                        {(s.name || '?').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {liveCrowd > 2 && (
                <span className="text-[10px] sm:text-xs font-semibold text-white/50">+{fmtCount(liveCrowd - 2)}</span>
              )}
            </div>
          </div>
        </div>

        {/* ---- Right stat boxes – visible only on md+ ---- */}
        <div className="hidden md:flex flex-row gap-3 flex-shrink-0 self-center">
          {/* Live Crowd */}
          <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-center min-w-[120px]">
            <span className="text-[9px] text-white/40 uppercase tracking-[0.15em] font-bold block mb-1.5">
              Live Crowd
            </span>
            <span className="text-3xl font-bold block leading-none">{fmtCount(liveCrowd)}+</span>
            {(recentSavers.length > 0 || liveCrowd > 0) && (
              <div className="flex items-center justify-center gap-1 mt-2.5">
                {recentSavers.slice(0, 2).map((s: any, i: number) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-[#2a2a4a] flex items-center justify-center text-[8px] font-bold text-white/60"
                  >
                    {(s.name || '?').slice(0, 2).toUpperCase()}
                  </div>
                ))}
                {liveCrowd > 2 && (
                  <div className="w-6 h-6 rounded-full bg-[#2a2a4a] flex items-center justify-center text-[8px] font-bold text-white/50">
                    +{fmtCount(liveCrowd - 2)}
                  </div>
                )}
              </div>
            )}
            <div className="h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-[#B91C1C] rounded-full" style={{ width: '65%' }} />
            </div>
          </div>

          {/* Ends In */}
          {hasCountdown && (
            <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-center min-w-[120px]">
              <span className="text-[9px] text-white/40 uppercase tracking-[0.15em] font-bold block mb-1.5">
                Ends In
              </span>
              <span className="text-3xl font-bold text-[#B91C1C] block leading-none">
                {String(hours).padStart(2, '0')}
                <span className="text-white/30">:</span>
                {String(minutes).padStart(2, '0')}
              </span>
              <div className="h-1 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all"
                  style={{
                    width: `${Math.max(5, 100 - ((hours * 3600 + minutes * 60 + seconds) / 864) * 10)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Tab Bar – pill / capsule style (dark active)                       */
/* ------------------------------------------------------------------ */
function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; enabled: boolean; comingSoon?: boolean }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="rounded-full bg-neutral-100 p-1 flex overflow-x-auto scrollbar-hide border border-neutral-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => tab.enabled && onChange(tab.id)}
          disabled={!tab.enabled}
          title={tab.comingSoon ? 'Coming Soon' : undefined}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-all',
            !tab.enabled && 'cursor-not-allowed opacity-40',
            active === tab.id && tab.enabled
              ? 'bg-[#1a1a2e] text-white shadow-md'
              : tab.enabled
                ? 'text-neutral-500 hover:text-neutral-700'
                : 'text-neutral-400',
          )}
        >
          {tab.label}
          {tab.comingSoon && <Lock className="inline-block ml-1 h-3 w-3 opacity-50" />}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small reusable pieces                                              */
/* ------------------------------------------------------------------ */
const Stars = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={cn(
          n <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300',
        )}
        style={{ width: size, height: size }}
      />
    ))}
  </div>
);

const ComingSoonOverlay = ({ feature }: { feature: string }) => (
  <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
    <Lock className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
    <h3 className="text-lg font-bold text-neutral-600">{feature} &mdash; Coming Soon</h3>
    <p className="text-sm text-neutral-500 mt-1 max-w-md mx-auto">
      This feature is not yet supported. It will be enabled once the team integrates the API.
    </p>
  </div>
);

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export const DealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { canGoBack, goBack } = useNavigationHistory();
  const { savedDealIds, saveDeal, unsaveDeal } = useSavedDeals();
  const [leftTab, setLeftTab] = useState<LeftTab>('info');
  const [rightTab, setRightTab] = useState<RightTab>('menu');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{ pointsEarned: number } | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [menuCategory, setMenuCategory] = useState<string>('all');
  const [showAllMenu, setShowAllMenu] = useState(false);
  const MENU_INITIAL_COUNT = 4;

  const { isCheckingIn, checkIn } = useCheckIn({
    onSuccess: (data) => {
      if (data.withinRange) {
        setCheckInResult({ pointsEarned: data.pointsEarned });
        setShowCheckInModal(true);
      }
    },
  });

  const { data: deal, isLoading, error } = useDealDetail(dealId || '');

  const allImages = useMemo(() => {
    if (!deal) return [];
    return deal.images?.length ? deal.images : deal.imageUrl ? [deal.imageUrl] : [];
  }, [deal]);

  const todayDayName = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    [],
  );

  // Derive avg ticket from menu items (dynamic, no hardcode)
  const avgTicket = useMemo(() => {
    if (!deal?.menuItems?.length) return null;
    const avg =
      deal.menuItems.reduce(
        (sum: number, item: any) => sum + (item.discountedPrice || item.originalPrice || 0),
        0,
      ) / deal.menuItems.length;
    return `$${Math.round(avg)}+`;
  }, [deal]);

  // Derive unique menu categories dynamically
  const menuCategories = useMemo(() => {
    if (!deal?.menuItems?.length) return [];
    const cats = Array.from(new Set(deal.menuItems.map((item: any) => item.category).filter(Boolean)));
    return cats.sort();
  }, [deal]);

  // Filter + paginate menu items
  const filteredMenuItems = useMemo(() => {
    if (!deal?.menuItems?.length) return [];
    let items = deal.menuItems;
    if (menuCategory !== 'all') {
      items = items.filter((item: any) => item.category === menuCategory);
    }
    if (!showAllMenu) {
      return items.slice(0, MENU_INITIAL_COUNT);
    }
    return items;
  }, [deal, menuCategory, showAllMenu, MENU_INITIAL_COUNT]);

  const totalFilteredCount = useMemo(() => {
    if (!deal?.menuItems?.length) return 0;
    if (menuCategory === 'all') return deal.menuItems.length;
    return deal.menuItems.filter((item: any) => item.category === menuCategory).length;
  }, [deal, menuCategory]);

  /* ---------- Loading / Error ---------- */
  if (isLoading) return <LoadingOverlay message="Loading deal details\u2026" />;
  if (error || !deal) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <div className="max-w-xl rounded-2xl border bg-white p-10 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900">Deal not found</h2>
          <p className="mt-3 text-neutral-600">
            We couldn&apos;t find the deal{dealId ? ` with id "${dealId}"` : ''}.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              size="md"
              variant="primary"
              onClick={canGoBack ? goBack : () => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Derived state ---------- */
  const isSaved = savedDealIds.has(deal.id.toString());
  const handleSave = () =>
    isSaved ? unsaveDeal(deal.id.toString()) : saveDeal(deal.id.toString());
  const handleCheckIn = () => {
    if (dealId) checkIn(dealId);
  };
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${deal.title} \u2014 ${deal.merchant.businessName}`,
          text: deal.description || `Check out this deal at ${deal.merchant.businessName}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* cancelled */
    }
  };

  const dealTypeName =
    typeof deal.dealType === 'string' ? deal.dealType : deal.dealType?.name || 'Standard';
  const categoryLabel =
    typeof deal.category === 'object'
      ? deal.category?.label || ''
      : String(deal.category || '');

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="pt-20 pb-12 bg-white min-h-screen">
      <div className="container mx-auto max-w-screen-xl px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ========================================================= */}
          {/*  LEFT COLUMN  (5 / 12)                                     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <HeroGallery images={allImages} title={deal.merchant.businessName} />

            <TabBar tabs={LEFT_TABS} active={leftTab} onChange={setLeftTab} />

            {/* ---------- INFO TAB ---------- */}
            {leftTab === 'info' && (
              <div className="space-y-6">
                {/* Name + avg ticket */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-black text-neutral-900 leading-tight">
                      {deal.merchant.businessName}
                    </h1>
                    {avgTicket && (
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xl font-black text-[#8B1A1A]">{avgTicket}</span>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                          Avg Ticket
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-600">
                    {categoryLabel && (
                      <span className="uppercase text-xs tracking-wider font-medium">
                        {categoryLabel}
                      </span>
                    )}
                    {categoryLabel && <span className="text-neutral-300">&middot;</span>}
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-neutral-800">
                      {placeholderRatingsSummary.average}
                    </span>
                    <span className="text-neutral-400">
                      ({placeholderRatingsSummary.totalReviews})
                    </span>
                  </div>
                  {dealTypeName !== 'Standard' && (
                    <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-[#8B1A1A]/10 border border-[#8B1A1A]/20 text-xs font-bold text-[#8B1A1A]">
                      {dealTypeName}
                    </span>
                  )}
                </div>

                {/* Action buttons – always show CALL/ROUTE/SHARE, equal width per Figma */}
                <div className="flex gap-3">
                  {deal.merchant.phoneNumber ? (
                    <a
                      href={`tel:${deal.merchant.phoneNumber.replace(/\D/g, '')}`}
                      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-neutral-200 hover:border-[#8B1A1A]/30 hover:bg-[#8B1A1A]/5 transition-all"
                    >
                      <Phone className="h-6 w-6 text-[#8B1A1A]" />
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Call
                      </span>
                    </a>
                  ) : (
                    <div className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-neutral-200 opacity-40 cursor-not-allowed">
                      <Phone className="h-6 w-6 text-neutral-400" />
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Call
                      </span>
                    </div>
                  )}
                  {deal.merchant.latitude && deal.merchant.longitude ? (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${deal.merchant.latitude},${deal.merchant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-neutral-200 hover:border-[#8B1A1A]/30 hover:bg-[#8B1A1A]/5 transition-all"
                    >
                      <MapPin className="h-6 w-6 text-[#8B1A1A]" />
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Route
                      </span>
                    </a>
                  ) : (
                    <div className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-neutral-200 opacity-40 cursor-not-allowed">
                      <MapPin className="h-6 w-6 text-neutral-400" />
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Route
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleShare}
                    className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border border-neutral-200 hover:border-[#8B1A1A]/30 hover:bg-[#8B1A1A]/5 transition-all"
                  >
                    <Share2 className="h-6 w-6 text-[#8B1A1A]" />
                    <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      Share
                    </span>
                  </button>
                </div>

                {/* THE VIBE (placeholder – no backend field) */}
                <div>
                  <h3 className="text-[11px] font-bold text-neutral-500 tracking-[0.2em] uppercase mb-2.5">
                    The Vibe
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {placeholderVibeTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3.5 py-1.5 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-700 uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* HOURS (placeholder – no backend field) */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#8B1A1A] tracking-[0.2em] uppercase mb-2.5">
                    Hours
                  </h3>
                  <div className="space-y-0">
                    {placeholderHours.map((h) => {
                      const isToday = h.day === todayDayName;
                      return (
                        <div
                          key={h.day}
                          className="flex items-center gap-3 py-2.5"
                        >
                          <span
                            className={cn(
                              'text-sm flex-shrink-0 w-24',
                              isToday ? 'font-bold text-[#8B1A1A]' : 'font-medium text-neutral-700',
                            )}
                          >
                            {h.day}
                          </span>
                          <div className="flex-1 border-b border-dashed border-neutral-300" />
                          <span
                            className={cn(
                              'text-sm tabular-nums flex-shrink-0',
                              isToday ? 'font-bold text-[#8B1A1A]' : 'text-neutral-600',
                            )}
                          >
                            {h.isClosed ? 'Closed' : `${h.open} - ${h.close}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ABOUT */}
                <div>
                  <h3 className="text-[11px] font-bold text-[#8B1A1A] tracking-[0.2em] uppercase mb-2.5">
                    About
                  </h3>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {deal.merchant.description ||
                      deal.description ||
                      'No description available.'}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    {deal.merchant.address}
                  </p>
                  {deal.merchant.totalStores > 1 && (
                    <p className="mt-1 text-xs text-neutral-400">
                      {deal.merchant.totalStores} locations
                    </p>
                  )}
                </div>

                {/* Book Table CTA – dark navy per Figma */}
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full py-3.5 rounded-2xl bg-[#1a1a2e] hover:bg-[#252548] text-white font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  Book Table <ChevronRight className="h-4 w-4" />
                </button>

                {/* Things to Know – green numbered circles */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">Things to know</h3>
                  {deal.redemptionInstructions ? (
                    <ol className="space-y-3">
                      {deal.redemptionInstructions
                        .split('\n')
                        .filter(Boolean)
                        .map((line: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#8B1A1A] flex items-center justify-center text-[#8B1A1A] text-sm font-bold">
                              {i + 1}
                            </div>
                            <p className="text-sm text-neutral-700 pt-1.5">
                              {line.replace(/^\d+\.\s*/, '')}
                            </p>
                          </li>
                        ))}
                    </ol>
                  ) : (
                    <ol className="space-y-3">
                      {placeholderThingsToKnow.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#8B1A1A] flex items-center justify-center text-[#8B1A1A] text-sm font-bold">
                            {i + 1}
                          </div>
                          <p className="text-sm text-neutral-700 pt-1.5">{item}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            )}

            {/* ---------- REVIEWS TAB ---------- */}
            {leftTab === 'reviews' && (
              <div className="space-y-5">
                {/* Rating row */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-5xl font-black text-neutral-900">
                        {placeholderRatingsSummary.average}
                      </span>
                      <Stars rating={placeholderRatingsSummary.average} size={18} />
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {placeholderRatingsSummary.totalReviews} reviews
                    </p>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {placeholderRatingsSummary.verifiedCount} Verified
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-500 text-xs font-semibold">
                      {placeholderRatingsSummary.unverifiedCount} Unverified
                    </span>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 rounded-full bg-[#1a1a2e] text-white text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-80"
                    title="Reviews not yet supported by backend"
                  >
                    <Pencil className="h-3 w-3" /> Write Review
                  </button>
                </div>

                {/* Review cards */}
                <div className="space-y-4">
                  {placeholderReviews.map((review) => (
                    <div key={review.id} className="border-b border-neutral-100 pb-4 last:border-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={review.avatarUrl}
                          alt={review.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900 text-sm">
                              {review.userName}
                            </span>
                            {review.isVerified && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-700">
                                <Check className="h-3 w-3" /> Verified
                              </span>
                            )}
                            <div className="ml-auto">
                              <Stars rating={review.rating} size={12} />
                            </div>
                          </div>
                          <span className="text-xs text-neutral-400">{review.date}</span>
                        </div>
                      </div>
                      {/* Body */}
                      <p className="text-sm text-neutral-700 leading-relaxed italic">
                        {review.text}
                      </p>
                      {/* Purchases */}
                      {review.purchases && review.purchases.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-neutral-500 mb-1.5">
                            Items purchased:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {review.purchases.map((p) => (
                              <span
                                key={p}
                                className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-xs text-neutral-600 font-medium"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                          {review.purchaseImages && (
                            <div className="flex gap-2 mt-2">
                              {review.purchaseImages.map((img, i) => (
                                <div
                                  key={i}
                                  className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100"
                                >
                                  <img
                                    src={img}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Actions */}
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <button
                          disabled
                          className="flex items-center gap-1 text-neutral-500 cursor-not-allowed"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" /> Helpful
                        </button>
                        <button
                          disabled
                          className="text-red-500 font-semibold cursor-not-allowed"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------- MEDIA TAB ---------- */}
            {leftTab === 'media' && (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                      News/PR
                    </h3>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      Check us out &mdash; staying in the news
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-[#8B1A1A]" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-600">News/PR</span>
                  </div>
                </div>

                {/* Article cards */}
                <div className="space-y-4">
                  {placeholderArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex gap-4 border-b border-neutral-100 pb-4 last:border-0"
                    >
                      {/* Image */}
                      <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-neutral-100">
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                            <ExternalLink className="h-5 w-5 text-neutral-400" />
                          </div>
                        )}
                        {article.type === 'tv' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-8 h-8 rounded-full bg-[#8B1A1A] flex items-center justify-center">
                              <Play className="h-3.5 w-3.5 text-white fill-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-[#8B1A1A] uppercase tracking-wider mb-0.5">
                          {article.source}
                        </p>
                        <h4 className="font-semibold text-neutral-900 text-sm leading-snug mb-1 line-clamp-2 hover:underline">
                          {article.headline}
                        </h4>
                        <p className="text-xs text-neutral-500 line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400">{article.date}</span>
                          <button
                            disabled
                            className="text-xs font-semibold text-[#8B1A1A] flex items-center gap-1 cursor-not-allowed"
                            title="Media links not yet integrated"
                          >
                            {article.type === 'tv' ? 'Watch Video' : 'Read More'}{' '}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/*  RIGHT COLUMN  (7 / 12)                                    */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4">
            <BountyEarnCard
              deal={deal}
              onCheckIn={handleCheckIn}
              isCheckingIn={isCheckingIn}
            />

            <TabBar tabs={RIGHT_TABS} active={rightTab} onChange={setRightTab} />

            {/* ---------- MENU ---------- */}
            {rightTab === 'menu' && (
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
                      Curated Menu
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Auto-playing cinematic previews
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center cursor-not-allowed opacity-50"
                      title="Filter coming soon"
                    >
                      <SlidersHorizontal className="h-[18px] w-[18px] text-neutral-600" />
                    </button>
                    <button
                      disabled
                      className="w-10 h-10 rounded-xl bg-[#1a1a2e] flex items-center justify-center cursor-not-allowed opacity-70"
                      title="Search coming soon"
                    >
                      <Search className="h-[18px] w-[18px] text-white" />
                    </button>
                  </div>
                </div>

                {/* Category filter pills */}
                {menuCategories.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-3">
                    <button
                      onClick={() => { setMenuCategory('all'); setShowAllMenu(false); }}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-all flex-shrink-0',
                        menuCategory === 'all'
                          ? 'bg-[#1a1a2e] text-white'
                          : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 border border-neutral-200',
                      )}
                    >
                      ALL
                    </button>
                    {menuCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setMenuCategory(cat); setShowAllMenu(false); }}
                        className={cn(
                          'px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-all flex-shrink-0 uppercase',
                          menuCategory === cat
                            ? 'bg-[#1a1a2e] text-white'
                            : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 border border-neutral-200',
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Menu grid – cards per Figma */}
                {deal.hasMenuItems && deal.menuItems.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredMenuItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group aspect-[3/5]"
                          onClick={() => navigate(`/deals/${dealId}/menu/${item.id}`)}
                        >
                          {/* Full-bleed image / slideshow */}
                          {(item.images && item.images.length > 0) || item.imageUrl ? (
                            <div className="absolute inset-0">
                              <ImageSlideshow
                                images={item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : [])}
                                alt={item.name}
                                className="w-full h-full"
                                autoPlay={5000}
                                maxImages={3}
                                hoverScale
                              />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                              <ShoppingCart className="h-8 w-8 text-neutral-600" />
                            </div>
                          )}

                          {/* Category badge – top left */}
                          {item.category && (
                            <div className="absolute top-3.5 left-3.5 z-10">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-[#B91C1C]" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Price badge – top right */}
                          <div className="absolute top-3.5 right-3.5 z-10">
                            <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-sm">
                              ${(item.discountedPrice || item.originalPrice || 0).toFixed(2)}
                            </span>
                          </div>

                          {/* Bottom gradient – smooth progressive fade */}
                          <div className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none bg-gradient-to-t from-black via-black/70 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-gradient-to-t from-black/50 to-transparent" />

                          {/* Bottom content – all on top of image */}
                          <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex flex-col">
                            {/* Name + description */}
                            <h4 className="text-xl font-black text-white uppercase tracking-wide leading-tight">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-[13px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* Action row – overlaid on image */}
                            <div className="flex items-center gap-2.5 mt-4">
                              {/* Add to Basket + cart icon – single combined button, takes remaining space */}
                              <button
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 flex items-center justify-between pl-5 pr-1.5 py-1.5 rounded-full bg-white cursor-not-allowed"
                                title="Online ordering coming soon"
                              >
                                <span className="text-sm font-semibold text-[#1a1a2e] whitespace-nowrap">Add to Basket</span>
                                <span className="w-10 h-10 rounded-full bg-[#1a1a2e] flex items-center justify-center flex-shrink-0">
                                  <ShoppingCart className="h-[17px] w-[17px] text-white" />
                                </span>
                              </button>
                              {/* Heart – separate white circle */}
                              <button
                                disabled
                                onClick={(e) => e.stopPropagation()}
                                className="w-11 h-11 rounded-full bg-white flex items-center justify-center cursor-not-allowed flex-shrink-0"
                                title="Save item coming soon"
                              >
                                <Heart className="h-[18px] w-[18px] text-[#1a1a2e]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Show More / Show Less */}
                    {totalFilteredCount > MENU_INITIAL_COUNT && (
                      <button
                        onClick={() => setShowAllMenu(!showAllMenu)}
                        className="mt-4 w-full py-3 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        {showAllMenu
                          ? 'Show Less'
                          : `Show All ${totalFilteredCount} Items`}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 text-neutral-400 text-sm">
                    No menu items available for this deal.
                  </div>
                )}
              </div>
            )}

            {/* ---------- EVENTS ---------- */}
            {rightTab === 'events' && <EventsTab deal={deal} />}
            {/* ---------- LEADERS ---------- */}
            {rightTab === 'leaders' && <LeaderboardTab deal={deal} />}
            {/* ---------- Coming Soon tabs ---------- */}
            {rightTab === 'catering' && <ComingSoonOverlay feature="Catering" />}
            {rightTab === 'merch' && <ComingSoonOverlay feature="Merchandise" />}
            {rightTab === 'rides' && <ComingSoonOverlay feature="Rides" />}
            {rightTab === 'games' && <ComingSoonOverlay feature="Games" />}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MODALS                                                       */}
      {/* ============================================================ */}
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

      {showBookingModal && deal?.merchant?.id && (
        <TableBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          merchantId={deal.merchant.id}
          merchantName={deal.merchant.businessName}
        />
      )}
    </div>
  );
};

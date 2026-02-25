import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  Clock,
  MapPin,
  Sparkles,
  Gift,
  UtensilsCrossed,
  X,
  Banknote,
  Copy,
  Check,
  Lock,
  Users,
  Repeat,
  Zap,
  Tag,
  ChevronDown,
  Send,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Deal } from '@/data/deals';
import { getLandingMenuItems } from '@/data/landing-menu';
// API menu fetch disabled — using hardcoded menu for now:
// import { useMenuItems } from '@/hooks/useMenuSystem';
import { useTodayAvailability } from '@/hooks/useTableBooking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCountdown } from '@/hooks/useCountdown';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useAuth } from '@/context/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { ImageSlideshow } from './ImageSlideshow';

// ─── Types ─────────────────────────────────────────────────────────

interface NewDealCardProps {
  deal: Deal;
  onClick?: () => void;
  distance?: number;
}

// ─── Deal-type helpers ─────────────────────────────────────────────

type NormalizedDealType =
  | 'standard'
  | 'happy_hour'
  | 'bounty'
  | 'hidden'
  | 'redeem'
  | 'recurring';

function normalizeDealType(dt: Deal['dealType']): NormalizedDealType {
  if (!dt) return 'standard';
  const raw = typeof dt === 'string' ? dt : (dt as any).name ?? '';
  const key = raw.toUpperCase().replace(/\s+/g, '_');
  const map: Record<string, NormalizedDealType> = {
    STANDARD: 'standard',
    DISCOUNT: 'standard',
    HAPPY_HOUR: 'happy_hour',
    RECURRING: 'recurring',
    BOUNTY_DEAL: 'bounty',
    BOUNTY: 'bounty',
    KICKBACK: 'bounty',
    HIDDEN_DEAL: 'hidden',
    HIDDEN: 'hidden',
    REDEEM_NOW: 'redeem',
  };
  return map[key] || 'standard';
}

const DEAL_META: Record<
  NormalizedDealType,
  { badge: string; cta: string; icon: typeof Tag }
> = {
  standard: { badge: 'DEAL', cta: "I'll Bite", icon: Tag },
  happy_hour: { badge: 'HAPPY HOUR', cta: "I'll Bite", icon: Clock },
  bounty: { badge: 'BOUNTY', cta: "I'm In", icon: Banknote },
  hidden: { badge: 'SECRET', cta: 'Unlock', icon: Lock },
  redeem: { badge: 'FLASH SALE', cta: 'Treat me', icon: Zap },
  recurring: { badge: 'RECURRING', cta: "I'll Bite", icon: Repeat },
};

// ─── Component ─────────────────────────────────────────────────────

export const NewDealCard = ({ deal, onClick, distance }: NewDealCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Overlay state
  const [showMenuPeek, setShowMenuPeek] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showIncentiveDetails, setShowIncentiveDetails] = useState(false);
  const [menuTab, setMenuTab] = useState<'bites' | 'drinks' | 'reservations'>('bites');
  const [linkCopied, setLinkCopied] = useState(false);

  // Hooks
  const { savedDealIds, saveDeal, unsaveDeal } = useSavedDeals();
  const isSaved = savedDealIds.has(deal.id);
  const { biteItems: hardcodedBites, drinkItems: hardcodedDrinks } = getLandingMenuItems(deal.id);
  const { data: availability } = useTodayAvailability(deal.merchantId || undefined);

  // Countdown
  const countdown = useCountdown(deal.expiresAt || deal.endTime || '');
  const now = new Date();
  const endDate = deal.endTime ? new Date(deal.endTime) : null;
  const startDate = deal.startTime ? new Date(deal.startTime) : null;
  const isActive = endDate ? endDate > now && (!startDate || startDate <= now) : false;
  const isUpcoming = startDate ? startDate > now : false;

  // Deal type
  const dtype = normalizeDealType(deal.dealType);
  const meta = DEAL_META[dtype];

  // Bounty helpers
  const hasBounty = dtype === 'bounty' && (deal.bountyRewardAmount ?? 0) > 0;
  const maxCash = deal.bountyRewardAmount || 0;
  const cashPerFriend =
    hasBounty && (deal.minReferralsRequired ?? 0) > 0
      ? Math.floor(maxCash / deal.minReferralsRequired!)
      : 0;

  // Social proof
  const tappedInCount = deal.claimedBy?.totalCount || 0;
  const tappedInUsers = deal.claimedBy?.visibleUsers || [];

  // Images for story bar / slideshow (cap to 5)
  const images = (deal.images?.length ? deal.images : [deal.image]).filter(Boolean).slice(0, 5);

  // Distance
  const distanceDisplay = distance
    ? `${distance.toFixed(1)} mi`
    : deal.location
      ? deal.location.split(',')[0]?.trim()
      : '';

  // Countdown text
  const timeDisplay = countdown
    ? `${countdown.hours}h ${countdown.minutes}m`
    : '';

  // Discount values for the top capsule
  const discountPct = deal.discountPercentage ?? 0;
  const discountAmt = deal.discountAmount ?? 0;
  const originalPrice = deal.originalValue ?? 0;
  const salePrice =
    discountPct > 0 && originalPrice > 0
      ? +(originalPrice * (1 - discountPct / 100)).toFixed(2)
      : discountAmt > 0 && originalPrice > 0
        ? +(originalPrice - discountAmt).toFixed(2)
        : 0;

  // Category label for capsule — handle both string and Prisma relation object
  const categoryLabel =
    typeof deal.category === 'string'
      ? deal.category.toUpperCase()
      : (deal.category as any)?.name?.toUpperCase() || '';

  // Price pill variant: 0 = red bg, 1 = glassmorphism + red border
  const pricePillVariant =
    (String(deal.id)
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0) %
      2) as 0 | 1;

  const PILL_BASE =
    'rounded-full h-8 min-h-[32px] min-w-[84px] flex items-center shrink-0';

  // First pill: always dark reddish-brown (maroon-type)
  const categoryPillStyle = 'bg-[#453030] border border-white/5';

  const pricePillStyles = [
    // 0: solid red bg
    'bg-[#E80203]/90 border border-white/20',
    // 1: glassmorphism + red border
    'bg-black/40 backdrop-blur-md border-2 border-[#E80203]',
  ];

  // Navigation
  const goToDeal = () => {
    if (onClick) return onClick();
    navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
  };

  // Handlers
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to save deals.' });
      return;
    }
    isSaved ? unsaveDeal(deal.id) : saveDeal(deal.id);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${PATHS.DEAL_DETAIL.replace(':dealId', deal.id)}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Hardcoded menu (API disabled for now)
  const biteItems = hardcodedBites;
  const drinkItems = hardcodedDrinks;

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="flex flex-col w-full">
      {/* ── Main Card ─────────────────────────────────── */}
      <motion.div
        className="group relative w-full rounded-[1.25rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-white/10"
        style={{ background: '#1a1a2e' }}
        onClick={goToDeal}
      >
        {/* Image area — tall aspect ratio like Figma */}
        <div className="relative aspect-[3/4.5] overflow-hidden">
          <ImageSlideshow images={images} alt={deal.name} maxImages={5} autoPlay={4000} showStoryBar />

          {/* Gradient overlay — stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 via-50% to-black/80 pointer-events-none" />

          {/* ── Overlays ── */}
          <MenuPeekOverlay
            show={showMenuPeek}
            onClose={() => setShowMenuPeek(false)}
            deal={deal}
            menuTab={menuTab}
            setMenuTab={setMenuTab}
            biteItems={biteItems}
            drinkItems={drinkItems}
            availability={availability}
          />
          <IncentiveOverlay
            show={showIncentiveDetails}
            onClose={() => setShowIncentiveDetails(false)}
            deal={deal}
            dtype={dtype}
            hasBounty={hasBounty}
            maxCash={maxCash}
            cashPerFriend={cashPerFriend}
            timeDisplay={timeDisplay}
            isActive={isActive}
            onShare={() => {
              setShowIncentiveDetails(false);
              setShowShareSheet(true);
            }}
            onNavigate={goToDeal}
          />
          <ShareSheetOverlay
            show={showShareSheet}
            onClose={() => setShowShareSheet(false)}
            deal={deal}
            hasBounty={hasBounty}
            cashPerFriend={cashPerFriend}
            maxCash={maxCash}
            maxFriends={deal.minReferralsRequired || 0}
            timeDisplay={timeDisplay}
            linkCopied={linkCopied}
            onCopyLink={handleCopyLink}
            userId={user?.id?.toString()}
          />

          {/* ─────────────── TOP CAPSULE (Pills) ─────────────── */}
          {/* Category pill (left) + Price pill (right) — similar height, glassmorphism variants */}
          <div className="absolute top-10 left-3 right-3 z-20 flex items-center justify-between gap-2">
            {/* Category tag — always dark maroon */}
            <div
              className={cn(PILL_BASE, 'px-3 justify-center', categoryPillStyle)}
            >
              <span className="text-white font-bold text-[10px] leading-tight uppercase tracking-wider">
                {dtype !== 'standard' ? meta.badge : (categoryLabel || 'DEAL')}
              </span>
            </div>
            {/* Price tag — red bg OR glassmorphism + red border */}
            {(salePrice > 0 || originalPrice > 0) && (
              <div
                className={cn(
                  PILL_BASE,
                  'pl-3 pr-2 gap-1.5',
                  pricePillStyles[pricePillVariant]
                )}
              >
                {salePrice > 0 && (
                  <span className="text-white font-bold text-sm">${salePrice.toFixed(2)}</span>
                )}
                {originalPrice > 0 && salePrice > 0 && (
                  <span className="text-white/70 text-xs line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                {originalPrice > 0 && salePrice === 0 && (
                  <span className="text-white font-bold text-sm">${originalPrice.toFixed(2)}</span>
                )}
                <ChevronDown className="w-4 h-4 text-white flex-shrink-0" />
              </div>
            )}
          </div>

          {/* ─────────────── Social Proof ─────────────── */}
          <div className="absolute bottom-[140px] left-3 z-10">
            {tappedInCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {tappedInUsers.slice(0, 3).map((u, i) => (
                    <Avatar key={i} className="w-8 h-8 border-2 border-white/80 shadow-md">
                      <AvatarImage src={u.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-brand-primary-400 to-amber-400 text-white text-[10px] font-semibold">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-white text-xs font-medium drop-shadow-lg">
                  +{tappedInCount} checked in
                </span>
              </div>
            )}
          </div>

          {/* ─────────────── BOTTOM CONTENT ─────────────── */}
          <div className="absolute bottom-0 inset-x-0 p-3.5 space-y-1.5">
            {/* Title — large bold serif-like */}
            <h3 className="text-white text-[22px] font-extrabold leading-[1.15] truncate drop-shadow-lg tracking-tight">
              {deal.name}
            </h3>

            {/* Merchant + distance */}
            <div className="flex items-center gap-1.5 text-white/70 text-[13px]">
              {deal.merchantName && (
                <>
                  <span className="truncate max-w-[130px]">{deal.merchantName}</span>
                  {distanceDisplay && <span className="text-white/40">•</span>}
                </>
              )}
              {distanceDisplay && (
                <span className="flex items-center gap-0.5 flex-shrink-0">
                  <MapPin className="w-3 h-3" />
                  {distanceDisplay}
                </span>
              )}
            </div>

            {/* ── Figma: Status pill + action icons ── */}
            <div className="flex items-center gap-1.5 pt-1">
              {/* Status pill — Figma styles: Starts (dark+red border), Ends (green), Opens/Date (dark) */}
              {deal.statusText ? (
                deal.statusText.startsWith('Opens') ? (
                  <div
                    className="flex items-center gap-1 rounded-full px-2.5 py-1.5 flex-shrink-0"
                    style={{ background: '#2D2D2D' }}
                  >
                    <span className="text-white text-[10px] font-semibold">
                      {deal.statusText}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 rounded-full px-2.5 py-1.5 flex-shrink-0 border"
                    style={{ background: '#2D2D2D', borderColor: '#E80203' }}
                  >
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-white text-[10px] font-semibold">
                      {deal.statusText}
                    </span>
                  </div>
                )
              ) : (isActive || isUpcoming) && timeDisplay ? (
                isActive ? (
                  <div
                    className="flex items-center gap-1 rounded-full px-2.5 py-1.5 flex-shrink-0"
                    style={{ background: '#34C759' }}
                  >
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-white text-[10px] font-semibold whitespace-nowrap">
                      Ends {timeDisplay}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 rounded-full px-2.5 py-1.5 flex-shrink-0 border"
                    style={{ background: '#2E3134', borderColor: '#E80203' }}
                  >
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-white text-[10px] font-semibold whitespace-nowrap">
                      Starts {timeDisplay}
                    </span>
                  </div>
                )
              ) : dtype === 'recurring' && deal.recurringDays?.length ? (
                <div
                  className="flex items-center gap-1 rounded-full px-2.5 py-1.5 flex-shrink-0"
                  style={{ background: '#2D2D2D' }}
                >
                  <Repeat className="w-3 h-3 text-white" />
                  <span className="text-white text-[10px] font-semibold">
                    {deal.recurringDays.map((d) => d.slice(0, 3)).join('/')}
                  </span>
                </div>
              ) : hasBounty && maxCash > 0 ? (
                <div
                  className="flex items-center gap-1 rounded-full px-2.5 py-1.5 flex-shrink-0"
                  style={{ background: '#2D2D2D' }}
                >
                  <Banknote className="w-3 h-3 text-white" />
                  <span className="text-white text-[10px] font-semibold">Up to ${maxCash}</span>
                </div>
              ) : null}

              <div className="flex-1 min-w-0" />

              {/* Action icons — dark gray circles, send = purple gradient */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  style={{ background: '#4C4C4C' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareSheet(true);
                  }}
                >
                  <Share2 className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  style={{ background: '#4C4C4C' }}
                  onClick={handleFavorite}
                >
                  <Heart
                    className={cn(
                      'w-3.5 h-3.5',
                      isSaved ? 'fill-brand-primary-600 text-brand-primary-600' : 'text-white',
                    )}
                  />
                </button>
                {(deal.merchantId || biteItems.length > 0 || drinkItems.length > 0) && (
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                    style={{ background: '#4C4C4C' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenuPeek(true);
                    }}
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowIncentiveDetails(true);
                  }}
                >
                  <Send className="w-3.5 h-3.5 text-white -rotate-12" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Figma: CTA bar — dark blue pill + "up to $80" ── */}
      <div className="flex items-center gap-2.5 mt-3">
        <button
          onClick={goToDeal}
          className="flex-1 h-[52px] rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-between pl-5 pr-1.5 group/cta"
          style={{ background: '#1a1a2e' }}
        >
          <span className="text-white font-semibold text-sm tracking-wide">
            {meta.cta}
          </span>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover/cta:scale-110 transition-transform">
            <ArrowUpRight className="w-[18px] h-[18px] text-gray-900" />
          </div>
        </button>

        <RewardBadge
          dtype={dtype}
          deal={deal}
          hasBounty={hasBounty}
          maxCash={maxCash}
          onPress={() => setShowIncentiveDetails(true)}
        />
      </div>
    </div>
  );
};

// ─── Reward Badge ──────────────────────────────────────────────────

function RewardBadge({
  dtype,
  deal,
  hasBounty,
  maxCash,
  onPress,
}: {
  dtype: NormalizedDealType;
  deal: Deal;
  hasBounty: boolean;
  maxCash: number;
  onPress: () => void;
}) {
  const hasContent =
    maxCash > 0 ||
    hasBounty ||
    dtype === 'hidden' ||
    dtype === 'redeem' ||
    ((deal.discountPercentage ?? 0) > 0) ||
    ((deal.discountAmount ?? 0) > 0);

  if (!hasContent) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onPress();
      }}
      className="h-[52px] rounded-full bg-white border border-gray-200 flex items-center justify-center px-4 shadow-md flex-shrink-0 hover:border-gray-400 transition-colors"
    >
      {(hasBounty || maxCash > 0) && maxCash > 0 ? (
        <div className="flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-neutral-600" />
          <span className="text-[10px] text-neutral-500">up to</span>
          <span className="text-lg font-bold text-neutral-900">${maxCash}</span>
        </div>
      ) : dtype === 'hidden' ? (
        <div className="flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900 text-sm">Surprise</span>
        </div>
      ) : dtype === 'redeem' && deal.discountPercentage ? (
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-gray-600" />
          <span className="text-lg font-bold text-gray-900">{deal.discountPercentage}%</span>
          <span className="text-[10px] text-gray-400">off</span>
        </div>
      ) : deal.discountPercentage ? (
        <div className="flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-gray-600" />
          <span className="text-lg font-bold text-gray-900">{deal.discountPercentage}%</span>
          <span className="text-[10px] text-gray-400">off</span>
        </div>
      ) : deal.discountAmount ? (
        <div className="flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-gray-600" />
          <span className="text-lg font-bold text-gray-900">${deal.discountAmount}</span>
          <span className="text-[10px] text-gray-400">off</span>
        </div>
      ) : null}
    </button>
  );
}

// ─── Menu Peek Overlay ─────────────────────────────────────────────

function MenuPeekOverlay({
  show,
  onClose,
  deal,
  menuTab,
  setMenuTab,
  biteItems,
  drinkItems,
  availability,
}: {
  show: boolean;
  onClose: () => void;
  deal: Deal;
  menuTab: string;
  setMenuTab: (t: any) => void;
  biteItems: any[];
  drinkItems: any[];
  availability: any;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute inset-0 bg-white z-50 overflow-y-auto rounded-[1.25rem]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10"
          >
            <X className="w-4 h-4 text-gray-900" />
          </button>
          <div className="p-4 pt-5">
            <h3 className="text-lg font-bold text-gray-900 mb-0.5">{deal.name}</h3>
            <p className="text-gray-400 text-[11px] mb-4">Browse menu items and reserve a table.</p>
            <Tabs value={menuTab} onValueChange={setMenuTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 rounded-full p-1">
                <TabsTrigger value="bites" className="rounded-full text-[11px] data-[state=active]:bg-gray-900 data-[state=active]:text-white">BITES</TabsTrigger>
                <TabsTrigger value="drinks" className="rounded-full text-[11px] data-[state=active]:bg-gray-900 data-[state=active]:text-white">DRINKS</TabsTrigger>
                <TabsTrigger value="reservations" className="rounded-full text-[11px] data-[state=active]:bg-gray-900 data-[state=active]:text-white">RESERVE</TabsTrigger>
              </TabsList>
              <TabsContent value="bites" className="space-y-2">
                {biteItems.length > 0 ? biteItems.slice(0, 3).map((item) => (
                  <MenuItemRow key={item.id} item={item} deal={deal} />
                )) : <p className="text-gray-400 text-xs py-4 text-center">No bites available</p>}
              </TabsContent>
              <TabsContent value="drinks" className="space-y-2">
                {drinkItems.length > 0 ? drinkItems.slice(0, 3).map((item) => (
                  <MenuItemRow key={item.id} item={item} deal={deal} />
                )) : <p className="text-gray-400 text-xs py-4 text-center">No drinks available</p>}
              </TabsContent>
              <TabsContent value="reservations" className="space-y-2.5">
                <p className="text-gray-400 text-[11px] text-center">
                  {deal.startTime && deal.endTime
                    ? `${new Date(deal.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${new Date(deal.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                    : 'Walk-in or call to reserve'}
                </p>
                {availability?.availableTimeSlots?.length ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {availability.availableTimeSlots.slice(0, 6).map((slot: any) => (
                      <button
                        key={slot.id}
                        disabled={slot.availableSpots === 0}
                        className={cn(
                          'p-2 rounded-lg text-xs font-medium transition-all',
                          slot.availableSpots > 0
                            ? 'bg-white border border-gray-200 hover:border-gray-900 text-gray-900'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                        )}
                      >
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-xs py-3 text-center">No time slots right now</p>}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuItemRow({ item, deal }: { item: any; deal: Deal }) {
  return (
    <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-xs truncate">{item.name}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-600 font-semibold text-xs">${item.price}</span>
          {deal.discountPercentage != null && deal.discountPercentage > 0 && (
            <Badge className="bg-brand-primary-600 text-white text-[9px] px-1.5 py-0">{deal.discountPercentage}% OFF</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Incentive Details Overlay ─────────────────────────────────────

function IncentiveOverlay({
  show, onClose, deal, dtype, hasBounty, maxCash, cashPerFriend, timeDisplay, isActive, onShare, onNavigate,
}: {
  show: boolean; onClose: () => void; deal: Deal; dtype: NormalizedDealType;
  hasBounty: boolean; maxCash: number; cashPerFriend: number; timeDisplay: string;
  isActive: boolean; onShare: () => void; onNavigate: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-50 rounded-[1.25rem] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center z-10"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="p-4 pt-6 flex flex-col h-full justify-between min-h-full">
            <div className="space-y-4 pt-4">
              {dtype === 'bounty' && hasBounty ? (
                <div className="text-center space-y-2">
                  <span className="text-5xl font-bold text-white">${maxCash}</span>
                  <p className="text-white/60 text-xs">Maximum Cash Reward</p>
                  {cashPerFriend > 0 && <p className="text-white/40 text-[11px]">${cashPerFriend} per friend</p>}
                </div>
              ) : dtype === 'redeem' ? (
                <div className="text-center space-y-2">
                  <span className="text-5xl font-bold text-emerald-400">{deal.discountPercentage || 50}%</span>
                  <p className="text-white/80 text-base">OFF YOUR BILL</p>
                  {deal.discountAmount != null && <p className="text-white/50 text-[11px]">Up to ${deal.discountAmount} discount</p>}
                </div>
              ) : dtype === 'hidden' ? (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white/70 text-base">Mystery Reward</p>
                  <p className="text-white/40 text-[11px]">Unlocked at check-in</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  {deal.discountPercentage ? (
                    <>
                      <span className="text-5xl font-bold text-white">{deal.discountPercentage}%</span>
                      <p className="text-white/60 text-xs">Discount on this deal</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                        <Gift className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white/70 text-base">Special Deal</p>
                    </>
                  )}
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-3.5 space-y-1.5">
                <h4 className="text-white font-semibold text-[11px] uppercase tracking-wide">How it works</h4>
                {dtype === 'bounty' && hasBounty ? (
                  <ul className="space-y-1 text-white/50 text-[11px]">
                    <li>• Friends must arrive before the countdown ends</li>
                    <li>• They check in & spend $20+ → you earn cash</li>
                    {deal.minReferralsRequired && <li>• Up to {deal.minReferralsRequired} friends = ${maxCash} total</li>}
                  </ul>
                ) : dtype === 'redeem' ? (
                  <ul className="space-y-1 text-white/50 text-[11px]">
                    <li>• Must check in to activate discount</li>
                    <li>• One redeem per table</li>
                    <li>• Can't combine with other deals</li>
                  </ul>
                ) : dtype === 'hidden' ? (
                  <ul className="space-y-1 text-white/50 text-[11px]">
                    <li>• Surprise discount revealed at check-in</li>
                    <li>• Must spend minimum $20 to qualify</li>
                    <li>• Surprise changes each visit</li>
                  </ul>
                ) : (
                  <ul className="space-y-1 text-white/50 text-[11px]">
                    <li>• Check in at the venue to claim</li>
                    <li>• Show deal to your server</li>
                    {deal.offerTerms && <li>• {deal.offerTerms}</li>}
                  </ul>
                )}
              </div>
              {isActive && timeDisplay && (
                <div className="flex items-center gap-2 bg-brand-primary-600/20 border border-brand-primary-600/40 rounded-xl p-2.5">
                  <Clock className="w-3.5 h-3.5 text-brand-primary-500 flex-shrink-0" />
                  <p className="text-brand-primary-400 text-[11px]">Deal ends in {timeDisplay}</p>
                </div>
              )}
            </div>
            <div className="space-y-2.5 mt-5">
              {dtype === 'bounty' && hasBounty && (
                <button onClick={(e) => { e.stopPropagation(); onShare(); }}
                  className="w-full h-11 bg-emerald-500 text-white rounded-full font-semibold text-xs hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share & Invite Friends
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onClose(); onNavigate(); }}
                className="w-full h-11 bg-white text-gray-900 rounded-full font-semibold text-xs hover:bg-white/90 transition-colors"
              >View Deal</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Share Sheet Overlay ───────────────────────────────────────────

function ShareSheetOverlay({
  show, onClose, deal, hasBounty, cashPerFriend, maxCash, maxFriends, timeDisplay, linkCopied, onCopyLink, userId,
}: {
  show: boolean; onClose: () => void; deal: Deal; hasBounty: boolean;
  cashPerFriend: number; maxCash: number; maxFriends: number; timeDisplay: string;
  linkCopied: boolean; onCopyLink: () => void; userId?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute inset-0 bg-white z-50 rounded-[1.25rem] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10"
          >
            <X className="w-4 h-4 text-gray-900" />
          </button>
          <div className="p-4 space-y-4 mt-6">
            {hasBounty && cashPerFriend > 0 && maxFriends > 0 && (
              <div className="bg-emerald-500 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">${cashPerFriend}</span>
                  <span className="text-white/80 text-xs">per friend</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/80 text-[11px]">
                  <Users className="w-3.5 h-3.5" />
                  <span>Bring {maxFriends} friends = ${maxCash} max</span>
                </div>
              </div>
            )}
            <div className="space-y-2.5">
              <h3 className="text-gray-400 uppercase tracking-wide text-[11px]">To qualify, friends must:</h3>
              {['Use your referral link to check in', `Arrive before ${timeDisplay || 'the deadline'}`, 'Spend $20+ at checkout'].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</div>
                  <p className="text-gray-800 pt-0.5 text-[11px]">{step}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <h3 className="text-gray-400 uppercase tracking-wide text-[11px]">Share your link</h3>
              <div className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl bg-gray-50">
                <input type="text" value={`${window.location.origin}${PATHS.DEAL_DETAIL.replace(':dealId', deal.id)}?ref=${userId || 'YOU'}`}
                  className="flex-1 bg-transparent text-blue-600 outline-none text-[11px]" readOnly />
                <button className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-[11px] hover:bg-gray-800 transition-colors flex items-center gap-1"
                  onClick={onCopyLink}>
                  {linkCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {linkCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Ticket,
  Play,
  Check,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Gift,
  ExternalLink,
  Sparkles,
  Star,
  ParkingCircle,
  Wine,
  Zap,
  Camera,
  Lock,
  X,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useEventDetail,
  usePurchaseTickets,
  useJoinWaitlist,
} from '@/hooks/useEventDetail';
import type { EventTicketTier, EventDetail } from '@/hooks/useEventDetail';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';
import { useDealsByCategory } from '@/hooks/useDealsByCategory';
import type { Deal } from '@/data/deals';
import { NewDealCard } from '@/components/landing/NewDealCard';
import { useBrowseEvents } from '@/hooks/useEventDetail';
import { EventCard } from '@/components/events/EventCard';

/* ─── Extended types ──────────────────────────────────────────── */

interface FullEventDetail extends EventDetail {
  userTickets?:
    | { id: number; ticketNumber: string; status: string; purchasePrice: number }[]
    | null;
}

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getAvailable(tier: EventTicketTier) {
  return tier.totalQuantity - tier.soldQuantity - tier.reservedQuantity;
}

function getSoldPercent(tier: EventTicketTier) {
  if (tier.totalQuantity === 0) return 0;
  return Math.round(
    ((tier.soldQuantity + tier.reservedQuantity) / tier.totalQuantity) * 100,
  );
}

function getTierPrice(tier: EventTicketTier) {
  return tier.price + (tier.serviceFee || 0);
}

function getTotalWithTax(tier: EventTicketTier, qty: number) {
  const base = tier.price * qty;
  const fee = (tier.serviceFee || 0) * qty;
  const tax = base * (tier.taxRate || 0);
  return base + fee + tax;
}

/* ─── Perk icon mapping ──────────────────────────────────────── */

const PERK_ICONS: Record<string, React.ElementType> = {
  parking: ParkingCircle,
  drink: Wine,
  entry: Zap,
  photo: Camera,
  gift: Gift,
  vip: Star,
  food: Wine,
  default: Sparkles,
};

function getPerkIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('parking')) return PERK_ICONS.parking;
  if (lower.includes('drink') || lower.includes('beverage') || lower.includes('cocktail'))
    return PERK_ICONS.drink;
  if (lower.includes('entry') || lower.includes('express') || lower.includes('access'))
    return PERK_ICONS.entry;
  if (lower.includes('photo') || lower.includes('booth')) return PERK_ICONS.photo;
  if (lower.includes('gift') || lower.includes('swag')) return PERK_ICONS.gift;
  if (lower.includes('vip') || lower.includes('lounge')) return PERK_ICONS.vip;
  if (lower.includes('food') || lower.includes('meal')) return PERK_ICONS.food;
  return PERK_ICONS.default;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 1 — Hero Slideshow + Thumbnails
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function HeroSlideshow({ event }: { event: FullEventDetail }) {
  const allMedia: { url: string; isVideo: boolean }[] = [];

  if (event.coverImageUrl) allMedia.push({ url: event.coverImageUrl, isVideo: false });
  if (event.videoUrl) allMedia.push({ url: event.videoUrl, isVideo: true });
  event.imageGallery?.forEach((img) => allMedia.push({ url: img, isVideo: false }));

  if (allMedia.length === 0)
    allMedia.push({
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      isVideo: false,
    });

  const [current, setCurrent] = useState(0);
  const total = allMedia.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);
  const media = allMedia[current];

  const VISIBLE_THUMBS = 4;
  const extraCount = Math.max(0, total - VISIBLE_THUMBS);

  return (
    <div className="space-y-3">
      {/* Main hero — 9:16 reels aspect ratio */}
      <div className="relative w-full aspect-[9/16] max-h-[600px] rounded-2xl overflow-hidden bg-[#1a1a2e] group">
        {media.isVideo ? (
          <div className="w-full h-full relative">
            <img
              src={event.coverImageUrl || allMedia[0]?.url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <button className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center shadow-2xl transition-all border border-white/20">
                <Play className="h-7 w-7 text-white ml-1" fill="white" />
              </button>
            </div>
          </div>
        ) : (
          <img
            src={media.url}
            alt={`${event.title} ${current + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800';
            }}
          />
        )}

        {/* Verified Venue badge */}
        {event.merchant && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#B91C1C] text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Venue
          </div>
        )}

        {/* Expand icon top-right */}
        <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition-colors backdrop-blur-sm">
          <ExternalLink className="h-3.5 w-3.5" />
        </button>

        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 bottom-10 h-9 w-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#1a1a2e] shadow-lg transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 bottom-10 h-9 w-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#1a1a2e] shadow-lg transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-semibold backdrop-blur-sm">
              {current + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2">
          {allMedia.slice(0, VISIBLE_THUMBS).map((m, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'relative h-16 flex-1 rounded-xl overflow-hidden transition-all',
                current === i
                  ? 'ring-2 ring-[#B91C1C] ring-offset-1'
                  : 'opacity-70 hover:opacity-100',
              )}
            >
              <img
                src={m.isVideo ? (event.coverImageUrl || m.url) : m.url}
                alt={`Thumb ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200';
                }}
              />
              {i === VISIBLE_THUMBS - 1 && extraCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+{extraCount} MORE</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 2 — Earn / Referral Banner
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function EarnBanner({ event }: { event: FullEventDetail }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const start = new Date(event.startDate);
      const diff = start.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event.startDate]);

  const isUpcoming = new Date(event.startDate) > new Date();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-5 sm:p-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(185,28,28,0.5),transparent_60%)]" />
      </div>

      <div className="relative">
        {/* Top badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#B91C1C] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border border-[#B91C1C]/40">
            Ends at {formatTime(event.startDate)}
          </span>
          <span className="bg-emerald-500 text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Live Offer
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              EARN <span className="text-[#B91C1C]">$18</span>{' '}
              <span className="text-white/80">/ FRIEND</span>
            </h3>
            <p className="text-white/50 text-sm mt-1.5 leading-relaxed">
              Boost your nightlife bank. Invite 5 friends for an instant{' '}
              <span className="text-white font-bold">$90 bonus</span>
            </p>

            <Link
              to={PATHS.REFERRALS}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#B91C1C] hover:bg-[#9B2020] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors active:scale-[0.98] shadow-lg shadow-red-900/30"
            >
              Check In Now
            </Link>

            {event.currentAttendees > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex -space-x-2">
                  {['JD', 'SK'].map((initials, i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full bg-[#2a2a4a] border-2 border-[#1a1a2e] flex items-center justify-center text-[9px] font-bold text-white/70"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-white/40 font-medium">
                  +{event.currentAttendees} attending
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-stretch gap-2.5 flex-shrink-0">
            <div className="text-center px-4 py-3 bg-white/5 border border-white/10 rounded-2xl min-w-[90px]">
              <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.15em]">
                Live Crowd
              </p>
              <p className="text-2xl font-black text-white mt-0.5">
                {event.currentAttendees || event.socialProofCount || 412}+
              </p>
              <div className="flex justify-center -space-x-1 mt-1.5">
                {['J', 'S', '+'].map((t, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full bg-[#2a2a4a] border border-[#1a1a2e] flex items-center justify-center text-[6px] font-bold text-white/50"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {isUpcoming && (
              <div className="text-center px-4 py-3 bg-[#B91C1C]/15 border border-[#B91C1C]/30 rounded-2xl min-w-[90px]">
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.15em]">
                  Ends In
                </p>
                <p className="text-2xl font-black text-[#B91C1C] font-mono mt-0.5">
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}
                </p>
                <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#B91C1C] rounded-full transition-all"
                    style={{
                      width: `${Math.max(10, 100 - (timeLeft.hours * 60 + timeLeft.minutes))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 3 — The Lineup
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function LineupSection({ event }: { event: FullEventDetail }) {
  const performers: {
    name: string;
    role: string;
    avatar?: string;
    isHeadliner?: boolean;
  }[] = [];

  if (event.organizer?.name) {
    performers.push({
      name: event.organizer.name,
      role: event.organizer.avatarUrl ? 'Headliner' : 'Host / Headliner',
      avatar: event.organizer.avatarUrl || undefined,
      isHeadliner: true,
    });
  }
  if (event.merchant?.businessName) {
    performers.push({
      name: event.merchant.businessName,
      role: 'Venue Partner',
      avatar: event.merchant.logoUrl || undefined,
    });
  }
  event.tags?.slice(0, 3).forEach((tag) => {
    performers.push({ name: tag, role: 'Featured Act' });
  });

  if (performers.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-white p-5">
      <h2 className="font-heading text-base font-black text-[#1a1a2e] uppercase tracking-wide mb-5">
        The Lineup
      </h2>

      <div className="flex items-start justify-center gap-8 overflow-x-auto scrollbar-hide pb-2">
        {performers.slice(0, 3).map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative">
              {/* Headliner gets red ring, others get neutral */}
              <div
                className={cn(
                  'h-[80px] w-[80px] rounded-full overflow-hidden border-[3px] bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center shadow-lg',
                  p.isHeadliner
                    ? 'border-[#B91C1C]'
                    : 'border-neutral-300',
                )}
              >
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-neutral-400">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {p.isHeadliner && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase bg-[#B91C1C] text-white px-2.5 py-0.5 rounded-full whitespace-nowrap tracking-wider shadow-md">
                  Headliner
                </span>
              )}
            </div>
            <div className="text-center mt-1">
              <p className="text-sm font-black text-[#1a1a2e]">{p.name}</p>
              <p className="text-[10px] text-neutral-500 leading-snug max-w-[140px]">
                {p.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 4 — Select Tickets  (per-tier quantities, +/- on all)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SelectTickets({
  event,
  selectedTierId,
  setSelectedTierId,
  quantities,
  setQuantities,
  onWaitlist,
}: {
  event: FullEventDetail;
  selectedTierId: number | null;
  setSelectedTierId: (id: number | null) => void;
  quantities: Record<number, number>;
  setQuantities: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  onWaitlist: () => void;
}) {
  const activeTiers = event.ticketTiers.filter((t) => t.isActive);

  // Auto-select the first available tier on mount
  useEffect(() => {
    const first = activeTiers.find((t) => getAvailable(t) > 0);
    if (first && selectedTierId === null) {
      setSelectedTierId(first.id);
      setQuantities((prev) => ({ ...prev, [first.id]: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTiers.length]);

  const getPerksForTier = (tier: EventTicketTier) => {
    const tierLower = tier.tier.toLowerCase();
    const tierName = tier.name.toLowerCase();
    const perks: string[] = [];

    if (tierLower.includes('vip') || tierName.includes('vip') || tierName.includes('backstage'))
      perks.push('PRIVATE BAR');
    if (tierName.includes('early') || tierLower.includes('early_bird'))
      perks.push('EXPRESS ENTRY');
    if (tier.description?.toLowerCase().includes('drink')) perks.push('1 DRINK');
    if (tier.description?.toLowerCase().includes('parking')) perks.push('FREE PARKING');

    event.addOns
      ?.filter(
        (a: { isActive: boolean; price: number; isOptional: boolean }) =>
          a.isActive && a.price === 0 && !a.isOptional,
      )
      .forEach((a: { name: string }) => {
        if (!perks.includes(a.name.toUpperCase())) perks.push(a.name.toUpperCase());
      });

    return perks.slice(0, 3);
  };

  const handleIncrement = (tier: EventTicketTier, e: React.MouseEvent) => {
    e.stopPropagation();
    const avail = getAvailable(tier);
    const currentQty = quantities[tier.id] || 0;
    if (currentQty >= tier.maxPerOrder || currentQty >= avail) return;

    const newQty = currentQty + 1;
    setQuantities((prev) => ({ ...prev, [tier.id]: newQty }));
    // Auto-select this tier when incrementing from 0
    if (currentQty === 0) setSelectedTierId(tier.id);
  };

  const handleDecrement = (tier: EventTicketTier, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentQty = quantities[tier.id] || 0;
    if (currentQty <= 0) return;

    const newQty = Math.max(0, currentQty - 1);
    setQuantities((prev) => ({ ...prev, [tier.id]: newQty }));
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h2 className="font-heading text-base font-black text-[#1a1a2e] uppercase tracking-wide mb-4">
        Select Tickets
      </h2>

      <div className="space-y-3">
        {activeTiers.map((tier) => {
          const avail = getAvailable(tier);
          const isSoldOut = avail <= 0;
          const isSelected = selectedTierId === tier.id;
          const soldPct = getSoldPercent(tier);
          const perks = getPerksForTier(tier);
          const qty = quantities[tier.id] || 0;

          return (
            <div
              key={tier.id}
              onClick={() => {
                if (!isSoldOut) {
                  setSelectedTierId(tier.id);
                  if (qty === 0) {
                    setQuantities((prev) => ({ ...prev, [tier.id]: 1 }));
                  }
                }
              }}
              className={cn(
                'relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200',
                isSelected && !isSoldOut
                  ? 'border-[#B91C1C] bg-red-50/30'
                  : isSoldOut
                    ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-default'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white',
              )}
            >
              {/* Sold Out overlay */}
              {isSoldOut && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-[#B91C1C] text-white text-[10px] font-black uppercase px-3 py-1 rounded shadow-lg tracking-wider">
                    Sold Out
                  </span>
                </div>
              )}

              {/* Name + Price row */}
              <div className="flex items-start justify-between mb-2">
                <span
                  className={cn(
                    'font-bold text-[#1a1a2e] text-base',
                    isSoldOut && 'opacity-40',
                  )}
                >
                  {tier.name}
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'font-black text-[#1a1a2e] text-xl',
                      isSoldOut && 'opacity-40 line-through',
                    )}
                  >
                    {event.isFreeEvent || tier.price === 0
                      ? 'Free'
                      : `$${getTierPrice(tier).toFixed(0)}`}
                  </span>
                </div>
              </div>

              {/* Perk badges + Quantity controls on same row */}
              <div className="flex items-center justify-between">
                {/* Perks */}
                <div className="flex flex-wrap gap-1.5">
                  {perks.map((perk) => (
                    <span
                      key={perk}
                      className="text-[9px] font-bold uppercase tracking-wider bg-[#1a1a2e] text-white px-2 py-0.5 rounded"
                    >
                      {perk}
                    </span>
                  ))}
                </div>

                {/* +/- controls — shown on ALL available tiers */}
                {!isSoldOut && (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={(e) => handleDecrement(tier, e)}
                      disabled={qty <= 0}
                      className="h-8 w-8 rounded-full bg-[#B91C1C] flex items-center justify-center text-white hover:bg-[#9B2020] disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-4 text-center font-black text-[#1a1a2e] text-lg tabular-nums">
                      {qty}
                    </span>
                    <button
                      onClick={(e) => handleIncrement(tier, e)}
                      disabled={qty >= tier.maxPerOrder || qty >= avail}
                      className="h-8 w-8 rounded-full bg-[#B91C1C] flex items-center justify-center text-white hover:bg-[#9B2020] disabled:opacity-30 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Sold % progress */}
              {!isSoldOut && soldPct > 30 && (
                <div className="mt-3">
                  <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B91C1C] rounded-full transition-all"
                      style={{ width: `${soldPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#B91C1C] font-bold mt-1">
                    {soldPct}% SOLD OUT
                  </p>
                </div>
              )}

              {/* Waitlist for sold out */}
              {isSoldOut && event.enableWaitlist && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWaitlist();
                  }}
                  className="mt-2 text-xs font-bold text-[#B91C1C] hover:text-[#8B1A1A] uppercase tracking-wide"
                >
                  Join Waitlist &rarr;
                </button>
              )}

              {/* Tickets left */}
              {!isSoldOut && avail > 0 && avail <= 20 && (
                <p className="text-[10px] font-bold uppercase text-neutral-500 mt-2">
                  {avail} TICKETS LEFT
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 5 — Secure Checkout
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SecureCheckout({
  event,
  selectedTier,
  quantity,
  onPurchase,
  isPurchasing,
}: {
  event: FullEventDetail;
  selectedTier: EventTicketTier | null;
  quantity: number;
  onPurchase: () => void;
  isPurchasing: boolean;
}) {
  if (!selectedTier || quantity <= 0 || getAvailable(selectedTier) <= 0) return null;

  const subtotal = selectedTier.price * quantity;
  const serviceFee = (selectedTier.serviceFee || 0) * quantity;
  const total = getTotalWithTax(selectedTier, quantity);
  const cashbackEstimate = Math.floor(total * 0.25 * 100) / 100;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="font-heading text-base font-black text-[#1a1a2e] uppercase tracking-wide mb-4 flex items-center gap-2">
        <Lock className="h-4 w-4 text-[#8B1A1A]" />
        Secure Checkout
      </h3>

      <div className="flex gap-4 items-start">
        {/* Line items */}
        <div className="flex-1 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">
              {quantity}x {selectedTier.name}
            </span>
            <span className="font-semibold text-[#1a1a2e]">${subtotal.toFixed(2)}</span>
          </div>
          {serviceFee > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-500">Service Fee</span>
              <span className="font-semibold text-[#1a1a2e]">${serviceFee.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Cashback card */}
        {!event.isFreeEvent && total > 0 && (
          <div className="flex-shrink-0 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 max-w-[140px]">
            <p className="text-[8px] font-bold text-[#B91C1C] uppercase tracking-[0.12em]">
              Cashback Rewards
            </p>
            <p className="text-sm font-black text-[#1a1a2e] mt-0.5">
              Earn ${cashbackEstimate.toFixed(2)}
            </p>
            <p className="text-[8px] text-neutral-400 uppercase tracking-wider mt-0.5">
              Instant Reward Points
            </p>
          </div>
        )}
      </div>

      {/* Final total */}
      <div className="flex items-end justify-between mt-4 pt-3 border-t border-neutral-100">
        <span className="text-sm font-bold text-neutral-500">Final Total</span>
        <span className="font-black text-3xl text-[#1a1a2e] tracking-tight">
          {event.isFreeEvent || total === 0 ? 'Free' : `$${total.toFixed(2)}`}
        </span>
      </div>

      {/* Purchase button */}
      <button
        onClick={onPurchase}
        disabled={isPurchasing}
        className="w-full mt-4 h-12 rounded-full bg-[#B91C1C] hover:bg-[#9B2020] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-red-900/20"
      >
        {isPurchasing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            PURCHASE NOW
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {/* SSL notice */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <Lock className="h-3 w-3 text-neutral-300" />
        <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-medium">
          128-bit Encrypted SSL Secure
        </span>
      </div>

      {/* Already purchased notice */}
      {event.isUserAttending && event.userTickets && event.userTickets.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-bold text-blue-700">
            You already have {event.userTickets.length} ticket
            {event.userTickets.length > 1 ? 's' : ''}
          </p>
          <Link
            to={PATHS.MY_TICKETS}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View My Tickets &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 6 — Event Perks
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function EventPerks({ event }: { event: FullEventDetail }) {
  const perks: { name: string; icon: React.ElementType }[] = [];

  event.addOns
    ?.filter((a) => a.isActive)
    .forEach((a) => {
      perks.push({ name: a.name, icon: getPerkIcon(a.name) });
    });

  if (event.isFreeEvent && !perks.some((p) => p.name.toLowerCase().includes('free')))
    perks.push({ name: 'Free Entry', icon: Zap });
  if (event.isVirtualEvent) perks.push({ name: 'Virtual Access', icon: ExternalLink });

  if (perks.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h2 className="font-heading text-sm font-black text-[#8B1A1A] uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        Event Perks
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {perks.map((perk, i) => {
          const Icon = perk.icon;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-2.5 p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-[#B91C1C]/30 hover:bg-red-50/30 transition-colors"
            >
              <div className="h-11 w-11 rounded-full bg-red-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#B91C1C]" />
              </div>
              <span className="text-[10px] font-bold text-neutral-700 text-center uppercase tracking-wider">
                {perk.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 7 — Essential Rules
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function EssentialRules({ event }: { event: FullEventDetail }) {
  const rules: string[] = [];

  if (event.ageVerificationReq && event.minAge)
    rules.push(`${event.minAge}+ Physical ID required. No digital copies.`);
  if (event.requiresApproval)
    rules.push('Registration requires organizer approval.');
  if (event.isPrivate && event.accessCode)
    rules.push('Private event \u2014 access code required.');
  if (event.maxAttendees)
    rules.push(`Venue capacity limited to ${event.maxAttendees} attendees.`);
  rules.push('No professional gear without press pass.');
  if (!event.isFreeEvent)
    rules.push('Tickets are non-refundable after the event starts.');

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h2 className="font-heading text-sm font-black text-[#8B1A1A] uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        Essential Rules
      </h2>
      <ol className="space-y-3">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500">
              {i + 1}
            </span>
            <span className="leading-relaxed">{rule}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 8 — Merchandise  (disabled — backend unsupported)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const PLACEHOLDER_MERCH = [
  {
    name: 'Midnight Oversized Hoodie',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop',
    price: 65,
    oldPrice: 80,
    badge: 'Best Seller',
  },
  {
    name: 'Vanguard Street Cap',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop',
    price: 24,
    oldPrice: 35,
    badge: 'Best Seller',
  },
  {
    name: 'Vanguard Street Cap',
    image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400&h=500&fit=crop',
    price: 24,
    oldPrice: 35,
    badge: 'Best Seller',
  },
];

function MerchandiseSection() {
  return (
    <div className="relative">
      <h2 className="font-heading text-xl font-black text-[#1a1a2e] uppercase tracking-wide mb-4">
        Merchandise
      </h2>

      {/* Disabled overlay */}
      <div className="relative">
        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
          <span className="bg-[#1a1a2e] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
            Coming Soon
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 pointer-events-none opacity-60">
          {PLACEHOLDER_MERCH.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-neutral-200 bg-white"
            >
              {/* Image */}
              <div className="relative h-[180px] overflow-hidden bg-neutral-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {item.badge}
                </span>
                <button className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/30 flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white" />
                </button>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-black text-xs uppercase leading-tight">
                    {item.name}
                  </p>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-[#B91C1C] text-sm">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="text-neutral-400 text-xs line-through">
                    ${item.oldPrice.toFixed(2)}
                  </span>
                </div>
                <button className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#1a1a2e] text-white text-[10px] font-bold uppercase tracking-wider">
                  <Plus className="h-3 w-3" />
                  Add to Basket
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 9 — Tab Navigation
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function TabNavigation({
  activeTab,
  setActiveTab,
}: {
  activeTab: 'details' | 'merchandise' | 'similar' | 'merchants';
  setActiveTab: (tab: 'details' | 'merchandise' | 'similar' | 'merchants') => void;
}) {
  const tabs = [
    { id: 'details' as const, label: 'EVENT DETAILS' },
    { id: 'merchandise' as const, label: 'MERCHANDISE' },
    { id: 'similar' as const, label: 'SIMILAR EVENTS' },
    { id: 'merchants' as const, label: 'MERCHANTS' },
  ];

  return (
    <div className="rounded-full bg-neutral-100 p-1 flex overflow-x-auto scrollbar-hide border border-neutral-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-all',
            activeTab === tab.id
              ? 'bg-[#1a1a2e] text-white shadow-md'
              : 'text-neutral-500 hover:text-neutral-700',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 10 — Merchants Tab (Upcoming Shows + Deals)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function MerchantsTab({ event }: { event: FullEventDetail }) {
  const { data: upcomingEvents, isLoading: eventsLoading } = useBrowseEvents({
    sortBy: 'startDate',
    sortOrder: 'asc',
    limit: 6,
  });

  const { data: nearbyDeals, isLoading: dealsLoading } = useDealsByCategory({
    latitude: event.latitude || undefined,
    longitude: event.longitude || undefined,
    radius: 5,
    limit: 8,
  });

  return (
    <div className="space-y-8">
      {/* Upcoming Shows Section */}
      <div>
        <h2 className="font-heading text-xl sm:text-2xl font-black text-[#1a1a2e] uppercase tracking-wide mb-5">
          Upcoming Shows
        </h2>
        {eventsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[364px] rounded-2xl bg-neutral-100 animate-pulse"
              />
            ))}
          </div>
        ) : upcomingEvents && upcomingEvents.events && upcomingEvents.events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.events.map((evt) => (
              <EventCard key={evt.id} event={evt} width={204.75} height={364} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-neutral-200">
            <Calendar className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No upcoming shows at this time.</p>
          </div>
        )}
      </div>

      {/* Deals Near This Event Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl sm:text-2xl font-black text-[#1a1a2e] uppercase tracking-wide">
            Deals Near This Event
          </h2>
          <Link
            to={PATHS.ALL_DEALS}
            className="text-xs font-bold text-[#B91C1C] hover:text-[#8B1A1A] flex items-center gap-1 tracking-wider"
          >
            Browse All Near Venue
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {dealsLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[280px] sm:w-[300px] h-[420px] rounded-2xl bg-neutral-100 animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        ) : nearbyDeals && nearbyDeals.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
            {nearbyDeals.slice(0, 8).map((deal) => (
              <div key={deal.id} className="w-[280px] flex-shrink-0 sm:w-[300px]">
                <NewDealCard deal={deal} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-neutral-200">
            <MapPin className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">
              Discover deals near{' '}
              <span className="font-bold text-[#1a1a2e]">
                {event.venueName || 'the venue'}
              </span>
            </p>
            <Link
              to={PATHS.ALL_DEALS}
              className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-[#1a1a2e] hover:bg-[#252548] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Browse Nearby Deals
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 11 — Similar Events Tab
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function SimilarEventsTab({ event }: { event: FullEventDetail }) {
  const { data: similarEvents, isLoading } = useBrowseEvents({
    sortBy: 'startDate',
    sortOrder: 'asc',
    eventType: event.eventType || undefined,
    limit: 6,
  });

  return (
    <div>
      <h2 className="font-heading text-xl sm:text-2xl font-black text-[#1a1a2e] uppercase tracking-wide mb-5">
        Similar Events
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[364px] rounded-2xl bg-neutral-100 animate-pulse"
            />
          ))}
        </div>
      ) : similarEvents && similarEvents.events && similarEvents.events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {similarEvents.events
            .filter((evt) => evt.id !== event.id)
            .slice(0, 6)
            .map((evt) => (
              <EventCard key={evt.id} event={evt} width={204.75} height={364} />
            ))}
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-neutral-200">
          <Calendar className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">No similar events found.</p>
        </div>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 13 — About the Event / Venue
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function AboutVenue({ event }: { event: FullEventDetail }) {
  return (
    <div className="bg-neutral-50 rounded-2xl p-6">
      <h2 className="font-heading text-lg font-black text-[#1a1a2e] mb-3 uppercase tracking-wide">
        About the Event
      </h2>
      <p className="text-sm text-neutral-600 leading-relaxed mb-5 whitespace-pre-line">
        {event.description}
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-neutral-700">
            <Calendar className="h-4 w-4 text-[#8B1A1A]" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-neutral-700">
            <Clock className="h-4 w-4 text-[#8B1A1A]" />
            <span>
              {formatTime(event.startDate)} &ndash; {formatTime(event.endDate)}
            </span>
          </div>
          {event.venueName && (
            <div className="flex items-center gap-2.5 text-sm text-neutral-700">
              <MapPin className="h-4 w-4 text-[#8B1A1A]" />
              <span>{event.venueName}</span>
            </div>
          )}
          {event.venueAddress && (
            <p className="text-xs text-neutral-500 ml-7">{event.venueAddress}</p>
          )}
          {event.city && (
            <p className="text-xs text-neutral-500 ml-7">
              {event.city.name}, {event.city.state}
            </p>
          )}
          {event.maxAttendees && (
            <div className="flex items-center gap-2.5 text-sm text-neutral-700">
              <Users className="h-4 w-4 text-[#8B1A1A]" />
              <span>
                {event.currentAttendees} / {event.maxAttendees} attendees
              </span>
            </div>
          )}
          {event.isVirtualEvent && event.virtualEventUrl && (
            <a
              href={event.virtualEventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm text-[#B91C1C] hover:text-[#8B1A1A] font-semibold"
            >
              <ExternalLink className="h-4 w-4" />
              Join Virtual Event
            </a>
          )}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {event.isMultiDay && (
            <p className="text-xs text-neutral-500 italic">Multi-day event</p>
          )}
          {event.timezone && (
            <p className="text-[10px] text-neutral-400">Timezone: {event.timezone}</p>
          )}
        </div>

        <div className="w-full h-40 rounded-xl bg-neutral-200 overflow-hidden">
          {event.latitude && event.longitude ? (
            <img
              src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+B91C1C(${event.longitude},${event.latitude})/${event.longitude},${event.latitude},14,0/400x200@2x?access_token=${import.meta.env.VITE_MAPBOX_TOKEN || 'placeholder'}`}
              alt="Venue map"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-8 w-8 text-neutral-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 14 — Explore Section
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ExploreSection() {
  return (
    <div className="text-center py-8 border-t border-neutral-100">
      <h2 className="font-heading text-2xl font-black text-[#1a1a2e] mb-3">Explore</h2>
      <p className="text-sm text-neutral-500 mb-5 max-w-md mx-auto">
        Discover more events, deals, and experiences near you.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to={PATHS.DISCOVER_EVENTS}
          className="px-5 py-2.5 bg-[#B91C1C] hover:bg-[#9B2020] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors active:scale-[0.98]"
        >
          More Events
        </Link>
        <Link
          to={PATHS.ALL_DEALS}
          className="px-5 py-2.5 bg-[#1a1a2e] hover:bg-[#252548] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
        >
          Browse Deals
        </Link>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SECTION 15 — Purchase Success Modal
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function PurchaseSuccessModal({
  isOpen,
  tickets,
  onClose,
}: {
  isOpen: boolean;
  tickets: { ticketNumber: string }[];
  onClose: () => void;
}) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[70] p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-heading text-2xl font-black text-[#1a1a2e] mb-2">
                Tickets Confirmed!
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                {tickets.length} ticket{tickets.length > 1 ? 's' : ''} purchased
                successfully.
              </p>
              <div className="space-y-2 mb-6">
                {tickets.map((t) => (
                  <div
                    key={t.ticketNumber}
                    className="flex items-center gap-2 rounded-lg bg-neutral-50 px-4 py-2 text-sm"
                  >
                    <Ticket className="h-4 w-4 text-[#B91C1C]" />
                    <span className="font-mono text-neutral-700">{t.ticketNumber}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate(PATHS.MY_TICKETS);
                }}
                className="w-full h-11 rounded-xl bg-[#B91C1C] text-white font-bold hover:bg-[#9B2020] transition-colors"
              >
                View My Tickets
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useModal();
  const { toast } = useToast();

  const numericId = eventId ? parseInt(eventId) : undefined;
  const { data: event, isLoading, error } = useEventDetail(numericId);

  const purchaseMutation = usePurchaseTickets(numericId || 0);
  const waitlistMutation = useJoinWaitlist(numericId || 0);

  // Per-tier quantity tracking (Figma shows +/- on every tier)
  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState<{ ticketNumber: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'merchandise' | 'similar' | 'merchants'>('details');

  const selectedTier =
    event?.ticketTiers.find((t) => t.id === selectedTierId) ?? null;
  const selectedQty = selectedTierId ? quantities[selectedTierId] || 0 : 0;

  const handlePurchase = useCallback(() => {
    if (!user) {
      openModal();
      return;
    }
    if (!selectedTier || selectedQty <= 0) return;

    if (event?.isFreeEvent || selectedTier.price === 0) {
      purchaseMutation.mutate(
        { ticketTierId: selectedTier.id, quantity: selectedQty },
        {
          onSuccess: (data) => {
            setPurchasedTickets(
              data.tickets.map((t) => ({ ticketNumber: t.ticketNumber })),
            );
            setShowSuccess(true);
            toast({
              title: 'Tickets confirmed!',
              description: `${data.tickets.length} ticket(s) secured.`,
            });
          },
          onError: (err: Error) => {
            toast({
              title: 'Purchase failed',
              description: err.message,
              variant: 'destructive',
            });
          },
        },
      );
    } else {
      toast({
        title: 'Payment required',
        description:
          'Payment gateway integration coming soon. Free events work now!',
      });
    }
  }, [user, selectedTier, selectedQty, event, openModal, purchaseMutation, toast]);

  const handleWaitlist = () => {
    if (!user) {
      openModal();
      return;
    }
    waitlistMutation.mutate(
      {},
      {
        onSuccess: (data) =>
          toast({ title: 'Waitlist joined!', description: data.message }),
        onError: (err: Error) =>
          toast({
            title: 'Could not join waitlist',
            description: err.message,
            variant: 'destructive',
          }),
      },
    );
  };

  /* ─── Loading ──────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#B91C1C]" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-white">
        <AlertCircle className="h-12 w-12 text-neutral-300" />
        <h2 className="font-heading text-xl font-black text-[#1a1a2e]">
          Event not found
        </h2>
        <p className="text-sm text-neutral-500 text-center max-w-sm">
          {error?.message ||
            'This event may have been removed or is no longer available.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 h-10 px-6 rounded-full bg-[#B91C1C] text-white text-sm font-bold hover:bg-[#9B2020] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const fullEvent = event as FullEventDetail;

  /* ─── Render ───────────────────────────────────────────────── */

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-6">
          {/* ════ Two-column Figma layout (5 / 7 split) ════ */}
          <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 items-start">
            {/* ── LEFT: Hero + Perks + Rules ── */}
            <div className="space-y-5">
              <HeroSlideshow event={fullEvent} />
              <EventPerks event={fullEvent} />
              <EssentialRules event={fullEvent} />
            </div>

            {/* ── RIGHT: Earn + Tabs + Content ── */}
            <div className="space-y-5">
              <EarnBanner event={fullEvent} />
              
              {/* Tab Navigation */}
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              
              {/* Tab Content */}
              <div>
                {activeTab === 'details' && (
                  <div className="space-y-5">
                    <LineupSection event={fullEvent} />
                    <SelectTickets
                      event={fullEvent}
                      selectedTierId={selectedTierId}
                      setSelectedTierId={setSelectedTierId}
                      quantities={quantities}
                      setQuantities={setQuantities}
                      onWaitlist={handleWaitlist}
                    />
                    <SecureCheckout
                      event={fullEvent}
                      selectedTier={selectedTier}
                      quantity={selectedQty}
                      onPurchase={handlePurchase}
                      isPurchasing={purchaseMutation.isPending}
                    />
                  </div>
                )}
                
                {activeTab === 'merchandise' && <MerchandiseSection />}
                
                {activeTab === 'similar' && <SimilarEventsTab event={fullEvent} />}
                
                {activeTab === 'merchants' && <MerchantsTab event={fullEvent} />}
              </div>
            </div>
          </div>

          {/* ════ Full-width sections below the grid ════ */}
          <div className="mt-10 space-y-10">
            <AboutVenue event={fullEvent} />
            <ExploreSection />
          </div>
        </div>
      </div>

      <PurchaseSuccessModal
        isOpen={showSuccess}
        tickets={purchasedTickets}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}

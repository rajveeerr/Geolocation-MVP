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
  DollarSign,
  ShieldCheck,
  Gift,
  ExternalLink,
  Sparkles,
  Star,
  ParkingCircle,
  Wine,
  Zap,
  Camera,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEventDetail, usePurchaseTickets, useJoinWaitlist } from '@/hooks/useEventDetail';
import type { EventTicketTier, EventDetail, EventAddOn } from '@/hooks/useEventDetail';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

// ─── Extended types (backend auth-dependent fields) ──

interface FullEventDetail extends EventDetail {
  userTickets?: { id: number; ticketNumber: string; status: string; purchasePrice: number }[] | null;
}

// ─── Helpers ──────────────────────────────────────────────────────

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
  return Math.round(((tier.soldQuantity + tier.reservedQuantity) / tier.totalQuantity) * 100);
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

// ─── Perk icon mapping ──────────────────────────────────────────

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 1: Hero Image Slideshow
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function HeroSlideshow({ event }: { event: FullEventDetail }) {
  const allMedia: { url: string; isVideo: boolean }[] = [];

  if (event.coverImageUrl) allMedia.push({ url: event.coverImageUrl, isVideo: false });
  if (event.videoUrl) allMedia.push({ url: event.videoUrl, isVideo: true });
  event.imageGallery?.forEach((img) => allMedia.push({ url: img, isVideo: false }));

  const [current, setCurrent] = useState(0);
  const total = allMedia.length || 1;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const media = allMedia[current];

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[480px] rounded-2xl overflow-hidden bg-neutral-900 group">
      {media ? (
        media.isVideo ? (
          <div className="w-full h-full relative">
            <img
              src={event.coverImageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button className="h-16 w-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors">
                <Play className="h-7 w-7 text-neutral-900 ml-1" />
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
        )
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
          <Ticket className="h-16 w-16 text-neutral-600" />
        </div>
      )}

      {/* Verified Venue badge */}
      {event.merchant && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">
          <ShieldCheck className="h-3.5 w-3.5" />
          VERIFIED VENUE
        </div>
      )}

      {/* Favourite button */}
      <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors">
        <Heart className="h-4 w-4" />
      </button>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-medium">
            {current + 1} / {total}
          </div>
        </>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 2: Referral / Earn Banner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-5 sm:p-6">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(185,28,28,0.4),transparent_60%)]" />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Opens {formatTime(event.startDate)}
            </span>
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Live Offer
            </span>
          </div>
          <h3 className="text-white text-xl sm:text-2xl font-extrabold">
            EARN <span className="text-red-400">$18</span> / FRIEND
          </h3>
          <p className="text-white/60 text-sm mt-1">
            Boost your nightlife bank. Invite 5 friends for an instant{' '}
            <span className="text-white font-semibold">$90 bonus</span>
          </p>
          <Link
            to={PATHS.REFERRALS}
            className="inline-flex items-center gap-2 mt-3 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            CHECK IN NOW
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <p className="text-xs text-white/50 uppercase tracking-wider font-medium">Earned by</p>
            <p className="text-2xl font-extrabold text-white">{event.socialProofCount || 0}+</p>
          </div>
          {isUpcoming && (
            <div className="text-center px-4 py-3 bg-red-600/20 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-300 uppercase tracking-wider font-medium">Starts in</p>
              <p className="text-2xl font-extrabold text-white font-mono">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}
              </p>
            </div>
          )}
        </div>
      </div>

      {event.currentAttendees > 0 && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <div className="flex -space-x-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 w-7 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 border-2 border-neutral-800 flex items-center justify-center text-[10px] text-white font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-xs text-white/50">
            +{event.currentAttendees} people attending
          </span>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 3: The Lineup
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function LineupSection({ event }: { event: FullEventDetail }) {
  const performers: { name: string; role: string; avatar?: string }[] = [];

  if (event.organizer?.name) {
    performers.push({ name: event.organizer.name, role: 'Host' });
  }
  if (event.merchant?.businessName) {
    performers.push({
      name: event.merchant.businessName,
      role: 'Venue',
      avatar: event.merchant.logoUrl || undefined,
    });
  }
  event.tags?.slice(0, 4).forEach((tag) => {
    performers.push({ name: tag, role: 'Featured' });
  });

  if (performers.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h2 className="font-heading text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-red-600 rounded-full" />
        THE LINEUP
      </h2>
      <div className="flex items-start gap-6 overflow-x-auto scrollbar-hide pb-2">
        {performers.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[80px]">
            <div className="relative">
              <div className="h-[72px] w-[72px] rounded-full overflow-hidden border-[3px] border-red-600 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-neutral-500">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {p.role === 'Host' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                  Host
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-neutral-900 truncate max-w-[90px]">{p.name}</p>
              <p className="text-[10px] text-neutral-500">{p.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 4: Select Tickets
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SelectTickets({
  event,
  selectedTierId,
  setSelectedTierId,
  quantity,
  setQuantity,
  onWaitlist,
}: {
  event: FullEventDetail;
  selectedTierId: number | null;
  setSelectedTierId: (id: number | null) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  onWaitlist: () => void;
}) {
  const activeTiers = event.ticketTiers.filter((t) => t.isActive);

  useEffect(() => {
    const first = activeTiers.find((t) => getAvailable(t) > 0);
    if (first && selectedTierId === null) setSelectedTierId(first.id);
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

    (event as FullEventDetail).addOns
      ?.filter((a) => a.isActive && a.price === 0 && !a.isOptional)
      .forEach((a) => {
        if (!perks.includes(a.name.toUpperCase())) perks.push(a.name.toUpperCase());
      });

    return perks.slice(0, 3);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h2 className="font-heading text-lg font-bold text-neutral-900 mb-4">SELECT TICKETS</h2>

      <div className="space-y-3">
        {activeTiers.map((tier) => {
          const avail = getAvailable(tier);
          const isSoldOut = avail <= 0;
          const isSelected = selectedTierId === tier.id;
          const soldPct = getSoldPercent(tier);
          const perks = getPerksForTier(tier);

          return (
            <div
              key={tier.id}
              onClick={() => {
                if (!isSoldOut) {
                  setSelectedTierId(tier.id);
                  setQuantity(1);
                }
              }}
              className={cn(
                'rounded-xl border-2 p-4 cursor-pointer transition-all duration-200',
                isSelected
                  ? 'border-neutral-900 bg-neutral-50'
                  : isSoldOut
                    ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-default'
                    : 'border-neutral-200 hover:border-neutral-400',
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-900">{tier.name}</span>
                  {isSoldOut && (
                    <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded">
                      SOLD OUT
                    </span>
                  )}
                </div>
                <span className="font-bold text-neutral-900 text-lg">
                  {event.isFreeEvent || tier.price === 0
                    ? 'Free'
                    : `$${getTierPrice(tier).toFixed(0)}`}
                </span>
              </div>

              {perks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {perks.map((perk) => (
                    <span
                      key={perk}
                      className="text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5 rounded"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              )}

              {isSelected && !isSoldOut && (
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity(Math.max(tier.minPerOrder, quantity - 1));
                      }}
                      disabled={quantity <= tier.minPerOrder}
                      className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-300 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-neutral-900">{quantity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity(Math.min(tier.maxPerOrder, avail, quantity + 1));
                      }}
                      disabled={quantity >= tier.maxPerOrder || quantity >= avail}
                      className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-300 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {!isSoldOut && soldPct > 30 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${soldPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-red-600 font-bold mt-1">{soldPct}% SOLD OUT</p>
                </div>
              )}

              {isSoldOut && event.enableWaitlist && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWaitlist();
                  }}
                  className="mt-2 text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wide"
                >
                  Join Waitlist →
                </button>
              )}

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 5: Secure Checkout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  if (!selectedTier || getAvailable(selectedTier) <= 0) return null;

  const subtotal = selectedTier.price * quantity;
  const serviceFee = (selectedTier.serviceFee || 0) * quantity;
  const total = getTotalWithTax(selectedTier, quantity);
  const cashbackEstimate = Math.floor(total * 0.25);

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 sticky top-24">
      <h3 className="font-heading text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        SECURE CHECKOUT
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">
            {quantity}x {selectedTier.name}
          </span>
          <span className="text-neutral-900">${subtotal.toFixed(2)}</span>
        </div>
        {serviceFee > 0 && (
          <div className="flex justify-between">
            <span className="text-neutral-600">Service Fee</span>
            <span className="text-neutral-900">${serviceFee.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-neutral-200 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-bold text-neutral-900">Final Total</span>
            <span className="font-extrabold text-2xl text-neutral-900">
              {event.isFreeEvent ? 'Free' : `$${total.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {!event.isFreeEvent && total > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
          <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
              Cashback Rewards
            </p>
            <p className="text-sm font-bold text-neutral-900">Earn ${cashbackEstimate.toFixed(2)}</p>
            <p className="text-[10px] text-neutral-500">ADDED TO BALANCE ON DEAL CHECKIN</p>
          </div>
        </div>
      )}

      <button
        onClick={onPurchase}
        disabled={isPurchasing}
        className="w-full mt-4 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
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
            View My Tickets →
          </Link>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 6: Event Perks (from AddOns)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
      <h2 className="font-heading text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        EVENT PERKS
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {perks.map((perk, i) => {
          const Icon = perk.icon;
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-4 bg-neutral-50 rounded-xl border border-neutral-100"
            >
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xs font-bold text-neutral-700 text-center uppercase tracking-wide">
                {perk.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 7: Essential Rules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function EssentialRules({ event }: { event: FullEventDetail }) {
  const rules: string[] = [];

  if (event.ageVerificationReq && event.minAge) {
    rules.push(`${event.minAge}+ Physical ID required. No digital copies.`);
  }
  if (event.requiresApproval) {
    rules.push('Registration requires organizer approval.');
  }
  if (event.isPrivate && event.accessCode) {
    rules.push('Private event — access code required.');
  }
  if (event.maxAttendees) {
    rules.push(`Venue capacity limited to ${event.maxAttendees} attendees.`);
  }
  rules.push('No professional gear without press pass.');
  if (!event.isFreeEvent) {
    rules.push('Tickets are non-refundable after the event starts.');
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h2 className="font-heading text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        ESSENTIAL RULES
      </h2>
      <ol className="space-y-3">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500">
              {i + 1}
            </span>
            <span>{rule}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 8: Deals Near This Event
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function DealsNearEvent({ event }: { event: FullEventDetail }) {
  if (!event.latitude || !event.longitude) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-neutral-900">DEALS NEAR THIS EVENT</h2>
        <Link
          to={PATHS.ALL_DEALS}
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          Browse All Near Venue
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-neutral-200">
        <MapPin className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
        <p className="text-sm text-neutral-500">
          Discover deals near{' '}
          <span className="font-semibold text-neutral-700">{event.venueName || 'the venue'}</span>
        </p>
        <Link
          to={PATHS.ALL_DEALS}
          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          Browse Nearby Deals
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 9: About the Venue
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function AboutVenue({ event }: { event: FullEventDetail }) {
  return (
    <div className="bg-neutral-50 rounded-2xl p-6">
      <h2 className="font-heading text-lg font-bold text-neutral-900 mb-3">About the Event</h2>
      <p className="text-sm text-neutral-600 leading-relaxed mb-5 whitespace-pre-line">
        {event.description}
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Calendar className="h-4 w-4 text-red-600" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-700">
            <Clock className="h-4 w-4 text-red-600" />
            <span>
              {formatTime(event.startDate)} – {formatTime(event.endDate)}
            </span>
          </div>
          {event.venueName && (
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <MapPin className="h-4 w-4 text-red-600" />
              <span>{event.venueName}</span>
            </div>
          )}
          {event.venueAddress && (
            <p className="text-xs text-neutral-500 ml-6">{event.venueAddress}</p>
          )}
          {event.maxAttendees && (
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Users className="h-4 w-4 text-red-600" />
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
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Join Virtual Event
            </a>
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 10: Purchase Success Modal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
              <h3 className="font-heading text-2xl font-bold text-neutral-900 mb-2">
                Tickets Confirmed!
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                {tickets.length} ticket{tickets.length > 1 ? 's' : ''} purchased successfully.
              </p>
              <div className="space-y-2 mb-6">
                {tickets.map((t) => (
                  <div
                    key={t.ticketNumber}
                    className="flex items-center gap-2 rounded-lg bg-neutral-50 px-4 py-2 text-sm"
                  >
                    <Ticket className="h-4 w-4 text-red-600" />
                    <span className="font-mono text-neutral-700">{t.ticketNumber}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate(PATHS.MY_TICKETS);
                }}
                className="w-full h-11 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

  const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState<{ ticketNumber: string }[]>([]);

  const selectedTier = event?.ticketTiers.find((t) => t.id === selectedTierId) ?? null;

  const handlePurchase = useCallback(() => {
    if (!user) {
      openModal();
      return;
    }
    if (!selectedTier) return;

    if (event?.isFreeEvent || selectedTier.price === 0) {
      purchaseMutation.mutate(
        { ticketTierId: selectedTier.id, quantity },
        {
          onSuccess: (data) => {
            setPurchasedTickets(data.tickets.map((t) => ({ ticketNumber: t.ticketNumber })));
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
        description: 'Payment gateway integration coming soon. Free events work now!',
      });
    }
  }, [user, selectedTier, quantity, event, openModal, purchaseMutation, toast]);

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

  // ─── Loading ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-white">
        <AlertCircle className="h-12 w-12 text-neutral-400" />
        <h2 className="font-heading text-xl font-bold text-neutral-800">Event not found</h2>
        <p className="text-sm text-neutral-500 text-center max-w-sm">
          {error?.message || 'This event may have been removed or is no longer available.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 h-10 px-6 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const fullEvent = event as FullEventDetail;

  // ─── Render ───────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {/* Event title + meta */}
          <div className="mb-5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-sm text-neutral-500">{formatDate(event.startDate)}</span>
              <span className="text-neutral-300">|</span>
              <span className="text-sm text-neutral-500">
                {formatTime(event.startDate)} – {formatTime(event.endDate)}
              </span>
              {event.venueName && (
                <>
                  <span className="text-neutral-300">|</span>
                  <span className="text-sm text-neutral-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.venueName}
                  </span>
                </>
              )}
              {event.isSoldOut && (
                <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                  SOLD OUT
                </span>
              )}
            </div>
          </div>

          {/* ════ Two-column layout (desktop) ════ */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            {/* ── LEFT COLUMN ── */}
            <div className="space-y-5">
              <HeroSlideshow event={fullEvent} />
              <SelectTickets
                event={fullEvent}
                selectedTierId={selectedTierId}
                setSelectedTierId={setSelectedTierId}
                quantity={quantity}
                setQuantity={setQuantity}
                onWaitlist={handleWaitlist}
              />
              <EventPerks event={fullEvent} />
              <EssentialRules event={fullEvent} />
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-5">
              <EarnBanner event={fullEvent} />
              <LineupSection event={fullEvent} />
              <SecureCheckout
                event={fullEvent}
                selectedTier={selectedTier}
                quantity={quantity}
                onPurchase={handlePurchase}
                isPurchasing={purchaseMutation.isPending}
              />
            </div>
          </div>

          {/* ════ Full-width sections below ════ */}
          <div className="mt-8 space-y-8">
            <DealsNearEvent event={fullEvent} />
            <AboutVenue event={fullEvent} />
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

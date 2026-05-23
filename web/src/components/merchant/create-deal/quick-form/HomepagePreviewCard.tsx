// src/components/merchant/create-deal/quick-form/HomepagePreviewCard.tsx
import { useMemo } from 'react';
import { MapPin, ChevronDown, Heart, Share2, UtensilsCrossed, Send } from 'lucide-react';
import { useDealCreation, type DealCreationState } from '@/context/DealCreationContext';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80';

interface PreviewMeta {
  badge: string; // category / deal-type tag shown on the top-left pill
  cta: string;
  accent: 'red' | 'amber' | 'purple' | 'emerald' | 'sky';
}

const dealTypeMeta = (state: DealCreationState): PreviewMeta => {
  switch (state.dealType) {
    case 'HAPPY_HOUR':
      return { badge: 'HAPPY HOUR', cta: "I'll be there", accent: 'amber' };
    case 'BOUNTY':
      return { badge: 'BOUNTY', cta: 'Bring friends', accent: 'emerald' };
    case 'HIDDEN':
      return { badge: 'SECRET', cta: 'Unlock', accent: 'purple' };
    case 'REDEEM_NOW':
      return { badge: 'REDEEM NOW', cta: 'Grab it', accent: 'red' };
    case 'RECURRING':
      return { badge: 'DAILY DEAL', cta: "I'll bite", accent: 'sky' };
    case 'BOGO':
      return { badge: 'BOGO', cta: "I'll bite", accent: 'amber' };
    default:
      return { badge: 'DEAL', cta: "I'll bite", accent: 'red' };
  }
};

const ACCENT_STYLE: Record<PreviewMeta['accent'], { pill: string; cashBadge: string }> = {
  red: { pill: 'bg-brand/90 border-brand/70', cashBadge: 'bg-brand text-white' },
  amber: { pill: 'bg-amber-500/90 border-amber-400/70', cashBadge: 'bg-amber-500 text-white' },
  purple: { pill: 'bg-violet-600/90 border-violet-500/70', cashBadge: 'bg-violet-600 text-white' },
  emerald: { pill: 'bg-emerald-600/90 border-emerald-500/70', cashBadge: 'bg-emerald-600 text-white' },
  sky: { pill: 'bg-sky-600/90 border-sky-500/70', cashBadge: 'bg-sky-600 text-white' },
};

const formatTimeWindow = (state: DealCreationState): string => {
  if (state.dealType === 'RECURRING' && state.recurringDays?.length) {
    const short: Record<string, string> = {
      MONDAY: 'Mon',
      TUESDAY: 'Tue',
      WEDNESDAY: 'Wed',
      THURSDAY: 'Thu',
      FRIDAY: 'Fri',
      SATURDAY: 'Sat',
      SUNDAY: 'Sun',
    };
    return state.recurringDays.map((d) => short[d] ?? d).join(' · ');
  }
  if (state.endTime || state.activeEndDate) {
    const end = new Date(state.endTime || state.activeEndDate);
    if (Number.isNaN(end.getTime())) return 'Today';
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs < 0) return 'Ended';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  }
  return 'Live now';
};

const formatPriceTag = (state: DealCreationState): string => {
  if (state.dealType === 'BOUNTY' && state.bountyRewardAmount) {
    return `$${state.bountyRewardAmount.toFixed(0)}`;
  }
  if (state.discountPercentage) return `${state.discountPercentage}% OFF`;
  if (state.discountAmount) return `$${state.discountAmount.toFixed(0)} OFF`;
  return 'Up to 20%';
};

const cashBadgeContent = (state: DealCreationState): string | null => {
  if (state.dealType === 'BOUNTY' && state.bountyRewardAmount) {
    return `+$${state.bountyRewardAmount.toFixed(0)}`;
  }
  if (state.discountAmount && state.discountAmount > 0) {
    return `Up to $${state.discountAmount.toFixed(0)}`;
  }
  return null;
};

interface HomepagePreviewCardProps {
  /** Hides surrounding chrome and renders just the card (useful inline). */
  bare?: boolean;
}

/**
 * Static preview card that mirrors the customer-facing NewDealCard
 * (tall portrait, dark background, top capsule pills, action icons, CTA bar).
 * Reads live form state — image, title, merchant, discount, timing — so the
 * merchant sees the actual deal as customers will see it on the homepage.
 */
export const HomepagePreviewCard = ({ bare = false }: HomepagePreviewCardProps) => {
  const { state } = useDealCreation();
  const { data: merchantData } = useMerchantStatus();
  const merchantName = merchantData?.data?.merchant?.businessName ?? 'Your business';
  const merchantCity = merchantData?.data?.merchant?.city ?? 'Nearby';

  const meta = useMemo(() => dealTypeMeta(state), [state]);
  const priceTag = useMemo(() => formatPriceTag(state), [state]);
  const timeWindow = useMemo(() => formatTimeWindow(state), [state]);
  const cashBadge = useMemo(() => cashBadgeContent(state), [state]);
  const image = state.imageUrls?.[0] || FALLBACK_IMAGE;
  const title = state.title || 'Your deal title';
  const accent = ACCENT_STYLE[meta.accent];

  const card = (
    <div className="flex w-full flex-col">
      <div
        className="relative w-full overflow-hidden rounded-[1.25rem] border border-white/10 shadow-lg"
        style={{ background: '#1a1a2e' }}
      >
        <div className="relative aspect-[3/4.5] overflow-hidden">
          <img src={image} alt={title} className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />

          {/* Top capsule */}
          <div className="absolute left-3 right-3 top-3 z-10 flex items-center justify-between gap-2">
            <div
              className={cn(
                'inline-flex h-8 items-center justify-center rounded-full border border-[#5a2a2a]/60 bg-[#453030] px-3',
              )}
            >
              <span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-white">
                {meta.badge}
              </span>
            </div>
            <div
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full border pl-3 pr-2',
                accent.pill,
              )}
            >
              <span className="text-[13px] font-bold text-white">{priceTag}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white" />
            </div>
          </div>

          {/* Bottom content overlay */}
          <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-3.5">
            <h3 className="line-clamp-2 text-[17px] font-bold leading-tight tracking-tight text-white">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-white/80">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {merchantName} · {merchantCity}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold',
                  state.endTime || state.activeEndDate
                    ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30'
                    : 'bg-card/10 dark:bg-card text-white/80 ring-1 ring-white/20',
                )}
              >
                <span
                  className={cn(
                    'inline-block h-1.5 w-1.5 rounded-full',
                    state.endTime ? 'bg-emerald-400' : 'bg-card/70 dark:bg-card',
                  )}
                />
                {timeWindow}
              </div>
              <div className="flex items-center gap-1">
                <ActionIcon>
                  <Share2 className="h-3.5 w-3.5" />
                </ActionIcon>
                <ActionIcon>
                  <Heart className="h-3.5 w-3.5" />
                </ActionIcon>
                <ActionIcon>
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                </ActionIcon>
                <ActionIcon>
                  <Send className="h-3.5 w-3.5" />
                </ActionIcon>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA bar */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          tabIndex={-1}
          className="flex h-11 flex-1 items-center justify-between gap-3 rounded-full bg-foreground px-5 text-background"
        >
          <span className="text-[13px] font-semibold tracking-tight">{meta.cta}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-foreground">
            <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
          </span>
        </button>
        {cashBadge ? (
          <div
            className={cn(
              'flex h-11 items-center justify-center rounded-full px-3 text-[11px] font-bold',
              accent.cashBadge,
            )}
          >
            {cashBadge}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (bare) return card;

  return (
    <div className="rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Preview — how it appears on the homepage
        </div>
        <div className="text-[11px] text-muted-foreground">live tile</div>
      </div>
      <div className="mx-auto max-w-[260px]">{card}</div>
    </div>
  );
};

const ActionIcon = ({ children }: { children: React.ReactNode }) => (
  <span
    className="flex h-7 w-7 items-center justify-center rounded-full bg-card/15 dark:bg-card text-white backdrop-blur-sm"
    aria-hidden
  >
    {children}
  </span>
);

export default HomepagePreviewCard;

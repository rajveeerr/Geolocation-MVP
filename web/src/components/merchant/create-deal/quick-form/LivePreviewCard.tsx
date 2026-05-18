// src/components/merchant/create-deal/quick-form/LivePreviewCard.tsx
import { Clock, MapPin, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivePreviewCardProps {
  title: string;
  merchantName?: string;
  offerLine: string;
  checkInRewardLabel?: string;
  timingLabel?: string;
  maxRedemptionsLabel?: string;
  isLive?: boolean;
  className?: string;
}

/**
 * Live preview card matching the customer-facing deal card vibe.
 * Mirrors the "Preview — how it appears to customers" card from the mockup.
 */
export const LivePreviewCard = ({
  title,
  merchantName,
  offerLine,
  checkInRewardLabel,
  timingLabel,
  maxRedemptionsLabel,
  isLive = false,
  className,
}: LivePreviewCardProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)]',
        className,
      )}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
        Preview — how it appears to customers
      </div>

      <div className="mt-3 rounded-[1.3rem] bg-neutral-900 p-5 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[17px] font-semibold tracking-tight">
              {title || 'Your deal title'}
            </h3>
            <div className="mt-0.5 text-[12px] text-white/70">
              {merchantName ? `${merchantName} · ` : ''}
              {offerLine || 'Offer details'}
            </div>
          </div>
          {isLive ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          ) : null}
        </div>

        {checkInRewardLabel ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white">
            <Sparkles className="h-3 w-3" />
            {checkInRewardLabel}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/80">
          {timingLabel ? (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-white/60" />
              <span className="truncate">{timingLabel}</span>
            </div>
          ) : null}
          {maxRedemptionsLabel ? (
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-white/60" />
              <span className="truncate">{maxRedemptionsLabel}</span>
            </div>
          ) : null}
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-white/60" />
              <span className="truncate">Live now</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

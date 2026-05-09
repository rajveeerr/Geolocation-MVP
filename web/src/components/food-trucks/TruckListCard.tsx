import { motion } from 'framer-motion';
import { Clock, MapPin, Navigation } from 'lucide-react';
import { TruckBadge } from '@/components/common/TruckBadge';
import { cn } from '@/lib/utils';
import type { TruckSummary } from '@/types/truckSchedule';

interface TruckListCardProps {
  truck: TruckSummary;
  onClick?: (truck: TruckSummary) => void;
  onHover?: (storeId: number | null) => void;
  isHighlighted?: boolean;
}

const formatTimeWindow = (startsAt: string, endsAt: string) => {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  return `${s.toLocaleTimeString(undefined, opts)} – ${e.toLocaleTimeString(undefined, opts)}`;
};

const formatRelativeStart = (startsAt: string) => {
  const start = new Date(startsAt);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return `Starts ${start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
  }
  return start.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const TruckListCard = ({ truck, onClick, onHover, isHighlighted }: TruckListCardProps) => {
  const stop = truck.currentStop ?? truck.nextStop;
  const live = !!truck.currentStop;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick?.(truck)}
      onMouseEnter={() => onHover?.(truck.storeId)}
      onMouseLeave={() => onHover?.(null)}
      id={`truck-${truck.storeId}`}
      className={cn(
        'group flex w-full items-start gap-3 rounded-2xl border bg-white p-4 text-left transition',
        isHighlighted ? 'border-amber-400 shadow-md' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm',
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        {truck.merchant.logoUrl ? (
          <img src={truck.merchant.logoUrl} alt={truck.merchant.businessName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-base font-semibold text-neutral-500">
            {truck.merchant.businessName.charAt(0)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-neutral-900">{truck.merchant.businessName}</h3>
          <TruckBadge size="xs" variant={live ? 'live' : 'default'} label={live ? 'Live now' : 'Food truck'} />
        </div>

        {stop ? (
          <>
            <div className="flex items-start gap-1.5 text-xs text-neutral-700">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden />
              <span className="line-clamp-1">{stop.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {live ? (
                <span>
                  Until {new Date(stop.endsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </span>
              ) : (
                <span>{formatRelativeStart(stop.startsAt)} · {formatTimeWindow(stop.startsAt, stop.endsAt)}</span>
              )}
            </div>
          </>
        ) : (
          <p className="text-xs text-neutral-500">No upcoming stops posted yet.</p>
        )}
      </div>

      {truck.distanceKm != null && (
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-700">
          <Navigation className="h-3 w-3" aria-hidden />
          {truck.distanceKm < 1
            ? `${Math.round(truck.distanceKm * 1000)} m`
            : `${truck.distanceKm.toFixed(1)} km`}
        </div>
      )}
    </motion.button>
  );
};

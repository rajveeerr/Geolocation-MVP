import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { TruckBadge } from '@/components/common/TruckBadge';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import type { DetailedDeal } from '@/hooks/useDealDetail';

interface DealLocationLineProps {
  merchant: DetailedDeal['merchant'];
  /** Visual variant: card-tight or detail-prominent. */
  variant?: 'card' | 'detail';
  className?: string;
}

const truckStore = (merchant: DetailedDeal['merchant']) =>
  merchant.stores?.find((s) => s.isFoodTruck);

const formatTimeWindow = (startsAt: string, endsAt: string) => {
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  return `${new Date(startsAt).toLocaleTimeString(undefined, opts)} – ${new Date(endsAt).toLocaleTimeString(undefined, opts)}`;
};

const formatNextStart = (startsAt: string) =>
  new Date(startsAt).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const DealLocationLine = ({ merchant, variant = 'card', className }: DealLocationLineProps) => {
  const truck = truckStore(merchant);
  const isCard = variant === 'card';

  if (truck) {
    const truckLink = `${PATHS.FOOD_TRUCKS}#truck-${truck.id}`;
    if (truck.currentStop) {
      return (
        <div className={cn('flex flex-col gap-1', className)}>
          <div className="flex flex-wrap items-center gap-2">
            <TruckBadge size={isCard ? 'xs' : 'sm'} variant="live" label="Live now" />
            <Link
              to={truckLink}
              className={cn(
                'inline-flex items-center gap-1 truncate font-medium text-emerald-700 hover:underline',
                isCard ? 'text-xs' : 'text-sm',
              )}
            >
              <MapPin className={isCard ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
              {truck.currentStop.address}
            </Link>
          </div>
          <p className={cn('text-emerald-600', isCard ? 'text-[11px]' : 'text-xs')}>
            Until {new Date(truck.currentStop.endsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      );
    }
    if (truck.nextStop) {
      return (
        <div className={cn('flex flex-col gap-1', className)}>
          <div className="flex flex-wrap items-center gap-2">
            <TruckBadge size={isCard ? 'xs' : 'sm'} label="Food truck" />
            <Link
              to={truckLink}
              className={cn(
                'inline-flex items-center gap-1 truncate font-medium text-neutral-700 hover:underline',
                isCard ? 'text-xs' : 'text-sm',
              )}
            >
              <Calendar className={isCard ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
              Next: {truck.nextStop.address}
            </Link>
          </div>
          <p className={cn('text-neutral-500', isCard ? 'text-[11px]' : 'text-xs')}>
            {formatNextStart(truck.nextStop.startsAt)} · {formatTimeWindow(truck.nextStop.startsAt, truck.nextStop.endsAt)}
          </p>
        </div>
      );
    }
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div className="flex flex-wrap items-center gap-2">
          <TruckBadge size={isCard ? 'xs' : 'sm'} label="Food truck" />
          <Link
            to={truckLink}
            className={cn('font-medium text-amber-700 hover:underline', isCard ? 'text-xs' : 'text-sm')}
          >
            See schedule →
          </Link>
        </div>
        <p className={cn('text-neutral-500', isCard ? 'text-[11px]' : 'text-xs')}>
          {merchant.businessName} hasn't posted today's location yet.
        </p>
      </div>
    );
  }

  return (
    <p
      className={cn(
        'inline-flex items-start gap-1 text-neutral-700',
        isCard ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <MapPin className={cn('mt-0.5 shrink-0 text-neutral-400', isCard ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden />
      <span className={isCard ? 'line-clamp-1' : ''}>{merchant.address}</span>
    </p>
  );
};

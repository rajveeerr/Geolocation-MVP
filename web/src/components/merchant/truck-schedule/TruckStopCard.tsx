import { Calendar, Clock, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ScheduledStop, TruckStopStatus } from '@/types/truckSchedule';

interface TruckStopCardProps {
  stop: ScheduledStop;
  onEdit: (stop: ScheduledStop) => void;
  onDelete: (stop: ScheduledStop) => void;
}

const statusStyles: Record<TruckStopStatus, string> = {
  LIVE: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  SCHEDULED: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  COMPLETED: 'bg-neutral-100 text-neutral-600 ring-neutral-400/20',
  CANCELLED: 'bg-rose-100 text-rose-700 ring-rose-600/20',
};

const statusLabel: Record<TruckStopStatus, string> = {
  LIVE: 'Live now',
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatTimeWindow = (startsAt: string, endsAt: string) => {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  return `${start.toLocaleTimeString(undefined, opts)} – ${end.toLocaleTimeString(undefined, opts)}`;
};

export const TruckStopCard = ({ stop, onEdit, onDelete }: TruckStopCardProps) => {
  const isPast = stop.status === 'COMPLETED' || stop.status === 'CANCELLED';

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-2xl border p-4 transition',
        stop.status === 'LIVE'
          ? 'border-emerald-300 bg-emerald-50/40'
          : 'border-neutral-200 bg-white',
        isPast && 'opacity-60',
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
              statusStyles[stop.status],
            )}
          >
            {statusLabel[stop.status]}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {formatDate(stop.startsAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatTimeWindow(stop.startsAt, stop.endsAt)}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">{stop.address}</p>
            {stop.city && (
              <p className="text-xs text-neutral-500">
                {stop.city.name}, {stop.city.state}
              </p>
            )}
          </div>
        </div>

        {stop.notes && (
          <p className="text-xs text-neutral-600">{stop.notes}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Stop actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onEdit(stop)} className="text-sm">
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(stop)}
            className="text-sm text-rose-600 focus:text-rose-600"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

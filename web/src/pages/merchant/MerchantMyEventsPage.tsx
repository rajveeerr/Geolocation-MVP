import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Eye,
  Trash2,
  Clock,
  Filter,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import {
  useMyEvents,
  useDeleteEvent,
  EVENT_STATUSES,
  type EventStatus,
} from '@/hooks/useMerchantEvents';
import type { EventDetail } from '@/hooks/useEventDetail';
import { useToast } from '@/hooks/use-toast';

// ─── Status Badge ───────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-muted text-foreground',
  PUBLISHED: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  CANCELLED: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
  COMPLETED: 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300',
  SOLD_OUT: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
};

const panelClass =
  'rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

function StatusBadge({ status }: { status: string }) {
  const label = EVENT_STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        statusStyles[status] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {label}
    </span>
  );
}

// ─── Event Card ─────────────────────────────────────────────────────

function EventCard({
  event,
  onDelete,
}: {
  event: EventDetail;
  onDelete: (id: number) => void;
}) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isUpcoming = startDate > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card shadow-[0_8px_22px_rgba(15,23,42,0.045)] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
    >
      <div className="relative h-40 bg-thumb-surface">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={event.status} />
        </div>
        {isUpcoming && (
          <div className="absolute right-3 top-3 rounded-full bg-card/90 dark:bg-card px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 backdrop-blur-sm">
            Upcoming
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-1 line-clamp-1 text-[1.02rem] font-semibold tracking-tight text-foreground">
          {event.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-[13px] leading-6 text-muted-foreground">
          {event.shortDescription || event.description}
        </p>

        <div className="mb-5 space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {startDate.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
              })}
              {' - '}
              {endDate.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
              })}
            </span>
          </div>
          {event.venueName && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{event.venueName}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{event.currentAttendees} attending</span>
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Ticket className="h-3.5 w-3.5" />
              <span>
                {event.isFreeEvent
                  ? 'Free'
                  : `${event.ticketTiers?.length ?? 0} tiers`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Link
            to={`/merchant/events/${event.id}`}
            className="flex-1"
          >
            <Button size="sm" className="w-full rounded-full bg-foreground text-background hover:bg-foreground/85">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Manage
            </Button>
          </Link>
          <button
            onClick={() => onDelete(event.id)}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Delete event"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(panelClass, 'flex flex-col items-center justify-center border-dashed py-16')}
    >
      <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
      <h3 className="mb-2 text-[1.4rem] font-semibold tracking-tight text-foreground">
        No events yet
      </h3>
      <p className="mb-6 max-w-sm text-center text-[13px] text-muted-foreground sm:text-sm">
        Create your first event and start selling tickets to your audience.
      </p>
      <Link to={PATHS.MERCHANT_EVENTS_CREATE}>
        <Button size="md" className="rounded-full bg-foreground text-background hover:bg-foreground/85">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </Link>
    </motion.div>
  );
}

// ─── Content ────────────────────────────────────────────────────────

type StatusFilter = EventStatus | 'ALL';

function MerchantMyEventsContent() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const { data: events = [], isLoading, error } = useMyEvents();
  const deleteEvent = useDeleteEvent();
  const { toast } = useToast();

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'ALL') return events;
    return events.filter((e) => e.status === statusFilter);
  }, [events, statusFilter]);

  const handleDelete = (eventId: number) => {
    if (!confirm('Are you sure you want to delete/cancel this event?')) return;
    deleteEvent.mutate(eventId, {
      onSuccess: (data) => {
        toast({
          title: data.action === 'cancelled' ? 'Event Cancelled' : 'Event Deleted',
          description: data.message,
        });
      },
      onError: (err) => {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      },
    });
  };

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: events.length };
    for (const e of events) {
      counts[e.status] = (counts[e.status] ?? 0) + 1;
    }
    return counts;
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-600">Failed to load events</p>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-1 sm:py-4">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Experiences</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-foreground">My Events</h1>
          <p className="mt-2 text-[13px] text-muted-foreground sm:text-sm">
            Create and manage your events, ticket tiers, and add-ons.
          </p>
        </div>
        <Link to={PATHS.MERCHANT_EVENTS_CREATE}>
          <Button size="md" className="rounded-full bg-foreground text-background hover:bg-foreground/85">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length > 0 && (
        <div className={cn(panelClass, 'mb-6 flex items-center gap-2 overflow-x-auto p-3')}>
          <Filter className="mr-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          {(['ALL', ...EVENT_STATUSES.map((s) => s.value)] as StatusFilter[]).map(
            (status) => {
              const label =
                status === 'ALL'
                  ? 'All'
                  : EVENT_STATUSES.find((s) => s.value === status)?.label ?? status;
              const count = statusCounts[status] ?? 0;
              if (status !== 'ALL' && count === 0) return null;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                    statusFilter === status
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-accent',
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-xs',
                      statusFilter === status
                        ? 'bg-card/20 dark:bg-card text-background dark:text-foreground'
                        : 'bg-accent text-muted-foreground',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>
      )}

      {/* Events Grid or Empty */}
      {filteredEvents.length === 0 && events.length === 0 ? (
        <EmptyState />
      ) : filteredEvents.length === 0 ? (
        <p className={cn(panelClass, 'py-12 text-center text-[13px] text-muted-foreground sm:text-sm')}>
          No events match this filter.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Exported Page ──────────────────────────────────────────────────

export const MerchantMyEventsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only event organizers can view their events. Apply as a merchant to get started.">
    <MerchantMyEventsContent />
  </MerchantProtectedRoute>
);

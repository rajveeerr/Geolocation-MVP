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
  DRAFT: 'bg-neutral-100 text-neutral-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  SOLD_OUT: 'bg-amber-100 text-amber-700',
};

function StatusBadge({ status }: { status: string }) {
  const label = EVENT_STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        statusStyles[status] ?? 'bg-neutral-100 text-neutral-600',
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
      className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Cover Image */}
      <div className="relative h-40 bg-gradient-to-br from-brand-primary-500/20 to-brand-primary-600/30">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Calendar className="h-12 w-12 text-brand-primary-400/60" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={event.status} />
        </div>
        {isUpcoming && (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-green-700 backdrop-blur-sm">
            Upcoming
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 text-lg font-bold text-neutral-900 line-clamp-1">
          {event.title}
        </h3>
        <p className="mb-3 text-sm text-neutral-500 line-clamp-2">
          {event.shortDescription || event.description}
        </p>

        {/* Meta */}
        <div className="mb-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {' - '}
              {endDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          {event.venueName && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{event.venueName}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Users className="h-3.5 w-3.5" />
              <span>{event.currentAttendees} attending</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Ticket className="h-3.5 w-3.5" />
              <span>
                {event.isFreeEvent
                  ? 'Free'
                  : `${event.ticketTiers?.length ?? 0} tiers`}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/merchant/events/${event.id}`}
            className="flex-1"
          >
            <Button variant="primary" size="sm" className="w-full rounded-lg">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Manage
            </Button>
          </Link>
          <button
            onClick={() => onDelete(event.id)}
            className="rounded-lg border border-red-200 p-2 text-red-500 transition-colors hover:bg-red-50"
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
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-16"
    >
      <Calendar className="mb-4 h-16 w-16 text-neutral-300" />
      <h3 className="mb-2 text-xl font-bold text-neutral-700">
        No events yet
      </h3>
      <p className="mb-6 max-w-sm text-center text-neutral-500">
        Create your first event and start selling tickets to your audience.
      </p>
      <Link to={PATHS.MERCHANT_EVENTS_CREATE}>
        <Button size="md" className="rounded-full">
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
        <p className="text-sm text-neutral-500">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Events</h1>
          <p className="mt-1 text-neutral-500">
            Create and manage your events, ticket tiers, and add-ons.
          </p>
        </div>
        <Link to={PATHS.MERCHANT_EVENTS_CREATE}>
          <Button size="md" className="rounded-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Status Filters */}
      {events.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="mr-1 h-4 w-4 flex-shrink-0 text-neutral-400" />
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
                    'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    statusFilter === status
                      ? 'bg-brand-primary-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-xs',
                      statusFilter === status
                        ? 'bg-white/20'
                        : 'bg-neutral-200',
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
        <p className="py-12 text-center text-neutral-500">
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

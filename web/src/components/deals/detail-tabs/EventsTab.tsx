// web/src/components/deals/detail-tabs/EventsTab.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Music,
  MapPin,
  Users,
  TrendingUp,
  Loader2,
  ArrowRight,
  PartyPopper,
  Beer,
} from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { useBrowseEvents } from '@/hooks/useEventDetail';
import type { EventDetail } from '@/hooks/useEventDetail';
import { cn } from '@/lib/utils';

interface EventsTabProps {
  deal: DetailedDeal;
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEventTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getLowestPrice(event: EventDetail): number | null {
  const activeTiers = event.ticketTiers?.filter((t) => t.isActive) ?? [];
  if (activeTiers.length === 0) return null;
  return Math.min(...activeTiers.map((t) => t.price));
}

function getTotalAvailable(event: EventDetail): number {
  return (event.ticketTiers ?? []).reduce(
    (sum, t) => sum + Math.max(0, t.totalQuantity - t.soldQuantity - t.reservedQuantity),
    0,
  );
}

const EVENT_TYPE_ICONS: Record<string, React.ElementType> = {
  PARTY: PartyPopper,
  BAR_CRAWL: Beer,
  FESTIVAL: Music,
  RSVP_EVENT: Calendar,
  SPORTS_TOURNAMENT: TrendingUp,
  WAGBT: Users,
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  PARTY: 'Party',
  BAR_CRAWL: 'Bar Crawl',
  FESTIVAL: 'Festival',
  RSVP_EVENT: 'RSVP Event',
  SPORTS_TOURNAMENT: 'Tournament',
  WAGBT: 'WAGBT',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'PARTY', label: 'Party', icon: PartyPopper },
  { id: 'BAR_CRAWL', label: 'Bar Crawl', icon: Beer },
  { id: 'RSVP_EVENT', label: 'RSVP', icon: Calendar },
  { id: 'FESTIVAL', label: 'Festival', icon: Music },
];

// ─── Event Card ──────────────────────────────────────────────────

function EventCard({ event }: { event: EventDetail }) {
  const lowestPrice = getLowestPrice(event);
  const available = getTotalAvailable(event);
  const isTrending = event.trendingScore > 50 || event.socialProofCount > 20;
  const Icon = EVENT_TYPE_ICONS[event.eventType] ?? Calendar;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={
            event.coverImageUrl ||
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
          <Icon className="h-3.5 w-3.5 text-neutral-700" />
          <span className="text-[11px] font-semibold text-neutral-700">
            {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
          </span>
        </div>

        {/* Trending badge */}
        {isTrending && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-brand text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
            <TrendingUp className="h-3 w-3" />
            Trending
          </div>
        )}

        {/* Price tag */}
        <div className="absolute bottom-2.5 right-2.5">
          {event.isFreeEvent ? (
            <span className="bg-success text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              Free
            </span>
          ) : lowestPrice !== null ? (
            <span className="bg-white/90 backdrop-blur-sm text-neutral-900 text-xs font-bold px-2.5 py-1 rounded-lg">
              From ${lowestPrice.toFixed(0)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-heading font-bold text-base text-neutral-900 mb-1 line-clamp-1 group-hover:text-brand transition-colors">
          {event.title}
        </h4>
        {event.shortDescription && (
          <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{event.shortDescription}</p>
        )}

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <Calendar className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
            <span>{formatEventDate(event.startDate)}</span>
            <span className="text-neutral-300">•</span>
            <span>{formatEventTime(event.startDate)}</span>
          </div>

          {event.venueName && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
              <span className="truncate">{event.venueName}</span>
            </div>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {event.currentAttendees > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {event.currentAttendees} going
              </span>
            )}
            {available > 0 && available <= 20 && (
              <span className="text-brand font-semibold">{available} left</span>
            )}
            {available <= 0 && (
              <span className="text-neutral-400 font-semibold">Sold out</span>
            )}
          </div>
          <span className="text-xs font-semibold text-brand flex items-center gap-1 group-hover:gap-2 transition-all">
            View
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export const EventsTab = ({ deal }: EventsTabProps) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const { data, isLoading } = useBrowseEvents({
    sortBy: 'startDate',
    sortOrder: 'asc',
    eventType: selectedFilter !== 'all' ? selectedFilter : undefined,
  });

  const events = data?.events ?? [];

  return (
    <div className="space-y-6">
      {/* Events Banner */}
      <div className="bg-gradient-to-r from-brand to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-7 w-7" />
          <h2 className="text-2xl font-heading font-bold">Upcoming Events</h2>
        </div>
        <p className="text-white/80 text-sm">
          Discover exclusive events, live music, bar crawls, and more. Book your tickets and earn
          bonus points!
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-200 text-sm',
                selectedFilter === filter.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50',
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-neutral-700 mb-1">No events found</h3>
          <p className="text-sm text-neutral-500">
            {selectedFilter !== 'all'
              ? 'Try a different filter or check back later.'
              : 'Check back soon for upcoming events!'}
          </p>
        </div>
      )}

      {/* Private Events Section */}
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        <h3 className="font-heading text-lg font-bold text-neutral-900 mb-3">
          Host Your Private Event
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          {deal.merchant.businessName} offers customizable private dining experiences for groups of
          10-100 guests. Perfect for celebrations, corporate events, and intimate gatherings.
        </p>
        <ul className="space-y-2 mb-5 text-sm text-neutral-700">
          {[
            'Dedicated event coordinator',
            'Customizable menus and bar packages',
            'Private dining rooms available',
            'AV equipment and entertainment options',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-brand mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="h-10 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand-hover transition-colors">
            Inquire About Private Events
          </button>
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <p className="text-sm font-semibold text-neutral-800 mb-1">Contact Events Team</p>
            <p className="text-xs text-neutral-600">
              events@{deal.merchant.businessName.toLowerCase().replace(/\s+/g, '')}.com
            </p>
            <p className="text-xs text-neutral-600">
              {deal.merchant.phoneNumber || '(555) 123-4568'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


// web/src/components/deals/detail-tabs/EventsTab.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Music,
  MapPin,
  Users,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  PartyPopper,
  Beer,
  Heart,
  Ticket,
  Clock,
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
  });
}

function formatEventTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getLowestPrice(event: EventDetail): string {
  if (event.isFreeEvent) return 'FREE';
  const activeTiers = event.ticketTiers?.filter((t) => t.isActive) ?? [];
  if (activeTiers.length === 0) return 'FREE';
  const min = Math.min(...activeTiers.map((t) => t.price));
  return `$${min.toFixed(2)}`;
}

function getTotalAvailable(event: EventDetail): number {
  return (event.ticketTiers ?? []).reduce(
    (sum, t) => sum + Math.max(0, t.totalQuantity - t.soldQuantity - t.reservedQuantity),
    0,
  );
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  PARTY: 'Party',
  BAR_CRAWL: 'Bar Crawl',
  FESTIVAL: 'Festival',
  RSVP_EVENT: 'RSVP Event',
  CONCERT: 'Concert',
  COMEDY: 'Comedy',
  NIGHTLIFE: 'Nightlife',
  SPORTS: 'Sports',
  SPORTS_TOURNAMENT: 'Tournament',
  FOOD_AND_DRINK: 'Food & Drink',
  ARTS: 'Arts',
  NETWORKING: 'Networking',
  WORKSHOP: 'Workshop',
  WAGBT: 'WAGBT',
  OTHER: 'Event',
};

const EVENT_TYPE_DOT_COLORS: Record<string, string> = {
  PARTY: 'bg-pink-500',
  BAR_CRAWL: 'bg-amber-500',
  FESTIVAL: 'bg-purple-500',
  RSVP_EVENT: 'bg-blue-500',
  CONCERT: 'bg-[#B91C1C]',
  COMEDY: 'bg-yellow-500',
  NIGHTLIFE: 'bg-indigo-500',
  SPORTS: 'bg-emerald-500',
  FOOD_AND_DRINK: 'bg-orange-500',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'PARTY', label: 'Party', icon: PartyPopper },
  { id: 'BAR_CRAWL', label: 'Bar Crawl', icon: Beer },
  { id: 'RSVP_EVENT', label: 'RSVP', icon: Calendar },
  { id: 'FESTIVAL', label: 'Festival', icon: Music },
];

// ─── Tall Event Card (matches Figma menu card design) ─────────────

function EventCard({ event }: { event: EventDetail }) {
  const navigate = useNavigate();
  const price = getLowestPrice(event);
  const available = getTotalAvailable(event);
  const isTrending = event.trendingScore > 50 || event.socialProofCount > 20;
  const typeLabel = EVENT_TYPE_LABELS[event.eventType] ?? event.eventType?.replace(/_/g, ' ');
  const dotColor = EVENT_TYPE_DOT_COLORS[event.eventType] ?? 'bg-[#B91C1C]';

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-lg cursor-pointer group aspect-[3/5]"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Full-bleed cover image */}
      {event.coverImageUrl ? (
        <div className="absolute inset-0">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600';
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
          <Ticket className="h-8 w-8 text-neutral-600" />
        </div>
      )}

      {/* Category badge – top left */}
      <div className="absolute top-3.5 left-3.5 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
          <div className={cn('w-2 h-2 rounded-full', dotColor)} />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Price badge – top right */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-sm">
          {price}
        </span>
      </div>

      {/* Trending badge */}
      {isTrending && (
        <div className="absolute top-14 right-3.5 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/80 backdrop-blur-md">
            <TrendingUp className="h-3 w-3 text-white" />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
              Trending
            </span>
          </div>
        </div>
      )}

      {/* Sold out overlay */}
      {available <= 0 && !event.isFreeEvent && (
        <div className="absolute top-14 left-3.5 z-10">
          <span className="px-2.5 py-1 rounded-full bg-red-600/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider">
            Sold Out
          </span>
        </div>
      )}

      {/* Bottom gradient – smooth progressive fade */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 pointer-events-none bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-gradient-to-t from-black/50 to-transparent" />

      {/* Bottom content – all on top of image */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex flex-col">
        {/* Title */}
        <h4 className="text-xl font-black text-white uppercase tracking-wide leading-tight line-clamp-2">
          {event.title}
        </h4>

        {/* Date + Time + Venue */}
        <div className="mt-1.5 space-y-0.5">
          <p className="text-[13px] text-white/60 flex items-center gap-1.5">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            {formatEventDate(event.startDate)} · {formatEventTime(event.startDate)}
          </p>
          {event.venueName && (
            <p className="text-[13px] text-white/50 flex items-center gap-1.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.venueName}</span>
            </p>
          )}
        </div>

        {/* Short desc */}
        {event.shortDescription && (
          <p className="text-[13px] text-white/40 mt-1.5 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>
        )}

        {/* Spots + attendees info */}
        {(event.currentAttendees > 0 || (available > 0 && available <= 30)) && (
          <div className="flex items-center gap-3 mt-2">
            {event.currentAttendees > 0 && (
              <span className="text-[11px] text-white/50 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.currentAttendees} going
              </span>
            )}
            {available > 0 && available <= 30 && (
              <span className="text-[11px] text-amber-400 font-semibold">
                {available} spots left
              </span>
            )}
          </div>
        )}

        {/* Action row – matches menu card "Add to Basket" design */}
        <div className="flex items-center gap-2.5 mt-4">
          {/* View Event – main CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event.id}`);
            }}
            className="flex-1 flex items-center justify-between pl-5 pr-1.5 py-1.5 rounded-full bg-white group/cta"
          >
            <span className="text-sm font-semibold text-[#1a1a2e] whitespace-nowrap">
              View Event
            </span>
            <span className="w-10 h-10 rounded-full bg-[#1a1a2e] flex items-center justify-center flex-shrink-0 group-hover/cta:scale-110 transition-transform">
              <ArrowUpRight className="h-[17px] w-[17px] text-white" />
            </span>
          </button>
          {/* Heart – separate white circle */}
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0 hover:bg-neutral-100 transition-colors"
          >
            <Heart className="h-[18px] w-[18px] text-[#1a1a2e]" />
          </button>
        </div>
      </div>
    </div>
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
    <div className="space-y-5">
      {/* Section header – matches "CURATED MENU" style */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-black text-[#1a1a2e] uppercase tracking-tight">
            Upcoming Events
          </h2>
          <p className="text-neutral-400 text-sm mt-0.5">
            Live happenings near this venue
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={cn(
                'px-4 py-2 rounded-full font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-200 text-sm border',
                selectedFilter === filter.id
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400',
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
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#B91C1C]" />
        </div>
      )}

      {/* Events Grid – tall cards like menu items */}
      {!isLoading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events.length === 0 && (
        <div className="text-center py-16">
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
      <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
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
              <span className="text-[#B91C1C] mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <button className="w-full h-12 rounded-full bg-[#1a1a2e] text-white font-semibold text-sm hover:bg-[#2a2a3e] transition-colors flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          Inquire About Private Events
        </button>
      </div>
    </div>
  );
};


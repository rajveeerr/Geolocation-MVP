// web/src/components/deals/detail-tabs/EventsTab.tsx
import { useState } from 'react';
import {
  Calendar,
  Music,
  Loader2,
  PartyPopper,
  Beer,
} from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { useBrowseEvents } from '@/hooks/useEventDetail';
import { EventCard } from '@/components/events/EventCard';
import { cn } from '@/lib/utils';

interface EventsTabProps {
  deal: DetailedDeal;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'PARTY', label: 'Party', icon: PartyPopper },
  { id: 'BAR_CRAWL', label: 'Bar Crawl', icon: Beer },
  { id: 'RSVP_EVENT', label: 'RSVP', icon: Calendar },
  { id: 'FESTIVAL', label: 'Festival', icon: Music },
];

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
          <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
        </div>
      )}

      {/* Events Grid – 3 cards per row with fixed dimensions */}
      {!isLoading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} width={204.75} height={364} compact />
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
              <span className="text-brand-primary-600 mt-0.5">•</span>
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


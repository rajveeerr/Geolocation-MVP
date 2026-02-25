import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  X,
  ExternalLink,
  Ticket,
  Sparkles,
  Globe,
  ChevronLeft,
  ChevronRight,
  Clock,
  Music,
  Star,
  Loader2,
  Zap,
  Navigation,
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CityPickerModal } from '@/components/events/CityPickerModal';
import {
  useDiscoverEvents,
  useBrowseEvents,
} from '@/hooks/useEventDetail';
import {
  useTicketmasterSearch,
  useTicketmasterVenues,
  useTicketmasterAttractions,
  type TicketmasterEvent,
  type TicketmasterVenue,
  type TicketmasterAttraction,
} from '@/hooks/useTickets';
import { EventCard } from '@/components/events/EventCard';
import type { HybridEvent } from '@/components/events/EventCard';

import { cn } from '@/lib/utils';

/* ─── helpers ──────────────────────────────────────────────────── */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/* getLowestPrice & getEventTypeLabel moved to shared EventCard component */

/* ─── Tab config ───────────────────────────────────────────────── */

const TABS = [
  { key: 'all', label: 'All Events', icon: Sparkles },
  { key: 'discover', label: 'Discover', icon: Zap },
  { key: 'ticketmaster', label: 'Ticketmaster', icon: Globe },
  { key: 'venues', label: 'Venues', icon: MapPin },
  { key: 'artists', label: 'Artists', icon: Music },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/* ─── Event type filter pills ──────────────────────────────────── */

const EVENT_TYPES = [
  { value: '', label: 'All' },
  { value: 'CONCERT', label: 'Concerts' },
  { value: 'FESTIVAL', label: 'Festivals' },
  { value: 'COMEDY', label: 'Comedy' },
  { value: 'NIGHTLIFE', label: 'Nightlife' },
  { value: 'FOOD_AND_DRINK', label: 'Food & Drink' },
  { value: 'SPORTS', label: 'Sports' },
  { value: 'ARTS', label: 'Arts' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'WORKSHOP', label: 'Workshops' },
];

const SORT_OPTIONS = [
  { value: 'startDate', label: 'Date' },
  { value: 'createdAt', label: 'Newest' },
  { value: 'trendingScore', label: 'Trending' },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LocalEventCard & HybridEventCard → replaced by shared EventCard
   from @/components/events/EventCard
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TMEventCard → replaced by shared EventCard
   Adapter converts TicketmasterEvent → HybridEvent shape
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function tmToHybrid(event: TicketmasterEvent): HybridEvent {
  return {
    id: event.id,
    name: event.name,
    coverImageUrl: null,
    images: event.images?.map((i) => ({ url: i.url, width: i.width })),
    dates: event.dates ? { start: event.dates.start } : undefined,
    venueName: event._embedded?.venues?.[0]?.name ?? null,
    _embedded: event._embedded as HybridEvent['_embedded'],
    source: 'ticketmaster' as const,
    url: event.url,
    priceRanges: event.priceRanges?.map((p) => ({ min: p.min, max: p.max, currency: p.currency })),
  };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Venue Card
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function VenueCard({ venue }: { venue: TicketmasterVenue }) {
  const image = venue.images?.[0]?.url;
  const location = [venue.city?.name, venue.state?.stateCode]
    .filter(Boolean)
    .join(', ');

  return (
    <a
      href={venue.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl hover:border-brand-primary-500/30 hover:shadow-md transition-all duration-200"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-neutral-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-bold text-[#1a1a2e] group-hover:text-brand-primary-600 transition-colors line-clamp-1">
          {venue.name}
        </h3>
        {location && (
          <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-primary-600" />
            {location}
          </p>
        )}
        {venue.address?.line1 && (
          <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
            {venue.address.line1}
          </p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-brand-primary-600 flex-shrink-0 transition-colors" />
    </a>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Attraction / Artist Card
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function AttractionCard({
  attraction,
}: {
  attraction: TicketmasterAttraction;
}) {
  const image =
    attraction.images?.find((i) => i.width > 300)?.url ??
    attraction.images?.[0]?.url;
  const genre = attraction.classifications?.[0]?.genre?.name;

  return (
    <a
      href={attraction.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl hover:border-brand-primary-500/30 hover:shadow-md transition-all duration-200"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={attraction.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Star className="w-6 h-6 text-neutral-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-bold text-[#1a1a2e] group-hover:text-brand-primary-600 transition-colors line-clamp-1">
          {attraction.name}
        </h3>
        {genre && (
          <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
            <Music className="w-3 h-3 text-brand-primary-600" />
            {genre}
          </p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-neutral-300 group-hover:text-brand-primary-600 flex-shrink-0 transition-colors" />
    </a>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Empty state
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center py-20">
      <div className="h-16 w-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-neutral-300" />
      </div>
      <p className="font-heading text-lg font-bold text-[#1a1a2e]">{title}</p>
      <p className="text-sm text-neutral-400 mt-1 max-w-sm mx-auto">
        {subtitle}
      </p>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Skeleton loader
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-neutral-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-100 rounded w-3/4" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
        <div className="h-3 bg-neutral-100 rounded w-full" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-2xl animate-pulse"
        >
          <div className="w-16 h-16 rounded-xl bg-neutral-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-100 rounded w-1/2" />
            <div className="h-3 bg-neutral-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Pagination
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="h-9 w-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center disabled:opacity-30 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-[#1a1a2e]" />
      </button>
      <span className="text-sm font-medium text-neutral-500">
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="h-9 w-9 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center disabled:opacity-30 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-[#1a1a2e]" />
      </button>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function DiscoverEventsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [freeOnly, setFreeOnly] = useState(false);

  /* ─── Auto-detect location ───────────────────────── */
  const geo = useGeolocation(true);

  // Auto-fill city once detected (only if user hasn't manually set one)
  useEffect(() => {
    if (geo.location?.city && !city) {
      setCity(geo.location.city);
    }
  }, [geo.location?.city]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(0);
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setPage(0);
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(0);
  };

  /* ─── All Events (local backend browse) ──────────────── */
  const browseQuery = useBrowseEvents({
    eventType: eventType || undefined,
    search: keyword || city || undefined,
    isFreeEvent: freeOnly ? true : undefined,
    page: page + 1, // backend is 1-indexed
    limit: 12,
    sortBy,
    sortOrder: sortBy === 'startDate' ? 'asc' : 'desc',
  });

  /* ─── Discover (hybrid local + TM) ──────────────────── */
  const discoverQuery = useDiscoverEvents({
    keyword: activeTab === 'discover' ? keyword : undefined,
    city: activeTab === 'discover' ? city : undefined,
    startDate: activeTab === 'discover' ? startDate : undefined,
    endDate: activeTab === 'discover' ? endDate : undefined,
    page: activeTab === 'discover' ? page : undefined,
    size: activeTab === 'discover' ? 20 : undefined,
    includeTicketmaster: activeTab === 'discover' ? true : undefined,
  });

  /* ─── Ticketmaster Events ───────────────────────────── */
  const tmEventsQuery = useTicketmasterSearch({
    keyword: activeTab === 'ticketmaster' ? keyword : undefined,
    city: activeTab === 'ticketmaster' ? city : undefined,
    startDate: activeTab === 'ticketmaster' ? startDate : undefined,
    endDate: activeTab === 'ticketmaster' ? endDate : undefined,
    page,
    size: 20,
    enabled: activeTab === 'ticketmaster' && !!(keyword || city),
  });

  /* ─── Ticketmaster Venues ───────────────────────────── */
  const venuesQuery = useTicketmasterVenues({
    keyword: activeTab === 'venues' ? keyword : undefined,
    city: activeTab === 'venues' ? city : undefined,
    enabled: activeTab === 'venues' && !!(keyword || city),
  });

  /* ─── Ticketmaster Attractions ──────────────────────── */
  const attractionsQuery = useTicketmasterAttractions({
    keyword: activeTab === 'artists' ? keyword : undefined,
    page,
    size: 20,
    enabled: activeTab === 'artists' && !!keyword,
  });

  const isLoading =
    (activeTab === 'all' && browseQuery.isLoading) ||
    (activeTab === 'discover' && discoverQuery.isLoading) ||
    (activeTab === 'ticketmaster' && tmEventsQuery.isLoading) ||
    (activeTab === 'venues' && venuesQuery.isLoading) ||
    (activeTab === 'artists' && attractionsQuery.isLoading);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#1a1a2e] tracking-tight">
            Discover{' '}
            <span className="text-brand-primary-600">Events</span>
          </h1>
          <p className="text-neutral-500 mt-2 text-sm">
            Find local events and browse Ticketmaster listings near you
          </p>
        </div>

        {/* ─── Search Bar ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search events, artists, venues…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#1a1a2e] placeholder-neutral-400 focus:outline-none focus:border-brand-primary-500 focus:ring-1 focus:ring-brand-primary-500/20 transition-colors"
            />
          </div>

          {/* City picker button */}
          <button
            onClick={() => setShowCityPicker(true)}
            className={cn(
              'flex items-center gap-2 sm:w-52 px-3.5 py-2.5 rounded-xl text-sm border transition-all active:scale-[0.98]',
              city
                ? 'bg-brand-primary-50 border-brand-primary-500/20 text-brand-primary-600'
                : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-[#1a1a2e]',
            )}
          >
            {geo.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            ) : city ? (
              <MapPin className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Navigation className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="truncate font-medium">
              {geo.isLoading
                ? 'Detecting…'
                : city || 'Select City'}
            </span>
            {city && (
              <X
                className="w-3.5 h-3.5 ml-auto flex-shrink-0 hover:text-brand-primary-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCity('');
                }}
              />
            )}
          </button>

          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-brand-primary-600 hover:bg-brand-primary-700 rounded-xl text-sm font-bold text-white transition-colors active:scale-[0.98] shadow-sm"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors',
              showFilters
                ? 'bg-brand-primary-50 border-brand-primary-500/30 text-brand-primary-600'
                : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:text-[#1a1a2e] hover:border-neutral-300',
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* ─── City Picker Modal ────────────────────────────── */}
        <CityPickerModal
          isOpen={showCityPicker}
          onClose={() => setShowCityPicker(false)}
          onSelect={handleCitySelect}
          currentCity={city}
          detectedCity={geo.location?.city || null}
          isDetecting={geo.isLoading}
          onDetectLocation={() => {
            geo.detect();
            if (geo.location?.city) {
              handleCitySelect(geo.location.city);
              setShowCityPicker(false);
            }
          }}
        />

        {/* ─── Filters ─────────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                {/* Date filters */}
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:border-brand-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:border-brand-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:border-brand-primary-500"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:border-neutral-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={freeOnly}
                        onChange={(e) => setFreeOnly(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
                      />
                      <span className="text-sm text-[#1a1a2e] font-medium">
                        Free only
                      </span>
                    </label>
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="self-end px-3 py-2 text-xs text-neutral-400 hover:text-brand-primary-600 font-medium"
                    >
                      <X className="w-3 h-3 inline mr-1" />
                      Clear dates
                    </button>
                  )}
                </div>

                {/* Event type pills — only for "All Events" tab */}
                {activeTab === 'all' && (
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                      Event Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EVENT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setEventType(type.value);
                            setPage(0);
                          }}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors',
                            eventType === type.value
                              ? 'bg-brand-primary-600 text-white'
                              : 'bg-white border border-neutral-200 text-neutral-500 hover:border-brand-primary-500/30 hover:text-brand-primary-600',
                          )}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Tabs ────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-neutral-200 pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors -mb-px',
                  activeTab === tab.key
                    ? 'border-brand-primary-500 text-brand-primary-600'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Content ─────────────────────────────────────── */}

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ═══ Tab: All Events (local browse) ═══ */}
        {!isLoading && activeTab === 'all' && (
          <>
            {browseQuery.data && browseQuery.data.events.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-neutral-500">
                    <span className="font-bold text-[#1a1a2e]">
                      {browseQuery.data.totalCount}
                    </span>{' '}
                    events found
                  </p>
                </div>
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {browseQuery.data.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={browseQuery.data.totalPages}
                  onPageChange={setPage}
                />
              </>
            ) : (
              <EmptyState
                icon={Ticket}
                title="No events yet"
                subtitle="Check back soon — new events are added regularly. Try the Discover tab to find Ticketmaster events too."
              />
            )}
          </>
        )}

        {/* ═══ Tab: Discover (hybrid) ═══ */}
        {!isLoading && activeTab === 'discover' && (
          <>
            {!keyword ? (
              <EmptyState
                icon={Sparkles}
                title="Search to discover events"
                subtitle="Find local events and Ticketmaster listings combined in one place."
              />
            ) : discoverQuery.data ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-neutral-500">
                    <span className="font-bold text-[#1a1a2e]">
                      {discoverQuery.data.pagination.total}
                    </span>{' '}
                    results
                    {discoverQuery.data.sources && (
                      <span className="text-neutral-400">
                        {' '}
                        · {discoverQuery.data.sources.local} local,{' '}
                        {discoverQuery.data.sources.ticketmaster} Ticketmaster
                      </span>
                    )}
                  </p>
                </div>

                {discoverQuery.data.events.length > 0 ? (
                  <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {discoverQuery.data.events.map((event: any) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Search}
                    title={`No events found for "${keyword}"`}
                    subtitle="Try a different search term or check back later."
                  />
                )}
              </>
            ) : null}
          </>
        )}

        {/* ═══ Tab: Ticketmaster ═══ */}
        {!isLoading && activeTab === 'ticketmaster' && (
          <>
            {!keyword ? (
              <EmptyState
                icon={Globe}
                title="Search Ticketmaster Events"
                subtitle="Enter a keyword to search millions of live events worldwide."
              />
            ) : tmEventsQuery.data ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-neutral-500">
                    <span className="font-bold text-[#1a1a2e]">
                      {tmEventsQuery.data.pagination.total}
                    </span>{' '}
                    results from Ticketmaster
                  </p>
                </div>

                {tmEventsQuery.data.events.length > 0 ? (
                  <>
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      {tmEventsQuery.data.events.map((event) => (
                        <EventCard key={event.id} event={tmToHybrid(event)} />
                      ))}
                    </div>
                    {tmEventsQuery.data.pagination.totalPages && (
                      <Pagination
                        page={page}
                        totalPages={tmEventsQuery.data.pagination.totalPages}
                        onPageChange={setPage}
                      />
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={Search}
                    title={`No Ticketmaster events for "${keyword}"`}
                    subtitle="Try a different search term or change the city filter."
                  />
                )}
              </>
            ) : null}
          </>
        )}

        {/* ═══ Tab: Venues ═══ */}
        {!isLoading && activeTab === 'venues' && (
          <>
            {!keyword ? (
              <EmptyState
                icon={MapPin}
                title="Search Venues"
                subtitle="Find event venues and concert halls near you."
              />
            ) : venuesQuery.isLoading ? (
              <ListSkeleton />
            ) : venuesQuery.data ? (
              <>
                <p className="text-sm text-neutral-500 mb-5">
                  <span className="font-bold text-[#1a1a2e]">
                    {venuesQuery.data.pagination.total}
                  </span>{' '}
                  venues found
                </p>
                {venuesQuery.data.venues.length > 0 ? (
                  <div className="space-y-3">
                    {venuesQuery.data.venues.map((venue) => (
                      <VenueCard key={venue.id} venue={venue} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Search}
                    title={`No venues found for "${keyword}"`}
                    subtitle="Try a different search term or city."
                  />
                )}
              </>
            ) : null}
          </>
        )}

        {/* ═══ Tab: Artists ═══ */}
        {!isLoading && activeTab === 'artists' && (
          <>
            {!keyword ? (
              <EmptyState
                icon={Music}
                title="Search Artists & Attractions"
                subtitle="Find your favorite artists, bands, and performers."
              />
            ) : attractionsQuery.isLoading ? (
              <ListSkeleton />
            ) : attractionsQuery.data ? (
              <>
                <p className="text-sm text-neutral-500 mb-5">
                  <span className="font-bold text-[#1a1a2e]">
                    {attractionsQuery.data.pagination.total}
                  </span>{' '}
                  artists found
                </p>
                {attractionsQuery.data.attractions.length > 0 ? (
                  <div className="space-y-3">
                    {attractionsQuery.data.attractions.map((a) => (
                      <AttractionCard key={a.id} attraction={a} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Search}
                    title={`No artists found for "${keyword}"`}
                    subtitle="Try a different search term."
                  />
                )}
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

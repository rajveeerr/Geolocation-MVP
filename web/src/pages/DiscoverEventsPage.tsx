import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useDiscoverEvents } from '@/hooks/useEventDetail';
import {
  useTicketmasterSearch,
  useTicketmasterVenues,
  useTicketmasterAttractions,
  type TicketmasterEvent,
  type TicketmasterVenue,
  type TicketmasterAttraction,
} from '@/hooks/useTickets';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

// ─── helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Tab selector ───────────────────────────────────────────────

const TABS = [
  { key: 'discover', label: 'Discover', icon: Sparkles },
  { key: 'ticketmaster', label: 'Ticketmaster', icon: Globe },
  { key: 'venues', label: 'Venues', icon: MapPin },
  { key: 'artists', label: 'Artists', icon: Music },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ─── Local Event Card ───────────────────────────────────────────

function LocalEventCard({ event }: { event: any }) {
  return (
    <Link
      to={PATHS.EVENT_DETAIL.replace(':eventId', String(event.id))}
      className="group block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
    >
      <div className="aspect-[16/9] overflow-hidden bg-zinc-800 relative">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ticket className="w-10 h-10 text-zinc-600" />
          </div>
        )}
        {event.source === 'ticketmaster' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
            Ticketmaster
          </span>
        )}
        {event.isFreeEvent && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-xs font-medium rounded-full">
            FREE
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1">
          {event.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.startDate)}
          </span>
          {event.venueName && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {event.venueName}
            </span>
          )}
        </div>
        {event.shortDescription && (
          <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{event.shortDescription}</p>
        )}
      </div>
    </Link>
  );
}

// ─── Ticketmaster Event Card ────────────────────────────────────

function TMEventCard({ event }: { event: TicketmasterEvent }) {
  const venue = event._embedded?.venues?.[0];
  const image = event.images?.find((i) => i.width > 500)?.url ?? event.images?.[0]?.url;
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
    >
      <div className="aspect-[16/9] overflow-hidden bg-zinc-800 relative">
        {image ? (
          <img
            src={image}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Globe className="w-10 h-10 text-zinc-600" />
          </div>
        )}
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Ticketmaster
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {event.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.dates.start.dateTime || event.dates.start.localDate)}
          </span>
          {event.dates.start.localTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {event.dates.start.localTime.slice(0, 5)}
            </span>
          )}
          {venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {venue.name}
            </span>
          )}
        </div>
        {event.priceRanges?.[0] && (
          <p className="text-xs text-emerald-400 mt-2">
            ${event.priceRanges[0].min}–${event.priceRanges[0].max} {event.priceRanges[0].currency}
          </p>
        )}
      </div>
    </a>
  );
}

// ─── Venue Card ─────────────────────────────────────────────────

function VenueCard({ venue }: { venue: TicketmasterVenue }) {
  const image = venue.images?.[0]?.url;
  return (
    <a
      href={venue.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
        {image ? (
          <img src={image} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {venue.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {[venue.city?.name, venue.state?.stateCode].filter(Boolean).join(', ')}
        </p>
        {venue.address?.line1 && (
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{venue.address.line1}</p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-zinc-600 ml-auto flex-shrink-0" />
    </a>
  );
}

// ─── Attraction Card ────────────────────────────────────────────

function AttractionCard({ attraction }: { attraction: TicketmasterAttraction }) {
  const image = attraction.images?.find((i) => i.width > 300)?.url ?? attraction.images?.[0]?.url;
  const genre = attraction.classifications?.[0]?.genre?.name;
  return (
    <a
      href={attraction.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
        {image ? (
          <img src={image} alt={attraction.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Star className="w-6 h-6 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {attraction.name}
        </h3>
        {genre && <p className="text-xs text-zinc-400 mt-0.5">{genre}</p>}
      </div>
      <ExternalLink className="w-4 h-4 text-zinc-600 ml-auto flex-shrink-0" />
    </a>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export function DiscoverEventsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = () => {
    setKeyword(searchInput);
    setCity(cityInput);
    setPage(0);
  };

  // ─── Discover (hybrid) ──────────────────────
  const discoverQuery = useDiscoverEvents({
    keyword: activeTab === 'discover' ? keyword : undefined,
    city: activeTab === 'discover' ? city : undefined,
    startDate: activeTab === 'discover' ? startDate : undefined,
    endDate: activeTab === 'discover' ? endDate : undefined,
    page,
    size: 20,
    includeTicketmaster: true,
  });

  // ─── Ticketmaster Events ───────────────────
  const tmEventsQuery = useTicketmasterSearch({
    keyword: activeTab === 'ticketmaster' ? keyword : undefined,
    city: activeTab === 'ticketmaster' ? city : undefined,
    startDate: activeTab === 'ticketmaster' ? startDate : undefined,
    endDate: activeTab === 'ticketmaster' ? endDate : undefined,
    page,
    size: 20,
    enabled: activeTab === 'ticketmaster' && !!keyword,
  });

  // ─── Ticketmaster Venues ───────────────────
  const venuesQuery = useTicketmasterVenues({
    keyword: activeTab === 'venues' ? keyword : undefined,
    city: activeTab === 'venues' ? city : undefined,
    enabled: activeTab === 'venues' && !!keyword,
  });

  // ─── Ticketmaster Attractions ──────────────
  const attractionsQuery = useTicketmasterAttractions({
    keyword: activeTab === 'artists' ? keyword : undefined,
    page,
    size: 20,
    enabled: activeTab === 'artists' && !!keyword,
  });

  const isLoading =
    (activeTab === 'discover' && discoverQuery.isLoading) ||
    (activeTab === 'ticketmaster' && tmEventsQuery.isLoading) ||
    (activeTab === 'venues' && venuesQuery.isLoading) ||
    (activeTab === 'artists' && attractionsQuery.isLoading);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Discover <span className="text-red-500">Events</span>
          </h1>
          <p className="text-zinc-400 mt-2">
            Find local events and browse Ticketmaster listings near you
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search events, artists, venues…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="City"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full sm:w-44 pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors',
              showFilters
                ? 'bg-zinc-800 border-red-500 text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white',
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex flex-wrap gap-3 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="self-end px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  <X className="w-3 h-3 inline mr-1" />
                  Clear dates
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto border-b border-zinc-800 pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(0);
                }}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px',
                  activeTab === tab.key
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300',
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'discover' ? (
          <>
            {!keyword && (
              <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-lg font-medium text-zinc-300">Search to discover events</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Find local events and Ticketmaster listings combined
                </p>
              </div>
            )}
            {keyword && discoverQuery.data && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-zinc-400">
                    {discoverQuery.data.pagination.total} results
                    {discoverQuery.data.sources && (
                      <span className="text-zinc-600">
                        {' '}
                        · {discoverQuery.data.sources.local} local, {discoverQuery.data.sources.ticketmaster} Ticketmaster
                      </span>
                    )}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {discoverQuery.data.events.map((event: any) => (
                    <LocalEventCard key={event.id} event={event} />
                  ))}
                </div>
                {discoverQuery.data.events.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-zinc-400">No events found for "{keyword}"</p>
                  </div>
                )}
              </>
            )}
          </>
        ) : activeTab === 'ticketmaster' ? (
          <>
            {!keyword ? (
              <div className="text-center py-16">
                <Globe className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-lg font-medium text-zinc-300">Search Ticketmaster Events</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Enter a keyword to search millions of events
                </p>
              </div>
            ) : tmEventsQuery.data ? (
              <>
                <p className="text-sm text-zinc-400 mb-4">
                  {tmEventsQuery.data.pagination.total} results from Ticketmaster
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tmEventsQuery.data.events.map((event) => (
                    <TMEventCard key={event.id} event={event} />
                  ))}
                </div>
                {tmEventsQuery.data.events.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-zinc-400">No Ticketmaster events found for "{keyword}"</p>
                  </div>
                )}
                {/* Pagination */}
                {tmEventsQuery.data.pagination.totalPages &&
                  tmEventsQuery.data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-2 bg-zinc-900 rounded-lg disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-zinc-400">
                        Page {page + 1} of {tmEventsQuery.data.pagination.totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setPage((p) =>
                            Math.min(tmEventsQuery.data!.pagination.totalPages! - 1, p + 1),
                          )
                        }
                        disabled={page >= (tmEventsQuery.data.pagination.totalPages ?? 1) - 1}
                        className="p-2 bg-zinc-900 rounded-lg disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
              </>
            ) : null}
          </>
        ) : activeTab === 'venues' ? (
          <>
            {!keyword ? (
              <div className="text-center py-16">
                <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-lg font-medium text-zinc-300">Search Venues</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Find event venues near you
                </p>
              </div>
            ) : venuesQuery.data ? (
              <>
                <p className="text-sm text-zinc-400 mb-4">
                  {venuesQuery.data.pagination.total} venues found
                </p>
                <div className="space-y-3">
                  {venuesQuery.data.venues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>
                {venuesQuery.data.venues.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-zinc-400">No venues found for "{keyword}"</p>
                  </div>
                )}
              </>
            ) : null}
          </>
        ) : (
          /* artists tab */
          <>
            {!keyword ? (
              <div className="text-center py-16">
                <Music className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-lg font-medium text-zinc-300">Search Artists & Attractions</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Find your favorite artists and performers
                </p>
              </div>
            ) : attractionsQuery.data ? (
              <>
                <p className="text-sm text-zinc-400 mb-4">
                  {attractionsQuery.data.pagination.total} artists found
                </p>
                <div className="space-y-3">
                  {attractionsQuery.data.attractions.map((a) => (
                    <AttractionCard key={a.id} attraction={a} />
                  ))}
                </div>
                {attractionsQuery.data.attractions.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-zinc-400">No artists found for "{keyword}"</p>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

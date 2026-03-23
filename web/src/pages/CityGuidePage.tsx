import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Clock3,
  Compass,
  ExternalLink,
  Footprints,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  Route,
  Sparkles,
  Store,
  Ticket,
  CalendarDays,
} from 'lucide-react';
import {
  type AiCityGuideItineraryResponse,
  type AiCityGuideRecommendation,
  useAiCityGuideFollowUp,
  useAiCityGuideItinerary,
  useAiCityGuideRecommend,
} from '@/hooks/useAi';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';

const QUICK_INTENTS = [
  'Coffee and a place to work for an hour',
  'A fun date-night stop nearby',
  'The best thing to do this evening',
  'A quick budget-friendly bite',
  'Something lively with a deal right now',
];

const PREFERENCE_OPTIONS = [
  'outdoor seating',
  'happy hour',
  'quiet vibe',
  'family-friendly',
  'live music',
  'walking distance',
  'desserts',
  'late night',
];

const TIME_OPTIONS = ['morning', 'afternoon', 'evening', 'night'];

function formatGeneratedAt(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getItemIcon(type: AiCityGuideRecommendation['type']) {
  if (type === 'deal') return Ticket;
  if (type === 'event') return CalendarDays;
  return Store;
}

function getPrimaryHref(item: AiCityGuideRecommendation) {
  if ('dealId' in item.details) return `/deals/${item.details.dealId}`;
  if ('eventId' in item.details) return `/events/${item.details.eventId}`;
  return null;
}

function RecommendationCard({ item }: { item: AiCityGuideRecommendation }) {
  const Icon = getItemIcon(item.type);
  const primaryHref = getPrimaryHref(item);

  return (
    <article className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0f172a] text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-lg font-black text-[#111827]">
                {item.title}
              </h3>
              <span className="rounded-full bg-[#fef2f2] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b91c1c]">
                {item.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
          </div>
        </div>
        <a
          href={item.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c]"
        >
          Map
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-500">
        <span className="rounded-full bg-neutral-100 px-3 py-1.5">{formatDistance(item.distanceKm)}</span>
        <span className="rounded-full bg-neutral-100 px-3 py-1.5">
          <Footprints className="mr-1 inline h-3.5 w-3.5" />
          {item.eta.walkingMinutes} min walk
        </span>
        <span className="rounded-full bg-neutral-100 px-3 py-1.5">
          <Car className="mr-1 inline h-3.5 w-3.5" />
          {item.eta.drivingMinutes} min drive
        </span>
        {item.city && <span className="rounded-full bg-neutral-100 px-3 py-1.5">{item.city}</span>}
      </div>

      <div className="mt-4 rounded-2xl bg-[#fff7ed] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a3412]">Why now</p>
        <p className="mt-1 text-sm text-[#7c2d12]">{item.reason}</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Best for</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.bestFor.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-medium text-[#1d4ed8]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Insider tip</p>
          <p className="mt-2 text-sm text-neutral-600">{item.insiderTip}</p>
        </div>
      </div>

      {'offerDisplay' in item.details && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
            {item.details.offerDisplay}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
            Ends {formatDateTime(item.details.endsAt)}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
            {item.details.merchantName}
          </span>
        </div>
      )}

      {'vibeTags' in item.details && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {item.details.vibeTags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
              {tag}
            </span>
          ))}
          {item.details.activeDealCount > 0 && (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
              {item.details.activeDealCount} live deals
            </span>
          )}
        </div>
      )}

      {'eventType' in item.details && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
            {item.details.eventType}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
            Starts {formatDateTime(item.details.startDate)}
          </span>
          {item.details.venueName && (
            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-neutral-600">
              {item.details.venueName}
            </span>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {primaryHref && (
          <Link
            to={primaryHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f2937]"
          >
            Open details
          </Link>
        )}
        <a
          href={item.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c]"
        >
          Navigate
          <Navigation className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

function ItineraryPanel({ itinerary }: { itinerary: AiCityGuideItineraryResponse }) {
  return (
    <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-950/5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ecfccb] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#3f6212]">
            <Route className="h-3.5 w-3.5" />
            Day Plan
          </div>
          <h2 className="mt-3 font-heading text-2xl font-black text-[#111827]">Suggested itinerary</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">{itinerary.summary}</p>
        </div>
        <p className="text-xs font-medium text-neutral-400">
          Updated {formatGeneratedAt(itinerary.generatedAt)}
        </p>
      </div>

      {itinerary.tips.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {itinerary.tips.map((tip) => (
            <span
              key={tip}
              className="rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-medium text-[#1d4ed8]"
            >
              {tip}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {itinerary.stops.map((stop, index) => {
          const Icon = getItemIcon(stop.type);

          return (
            <div
              key={`${stop.candidateId}-${index}`}
              className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#111827] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Stop {index + 1}
                    </p>
                    <h3 className="font-heading text-lg font-black text-[#111827]">{stop.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{stop.reason}</p>
                  </div>
                </div>
                <a
                  href={stop.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c]"
                >
                  Open map
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-500">
                <span className="rounded-full bg-white px-3 py-1.5">
                  <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                  {stop.visitWindow}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5">{formatDistance(stop.distanceKm)}</span>
                <span className="rounded-full bg-white px-3 py-1.5">
                  <Footprints className="mr-1 inline h-3.5 w-3.5" />
                  {stop.eta.walkingMinutes} min
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function CityGuidePage() {
  const { toast } = useToast();
  const geo = useGeolocation(true);
  const recommend = useAiCityGuideRecommend();
  const followUp = useAiCityGuideFollowUp();
  const itinerary = useAiCityGuideItinerary();

  const [intent, setIntent] = useState(QUICK_INTENTS[0]);
  const [radiusKm, setRadiusKm] = useState(5);
  const [timeOfDay, setTimeOfDay] = useState('evening');
  const [preferences, setPreferences] = useState<string[]>(['walking distance']);
  const [customPreference, setCustomPreference] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [maxStops, setMaxStops] = useState(3);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');

  useEffect(() => {
    if (geo.location) {
      setLatInput(geo.location.latitude.toFixed(6));
      setLngInput(geo.location.longitude.toFixed(6));
    }
  }, [geo.location]);

  const parsedLat = Number(latInput);
  const parsedLng = Number(lngInput);
  const hasValidLocation = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);
  const activeRecommendations = recommend.data ?? followUp.data;

  const selectedPreferences = useMemo(
    () => preferences.slice(0, 8),
    [preferences],
  );

  const basePayload = useMemo(
    () => ({
      lat: parsedLat,
      lng: parsedLng,
      radiusKm,
      intent: intent.trim(),
      timeOfDay,
      preferences: selectedPreferences,
    }),
    [intent, parsedLat, parsedLng, radiusKm, selectedPreferences, timeOfDay],
  );

  const togglePreference = (value: string) => {
    setPreferences((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value].slice(0, 8),
    );
  };

  const addCustomPreference = () => {
    const value = customPreference.trim();
    if (!value) return;
    setPreferences((current) => Array.from(new Set([...current, value])).slice(0, 8));
    setCustomPreference('');
  };

  const ensureLocation = () => {
    if (!hasValidLocation) {
      toast({
        title: 'Location required',
        description: 'Detect your location or enter latitude and longitude to use City Guide.',
        variant: 'destructive',
      });
      return false;
    }

    if (!intent.trim()) {
      toast({
        title: 'Add a plan',
        description: 'Tell the guide what you are in the mood for first.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleRecommend = async () => {
    if (!ensureLocation()) return;

    try {
      const result = await recommend.mutateAsync(basePayload);
      setFollowUpQuestion(result.followUpQuestion);
    } catch (error) {
      toast({
        title: 'Could not generate recommendations',
        description: error instanceof Error ? error.message : 'Please try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  const handleFollowUp = async () => {
    if (!ensureLocation()) return;
    if (!followUpQuestion.trim()) {
      toast({
        title: 'Add a follow-up question',
        description: 'Ask the guide how you want the results refined.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await followUp.mutateAsync({
        ...basePayload,
        followUpQuestion: followUpQuestion.trim(),
        previousRecommendations:
          activeRecommendations?.recommendations.map((item) => ({
            candidateId: item.candidateId,
            reason: item.reason,
          })) ?? [],
      });
      setFollowUpQuestion(result.followUpQuestion);
    } catch (error) {
      toast({
        title: 'Could not refine recommendations',
        description: error instanceof Error ? error.message : 'Please try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  const handleItinerary = async () => {
    if (!ensureLocation()) return;

    try {
      await itinerary.mutateAsync({
        ...basePayload,
        maxStops,
      });
    } catch (error) {
      toast({
        title: 'Could not build itinerary',
        description: error instanceof Error ? error.message : 'Please try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_32%),linear-gradient(180deg,_#fffaf5_0%,_#ffffff_38%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[36px] border border-[#fed7aa] bg-[#111827] px-6 py-8 text-white shadow-xl shadow-neutral-950/10 sm:px-8 lg:px-10">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(251,146,60,0.35),_transparent_60%)] lg:block" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-100">
                <Sparkles className="h-3.5 w-3.5" />
                AI City Guide
              </div>
              <h1 className="mt-4 max-w-3xl font-heading text-4xl font-black tracking-tight sm:text-5xl">
                Ask where to go next, and get a live plan built around you.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Use your current location, tell Yohop what kind of outing you want, and get nearby deals,
                merchants, and events ranked for right now. Then refine the results or turn them into a short itinerary.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">Live context</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <div className="flex items-start gap-3 rounded-2xl bg-black/10 px-4 py-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-300" />
                  <div>
                    <p className="font-semibold text-white">
                      {geo.location?.city
                        ? `${geo.location.city}${geo.location.state ? `, ${geo.location.state}` : ''}`
                        : 'Location not locked in yet'}
                    </p>
                    <p className="text-xs text-slate-300">
                      {geo.isLoading
                        ? 'Checking your device location...'
                        : geo.error || 'You can auto-detect your spot or enter coordinates manually.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-black/10 px-4 py-3">
                  <Compass className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-300" />
                  <div>
                    <p className="font-semibold text-white">{intent}</p>
                    <p className="text-xs text-slate-300">
                      Radius {radiusKm} km • {timeOfDay} • {selectedPreferences.length || 0} preference
                      {selectedPreferences.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-8">
            <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-950/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Step 1</p>
                  <h2 className="mt-2 font-heading text-2xl font-black text-[#111827]">Set your vibe</h2>
                </div>
                <button
                  type="button"
                  onClick={geo.detect}
                  disabled={geo.isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {geo.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  Detect my location
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[#111827]">Latitude</span>
                  <input
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    placeholder="12.971599"
                    className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#b91c1c] focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[#111827]">Longitude</span>
                  <input
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    placeholder="77.594566"
                    className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#b91c1c] focus:bg-white"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold text-[#111827]">What are you looking for?</span>
                <textarea
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  rows={4}
                  placeholder="Find me a relaxed spot with a good deal and maybe something happening nearby."
                  className="mt-2 w-full rounded-[24px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#b91c1c] focus:bg-white"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_INTENTS.map((quickIntent) => (
                  <button
                    key={quickIntent}
                    type="button"
                    onClick={() => setIntent(quickIntent)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                      intent === quickIntent
                        ? 'bg-[#111827] text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                    )}
                  >
                    {quickIntent}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <label className="block">
                  <span className="text-sm font-semibold text-[#111827]">Time of day</span>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#b91c1c] focus:bg-white"
                  >
                    {TIME_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#111827]">Max itinerary stops</span>
                  <select
                    value={maxStops}
                    onChange={(e) => setMaxStops(Number(e.target.value))}
                    className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#b91c1c] focus:bg-white"
                  >
                    {[2, 3, 4, 5].map((count) => (
                      <option key={count} value={count}>
                        {count} stops
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#111827]">Search radius</span>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                    {radiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="mt-3 w-full accent-[#b91c1c]"
                />
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#111827]">Preferences</span>
                  <span className="text-xs text-neutral-400">Up to 8</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map((option) => {
                    const active = preferences.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => togglePreference(option)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                          active
                            ? 'bg-[#b91c1c] text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                        )}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={customPreference}
                    onChange={(e) => setCustomPreference(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomPreference();
                      }
                    }}
                    placeholder="Add a custom preference"
                    className="flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#b91c1c] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={addCustomPreference}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c]"
                  >
                    Add
                  </button>
                </div>

                {selectedPreferences.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedPreferences.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => togglePreference(item)}
                        className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        {item} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleRecommend}
                  disabled={recommend.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b91c1c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recommend.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Get recommendations
                </button>
                <button
                  type="button"
                  onClick={handleItinerary}
                  disabled={itinerary.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {itinerary.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Route className="h-4 w-4" />}
                  Build itinerary
                </button>
              </div>
            </div>

            {activeRecommendations && (
              <section className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-950/5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Step 2</p>
                    <h2 className="mt-2 font-heading text-2xl font-black text-[#111827]">Recommended next moves</h2>
                    <p className="mt-2 max-w-2xl text-sm text-neutral-600">{activeRecommendations.summary}</p>
                  </div>
                  <p className="text-xs font-medium text-neutral-400">
                    Updated {formatGeneratedAt(activeRecommendations.generatedAt)}
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  {activeRecommendations.recommendations.map((item) => (
                    <RecommendationCard key={item.candidateId} item={item} />
                  ))}
                </div>

                <div className="mt-6 rounded-[28px] border border-neutral-200 bg-neutral-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Step 3</p>
                      <h3 className="mt-2 font-heading text-xl font-black text-[#111827]">Refine the shortlist</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFollowUpQuestion(activeRecommendations.followUpQuestion)}
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Use AI prompt
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-neutral-500">
                    Suggested question: <span className="font-medium text-neutral-700">{activeRecommendations.followUpQuestion}</span>
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <textarea
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      rows={3}
                      placeholder="Which option is best for a quieter place with the shortest walk?"
                      className="flex-1 rounded-[24px] border border-neutral-200 bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#b91c1c]"
                    />
                    <button
                      type="button"
                      onClick={handleFollowUp}
                      disabled={followUp.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {followUp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Refine results
                    </button>
                  </div>
                </div>
              </section>
            )}

            {itinerary.data && <ItineraryPanel itinerary={itinerary.data} />}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-950/5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">How it works</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-sm font-semibold text-[#111827]">1. Start from a real place</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Use GPS or paste coordinates for any part of the city you want to explore.
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-sm font-semibold text-[#111827]">2. Ask for an outing</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Describe the mood, budget, or timing, then let AI rank nearby merchants, deals, and events.
                  </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-sm font-semibold text-[#111827]">3. Tighten the plan</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Ask follow-up questions or generate a short route to turn the shortlist into a real plan.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#fed7aa] bg-[#fff7ed] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c2410c]">Good prompts</p>
              <div className="mt-4 space-y-3">
                {[
                  'Find me the shortest walk to a strong live deal.',
                  'I want somewhere relaxed with good desserts.',
                  'Build me a 3-stop evening plan near this area.',
                  'Which pick is best if I only have 45 minutes?',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setFollowUpQuestion(prompt)}
                    className="w-full rounded-2xl border border-[#fdba74] bg-white px-4 py-3 text-left text-sm font-medium text-[#7c2d12] transition hover:border-[#fb923c]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm shadow-neutral-950/5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Access</p>
              <h3 className="mt-2 font-heading text-xl font-black text-[#111827]">This page uses authenticated AI endpoints</h3>
              <p className="mt-2 text-sm text-neutral-500">
                You are already inside the protected experience, so recommendations are personalized from your account context and nearby live inventory.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={PATHS.ALL_DEALS}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c]"
                >
                  Browse deals
                </Link>
                <Link
                  to={PATHS.DISCOVER_EVENTS}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-[#b91c1c]/30 hover:text-[#b91c1c]"
                >
                  Explore events
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

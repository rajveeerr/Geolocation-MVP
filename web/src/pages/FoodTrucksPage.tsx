import { useEffect, useMemo, useState } from 'react';
import { Loader2, Navigation, Truck } from 'lucide-react';
import { useNearbyTrucks } from '@/hooks/useTruckSchedule';
import { TruckMap } from '@/components/food-trucks/TruckMap';
import { TruckListCard } from '@/components/food-trucks/TruckListCard';
import { TruckEmptyState } from '@/components/food-trucks/TruckEmptyState';
import { cn } from '@/lib/utils';
import type { TruckSummary } from '@/types/truckSchedule';

const RADIUS_OPTIONS = [
  { label: '5 mi', value: 5 },
  { label: '10 mi', value: 10 },
  { label: '25 mi', value: 25 },
];

type ViewMode = 'list' | 'map';

const FALLBACK_LOCATION = { lat: 40.7128, lng: -74.006 };

export const FoodTrucksPage = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [radius, setRadius] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [highlightedTruckId, setHighlightedTruckId] = useState<number | null>(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setUserLocation(FALLBACK_LOCATION);
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
        setIsLocating(false);
      },
      () => {
        setLocationError("Couldn't get your location — showing trucks near a default area.");
        setUserLocation(FALLBACK_LOCATION);
        setIsLocating(false);
      },
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const { data, isLoading, error } = useNearbyTrucks(
    userLocation?.lat ?? null,
    userLocation?.lng ?? null,
    radius,
  );

  const liveNow = data?.liveNow ?? [];
  const upcoming = data?.upcoming ?? [];

  const allTrucksForMap = useMemo<TruckSummary[]>(
    () => [...liveNow, ...upcoming],
    [liveNow, upcoming],
  );

  const handleSelectTruck = (truck: TruckSummary) => {
    const el = document.getElementById(`truck-${truck.storeId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedTruckId(truck.storeId);
      setTimeout(() => setHighlightedTruckId(null), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-gradient-to-br from-amber-50 via-white to-white">
        <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex items-center gap-2 text-amber-700">
            <Truck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Food trucks near you</span>
          </div>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Where the good food parks today
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Live and upcoming food trucks around you. Tap a truck to see its schedule and current stop.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 disabled:opacity-60"
            >
              {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {userLocation ? 'Refresh my location' : 'Detect my location'}
            </button>

            <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRadius(opt.value)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition',
                    radius === opt.value
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 lg:hidden">
              {(['list', 'map'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium capitalize transition',
                    viewMode === mode
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100',
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {locationError && (
            <p className="mt-3 text-xs text-amber-700">{locationError}</p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {(error as Error).message}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            {/* List */}
            <div className={cn('space-y-4', viewMode === 'map' ? 'hidden lg:block' : '')}>
              {liveNow.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Live now ({liveNow.length})
                  </h2>
                  <div className="space-y-2">
                    {liveNow.map((t) => (
                      <TruckListCard
                        key={t.storeId}
                        truck={t}
                        isHighlighted={highlightedTruckId === t.storeId}
                        onHover={setHighlightedTruckId}
                        onClick={handleSelectTruck}
                      />
                    ))}
                  </div>
                </div>
              )}

              {liveNow.length === 0 && upcoming.length === 0 && (
                <TruckEmptyState onSelectTruck={handleSelectTruck} />
              )}

              {liveNow.length === 0 && upcoming.length > 0 && (
                <TruckEmptyState upcoming={upcoming} onSelectTruck={handleSelectTruck} />
              )}

              {liveNow.length > 0 && upcoming.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Coming up next
                  </h2>
                  <div className="space-y-2">
                    {upcoming.map((t) => (
                      <TruckListCard
                        key={t.storeId}
                        truck={t}
                        isHighlighted={highlightedTruckId === t.storeId}
                        onHover={setHighlightedTruckId}
                        onClick={handleSelectTruck}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div
              className={cn(
                'relative h-[60vh] min-h-[420px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]',
                viewMode === 'list' ? 'hidden lg:block' : '',
              )}
            >
              <TruckMap
                trucks={allTrucksForMap}
                userLocation={userLocation}
                highlightedTruckId={highlightedTruckId}
                onSelectTruck={handleSelectTruck}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default FoodTrucksPage;

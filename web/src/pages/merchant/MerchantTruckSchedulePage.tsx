import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { TruckBadge } from '@/components/common/TruckBadge';
import { TruckScheduleSection } from '@/components/merchant/truck-schedule/TruckScheduleSection';
import { PATHS } from '@/routing/paths';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import { useCurrentTruckStop } from '@/hooks/useTruckSchedule';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

function MerchantTruckScheduleContent() {
  const { storeId: storeIdParam } = useParams<{ storeId: string }>();
  const storeId = Number(storeIdParam);
  const { data: storesData, isLoading: storesLoading } = useMerchantStores();
  const store = storesData?.stores.find((s) => s.id === storeId);
  const { data: scheduleStatus } = useCurrentTruckStop(
    store?.isFoodTruck ? storeId : null,
  );

  if (storesLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="mx-auto max-w-screen-md px-4 py-8 text-center">
        <h2 className="text-lg font-semibold text-neutral-900">Truck not found</h2>
        <p className="mt-2 text-sm text-neutral-500">This store doesn't belong to your account, or it was removed.</p>
        <Link to={PATHS.MERCHANT_TRUCKS} className="mt-4 inline-block text-sm font-medium text-brand-primary-600 hover:underline">
          Back to food trucks
        </Link>
      </div>
    );
  }

  const current = scheduleStatus?.current ?? null;
  const next = scheduleStatus?.next ?? null;

  return (
    <div className="mx-auto max-w-screen-md space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      <div>
        <Link
          to={PATHS.MERCHANT_TRUCKS}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All food trucks
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-[1.6rem] font-semibold tracking-tight text-neutral-900">
            {store.businessName || store.address}
          </h1>
          {store.isFoodTruck && (
            <TruckBadge size="sm" variant={current ? 'live' : 'default'} label={current ? 'Live now' : 'Food truck'} />
          )}
        </div>
        <p className="mt-1 text-sm text-neutral-500">{store.address}</p>
      </div>

      {store.isFoodTruck && (current || next) && (
        <div className={panelClass}>
          <div className="grid divide-y divide-neutral-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Live now</p>
              {current ? (
                <>
                  <p className="mt-2 flex items-start gap-2 text-sm font-medium text-neutral-900">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {current.address}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Until {new Date(current.endsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">Not at a stop right now.</p>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Next stop</p>
              {next ? (
                <>
                  <p className="mt-2 flex items-start gap-2 text-sm font-medium text-neutral-900">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                    {next.address}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(next.startsAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">No upcoming stops.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <TruckScheduleSection storeId={storeId} isFoodTruck={!!store.isFoodTruck} />

      {!store.isFoodTruck && (
        <div className={`${panelClass} border-amber-200 bg-amber-50 p-5 text-sm text-amber-800`}>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">Mark this store as a food truck to enable scheduling.</p>
              <p className="mt-1 text-xs text-amber-700">
                Edit the store and toggle "Food truck or mobile venue".
              </p>
              <Link
                to={PATHS.MERCHANT_STORES_EDIT.replace(':storeId', String(storeId))}
                className="mt-2 inline-block text-xs font-medium text-amber-900 underline"
              >
                Edit store
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const MerchantTruckSchedulePage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage food trucks.">
    <MerchantTruckScheduleContent />
  </MerchantProtectedRoute>
);

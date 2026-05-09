import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, MapPin, Plus, Truck } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { TruckBadge } from '@/components/common/TruckBadge';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import {
  useMerchantTrucksOverview,
  type MerchantTruckOverviewItem,
} from '@/hooks/useTruckSchedule';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
};

function TruckRow({ truck }: { truck: MerchantTruckOverviewItem }) {
  const editPath = PATHS.MERCHANT_TRUCK_SCHEDULE.replace(':storeId', String(truck.id));
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'p-5')}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-neutral-900">
              {truck.businessName || truck.address}
            </h3>
            <TruckBadge size="xs" variant={truck.currentStop ? 'live' : 'default'} label={truck.currentStop ? 'Live now' : 'Food truck'} />
          </div>

          {truck.currentStop ? (
            <div className="flex items-start gap-2 text-sm text-emerald-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div className="min-w-0">
                <p className="truncate font-medium">{truck.currentStop.address}</p>
                <p className="text-xs text-emerald-600">
                  Until {new Date(truck.currentStop.endsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ) : truck.nextStop ? (
            <div className="flex items-start gap-2 text-sm text-neutral-600">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-neutral-400">Next stop</p>
                <p className="truncate text-sm font-medium text-neutral-900">{truck.nextStop.address}</p>
                <p className="text-xs text-neutral-500">{formatDateTime(truck.nextStop.startsAt)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm text-neutral-500">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
              <p>No stops scheduled. Add one so customers can find you.</p>
            </div>
          )}

          {truck.upcomingStopCount > 0 && (
            <p className="text-xs text-neutral-500">
              {truck.upcomingStopCount} upcoming {truck.upcomingStopCount === 1 ? 'stop' : 'stops'}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link to={editPath}>
            <Button size="sm" variant="secondary" className="rounded-full">
              Manage schedule
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function MerchantTrucksContent() {
  const { data, isLoading, error } = useMerchantTrucksOverview();
  const trucks = data?.trucks ?? [];

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Commerce</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">Food trucks</h1>
          <p className="mt-2 max-w-xl text-[13px] text-neutral-500 sm:text-sm">
            Post upcoming stops so customers can see where you'll be. Each stop appears on the food trucks page and on any deals for this truck.
          </p>
        </div>
        <Link to={PATHS.MERCHANT_TRUCKS_CREATE}>
          <Button size="md" variant="secondary" className="rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            Add a truck
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className={cn(panelClass, 'border-rose-200 bg-rose-50 p-4 text-sm text-rose-700')}>
          {(error as Error).message}
        </div>
      ) : trucks.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <Truck className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No food trucks yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            Add your first truck — it takes about a minute, and you can post your opening stop in the same flow.
          </p>
          <div className="mt-5">
            <Link to={PATHS.MERCHANT_TRUCKS_CREATE}>
              <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
                <Plus className="mr-2 h-4 w-4" />
                Add a truck
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {trucks.map((truck) => (
            <TruckRow key={truck.id} truck={truck} />
          ))}
        </div>
      )}
    </div>
  );
}

export const MerchantTrucksPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage food trucks.">
    <MerchantTrucksContent />
  </MerchantProtectedRoute>
);

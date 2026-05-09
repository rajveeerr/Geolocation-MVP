import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Truck } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { useCreateStore } from '@/hooks/useMerchantStores';
import { useWhitelistedCities } from '@/hooks/useWhitelistedCities';
import { apiPost } from '@/services/api';
import {
  TruckStopFields,
  combineDateAndTime,
  initialStopFields,
  type TruckStopFieldsValue,
} from '@/components/merchant/truck-schedule/TruckStopFields';
import type { CreateTruckStopPayload, ScheduledStop } from '@/types/truckSchedule';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

function MerchantTruckCreateInner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createStore = useCreateStore();
  const { data: citiesData, isLoading: citiesLoading } = useWhitelistedCities();
  const cities = citiesData?.cities ?? [];

  const [cityId, setCityId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [includeFirstStop, setIncludeFirstStop] = useState(false);
  const [stopForm, setStopForm] = useState<TruckStopFieldsValue>(() => initialStopFields(null));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCity = useMemo(() => cities.find((c) => c.id === cityId) ?? null, [cities, cityId]);

  const validateFirstStop = (): { ok: true; payload: CreateTruckStopPayload } | { ok: false; error: string } => {
    if (!stopForm.address || stopForm.latitude == null || stopForm.longitude == null) {
      return { ok: false, error: 'Pick an address for your first stop, or uncheck "Post my first stop now".' };
    }
    const startsAt = combineDateAndTime(stopForm.date, stopForm.startTime);
    const endsAt = combineDateAndTime(stopForm.date, stopForm.endTime);
    if (!startsAt || !endsAt) return { ok: false, error: 'Pick a valid date and time window for your first stop.' };
    if (new Date(startsAt) >= new Date(endsAt)) return { ok: false, error: 'First stop end time must be after start time.' };
    return {
      ok: true,
      payload: {
        startsAt,
        endsAt,
        latitude: stopForm.latitude,
        longitude: stopForm.longitude,
        address: stopForm.address,
        notes: stopForm.notes.trim() ? stopForm.notes.trim() : null,
      },
    };
  };

  const handleSubmit = async () => {
    if (!selectedCity) {
      toast({ title: 'Pick a home city', description: 'Customers will see your truck in this city by default.', variant: 'destructive' });
      return;
    }

    let firstStopPayload: CreateTruckStopPayload | null = null;
    if (includeFirstStop) {
      const validated = validateFirstStop();
      if (!validated.ok) {
        toast({ title: 'Check the first stop', description: validated.error, variant: 'destructive' });
        return;
      }
      firstStopPayload = validated.payload;
    }

    setIsSubmitting(true);
    try {
      // If posting a first stop, seed the store's address/coords from the stop so
      // the registered location is meaningful rather than a generic city placeholder.
      const storeAddress = firstStopPayload?.address ?? `${selectedCity.name}, ${selectedCity.state} (mobile)`;
      const storeLat = firstStopPayload?.latitude ?? null;
      const storeLng = firstStopPayload?.longitude ?? null;

      const created = await createStore.mutateAsync({
        address: storeAddress,
        cityId: selectedCity.id,
        latitude: storeLat,
        longitude: storeLng,
        active: true,
        description: description.trim() || null,
        isFoodTruck: true,
      });

      const newStoreId = created.store.id;

      if (firstStopPayload) {
        const stopRes = await apiPost<{ stop: ScheduledStop }, CreateTruckStopPayload>(
          `/merchants/stores/${newStoreId}/schedule`,
          firstStopPayload,
        );
        if (!stopRes.success) {
          // Truck was created but the first stop failed — let the merchant know
          // and still drop them on the schedule page so they can retry.
          toast({
            title: 'Truck saved, first stop failed',
            description: stopRes.error ?? 'You can post the first stop from the schedule page.',
            variant: 'destructive',
          });
        }
      }

      toast({
        title: 'Truck created',
        description: firstStopPayload ? 'Your first stop is live.' : 'Add stops anytime from the schedule.',
      });
      navigate(PATHS.MERCHANT_TRUCK_SCHEDULE.replace(':storeId', String(newStoreId)));
    } catch (err) {
      // useCreateStore already shows a toast on error; nothing to add.
      console.error('Truck create failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-2 py-4">
      <Link
        to={PATHS.MERCHANT_TRUCKS}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back to food trucks
      </Link>

      <div className={`${panelClass} mt-4 p-6`}>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <Truck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Add a food truck</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Trucks move around — instead of fixed hours, you'll post stops. Customers see live and upcoming stops on the food trucks page.
            </p>
          </div>
        </div>

        {/* Section 1: About */}
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">About this truck</h2>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="truck-city" className="text-sm font-medium text-neutral-700">
                Home city <span className="text-red-500">*</span>
              </Label>
              <p className="mt-0.5 text-xs text-neutral-500">
                Used as the default map area when no stop is live.
              </p>
              <select
                id="truck-city"
                value={cityId ?? ''}
                onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : null)}
                disabled={citiesLoading}
                className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:border-brand-primary-400 focus:outline-none focus:ring-2 focus:ring-brand-primary-100 disabled:opacity-60"
              >
                <option value="">{citiesLoading ? 'Loading cities...' : 'Select a city'}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="truck-description" className="text-sm font-medium text-neutral-700">
                Description <span className="text-xs font-normal text-neutral-500">(optional)</span>
              </Label>
              <Textarea
                id="truck-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of food do you serve? Anything customers should know?"
                rows={3}
                maxLength={400}
                className="mt-2 resize-none rounded-xl border-neutral-200"
              />
            </div>
          </div>
        </section>

        {/* Section 2: First stop (optional) */}
        <section className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Post your first stop now</h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Optional — you can also do this later from the schedule page.
              </p>
            </div>
            <Switch
              checked={includeFirstStop}
              onCheckedChange={setIncludeFirstStop}
              aria-label="Post my first stop now"
            />
          </div>

          {includeFirstStop && (
            <div className="mt-5 border-t border-neutral-200 pt-5">
              <TruckStopFields value={stopForm} onChange={setStopForm} />
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
          <Link to={PATHS.MERCHANT_TRUCKS} className="sm:order-1">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              className="w-full rounded-full px-6 sm:w-auto"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCity}
            className="w-full rounded-full px-6 sm:order-2 sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save truck
          </Button>
        </div>
      </div>
    </div>
  );
}

export const MerchantTruckCreatePage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can create food trucks.">
    <MerchantTruckCreateInner />
  </MerchantProtectedRoute>
);

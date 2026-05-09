import { useMemo, useState } from 'react';
import { Calendar, Loader2, Plus, Truck } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { TruckStopCard } from './TruckStopCard';
import { TruckStopForm } from './TruckStopForm';
import {
  useCreateTruckStop,
  useDeleteTruckStop,
  useTruckSchedule,
  useUpdateTruckStop,
} from '@/hooks/useTruckSchedule';
import type {
  CreateTruckStopPayload,
  ScheduledStop,
  UpdateTruckStopPayload,
} from '@/types/truckSchedule';
import { cn } from '@/lib/utils';

interface TruckScheduleSectionProps {
  storeId: number;
  /** When false, render a hint card explaining how to enable schedule. */
  isFoodTruck: boolean;
}

const partitionStops = (stops: ScheduledStop[]) => {
  const upcoming: ScheduledStop[] = [];
  const past: ScheduledStop[] = [];
  for (const s of stops) {
    if (s.status === 'COMPLETED' || s.status === 'CANCELLED') {
      past.push(s);
    } else {
      upcoming.push(s);
    }
  }
  upcoming.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  past.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  return { upcoming, past };
};

export const TruckScheduleSection = ({ storeId, isFoodTruck }: TruckScheduleSectionProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<ScheduledStop | null>(null);

  const { data, isLoading, error } = useTruckSchedule(isFoodTruck ? storeId : null);
  const createStop = useCreateTruckStop(storeId);
  const updateStop = useUpdateTruckStop(storeId);
  const deleteStop = useDeleteTruckStop(storeId);

  const { upcoming, past } = useMemo(
    () => partitionStops(data?.stops ?? []),
    [data?.stops],
  );

  if (!isFoodTruck) {
    return (
      <section className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Truck className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-neutral-900">This store isn't marked as a food truck</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Turn on "Food truck or mobile venue" in store settings to start posting stops.
        </p>
      </section>
    );
  }

  const handleEdit = (stop: ScheduledStop) => {
    setEditingStop(stop);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingStop(null);
    setFormOpen(true);
  };

  const handleDelete = (stop: ScheduledStop) => {
    if (!confirm(`Remove the stop on ${new Date(stop.startsAt).toLocaleDateString()}?`)) return;
    deleteStop.mutate(stop.id);
  };

  const handleSubmit = async (payload: CreateTruckStopPayload | UpdateTruckStopPayload) => {
    if (editingStop) {
      await updateStop.mutateAsync({ stopId: editingStop.id, payload });
    } else {
      await createStop.mutateAsync(payload as CreateTruckStopPayload);
    }
    setFormOpen(false);
    setEditingStop(null);
  };

  const isSubmitting = createStop.isPending || updateStop.isPending;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Upcoming stops</h2>
          <p className="text-xs text-neutral-500">
            Customers see live and upcoming stops on the food trucks page.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAdd}
          className="rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add stop
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-neutral-200 bg-white py-10">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {(error as Error).message}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/60 p-8 text-center">
          <Calendar className="mx-auto h-8 w-8 text-neutral-300" aria-hidden />
          <h3 className="mt-3 text-sm font-semibold text-neutral-900">No upcoming stops</h3>
          <p className="mt-1 text-xs text-neutral-500">Add your first stop so customers know where to find you.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((stop) => (
            <TruckStopCard key={stop.id} stop={stop} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <details className={cn('group rounded-2xl border border-neutral-200 bg-neutral-50/40 px-4 py-3')}>
          <summary className="cursor-pointer list-none text-xs font-medium text-neutral-600 group-open:mb-3">
            Past stops ({past.length})
          </summary>
          <div className="space-y-2">
            {past.slice(0, 10).map((stop) => (
              <TruckStopCard key={stop.id} stop={stop} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        </details>
      )}

      <TruckStopForm
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditingStop(null);
        }}
        initialStop={editingStop}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

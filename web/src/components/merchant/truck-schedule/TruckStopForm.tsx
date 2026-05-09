import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import {
  TruckStopFields,
  initialStopFields,
  combineDateAndTime,
  type TruckStopFieldsValue,
} from './TruckStopFields';
import type {
  CreateTruckStopPayload,
  ScheduledStop,
  UpdateTruckStopPayload,
} from '@/types/truckSchedule';

interface TruckStopFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStop?: ScheduledStop | null;
  isSubmitting?: boolean;
  onSubmit: (payload: CreateTruckStopPayload | UpdateTruckStopPayload) => Promise<void> | void;
}

export const TruckStopForm = ({
  open,
  onOpenChange,
  initialStop,
  isSubmitting,
  onSubmit,
}: TruckStopFormProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState<TruckStopFieldsValue>(() => initialStopFields(initialStop));

  useEffect(() => {
    if (open) {
      setForm(initialStopFields(initialStop));
    }
  }, [open, initialStop]);

  const handleSubmit = async () => {
    if (!form.address || form.latitude == null || form.longitude == null) {
      toast({ title: 'Pick an address', description: 'Search for or pin the stop on the map.', variant: 'destructive' });
      return;
    }
    const startsAt = combineDateAndTime(form.date, form.startTime);
    const endsAt = combineDateAndTime(form.date, form.endTime);
    if (!startsAt || !endsAt) {
      toast({ title: 'Pick a valid date and time window', variant: 'destructive' });
      return;
    }
    if (new Date(startsAt) >= new Date(endsAt)) {
      toast({ title: 'End time must be after start time', variant: 'destructive' });
      return;
    }

    const payload: CreateTruckStopPayload = {
      startsAt,
      endsAt,
      latitude: form.latitude,
      longitude: form.longitude,
      address: form.address,
      notes: form.notes.trim() ? form.notes.trim() : null,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialStop ? 'Edit stop' : 'Add a stop'}</DialogTitle>
          <DialogDescription>
            Tell customers where the truck will be and when. They'll see this on the food trucks page.
          </DialogDescription>
        </DialogHeader>

        <TruckStopFields value={form} onChange={setForm} />

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-full px-5"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full px-5"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {initialStop ? 'Save changes' : 'Add stop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

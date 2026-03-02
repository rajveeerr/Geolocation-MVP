/**
 * "What's this location called?" - One focused question, Airbnb style.
 */
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';

interface StoreNameStepProps {
  data: { businessName: string };
  onUpdate: (data: { businessName: string }) => void;
}

export const StoreNameStep = ({ data, onUpdate }: StoreNameStepProps) => (
  <div className="mx-auto max-w-xl space-y-8">
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">What&apos;s this location called?</h2>
      <p className="mt-2 text-neutral-600">
        This is how customers will find you. You can change this later.
      </p>
    </div>
    <div className="space-y-2">
      <Label htmlFor="businessName" className="sr-only">
        Location name
      </Label>
      <div className="relative">
        <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <Input
          id="businessName"
          placeholder="e.g. Downtown Café, Main Street Outlet"
          value={data.businessName}
          onChange={(e) => onUpdate({ businessName: e.target.value })}
          className="h-14 pl-12 text-lg"
          autoFocus
        />
      </div>
    </div>
  </div>
);

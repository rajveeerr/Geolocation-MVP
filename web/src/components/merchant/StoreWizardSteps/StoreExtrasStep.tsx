import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Truck } from 'lucide-react';

interface StoreExtrasStepProps {
  data: { isFoodTruck?: boolean; description?: string };
  onUpdate: (data: Partial<{ isFoodTruck: boolean; description: string }>) => void;
}

export const StoreExtrasStep = ({ data, onUpdate }: StoreExtrasStepProps) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Anything else customers should know?</h2>
      <p className="mt-2 text-muted-foreground">Optional. Help customers understand what makes this location special.</p>
    </div>
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
            <Truck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Food truck or mobile venue</p>
            <p className="text-sm text-muted-foreground">Does this location move? (e.g. pop-up, food truck)</p>
          </div>
        </div>
        <Switch checked={data.isFoodTruck ?? false} onCheckedChange={(v) => onUpdate({ isFoodTruck: v })} />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="description" className="text-sm font-medium text-foreground">Short description</Label>
      <textarea id="description" placeholder="Tell customers about this location..." rows={4} value={data.description || ''} onChange={(e) => onUpdate({ description: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary-500" />
    </div>
  </div>
);

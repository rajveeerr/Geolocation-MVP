import { Wifi, Car, Utensils, CreditCard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi, description: 'Complimentary internet access' },
  { id: 'parking', label: 'Parking Available', icon: Car, description: 'Customer parking spaces' },
  { id: 'dining', label: 'Dine-in', icon: Utensils, description: 'Indoor seating available' },
  { id: 'card_payment', label: 'Card Payments', icon: CreditCard, description: 'Credit/debit accepted' },
  { id: 'group_friendly', label: 'Group Friendly', icon: Users, description: 'Accommodates large groups' },
];

interface StoreFeaturesStepProps {
  data: { features: string[] };
  onUpdate: (data: { features: string[] }) => void;
}

export const StoreFeaturesStep = ({ data, onUpdate }: StoreFeaturesStepProps) => {
  const toggle = (id: string) => {
    const cur = data.features || [];
    const next = cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id];
    onUpdate({ features: next });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Does this location have any of these?</h2>
        <p className="mt-2 text-neutral-600">Select what customers can expect. You can change this later.</p>
      </div>
      <div className="space-y-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          const checked = (data.features || []).includes(f.id);
          return (
            <button key={f.id} type="button" onClick={() => toggle(f.id)} className={cn('flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all', checked ? 'border-brand-primary-500 bg-brand-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300')}>
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', checked ? 'bg-brand-primary-500 text-white' : 'bg-neutral-100 text-neutral-600')}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900">{f.label}</p>
                <p className="text-sm text-neutral-500">{f.description}</p>
              </div>
              <div className={cn('h-5 w-5 shrink-0 rounded border-2', checked ? 'border-brand-primary-500 bg-brand-primary-500' : 'border-neutral-300')}>
                {checked && <svg className="h-full w-full p-0.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import { Utensils, ShoppingBag, Briefcase, Music2, Heart, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORE_TYPES = [
  { value: 'restaurant', label: 'Restaurant', description: 'Food service establishment', icon: Utensils },
  { value: 'retail', label: 'Retail Store', description: 'Product sales and merchandise', icon: ShoppingBag },
  { value: 'service', label: 'Service Business', description: 'Professional or personal services', icon: Briefcase },
  { value: 'entertainment', label: 'Entertainment', description: 'Recreation and entertainment venue', icon: Music2 },
  { value: 'healthcare', label: 'Healthcare', description: 'Medical and wellness services', icon: Heart },
  { value: 'other', label: 'Other', description: 'Other business type', icon: MoreHorizontal },
];

interface StoreTypeStepProps {
  data: { storeType: string };
  onUpdate: (data: { storeType: string }) => void;
}

export const StoreTypeStep = ({ data, onUpdate }: StoreTypeStepProps) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">Which best describes this place?</h2>
      <p className="mt-2 text-neutral-600">This helps customers find you when they search for deals.</p>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {STORE_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = data.storeType === type.value;
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onUpdate({ storeType: type.value })}
            className={cn(
              'flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all duration-200',
              isSelected ? 'border-brand-primary-500 bg-brand-primary-50 ring-2 ring-brand-primary-500' : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
            )}
          >
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', isSelected ? 'bg-brand-primary-500 text-white' : 'bg-neutral-100 text-neutral-600')}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{type.label}</p>
              <p className="text-sm text-neutral-500">{type.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

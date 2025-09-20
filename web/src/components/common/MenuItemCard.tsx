import type { MenuItem as MenuItemType } from '@/context/HappyHourContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { Check, Plus } from 'lucide-react';

const MenuItemCard = ({
  item,
  isSelected,
  onToggle,
  compact = false,
}: {
  item: MenuItemType;
  isSelected: boolean;
  onToggle: () => void;
  compact?: boolean;
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border p-3 bg-white shadow-sm transition-transform hover:-translate-y-1',
        isSelected ? 'border-brand-primary-500 ring-2 ring-brand-primary-100' : 'border-neutral-200'
      )}
    >
      <img src={item.imageUrl} alt={item.name} className={cn('rounded-lg object-cover', compact ? 'h-12 w-12' : 'h-20 w-20')} />

      <div className="flex-1">
        <p className="font-semibold text-neutral-900">{item.name}</p>
        <p className="text-sm text-neutral-500">${item.price.toFixed(2)}</p>
      </div>

      <div>
        <Button onClick={onToggle} size={compact ? 'sm' : 'md'} variant={isSelected ? 'secondary' : 'primary'}>
          {isSelected ? <><Check className="mr-2 h-4 w-4"/> Selected</> : <><Plus className="mr-2 h-4 w-4"/> Add</>}
        </Button>
      </div>
    </div>
  );
};

export default MenuItemCard;

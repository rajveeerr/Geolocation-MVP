import type { MenuItem as MenuItemType } from '@/context/HappyHourContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { Check, Plus, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

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
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border p-3 bg-white shadow-sm transition-transform hover:-translate-y-1',
        isSelected ? 'border-brand-primary-500 ring-2 ring-brand-primary-100' : 'border-neutral-200'
      )}
    >
      <div className={cn('relative rounded-lg overflow-hidden bg-neutral-100', compact ? 'h-12 w-12' : 'h-20 w-20')}>
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-brand-primary-500"></div>
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <ImageIcon className={cn('text-neutral-400', compact ? 'h-6 w-6' : 'h-8 w-8')} />
          </div>
        ) : (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className={cn('rounded-lg object-cover transition-opacity duration-200', compact ? 'h-12 w-12' : 'h-20 w-20', imageLoading ? 'opacity-0' : 'opacity-100')}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
      </div>

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

import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMerchantStores, type Store } from '@/hooks/useMerchantStores';

interface StoreSelectorProps {
  selectedStoreId: number | null;
  onSelectStore: (storeId: number | null) => void;
  className?: string;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  selectedStoreId,
  onSelectStore,
  className,
}) => {
  const { data: storesData, isLoading, isError } = useMerchantStores();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const stores = storesData?.stores ?? [];
  const selectedStore = stores.find((s: Store) => s.id === selectedStoreId);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('h-[42px] w-56 animate-pulse rounded-xl bg-neutral-200', className)} />
    );
  }

  // Error rendering -> render disabled button
  if (isError) {
    return (
      <div className={cn('relative', className)}>
        <button
          type="button"
          disabled
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 opacity-50 cursor-not-allowed',
            'bg-white border border-neutral-200 shadow-xs',
            'text-sm font-medium text-neutral-700 w-[200px]'
          )}
        >
          <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
          <span className="truncate flex-1 text-left">Unavailable</span>
        </button>
      </div>
    );
  }

  const displayLabel = selectedStore
    ? selectedStore.isFoodTruck
      ? `🚚 ${selectedStore.city?.name ?? selectedStore.address}`
      : selectedStore.address
    : stores.length > 0 
      ? `All Stores (${stores.length})` 
      : 'No stores available';

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-2.5',
          'bg-white border border-neutral-200 shadow-xs',
          'text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all',
          'min-w-[200px] max-w-[320px]'
        )}
      >
        <MapPin className="h-4 w-4 text-brand shrink-0" />
        <span className="truncate flex-1 text-left">{displayLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-1.5 z-50 w-full min-w-[240px]',
            'rounded-xl border border-neutral-200 bg-white shadow-md',
            'py-1.5 overflow-hidden'
          )}
        >
          {/* All stores option */}
          <button
            type="button"
            onClick={() => {
              onSelectStore(null);
              setIsOpen(false);
            }}
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors',
              selectedStoreId === null
                ? 'bg-brand/5 text-brand font-semibold'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            )}
          >
            <MapPin className="h-4 w-4 shrink-0" />
            <span>All Stores</span>
          </button>

          {stores.map((store: Store) => (
            <button
              key={store.id}
              type="button"
              onClick={() => {
                onSelectStore(store.id);
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                selectedStoreId === store.id
                  ? 'bg-brand/5 text-brand font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              <span className="shrink-0">{store.isFoodTruck ? '🚚' : '📍'}</span>
              <span className="truncate">
                {store.isFoodTruck
                  ? `Food Truck — ${store.city?.name ?? 'Unknown'}`
                  : store.address}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

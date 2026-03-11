import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import { MapPin, Truck } from 'lucide-react';

interface StoreSelectorProps {
  selectedStoreId: number | null;
  onStoreChange: (storeId: number) => void;
}

export const StoreSelector = ({ selectedStoreId, onStoreChange }: StoreSelectorProps) => {
  const { data } = useMerchantStores();
  const stores = data?.stores || [];

  if (stores.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-semibold text-neutral-300">Select Food Truck</label>
      <Select
        value={selectedStoreId?.toString() || ''}
        onValueChange={(val) => onStoreChange(Number(val))}
      >
        <SelectTrigger className="w-full rounded-lg border-neutral-700 bg-neutral-900 text-white">
          <SelectValue placeholder="Choose a store..." />
        </SelectTrigger>
        <SelectContent className="border-neutral-700 bg-neutral-900">
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id.toString()} className="text-white hover:bg-neutral-800">
              <span className="flex items-center gap-2">
                {store.isFoodTruck ? (
                  <Truck className="h-4 w-4 text-amber-400" />
                ) : (
                  <MapPin className="h-4 w-4 text-blue-400" />
                )}
                <span>{store.address}</span>
                {store.city && (
                  <span className="text-neutral-400">- {store.city.name}</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

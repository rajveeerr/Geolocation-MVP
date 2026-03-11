import { UtensilsCrossed } from 'lucide-react';
import { useStoreMenuCollections, type ParsedMenuCollection } from '@/hooks/useStoreMenuCollections';
import { MenuCard } from './MenuCard';

interface YourMenusPanelProps {
  storeId: number | null;
  onEditMenu: (collection: ParsedMenuCollection) => void;
}

export const YourMenusPanel = ({ storeId, onEditMenu }: YourMenusPanelProps) => {
  const { collections, isLoading } = useStoreMenuCollections(storeId);

  return (
    <div className="rounded-2xl border border-neutral-700/50 bg-neutral-800/30 p-6">
      <h3 className="mb-4 text-lg font-bold text-white">Your Menus</h3>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-white" />
        </div>
      )}

      {!isLoading && collections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UtensilsCrossed className="mb-3 h-12 w-12 text-neutral-600" />
          <p className="text-neutral-400">No menus created yet</p>
          <p className="text-sm text-neutral-500">Create your first menu on the left</p>
        </div>
      )}

      {!isLoading && collections.length > 0 && (
        <div className="space-y-4">
          {collections.map((collection) => (
            <MenuCard key={collection.id} collection={collection} onEdit={onEditMenu} />
          ))}
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Edit, Trash2, Clock, UtensilsCrossed, Baby, Coffee, IceCream2, Sparkles } from 'lucide-react';
import { useDeleteMenuCollection } from '@/hooks/useMenuCollections';
import { formatTimeDisplay } from './utils';
import type { ParsedMenuCollection } from '@/hooks/useStoreMenuCollections';
import type { MenuType } from './types';

interface MenuCardProps {
  collection: ParsedMenuCollection;
  onEdit: (collection: ParsedMenuCollection) => void;
}

const menuTypeIcons: Record<string, React.ReactNode> = {
  daily: <UtensilsCrossed className="h-5 w-5 text-blue-400" />,
  kids: <Baby className="h-5 w-5 text-pink-400" />,
  drinks: <Coffee className="h-5 w-5 text-amber-400" />,
  desserts: <IceCream2 className="h-5 w-5 text-teal-400" />,
  happy_hour: <Clock className="h-5 w-5 text-orange-400" />,
  special_event: <Sparkles className="h-5 w-5 text-purple-400" />,
};

const menuTypeBgColors: Record<string, string> = {
  daily: 'bg-blue-500/20',
  kids: 'bg-pink-500/20',
  drinks: 'bg-amber-500/20',
  desserts: 'bg-teal-500/20',
  happy_hour: 'bg-orange-500/20',
  special_event: 'bg-purple-500/20',
};

export const MenuCard = ({ collection, onEdit }: MenuCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteCollection = useDeleteMenuCollection();
  const meta = collection.parsedMetadata;
  const menuType = meta?.menuType || 'daily';
  const itemCount = collection._count?.items ?? collection.items?.length ?? 0;

  const handleDelete = async () => {
    await deleteCollection.mutateAsync(collection.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/50 p-4 transition-all hover:border-neutral-600">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${menuTypeBgColors[menuType] || 'bg-neutral-700'}`}>
              {menuTypeIcons[menuType] || <UtensilsCrossed className="h-5 w-5 text-neutral-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white">{collection.name}</h4>
                <Badge variant={collection.isActive ? 'default' : 'secondary'} className={collection.isActive ? 'bg-green-600 text-xs' : 'text-xs'}>
                  {collection.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-neutral-400">{collection.displayDescription}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300" onClick={() => onEdit(collection)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {meta?.menuType === 'happy_hour' && meta.timeStart && meta.timeEnd && (
          <p className="mb-2 text-xs text-neutral-500">
            {formatTimeDisplay(meta.timeStart)} - {formatTimeDisplay(meta.timeEnd)}
          </p>
        )}

        <div className="rounded-lg bg-neutral-900/50 px-3 py-2">
          <p className="text-sm text-neutral-300">Items: {itemCount}</p>
          {itemCount === 0 && (
            <p className="text-xs text-neutral-500">No items added yet</p>
          )}
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="border-neutral-700 bg-neutral-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Menu</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete "{collection.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" className="border-neutral-600 text-neutral-300" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCollection.isPending}>
              {deleteCollection.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

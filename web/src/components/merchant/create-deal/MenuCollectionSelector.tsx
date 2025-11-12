import { useState, useEffect } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { useMenuCollections, useMenuCollection } from '@/hooks/useMenuCollections';
import { Button } from '@/components/common/Button';
import { 
  Package, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Search,
  FolderOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

interface MenuCollectionSelectorProps {
  onCollectionSelect?: (collectionId: number | null, items?: any[]) => void;
}

export const MenuCollectionSelector = ({ onCollectionSelect }: MenuCollectionSelectorProps) => {
  const { state, dispatch } = useDealCreation();
  const { data: collectionsData, isLoading, error } = useMenuCollections();
  const selectedCollectionId = state.menuCollectionId;
  const { data: selectedCollectionData } = useMenuCollection(selectedCollectionId);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const collections = collectionsData?.collections || [];
  const selectedCollection = selectedCollectionData?.collection || collections.find(c => c.id === selectedCollectionId);

  // Filter collections by search term
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // When a collection is selected, load its items
  useEffect(() => {
    if (!onCollectionSelect) return;
    
    if (selectedCollectionId && selectedCollection?.items) {
      const items = selectedCollection.items
        .filter(item => item.isActive)
        .map(item => ({
          id: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
          category: item.menuItem.category,
          description: item.menuItem.description || '',
          imageUrl: item.menuItem.imageUrl || item.menuItem.images?.[0]?.url || '',
          images: item.menuItem.images || [],
          isHidden: false,
          customPrice: item.customPrice,
          customDiscount: item.customDiscount,
          discountAmount: null,
        }));
      onCollectionSelect(selectedCollectionId, items);
    } else if (!selectedCollectionId) {
      onCollectionSelect(null, []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollectionId, selectedCollectionData]);

  const handleSelectCollection = (collectionId: number | null) => {
    dispatch({ type: 'SET_MENU_COLLECTION', collectionId });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    dispatch({ type: 'SET_MENU_COLLECTION', collectionId: null });
    // Items will be cleared via useEffect
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary-600" />
          <span className="text-sm text-neutral-600">Loading collections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Failed to load collections. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-neutral-900">Menu Collection</label>
          <p className="text-xs text-neutral-600 mt-0.5">
            Select a saved collection to add all its items to this deal
          </p>
        </div>
        <Link to={PATHS.MERCHANT_MENU_COLLECTIONS || '/merchant/menu/collections'}>
          <Button variant="secondary" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </Link>
      </div>

      {/* Selected Collection Display */}
      {selectedCollection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border-2 border-brand-primary-200 bg-brand-primary-50 p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-lg bg-brand-primary-100 p-2">
                <Package className="h-5 w-5 text-brand-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-brand-primary-900 truncate">
                  {selectedCollection.name}
                </h4>
                {selectedCollection.description && (
                  <p className="text-sm text-brand-primary-700 mt-1 line-clamp-2">
                    {selectedCollection.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-brand-primary-600">
                  <span>
                    {selectedCollection._count?.items || selectedCollection.items?.length || 0} items
                  </span>
                  {selectedCollection.isActive && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleClearSelection}
              className="ml-3 rounded-md p-1 text-brand-primary-600 hover:bg-brand-primary-100 transition-colors"
              title="Clear selection"
            >
              <span className="text-sm font-medium">Change</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Collection Selector Dropdown */}
      {!selectedCollection && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'w-full rounded-lg border-2 p-4 text-left transition-all',
              isOpen
                ? 'border-brand-primary-500 bg-brand-primary-50 shadow-sm'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'rounded-lg p-2',
                  isOpen ? 'bg-brand-primary-100' : 'bg-neutral-100'
                )}>
                  <Package className={cn(
                    'h-5 w-5',
                    isOpen ? 'text-brand-primary-600' : 'text-neutral-600'
                  )} />
                </div>
                <div>
                  <div className="font-medium text-neutral-900">
                    {collections.length === 0 ? 'No collections available' : 'Select a collection'}
                  </div>
                  <div className="text-xs text-neutral-600 mt-0.5">
                    {collections.length === 0 
                      ? 'Create a collection first to use it here'
                      : `${collections.length} collection${collections.length !== 1 ? 's' : ''} available`
                    }
                  </div>
                </div>
              </div>
              {collections.length > 0 && (
                <div className={cn(
                  'transition-transform',
                  isOpen && 'rotate-180'
                )}>
                  <ChevronDown className="h-5 w-5 text-neutral-500" />
                </div>
              )}
            </div>
          </button>

          <AnimatePresence>
            {isOpen && collections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 mt-2 w-full rounded-lg border border-neutral-200 bg-white shadow-lg"
              >
                {/* Search */}
                <div className="border-b border-neutral-200 p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                      placeholder="Search collections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Collections List */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredCollections.length === 0 ? (
                    <div className="p-6 text-center">
                      <FolderOpen className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                      <p className="text-sm text-neutral-600">
                        {searchTerm ? 'No collections match your search' : 'No collections found'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {filteredCollections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => handleSelectCollection(collection.id)}
                          className={cn(
                            'w-full rounded-lg p-3 text-left transition-all hover:bg-neutral-50',
                            selectedCollectionId === collection.id && 'bg-brand-primary-50'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={cn(
                                'rounded-lg p-1.5 mt-0.5',
                                selectedCollectionId === collection.id
                                  ? 'bg-brand-primary-100'
                                  : 'bg-neutral-100'
                              )}>
                                <Package className={cn(
                                  'h-4 w-4',
                                  selectedCollectionId === collection.id
                                    ? 'text-brand-primary-600'
                                    : 'text-neutral-600'
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-neutral-900 truncate">
                                  {collection.name}
                                </div>
                                {collection.description && (
                                  <p className="text-xs text-neutral-600 mt-0.5 line-clamp-1">
                                    {collection.description}
                                  </p>
                                )}
                                <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-500">
                                  <span>
                                    {collection._count?.items || collection.items?.length || 0} items
                                  </span>
                                  {collection.isActive && (
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium">
                                      Active
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedCollectionId === collection.id && (
                              <div className="ml-2 rounded-full bg-brand-primary-500 p-1">
                                <div className="h-2 w-2 rounded-full bg-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {collections.length > 0 && (
                  <div className="border-t border-neutral-200 p-3 bg-neutral-50">
                    <Link
                      to={PATHS.MERCHANT_MENU_COLLECTIONS || '/merchant/menu/collections'}
                      className="flex items-center justify-center gap-2 text-sm font-medium text-brand-primary-600 hover:text-brand-primary-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Collection
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!isOpen && collections.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
          <Package className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
          <h4 className="font-semibold text-neutral-900 mb-1">No Collections Yet</h4>
          <p className="text-sm text-neutral-600 mb-4">
            Create a menu collection to quickly add multiple items to your deals
          </p>
          <Link to={PATHS.MERCHANT_MENU_COLLECTIONS || '/merchant/menu/collections'}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Collection
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};


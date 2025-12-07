import { useState, useEffect } from 'react';
import { useMenuCollections, useCreateMenuCollection, useDeleteMenuCollection, useUpdateMenuCollection, useAddItemsToCollection, useRemoveItemFromCollection, useMenuCollection, type MenuCollection } from '@/hooks/useMenuCollections';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Package, Pencil, Trash2, X, Loader2, Check, Utensils, Image as ImageIcon, Eye, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollectionFormProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<MenuCollection>;
  onSubmit: (data: { name: string; description?: string }) => Promise<void> | void;
  isSubmitting?: boolean;
}

const CollectionForm = ({ open, onClose, initial, onSubmit, isSubmitting }: CollectionFormProps) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');

  useEffect(() => {
    if (open && initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
    } else if (open && !initial) {
      setName('');
      setDescription('');
    }
  }, [open, initial]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="relative z-50 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">{initial?.id ? 'Edit Collection' : 'New Collection'}</h3>
              <button onClick={onClose} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Happy Hour Menu" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Special drinks and appetizers" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button
                onClick={async () => {
                  await onSubmit({ name: name.trim(), description: description.trim() || undefined });
                  onClose();
                }}
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AddItemsModalProps {
  open: boolean;
  onClose: () => void;
  collection: MenuCollection | null;
}

const AddItemsModal = ({ open, onClose, collection }: AddItemsModalProps) => {
  const { data: menuData } = useMerchantMenu();
  const addItems = useAddItemsToCollection();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const menuItems = menuData?.menuItems || [];
  const collectionItemIds = collection?.items?.map(item => item.menuItemId) || [];
  const availableItems = menuItems.filter(item => !collectionItemIds.includes(item.id));
  
  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!collection || selectedItems.size === 0) return;
    
    const itemsToAdd = Array.from(selectedItems).map((id, index) => ({
      id,
      sortOrder: index,
    }));

    await addItems.mutateAsync({
      collectionId: collection.id,
      menuItems: itemsToAdd,
    });

    setSelectedItems(new Set());
    setSearchTerm('');
    onClose();
  };

  useEffect(() => {
    if (!open) {
      setSelectedItems(new Set());
      setSearchTerm('');
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && collection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="relative z-50 w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 p-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Add Items to {collection.name}</h3>
                <p className="text-sm text-neutral-600 mt-1">Select menu items to add to this collection</p>
              </div>
              <button onClick={onClose} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search menu items..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Utensils className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                    <p className="text-neutral-600">
                      {availableItems.length === 0
                        ? 'All menu items are already in this collection'
                        : 'No items found matching your search'}
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    const displayImages = item.images && item.images.length > 0 
                      ? item.images 
                      : item.imageUrl 
                        ? [{ id: 'legacy', url: item.imageUrl, publicId: 'legacy', name: 'Image' }]
                        : [];

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                          isSelected
                            ? 'border-brand-primary-500 bg-brand-primary-50'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        )}
                      >
                        <div className="flex-shrink-0">
                          {displayImages.length > 0 ? (
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-100">
                              <img
                                src={displayImages[0].url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-neutral-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-neutral-600 line-clamp-1 mt-0.5">{item.description}</div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</span>
                            <span className="text-xs text-neutral-500">•</span>
                            <span className="text-xs text-neutral-500">{item.category}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected && (
                            <div className="h-6 w-6 rounded-full bg-brand-primary-500 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {selectedItems.size > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-sm text-neutral-600">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={addItems.isPending}
                    >
                      {addItems.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CollectionDetailModalProps {
  open: boolean;
  onClose: () => void;
  collectionId: number | null;
}

const CollectionDetailModal = ({ open, onClose, collectionId }: CollectionDetailModalProps) => {
  const { data: collectionData, isLoading } = useMenuCollection(collectionId);
  const addItems = useAddItemsToCollection();
  const removeItem = useRemoveItemFromCollection();
  const { data: menuData } = useMerchantMenu();
  const [showAddItems, setShowAddItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const collection = collectionData?.collection;
  const collectionItems = collection?.items || [];
  const collectionItemIds = collectionItems.map(item => item.menuItemId);
  const allMenuItems = menuData?.menuItems || [];
  const availableItems = allMenuItems.filter(item => !collectionItemIds.includes(item.id));
  
  const filteredAvailableItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddItems = async () => {
    if (!collectionId || selectedItems.size === 0) return;
    
    const itemsToAdd = Array.from(selectedItems).map((id, index) => ({
      id,
      sortOrder: collectionItems.length + index,
    }));

    await addItems.mutateAsync({
      collectionId,
      menuItems: itemsToAdd,
    });

    setSelectedItems(new Set());
    setSearchTerm('');
    setShowAddItems(false);
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!collectionId) return;
    await removeItem.mutateAsync({ collectionId, itemId });
  };

  useEffect(() => {
    if (!open) {
      setShowAddItems(false);
      setSelectedItems(new Set());
      setSearchTerm('');
    }
  }, [open]);

  if (!collection) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="relative z-50 w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 p-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-neutral-900">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-neutral-600 mt-1">{collection.description}</p>
                )}
                <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
                  <span>{collectionItems.length} items</span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    collection.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
                  )}>
                    {collection.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {!showAddItems ? (
                <>
                  {/* Collection Items List */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                      </div>
                    ) : collectionItems.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                        <p className="text-neutral-600 mb-4">This collection is empty</p>
                        <Button onClick={() => setShowAddItems(true)}>
                          <Plus className="mr-2 h-4 w-4" /> Add Items
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {collectionItems.map((collectionItem) => {
                          const item = collectionItem.menuItem;
                          const displayImages = item.images && item.images.length > 0 
                            ? item.images 
                            : item.imageUrl 
                              ? [{ id: 'legacy', url: item.imageUrl, publicId: 'legacy', name: 'Image' }]
                              : [];
                          
                          const finalPrice = collectionItem.customPrice !== null && collectionItem.customPrice !== undefined
                            ? collectionItem.customPrice
                            : collectionItem.customDiscount !== null && collectionItem.customDiscount !== undefined
                            ? item.price * (1 - collectionItem.customDiscount / 100)
                            : item.price;

                          return (
                            <div
                              key={collectionItem.menuItemId}
                              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex-shrink-0">
                                {displayImages.length > 0 ? (
                                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-neutral-100">
                                    <img
                                      src={displayImages[0].url}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-16 w-16 rounded-lg bg-neutral-100 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-neutral-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-neutral-900">{item.name}</div>
                                {item.description && (
                                  <div className="text-sm text-neutral-600 line-clamp-1 mt-0.5">{item.description}</div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  {finalPrice < item.price && (
                                    <span className="text-xs text-neutral-400 line-through">${item.price.toFixed(2)}</span>
                                  )}
                                  <span className="text-sm font-medium text-green-600">${finalPrice.toFixed(2)}</span>
                                  <span className="text-xs text-neutral-500">•</span>
                                  <span className="text-xs text-neutral-500">{item.category}</span>
                                  {(collectionItem.customPrice !== null || collectionItem.customDiscount !== null) && (
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                      Custom Price
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={removeItem.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-neutral-200 p-4 flex items-center justify-between">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button onClick={() => setShowAddItems(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Items
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Add Items View */}
                  <div className="p-6 flex-1 overflow-hidden flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold text-neutral-900">Add Items to Collection</h4>
                      <button
                        onClick={() => {
                          setShowAddItems(false);
                          setSelectedItems(new Set());
                          setSearchTerm('');
                        }}
                        className="text-sm text-neutral-600 hover:text-neutral-900"
                      >
                        Back to Collection
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search menu items..."
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                      {filteredAvailableItems.length === 0 ? (
                        <div className="text-center py-12">
                          <Utensils className="mx-auto h-12 w-12 text-neutral-300 mb-3" />
                          <p className="text-neutral-600">
                            {availableItems.length === 0
                              ? 'All menu items are already in this collection'
                              : 'No items found matching your search'}
                          </p>
                        </div>
                      ) : (
                        filteredAvailableItems.map((item) => {
                          const isSelected = selectedItems.has(item.id);
                          const displayImages = item.images && item.images.length > 0 
                            ? item.images 
                            : item.imageUrl 
                              ? [{ id: 'legacy', url: item.imageUrl, publicId: 'legacy', name: 'Image' }]
                              : [];

                          return (
                            <button
                              key={item.id}
                              onClick={() => handleToggleItem(item.id)}
                              className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                                isSelected
                                  ? 'border-brand-primary-500 bg-brand-primary-50'
                                  : 'border-neutral-200 bg-white hover:border-neutral-300'
                              )}
                            >
                              <div className="flex-shrink-0">
                                {displayImages.length > 0 ? (
                                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-100">
                                    <img
                                      src={displayImages[0].url}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-neutral-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-neutral-900">{item.name}</div>
                                {item.description && (
                                  <div className="text-sm text-neutral-600 line-clamp-1 mt-0.5">{item.description}</div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</span>
                                  <span className="text-xs text-neutral-500">•</span>
                                  <span className="text-xs text-neutral-500">{item.category}</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isSelected && (
                                  <div className="h-6 w-6 rounded-full bg-brand-primary-500 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {selectedItems.size > 0 && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
                        <span className="text-sm text-neutral-600">
                          {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => {
                            setShowAddItems(false);
                            setSelectedItems(new Set());
                            setSearchTerm('');
                          }}>Cancel</Button>
                          <Button
                            onClick={handleAddItems}
                            disabled={addItems.isPending}
                          >
                            {addItems.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MenuCollectionsPage = () => {
  const { data, isLoading, error } = useMenuCollections();
  const createCollection = useCreateMenuCollection();
  const updateCollection = useUpdateMenuCollection();
  const deleteCollection = useDeleteMenuCollection();

  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<MenuCollection | null>(null);
  const [addingItemsTo, setAddingItemsTo] = useState<MenuCollection | null>(null);
  const [viewingCollection, setViewingCollection] = useState<number | null>(null);

  const collections = data?.collections || [];
  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Menu Collections</h1>
          <p className="text-sm text-neutral-600">Create, edit, and reuse item collections for faster deal creation.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Collection
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collections..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-neutral-600">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading collections...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">Failed to load collections.</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-200 p-10 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
          <h3 className="mb-1 text-lg font-semibold text-neutral-900">No collections found</h3>
          <p className="mb-4 text-neutral-600">Create your first collection to get started.</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => {
            const items = c.items || [];
            const previewItems = items.slice(0, 4);
            const remainingCount = items.length - 4;
            const totalItems = c._count?.items || items.length || 0;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setViewingCollection(c.id)}
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3 flex-1">
                    <div className="rounded-lg bg-neutral-100 p-2 flex-shrink-0">
                      <Package className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-neutral-900">{c.name}</div>
                      {c.description && (
                        <div className="mt-0.5 line-clamp-2 text-sm text-neutral-600">{c.description}</div>
                      )}
                      <div className="mt-2 text-xs text-neutral-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingItemsTo(c);
                      }}
                      className="h-8 w-8 p-0"
                      title="Add Items"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(c);
                      }}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await deleteCollection.mutateAsync(c.id);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Item Preview */}
                {items.length > 0 ? (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 -space-x-2">
                      {previewItems.map((collectionItem, index) => {
                        const item = collectionItem.menuItem;
                        const displayImages = item.images && item.images.length > 0 
                          ? item.images 
                          : item.imageUrl 
                            ? [{ id: 'legacy', url: item.imageUrl, publicId: 'legacy', name: 'Image' }]
                            : [];

                        return (
                          <div
                            key={collectionItem.menuItemId}
                            className="relative h-12 w-12 rounded-lg border-2 border-white overflow-hidden bg-neutral-100 flex-shrink-0"
                            style={{ zIndex: previewItems.length - index }}
                          >
                            {displayImages.length > 0 ? (
                              <img
                                src={displayImages[0].url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Utensils className="h-5 w-5 text-neutral-400" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {remainingCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingCollection(c.id);
                          }}
                          className="h-12 w-12 rounded-lg border-2 border-white bg-brand-primary-500 text-white flex items-center justify-center font-semibold text-sm hover:bg-brand-primary-600 transition-colors flex-shrink-0"
                          style={{ zIndex: 0 }}
                        >
                          +{remainingCount}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 rounded-lg border-2 border-dashed border-neutral-200 p-4 text-center">
                    <Utensils className="mx-auto h-6 w-6 text-neutral-300 mb-2" />
                    <p className="text-xs text-neutral-500">No items yet</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-sm pt-3 border-t border-neutral-100">
                  <div className="text-neutral-600">Status</div>
                  <div className={cn('rounded-full px-2 py-0.5 text-xs font-medium', c.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700')}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <CollectionForm
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (values) => {
          await createCollection.mutateAsync(values);
        }}
        isSubmitting={createCollection.isPending}
      />

      {/* Edit Modal */}
      <CollectionForm
        open={!!editing}
        onClose={() => setEditing(null)}
        initial={editing || undefined}
        onSubmit={async (values) => {
          if (!editing) return;
          await updateCollection.mutateAsync({ collectionId: editing.id, data: values });
        }}
        isSubmitting={updateCollection.isPending}
      />

      {/* Add Items Modal */}
      <AddItemsModal
        open={!!addingItemsTo}
        onClose={() => setAddingItemsTo(null)}
        collection={addingItemsTo}
      />

      {/* Collection Detail Modal */}
      <CollectionDetailModal
        open={!!viewingCollection}
        onClose={() => setViewingCollection(null)}
        collectionId={viewingCollection}
      />
    </div>
  );
};

export default MenuCollectionsPage;



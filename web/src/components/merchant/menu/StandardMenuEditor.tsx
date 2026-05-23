import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  FileSpreadsheet,
  Globe,
  Save,
  Loader2,
  GripVertical,
  Image as ImageIcon,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
import { Input } from '@/components/ui/input';
import {
  useCreateMenuCollection,
  useUpdateMenuCollection,
  useBulkUpdateCollectionItems,
  type MenuCollection,
  type MenuCollectionType,
  type BulkItemData,
} from '@/hooks/useMenuCollections';
import { AiGenerateMenuModal } from './AiGenerateMenuModal';
import { BulkMenuUpload } from '@/components/merchant/BulkMenuUpload';
import type { AiParsedMenuItem } from '@/hooks/useAi';

export interface MenuEditorItem {
  tempId: string; // client-side id for keying rows
  id?: number; // server id if existing
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrls: string[];
  inventoryTrackingEnabled: boolean;
  inventoryQuantity: number | null;
  lowStockThreshold: number | null;
  allowBackorder: boolean;
  isBulkOrderEnabled: boolean;
  defaultPeopleCount: number | null;
  minPeopleCount: number | null;
}

interface StandardMenuEditorProps {
  isOpen: boolean;
  onClose: () => void;
  menuType: MenuCollectionType;
  /** If editing an existing collection, pass it here */
  existingCollection?: MenuCollection | null;
  /** Pre-set name for the collection (from template) */
  defaultName?: string;
  defaultSubType?: string;
  /** For special menus */
  themeName?: string;
  icon?: string;
  color?: string;
  selectedStoreId?: number | null;
  selectedStoreLabel?: string;
}

let tempIdCounter = 0;
const newTempId = () => `tmp_${++tempIdCounter}_${Date.now()}`;

const emptyRow = (): MenuEditorItem => ({
  tempId: newTempId(),
  name: '',
  price: 0,
  description: '',
  category: '',
  imageUrls: [],
  inventoryTrackingEnabled: true,
  inventoryQuantity: 0,
  lowStockThreshold: 5,
  allowBackorder: false,
  isBulkOrderEnabled: false,
  defaultPeopleCount: null,
  minPeopleCount: null,
});

const MENU_CATEGORIES = ['Entree', 'Side', 'Drink', 'Dessert', 'Kids'];

export const StandardMenuEditor: React.FC<StandardMenuEditorProps> = ({
  isOpen,
  onClose,
  menuType,
  existingCollection,
  defaultName = '',
  defaultSubType,
  themeName,
  icon,
  color,
  selectedStoreId = null,
  selectedStoreLabel = 'All Stores',
}) => {
  // --- State ---
  const [collectionName, setCollectionName] = useState(defaultName);
  const [collectionDescription, setCollectionDescription] = useState('');
  const [items, setItems] = useState<MenuEditorItem[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [showScrapeInput, setShowScrapeInput] = useState(false);
  const [showFeeInfo, setShowFeeInfo] = useState(false);
  const [uploadTargetTempId, setUploadTargetTempId] = useState<string | null>(null);

  // Mutations
  const createCollection = useCreateMenuCollection();
  const updateCollection = useUpdateMenuCollection();
  const bulkUpdate = useBulkUpdateCollectionItems();

  const isSaving =
    createCollection.isPending || updateCollection.isPending || bulkUpdate.isPending;

  const storeContextMessage = existingCollection
    ? `This menu is currently being edited in the context of ${selectedStoreLabel}.`
    : `This menu will be created for ${selectedStoreLabel}.`;

  // Populate from existing collection if editing
  useEffect(() => {
    if (existingCollection) {
      setCollectionName(existingCollection.name);
      setCollectionDescription(existingCollection.description || '');
      if (existingCollection.items && existingCollection.items.length > 0) {
        setItems(
          existingCollection.items.map((ci) => ({
            tempId: newTempId(),
            id: ci.menuItem.id,
            name: ci.menuItem.name,
            price: ci.menuItem.price,
            description: ci.menuItem.description || '',
            category: ci.menuItem.category || '',
            imageUrls: ci.menuItem.imageUrls || [],
            inventoryTrackingEnabled: ci.menuItem.inventoryTrackingEnabled ?? true,
            inventoryQuantity: ci.menuItem.inventoryQuantity ?? 0,
            lowStockThreshold: ci.menuItem.lowStockThreshold ?? 5,
            allowBackorder: ci.menuItem.allowBackorder ?? false,
            isBulkOrderEnabled: ci.menuItem.isBulkOrderEnabled ?? false,
            defaultPeopleCount: ci.menuItem.defaultPeopleCount ?? null,
            minPeopleCount: ci.menuItem.minPeopleCount ?? null,
          }))
        );
      } else {
        setItems([emptyRow(), emptyRow(), emptyRow()]);
      }
    } else {
      setCollectionName(defaultName);
      setCollectionDescription('');
      setItems([emptyRow(), emptyRow(), emptyRow()]);
    }
  }, [existingCollection, defaultName, isOpen]);

  // --- Handlers ---
  const updateItem = (tempId: string, field: keyof MenuEditorItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (tempId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.tempId !== tempId);
      return next.length === 0 ? [emptyRow()] : next;
    });
  };

  const addRow = () => {
    setItems((prev) => [...prev, emptyRow()]);
  };

  const handleAiItems = (parsed: AiParsedMenuItem[]) => {
    const newItems: MenuEditorItem[] = parsed.map((p) => ({
      tempId: newTempId(),
      name: p.name,
      price: p.price,
      description: p.description || '',
      category: p.category || '',
      imageUrls: [],
      inventoryTrackingEnabled: true,
      inventoryQuantity: 0,
      lowStockThreshold: 5,
      allowBackorder: false,
      isBulkOrderEnabled: false,
      defaultPeopleCount: null,
      minPeopleCount: null,
    }));
    setItems((prev) => {
      // Replace empty rows, append to non-empty
      const nonEmpty = prev.filter((i) => i.name.trim());
      return [...nonEmpty, ...newItems];
    });
  };

  const handleSave = async () => {
    if (!collectionName.trim()) return;

    // Filter out completely empty rows
    const validItems = items.filter((i) => i.name.trim());
    if (validItems.length === 0) return;

    try {
      if (existingCollection) {
        // Update existing collection metadata
        await updateCollection.mutateAsync({
          collectionId: existingCollection.id,
          data: {
            name: collectionName.trim(),
            description: collectionDescription.trim() || undefined,
            menuType,
            subType: defaultSubType,
            themeName,
            icon,
            color,
          },
        });

        // Bulk update items
        const bulkItems: BulkItemData[] = validItems.map((i) => ({
          id: i.id,
          name: i.name.trim(),
          price: i.price,
          description: i.description.trim() || undefined,
          category: i.category.trim() || undefined,
          imageUrls: i.imageUrls,
          inventoryTrackingEnabled: i.inventoryTrackingEnabled,
          inventoryQuantity: i.inventoryTrackingEnabled ? (i.inventoryQuantity ?? 0) : null,
          lowStockThreshold: i.inventoryTrackingEnabled ? (i.lowStockThreshold ?? 0) : null,
          allowBackorder: i.inventoryTrackingEnabled ? i.allowBackorder : false,
          isBulkOrderEnabled: i.isBulkOrderEnabled,
          defaultPeopleCount: i.isBulkOrderEnabled ? i.defaultPeopleCount : null,
          minPeopleCount: i.isBulkOrderEnabled ? i.minPeopleCount : null,
        }));

        await bulkUpdate.mutateAsync({
          collectionId: existingCollection.id,
          items: bulkItems,
        });
      } else {
        // Create new collection
        const result = await createCollection.mutateAsync({
          name: collectionName.trim(),
          description: collectionDescription.trim() || undefined,
          menuType,
          subType: defaultSubType,
          themeName,
          icon,
          color,
          storeId: selectedStoreId ?? undefined,
        });

        // Bulk add items
        const bulkItems: BulkItemData[] = validItems.map((i) => ({
          name: i.name.trim(),
          price: i.price,
          description: i.description.trim() || undefined,
          category: i.category.trim() || undefined,
          imageUrls: i.imageUrls,
          inventoryTrackingEnabled: i.inventoryTrackingEnabled,
          inventoryQuantity: i.inventoryTrackingEnabled ? (i.inventoryQuantity ?? 0) : null,
          lowStockThreshold: i.inventoryTrackingEnabled ? (i.lowStockThreshold ?? 0) : null,
          allowBackorder: i.inventoryTrackingEnabled ? i.allowBackorder : false,
          isBulkOrderEnabled: i.isBulkOrderEnabled,
          defaultPeopleCount: i.isBulkOrderEnabled ? i.defaultPeopleCount : null,
          minPeopleCount: i.isBulkOrderEnabled ? i.minPeopleCount : null,
        }));

        await bulkUpdate.mutateAsync({
          collectionId: result.collection.id,
          items: bulkItems,
        });
      }

      onClose();
    } catch {
      // Errors handled by mutation hooks via toast
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className={cn(
            'bg-card border border-border text-foreground',
            'sm:max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden'
          )}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              {existingCollection ? '✏️ Edit Menu' : '✨ Create Menu'}
            </DialogTitle>
          </DialogHeader>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            <div className="rounded-xl border border-border bg-muted px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Store Context
              </p>
              <p className="mt-1 text-sm text-foreground">
                {storeContextMessage.split(selectedStoreLabel)[0]}
                <span className="font-semibold text-foreground">{selectedStoreLabel}</span>
                {storeContextMessage.split(selectedStoreLabel)[1]}
              </p>
            </div>

            {/* Collection name & description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Menu Name</label>
                <Input
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g. Daily Menu"
                  className="bg-muted border-border text-foreground placeholder-neutral-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description (optional)</label>
                <Input
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  placeholder="Short description"
                  className="bg-muted border-border text-foreground placeholder-neutral-400"
                />
              </div>
            </div>

            {/* Toolbar: AI Generate | Excel Upload | Scrape URL | Fee Info */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
                    'bg-purple-50 dark:bg-purple-950/30 text-purple-600 border border-purple-200 dark:border-purple-900/50',
                    'hover:bg-purple-100 dark:bg-purple-950/40 hover:border-purple-300 transition-colors'
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Generate
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkUpload(true)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
                    'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200 dark:border-emerald-900/50',
                    'hover:bg-emerald-100 dark:bg-emerald-950/40 hover:border-emerald-300 transition-colors'
                  )}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Excel Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowScrapeInput(!showScrapeInput)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
                    'bg-sky-50 dark:bg-sky-950/30 text-sky-600 border border-sky-200 dark:border-sky-900/50',
                    'hover:bg-sky-100 dark:bg-sky-950/40 hover:border-sky-300 transition-colors'
                  )}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Scrape URL
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowFeeInfo(true)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
                  'bg-muted text-muted-foreground border border-border',
                  'hover:bg-muted hover:border-border transition-colors'
                )}
              >
                <Info className="h-3.5 w-3.5" />
                Fee Info
              </button>
            </div>

            {/* Scrape URL input (expandable) */}
            {showScrapeInput && (
              <div className="flex gap-2">
                <Input
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="https://your-website.com/menu"
                  className="flex-1 bg-muted border-border text-foreground placeholder-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implement scrape (future feature)
                    setShowScrapeInput(false);
                  }}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-medium text-white hover:bg-blue-600 transition-colors"
                >
                  Scrape
                </button>
              </div>
            )}

            {/* Card-Style Items Editor */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.tempId}
                  className={cn(
                    'relative rounded-xl border border-border bg-card p-4 shadow-sm transition-all',
                    'hover:border-border'
                  )}
                >
                  <div className="flex gap-4 items-start">
                    {/* Media Handle & Box */}
                    <div className="flex flex-col items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Media</span>
                        <button 
                          type="button" 
                          onClick={() => { setUploadTargetTempId(item.tempId); }}
                          className={cn(
                            "flex h-[88px] w-[88px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                            item.imageUrls?.length 
                              ? "border-brand-primary border-solid overflow-hidden" 
                              : "border-border bg-muted hover:border-brand-primary/30 hover:bg-muted"
                          )}
                        >
                         {item.imageUrls?.length ? (
                           <img src={item.imageUrls[0]} alt="Media" className="h-full w-full object-cover" />
                         ) : (
                           <>
                             <ImageIcon className="mb-1 h-5 w-5 text-muted-foreground" />
                             <span className="text-[10px] font-medium text-muted-foreground">Image</span>
                           </>
                         )}
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1fr] gap-3">
                         <div>
                           <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Item Name</label>
                           <Input 
                             placeholder="e.g., Classic Burger" 
                             value={item.name} 
                             onChange={(e) => updateItem(item.tempId, 'name', e.target.value)} 
                             className="h-10 text-sm bg-muted border-border focus:border-brand-primary/30"
                           />
                         </div>
                         <div>
                           <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                           <Input 
                             placeholder="Brief description" 
                             value={item.description} 
                             onChange={(e) => updateItem(item.tempId, 'description', e.target.value)} 
                             className="h-10 text-sm bg-muted border-border focus:border-brand-primary/30"
                           />
                         </div>
                         <div>
                           <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                           <Select value={item.category || undefined} onValueChange={(val) => updateItem(item.tempId, 'category', val)}>
                              <SelectTrigger className="h-10 text-sm bg-muted border-border">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                {MENU_CATEGORIES.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                           </Select>
                         </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                         <div>
                           <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your Price</label>
                           <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                             <Input 
                               className="pl-7 h-10 text-sm bg-muted border-border focus:border-brand-primary/30" 
                               type="number" 
                               step="0.01" 
                               min="0" 
                               value={item.price || ''} 
                               onChange={(e) => updateItem(item.tempId, 'price', parseFloat(e.target.value))} 
                             />
                           </div>
                         </div>
                      </div>
                      <div className="mt-1 rounded-lg border border-border bg-muted p-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Track inventory
                          </label>
                          <input
                            type="checkbox"
                            checked={item.inventoryTrackingEnabled}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.tempId === item.tempId
                                    ? {
                                        ...row,
                                        inventoryTrackingEnabled: e.target.checked,
                                        inventoryQuantity: e.target.checked
                                          ? (row.inventoryQuantity ?? 0)
                                          : null,
                                        lowStockThreshold: e.target.checked
                                          ? (row.lowStockThreshold ?? 5)
                                          : null,
                                        allowBackorder: e.target.checked ? row.allowBackorder : false,
                                      }
                                    : row
                                )
                              )
                            }
                            className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                          />
                        </div>
                        {item.inventoryTrackingEnabled ? (
                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                In stock
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={item.inventoryQuantity ?? 0}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((row) =>
                                      row.tempId === item.tempId
                                        ? {
                                            ...row,
                                            inventoryQuantity: Math.max(0, Number(e.target.value || 0)),
                                          }
                                        : row
                                    )
                                  )
                                }
                                className="h-9 text-sm bg-card border-border"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Low stock at
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                value={item.lowStockThreshold ?? 0}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((row) =>
                                      row.tempId === item.tempId
                                        ? {
                                            ...row,
                                            lowStockThreshold: Math.max(0, Number(e.target.value || 0)),
                                          }
                                        : row
                                    )
                                  )
                                }
                                className="h-9 text-sm bg-card border-border"
                              />
                            </div>
                            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:pt-6">
                              <input
                                type="checkbox"
                                checked={item.allowBackorder}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((row) =>
                                      row.tempId === item.tempId
                                        ? { ...row, allowBackorder: e.target.checked }
                                        : row
                                    )
                                  )
                                }
                                className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                              />
                              Allow backorders
                            </label>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Inventory is untracked for this item.
                          </p>
                        )}
                      </div>
                      <div className="mt-1 rounded-lg border border-border bg-muted p-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Bulk ordering
                          </label>
                          <input
                            type="checkbox"
                            checked={item.isBulkOrderEnabled}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((row) =>
                                  row.tempId === item.tempId
                                    ? {
                                        ...row,
                                        isBulkOrderEnabled: e.target.checked,
                                        defaultPeopleCount: e.target.checked
                                          ? (row.defaultPeopleCount ?? 10)
                                          : null,
                                        minPeopleCount: e.target.checked ? (row.minPeopleCount ?? 1) : null,
                                      }
                                    : row
                                )
                              )
                            }
                            className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                          />
                        </div>
                        {item.isBulkOrderEnabled ? (
                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Default people count
                              </label>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                value={item.defaultPeopleCount ?? 10}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((row) =>
                                      row.tempId === item.tempId
                                        ? {
                                            ...row,
                                            defaultPeopleCount: Math.max(1, Number(e.target.value || 1)),
                                          }
                                        : row
                                    )
                                  )
                                }
                                className="h-9 text-sm bg-card border-border"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Minimum people count
                              </label>
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                value={item.minPeopleCount ?? 1}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((row) =>
                                      row.tempId === item.tempId
                                        ? {
                                            ...row,
                                            minPeopleCount: Math.max(1, Number(e.target.value || 1)),
                                          }
                                        : row
                                    )
                                  )
                                }
                                className="h-9 text-sm bg-card border-border"
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Item uses regular single-serving ordering.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete Action */}
                    <div className="pl-2 pt-6 shrink-0">
                      <button 
                        type="button"
                        onClick={() => removeItem(item.tempId)} 
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add row */}
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 mt-2 text-xs font-medium text-muted-foreground hover:text-brand hover:bg-brand-subtle transition-colors w-full justify-center border border-dashed border-border hover:border-brand/30"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {items.filter((i) => i.name.trim()).length} items
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !collectionName.trim() || items.filter((i) => i.name.trim()).length === 0}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold',
                  'bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Menu
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <AiGenerateMenuModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onItemsGenerated={handleAiItems}
      />
      <BulkMenuUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
      />

      <ImageUploadModal
        open={!!uploadTargetTempId}
        onOpenChange={(open) => !open && setUploadTargetTempId(null)}
        onUploadComplete={(urls) => {
          if (uploadTargetTempId) {
            setItems(prev => prev.map(i => i.tempId === uploadTargetTempId ? { ...i, imageUrls: [...(i.imageUrls || []), ...urls] } : i));
          }
        }}
        maxFiles={5}
        title="Upload Item Images"
      />

      {/* Fee Info Dialog */}
      <Dialog open={showFeeInfo} onOpenChange={setShowFeeInfo}>
        <DialogContent className="sm:max-w-md border-border bg-card text-foreground p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-bold text-foreground">Platform Fee Structure</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4 space-y-4 text-sm font-medium">
            <p className="text-muted-foreground leading-relaxed">
              Small fees are added to customer prices. You keep 100% of your set price!
            </p>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between p-3 rounded-lg bg-muted border border-border">
                <span className="text-muted-foreground">$0.00 - $1.00</span>
                <span className="text-brand font-semibold">+$0.25</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted border border-border">
                <span className="text-muted-foreground">$1.01 - $5.00</span>
                <span className="text-brand font-semibold">+$0.50</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted border border-border">
                <span className="text-muted-foreground">$5.01 - $15.00</span>
                <span className="text-brand font-semibold">+$1.05</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted border border-border">
                <span className="text-muted-foreground">$15.01 - $30.00</span>
                <span className="text-brand font-semibold">+$2.00</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted border border-border">
                <span className="text-muted-foreground">$30.01+</span>
                <span className="text-brand font-semibold">+$5.00</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-warning/30 bg-warning/5">
              <h4 className="font-bold text-warning mb-1">10% Maintenance Fee</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Applied to total bill to cover payment processing, app maintenance, and platform improvements
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

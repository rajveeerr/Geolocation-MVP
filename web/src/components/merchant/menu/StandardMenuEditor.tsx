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
            'bg-white border border-neutral-200 text-neutral-800',
            'sm:max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden'
          )}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
            <DialogTitle className="font-heading text-lg font-bold text-neutral-900">
              {existingCollection ? '✏️ Edit Menu' : '✨ Create Menu'}
            </DialogTitle>
          </DialogHeader>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Store Context
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                {storeContextMessage.split(selectedStoreLabel)[0]}
                <span className="font-semibold text-neutral-900">{selectedStoreLabel}</span>
                {storeContextMessage.split(selectedStoreLabel)[1]}
              </p>
            </div>

            {/* Collection name & description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Menu Name</label>
                <Input
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g. Daily Menu"
                  className="bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Description (optional)</label>
                <Input
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  placeholder="Short description"
                  className="bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400"
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
                    'bg-purple-50 text-purple-600 border border-purple-200',
                    'hover:bg-purple-100 hover:border-purple-300 transition-colors'
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
                    'bg-emerald-50 text-emerald-600 border border-emerald-200',
                    'hover:bg-emerald-100 hover:border-emerald-300 transition-colors'
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
                    'bg-sky-50 text-sky-600 border border-sky-200',
                    'hover:bg-sky-100 hover:border-sky-300 transition-colors'
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
                  'bg-neutral-50 text-neutral-600 border border-neutral-200',
                  'hover:bg-neutral-100 hover:border-neutral-300 transition-colors'
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
                  className="flex-1 bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400"
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
                    'relative rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all',
                    'hover:border-neutral-300'
                  )}
                >
                  <div className="flex gap-4 items-start">
                    {/* Media Handle & Box */}
                    <div className="flex flex-col items-center gap-2">
                      <GripVertical className="h-4 w-4 text-neutral-300 cursor-grab" />
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Media</span>
                        <button 
                          type="button" 
                          onClick={() => { setUploadTargetTempId(item.tempId); }}
                          className={cn(
                            "flex h-[88px] w-[88px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                            item.imageUrls?.length 
                              ? "border-brand-primary border-solid overflow-hidden" 
                              : "border-neutral-200 bg-neutral-50 hover:border-brand-primary/30 hover:bg-neutral-100"
                          )}
                        >
                         {item.imageUrls?.length ? (
                           <img src={item.imageUrls[0]} alt="Media" className="h-full w-full object-cover" />
                         ) : (
                           <>
                             <ImageIcon className="mb-1 h-5 w-5 text-neutral-400" />
                             <span className="text-[10px] font-medium text-neutral-500">Image</span>
                           </>
                         )}
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1fr] gap-3">
                         <div>
                           <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Item Name</label>
                           <Input 
                             placeholder="e.g., Classic Burger" 
                             value={item.name} 
                             onChange={(e) => updateItem(item.tempId, 'name', e.target.value)} 
                             className="h-10 text-sm bg-neutral-50 border-neutral-200 focus:border-brand-primary/30"
                           />
                         </div>
                         <div>
                           <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Description</label>
                           <Input 
                             placeholder="Brief description" 
                             value={item.description} 
                             onChange={(e) => updateItem(item.tempId, 'description', e.target.value)} 
                             className="h-10 text-sm bg-neutral-50 border-neutral-200 focus:border-brand-primary/30"
                           />
                         </div>
                         <div>
                           <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Category</label>
                           <Select value={item.category || undefined} onValueChange={(val) => updateItem(item.tempId, 'category', val)}>
                              <SelectTrigger className="h-10 text-sm bg-neutral-50 border-neutral-200">
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
                           <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Your Price</label>
                           <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                             <Input 
                               className="pl-7 h-10 text-sm bg-neutral-50 border-neutral-200 focus:border-brand-primary/30" 
                               type="number" 
                               step="0.01" 
                               min="0" 
                               value={item.price || ''} 
                               onChange={(e) => updateItem(item.tempId, 'price', parseFloat(e.target.value))} 
                             />
                           </div>
                         </div>
                      </div>
                    </div>

                    {/* Delete Action */}
                    <div className="pl-2 pt-6 shrink-0">
                      <button 
                        type="button"
                        onClick={() => removeItem(item.tempId)} 
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
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
                className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 mt-2 text-xs font-medium text-neutral-500 hover:text-brand hover:bg-brand-subtle transition-colors w-full justify-center border border-dashed border-neutral-200 hover:border-brand/30"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">
              {items.filter((i) => i.name.trim()).length} items
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-800 transition-colors rounded-lg hover:bg-neutral-100"
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
        <DialogContent className="sm:max-w-md border-neutral-200 bg-white text-neutral-800 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-neutral-100">
            <DialogTitle className="text-lg font-bold text-neutral-900">Platform Fee Structure</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4 space-y-4 text-sm font-medium">
            <p className="text-neutral-500 leading-relaxed">
              Small fees are added to customer prices. You keep 100% of your set price!
            </p>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-600">$0.00 - $1.00</span>
                <span className="text-brand font-semibold">+$0.25</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-600">$1.01 - $5.00</span>
                <span className="text-brand font-semibold">+$0.50</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-600">$5.01 - $15.00</span>
                <span className="text-brand font-semibold">+$1.05</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-600">$15.01 - $30.00</span>
                <span className="text-brand font-semibold">+$2.00</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-neutral-600">$30.01+</span>
                <span className="text-brand font-semibold">+$5.00</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-warning/30 bg-warning/5">
              <h4 className="font-bold text-warning mb-1">10% Maintenance Fee</h4>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Applied to total bill to cover payment processing, app maintenance, and platform improvements
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

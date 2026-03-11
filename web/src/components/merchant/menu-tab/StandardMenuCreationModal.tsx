import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles, FileSpreadsheet, Link2, Info, Plus, Trash2, Upload, X,
} from 'lucide-react';
import { useCreateMenuCollection, useAddItemsToCollection } from '@/hooks/useMenuCollections';
import { useCreateMenuItem } from '@/hooks/useMerchantMenuManagement';
import { useAiMenuParse } from '@/hooks/useAi';
import { useBulkUploadMenuItems } from '@/hooks/useMerchantMenuManagement';
import { encodeCollectionMetadata } from './utils';
import { STANDARD_MENU_TEMPLATES } from './constants';
import type { MenuType, MenuCollectionMetadata, StagedMenuItem } from './types';
import { toast } from 'sonner';

interface StandardMenuCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuType: MenuType | null;
  storeId: number | null;
  eventTheme?: string;
}

type ActiveMethod = 'none' | 'ai' | 'excel' | 'scrape' | 'manual';

export const StandardMenuCreationModal = ({ isOpen, onClose, menuType, storeId, eventTheme }: StandardMenuCreationModalProps) => {
  const [activeMethod, setActiveMethod] = useState<ActiveMethod>('none');
  const [stagedItems, setStagedItems] = useState<StagedMenuItem[]>([]);
  const [showFeeInfo, setShowFeeInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // AI state
  const [aiText, setAiText] = useState('');
  const aiMenuParse = useAiMenuParse();

  // Excel state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkUploadMutation = useBulkUploadMenuItems();

  // Manual item form state
  const [manualItem, setManualItem] = useState({ name: '', price: '', category: '', description: '' });

  // Mutations
  const createCollection = useCreateMenuCollection();
  const addItemsToCollection = useAddItemsToCollection();
  const createMenuItem = useCreateMenuItem();

  const template = menuType ? STANDARD_MENU_TEMPLATES.find((t) => t.id === menuType) : null;
  const menuName = eventTheme || template?.name || 'New Menu';
  const menuDescription = eventTheme ? `Special event menu for ${eventTheme}` : (template?.description || '');

  const handleAiParse = async () => {
    if (!aiText.trim()) return;
    try {
      const result = await aiMenuParse.mutateAsync({ text: aiText });
      const newItems: StagedMenuItem[] = result.items.map((item) => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category || menuType || 'general',
        isNew: true,
      }));
      setStagedItems((prev) => [...prev, ...newItems]);
      setAiText('');
      setActiveMethod('none');
      toast.success(`Parsed ${result.count} items from AI`);
    } catch {
      toast.error('Failed to parse menu text with AI');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await bulkUploadMutation.mutateAsync(file);
      toast.success(`Uploaded ${result.created} menu items`);
      setActiveMethod('none');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Failed to upload file');
    }
  };

  const handleAddManualItem = () => {
    if (!manualItem.name || !manualItem.price) {
      toast.error('Name and price are required');
      return;
    }
    setStagedItems((prev) => [...prev, {
      name: manualItem.name,
      price: parseFloat(manualItem.price),
      category: manualItem.category || menuType || 'general',
      description: manualItem.description,
      isNew: true,
    }]);
    setManualItem({ name: '', price: '', category: '', description: '' });
    setActiveMethod('none');
  };

  const handleRemoveItem = (index: number) => {
    setStagedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!storeId) {
      toast.error('Please select a store first');
      return;
    }
    setIsSaving(true);
    try {
      // Create menu items first for new items
      const itemIds: number[] = [];
      for (const item of stagedItems) {
        if (item.isNew) {
          const result = await createMenuItem.mutateAsync({
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description,
            isAvailable: true,
          });
          if (result?.item?.id) itemIds.push(result.item.id);
        } else if (item.id) {
          itemIds.push(item.id);
        }
      }

      // Create collection with metadata
      const metadata: MenuCollectionMetadata = {
        menuType: eventTheme ? 'special_event' : (menuType || 'daily'),
        storeId,
        ...(eventTheme && { eventTheme }),
      };
      const description = encodeCollectionMetadata(metadata, menuDescription);

      const collectionResult = await createCollection.mutateAsync({
        name: menuName,
        description,
        menuItems: itemIds.map((id, i) => ({ id, sortOrder: i })),
      });

      toast.success(`${menuName} created with ${itemIds.length} items`);
      handleClose();
    } catch {
      toast.error('Failed to create menu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStagedItems([]);
    setActiveMethod('none');
    setAiText('');
    setManualItem({ name: '', price: '', category: '', description: '' });
    setShowFeeInfo(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-neutral-700 bg-neutral-900 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">{menuName}</DialogTitle>
          <DialogDescription className="text-neutral-400">Add and manage your menu items</DialogDescription>
        </DialogHeader>

        {/* Method Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => setActiveMethod(activeMethod === 'ai' ? 'none' : 'ai')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              activeMethod === 'ai' ? 'border-purple-500 bg-purple-500/20' : 'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/15'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-white">AI Generate</span>
            <span className="text-[10px] text-neutral-400">Create with AI</span>
          </button>

          <button
            onClick={() => setActiveMethod(activeMethod === 'excel' ? 'none' : 'excel')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              activeMethod === 'excel' ? 'border-green-500 bg-green-500/20' : 'border-green-500/30 bg-green-500/10 hover:bg-green-500/15'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-white">Excel Upload</span>
            <span className="text-[10px] text-neutral-400">Import .xlsx</span>
          </button>

          <button
            onClick={() => setActiveMethod(activeMethod === 'scrape' ? 'none' : 'scrape')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              activeMethod === 'scrape' ? 'border-cyan-500 bg-cyan-500/20' : 'border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/15'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-white">Scrape URL</span>
            <span className="text-[10px] text-neutral-400">UberEats/DoorDash</span>
          </button>

          <button
            onClick={() => setShowFeeInfo(!showFeeInfo)}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              showFeeInfo ? 'border-neutral-500 bg-neutral-500/20' : 'border-neutral-600 bg-neutral-800 hover:bg-neutral-700/50'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-600">
              <Info className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-white">Fee Info</span>
            <span className="text-[10px] text-neutral-400">View pricing</span>
          </button>
        </div>

        {/* AI Generate Section */}
        {activeMethod === 'ai' && (
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
            <Label className="text-sm text-purple-300">Paste your menu text or describe items</Label>
            <Textarea
              className="mt-2 border-purple-500/30 bg-neutral-800 text-white placeholder:text-neutral-500"
              placeholder="e.g. Classic Burger $12.99, Cheese Fries $6.99, Milkshake $5.49..."
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              rows={4}
            />
            <Button
              className="mt-3 bg-purple-600 hover:bg-purple-700"
              onClick={handleAiParse}
              disabled={aiMenuParse.isPending || !aiText.trim()}
            >
              {aiMenuParse.isPending ? 'Parsing...' : 'Parse with AI'}
            </Button>
          </div>
        )}

        {/* Excel Upload Section */}
        {activeMethod === 'excel' && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
            <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-neutral-600 p-6">
              <FileSpreadsheet className="h-10 w-10 text-green-400" />
              <p className="font-medium text-white">Click to upload Excel file</p>
              <p className="text-sm text-neutral-400">Supports .xlsx, .xls, .csv</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" className="border-green-500/50 text-green-400" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="text-amber-400">💡</span> Make sure your Excel has columns: Name, Description, Price, Category
            </p>
          </div>
        )}

        {/* Scrape URL Section */}
        {activeMethod === 'scrape' && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
            <Label className="text-sm text-cyan-300">Enter UberEats or DoorDash URL</Label>
            <div className="mt-2 flex gap-2">
              <Input
                className="border-cyan-500/30 bg-neutral-800 text-white placeholder:text-neutral-500"
                placeholder="https://www.ubereats.com/store/..."
              />
              <Button className="bg-cyan-600 hover:bg-cyan-700">Scrape</Button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">We'll extract menu items from the URL</p>
          </div>
        )}

        {/* Platform Fee Structure */}
        {showFeeInfo && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400" />
              <h4 className="font-semibold text-cyan-300">Platform Fee Structure</h4>
            </div>
            <p className="text-sm text-neutral-300">
              Small fees are added to customer prices to keep the platform running. You receive your full price + 10% revenue share on qualifying tiers.
            </p>
          </div>
        )}

        {/* Manual Add Section */}
        {activeMethod === 'manual' ? (
          <div className="rounded-xl border border-neutral-600 bg-neutral-800/50 p-4">
            <h4 className="mb-3 font-semibold text-white">Add Menu Item</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-neutral-400">Name *</Label>
                <Input
                  className="mt-1 border-neutral-600 bg-neutral-800 text-white"
                  value={manualItem.name}
                  onChange={(e) => setManualItem((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Item name"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-400">Price *</Label>
                <Input
                  className="mt-1 border-neutral-600 bg-neutral-800 text-white"
                  type="number"
                  step="0.01"
                  value={manualItem.price}
                  onChange={(e) => setManualItem((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-400">Category</Label>
                <Input
                  className="mt-1 border-neutral-600 bg-neutral-800 text-white"
                  value={manualItem.category}
                  onChange={(e) => setManualItem((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Appetizers"
                />
              </div>
              <div>
                <Label className="text-xs text-neutral-400">Description</Label>
                <Input
                  className="mt-1 border-neutral-600 bg-neutral-800 text-white"
                  value={manualItem.description}
                  onChange={(e) => setManualItem((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddManualItem}>
                Add Item
              </Button>
              <Button variant="ghost" className="text-neutral-400" onClick={() => setActiveMethod('none')}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActiveMethod('manual')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-600 p-4 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-300"
          >
            <Plus className="h-5 w-5" />
            <span>Add Menu Item Manually</span>
          </button>
        )}

        {/* Staged Items List */}
        {stagedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-neutral-300">Items ({stagedItems.length})</h4>
            {stagedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-neutral-800 px-3 py-2">
                <div>
                  <span className="text-sm font-medium text-white">{item.name}</span>
                  <span className="ml-2 text-sm text-green-400">${item.price.toFixed(2)}</span>
                  {item.category && <span className="ml-2 text-xs text-neutral-500">{item.category}</span>}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => handleRemoveItem(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Share Program */}
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <h4 className="font-semibold text-green-400">Revenue Share Program</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-neutral-800/50 p-3">
              <p className="text-xs text-neutral-400">Tier 1: $500 Sales</p>
              <p className="font-bold text-green-400">$100 Grant</p>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-3">
              <p className="text-xs text-neutral-400">Tier 2: $1,000 Sales</p>
              <p className="font-bold text-green-400">Grant Unlocked</p>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-3">
              <p className="text-xs text-neutral-400">Every +$500</p>
              <p className="font-bold text-green-400">$500 Bonus</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Plus 10% maintenance fee on total bill helps us keep improving the platform for you!
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-neutral-600 text-neutral-300" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : `Save Menu (${stagedItems.length} items)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

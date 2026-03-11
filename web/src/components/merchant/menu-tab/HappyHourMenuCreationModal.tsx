import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { useCreateMenuCollection, useAddItemsToCollection } from '@/hooks/useMenuCollections';
import { useMerchantMenuItems } from '@/hooks/useMerchantMenuManagement';
import { encodeCollectionMetadata, calculateDuration, formatTimeDisplay } from './utils';
import { HAPPY_HOUR_TEMPLATES } from './constants';
import type { HappyHourPreset, MenuCollectionMetadata } from './types';
import { toast } from 'sonner';

interface HappyHourMenuCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: HappyHourPreset | null;
  storeId: number | null;
}

interface SelectedItem {
  id: number;
  name: string;
  price: number;
  discount: number;
}

export const HappyHourMenuCreationModal = ({ isOpen, onClose, preset, storeId }: HappyHourMenuCreationModalProps) => {
  const template = preset ? HAPPY_HOUR_TEMPLATES.find((t) => t.id === preset) : null;
  const [timeStart, setTimeStart] = useState(template?.timeStart || '06:00');
  const [timeEnd, setTimeEnd] = useState(template?.timeEnd || '11:00');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: menuItems } = useMerchantMenuItems();
  const createCollection = useCreateMenuCollection();
  const addItemsToCollection = useAddItemsToCollection();

  // Reset times when preset changes
  useMemo(() => {
    if (template) {
      setTimeStart(template.timeStart);
      setTimeEnd(template.timeEnd);
      setSelectedItems([]);
    }
  }, [template]);

  const duration = calculateDuration(timeStart, timeEnd);

  const toggleItem = (item: { id: number; name: string; price: number }) => {
    setSelectedItems((prev) => {
      const exists = prev.find((s) => s.id === item.id);
      if (exists) return prev.filter((s) => s.id !== item.id);
      return [...prev, { id: item.id, name: item.name, price: item.price, discount: 20 }];
    });
  };

  const updateDiscount = (itemId: number, discount: number) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, discount: Math.min(100, Math.max(0, discount)) } : s))
    );
  };

  const avgDiscount = selectedItems.length > 0
    ? Math.round(selectedItems.reduce((sum, i) => sum + i.discount, 0) / selectedItems.length)
    : 0;

  const handleSave = async () => {
    if (!storeId) {
      toast.error('Please select a store first');
      return;
    }
    setIsSaving(true);
    try {
      const metadata: MenuCollectionMetadata = {
        menuType: 'happy_hour',
        happyHourPreset: preset || undefined,
        timeStart,
        timeEnd,
        storeId,
      };
      const description = encodeCollectionMetadata(
        metadata,
        `${formatTimeDisplay(timeStart)} - ${formatTimeDisplay(timeEnd)} special prices`
      );

      const collectionResult = await createCollection.mutateAsync({
        name: template?.name || 'Happy Hour',
        description,
        menuItems: selectedItems.map((item, i) => ({
          id: item.id,
          sortOrder: i,
          customDiscount: item.discount,
          customPrice: Math.round(item.price * (1 - item.discount / 100) * 100) / 100,
        })),
      });

      toast.success(`${template?.name || 'Happy Hour'} menu created with ${selectedItems.length} items`);
      handleClose();
    } catch {
      toast.error('Failed to create happy hour menu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedItems([]);
    onClose();
  };

  if (!isOpen || !preset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-neutral-700 bg-neutral-900 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">{template?.name || 'Happy Hour'}</DialogTitle>
          <DialogDescription className="text-neutral-400">Choose items from your daily menu and set discounts</DialogDescription>
        </DialogHeader>

        {/* Happy Hour Schedule */}
        <div className="rounded-xl border border-orange-500/40 bg-orange-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-400" />
            <h4 className="font-semibold text-orange-300">Happy Hour Schedule</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-neutral-400">Start Time</Label>
              <Input
                type="time"
                className="mt-1 border-neutral-600 bg-neutral-800 text-white"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-neutral-400">End Time</Label>
              <Input
                type="time"
                className="mt-1 border-neutral-600 bg-neutral-800 text-white"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="rounded-lg bg-neutral-800 px-3 py-2 text-center">
                <p className="text-xs text-neutral-400">Duration</p>
                <p className="font-bold text-white">{duration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items Selection */}
        <div className="rounded-xl border border-neutral-700 bg-neutral-800/30 p-4">
          {(!menuItems || menuItems.length === 0) ? (
            <div className="py-8 text-center">
              <p className="text-neutral-400">No daily menu items yet</p>
              <p className="text-sm text-neutral-500">Create your daily menu first, then add happy hour deals</p>
            </div>
          ) : (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const selected = selectedItems.find((s) => s.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
                      selected ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-neutral-800/50 border border-transparent hover:bg-neutral-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={() => toggleItem({ id: item.id, name: item.name, price: item.price })}
                      className="h-4 w-4 rounded accent-orange-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">{item.name}</span>
                      <span className="ml-2 text-sm text-neutral-400">${item.price.toFixed(2)}</span>
                    </div>
                    {selected && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="h-8 w-16 border-orange-500/30 bg-neutral-800 text-center text-sm text-white"
                          value={selected.discount}
                          onChange={(e) => updateDiscount(item.id, parseInt(e.target.value) || 0)}
                        />
                        <span className="text-xs text-orange-400">% off</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 rounded-xl border border-neutral-700 bg-neutral-800/30 p-4">
          <div>
            <p className="text-xs text-neutral-400">Selected Items</p>
            <p className="text-2xl font-bold text-white">{selectedItems.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-400">Avg. Discount</p>
            <p className="text-2xl font-bold text-orange-400">{avgDiscount}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-400">Duration</p>
            <p className="text-2xl font-bold text-white">{duration.replace(' hours', 'h').replace(' hour', 'h')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-neutral-600 text-neutral-300" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-500 text-white hover:from-orange-700 hover:to-red-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : `Save Happy Hour Menu (${selectedItems.length} items)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  useCreateMenuCollection,
  useUpdateMenuCollection,
  useBulkUpdateCollectionItems,
  type MenuCollection,
  type BulkItemData,
} from '@/hooks/useMenuCollections';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';

// ─── Types ──────────────────────────────────────────────────────────────────

interface HappyHourMenuEditorProps {
  isOpen: boolean;
  onClose: () => void;
  existingCollection?: MenuCollection | null;
  defaultName?: string;
  defaultSubType?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  selectedStoreId?: number | null;
  selectedStoreLabel?: string;
}

interface HappyHourItemRow {
  menuItemId: number;
  name: string;
  description: string;
  category: string;
  originalPrice: number;
  happyHourPrice: number;
  discountPercent: number;
  selected: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert "HH:MM" (24h) → "HH:MM AM/PM" for display */
function to12h(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h.toString().padStart(2, '0')}:${mStr} ${suffix}`;
}

/** Calculate duration between two "HH:MM" strings */
function getDuration(start: string, end: string): { hours: number; label: string } {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let totalMin = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMin <= 0) totalMin += 24 * 60; // crosses midnight
  const hours = totalMin / 60;
  const label =
    totalMin % 60 === 0
      ? `${Math.floor(hours)} hour${Math.floor(hours) !== 1 ? 's' : ''}`
      : `${Math.floor(hours)}h ${totalMin % 60}m`;
  return { hours: Math.round(hours * 10) / 10, label };
}

// ─── Component ──────────────────────────────────────────────────────────────

export const HappyHourMenuEditor: React.FC<HappyHourMenuEditorProps> = ({
  isOpen,
  onClose,
  existingCollection,
  defaultName = 'Happy Hour',
  defaultSubType,
  defaultStartTime = '16:00',
  defaultEndTime = '19:00',
  selectedStoreId = null,
  selectedStoreLabel = 'All Stores',
}) => {
  const [collectionName, setCollectionName] = useState(defaultName);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [itemRows, setItemRows] = useState<HappyHourItemRow[]>([]);

  const { data: menuData } = useMerchantMenu();
  const allMenuItems: MenuItem[] = menuData?.menuItems ?? [];

  const createCollection = useCreateMenuCollection();
  const updateCollection = useUpdateMenuCollection();
  const bulkUpdate = useBulkUpdateCollectionItems();

  const isSaving =
    createCollection.isPending || updateCollection.isPending || bulkUpdate.isPending;

  const storeContextMessage = existingCollection
    ? `This happy hour menu is currently being edited in the context of ${selectedStoreLabel}.`
    : `This happy hour menu will be created for ${selectedStoreLabel}.`;

  // ── Derived values ────────────────────────────────────────────────────

  const selectedCount = useMemo(() => itemRows.filter((r) => r.selected).length, [itemRows]);
  const duration = useMemo(() => getDuration(startTime, endTime), [startTime, endTime]);

  const avgDiscount = useMemo(() => {
    const selected = itemRows.filter((r) => r.selected);
    if (selected.length === 0) return 0;
    return Math.round(selected.reduce((sum, r) => sum + r.discountPercent, 0) / selected.length);
  }, [itemRows]);

  // ── Effects ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const existingItemIds = new Set(
      existingCollection?.items?.map((ci) => ci.menuItem.id) ?? []
    );

    const rows: HappyHourItemRow[] = allMenuItems.map((mi) => {
      const existingItem = existingCollection?.items?.find((ci) => ci.menuItem.id === mi.id);
      const isSelected = existingItemIds.has(mi.id);
      const hhPrice =
        existingItem?.menuItem.happyHourPrice ?? mi.happyHourPrice ?? mi.price * 0.8;
      const discount =
        mi.price > 0 ? Math.round(((mi.price - hhPrice) / mi.price) * 100) : 0;

      return {
        menuItemId: mi.id,
        name: mi.name,
        description: mi.description || '',
        category: mi.category || '',
        originalPrice: mi.price,
        happyHourPrice: hhPrice,
        discountPercent: discount,
        selected: isSelected,
      };
    });

    setItemRows(rows);

    if (existingCollection) {
      setCollectionName(existingCollection.name);
      setStartTime(existingCollection.startTime || defaultStartTime);
      setEndTime(existingCollection.endTime || defaultEndTime);
    } else {
      setCollectionName(defaultName);
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
    }
  }, [isOpen, existingCollection, allMenuItems.length]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const toggleItem = (menuItemId: number) => {
    setItemRows((prev) =>
      prev.map((r) =>
        r.menuItemId === menuItemId ? { ...r, selected: !r.selected } : r
      )
    );
  };

  const handleSave = async () => {
    const selectedItems = itemRows.filter((r) => r.selected);
    if (!collectionName.trim() || selectedItems.length === 0) return;

    try {
      let collectionId: number;

      if (existingCollection) {
        await updateCollection.mutateAsync({
          collectionId: existingCollection.id,
          data: {
            name: collectionName.trim(),
            menuType: 'HAPPY_HOUR',
            subType: defaultSubType,
            startTime,
            endTime,
          },
        });
        collectionId = existingCollection.id;
      } else {
        const result = await createCollection.mutateAsync({
          name: collectionName.trim(),
          menuType: 'HAPPY_HOUR',
          subType: defaultSubType,
          startTime,
          endTime,
          storeId: selectedStoreId ?? undefined,
        });
        collectionId = result.collection.id;
      }

      const bulkItems: BulkItemData[] = selectedItems.map((r) => ({
        id: r.menuItemId,
        name: r.name,
        price: r.originalPrice,
        isHappyHour: true,
        happyHourPrice: r.happyHourPrice,
      }));

      await bulkUpdate.mutateAsync({ collectionId, items: bulkItems });
      onClose();
    } catch {
      // Errors handled by mutation hooks
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'bg-white border border-neutral-200 text-neutral-800',
          'sm:max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden'
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <DialogTitle className="font-heading text-lg font-bold text-neutral-900">
            {collectionName || 'Happy Hour'}
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-0.5">
            Choose items from your daily menu and set discounts
          </p>
        </DialogHeader>

        {/* Scrollable body */}
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

          {/* ── Happy Hour Schedule card ── */}
          <div className="rounded-2xl border border-brand/20 bg-brand-subtle/50 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                <Clock className="h-4 w-4 text-brand" />
              </div>
              <span className="text-sm font-bold text-neutral-900">Happy Hour Schedule</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Start Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Start Time
                </label>
                <div className="relative group">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={cn(
                      "w-full rounded-xl bg-white border border-neutral-200 text-neutral-900 text-base font-medium px-4 py-3.5",
                      "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all",
                      "group-hover:border-neutral-300"
                    )}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Clock className="h-4 w-4 text-neutral-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-neutral-400 pl-1">{to12h(startTime)}</p>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  End Time
                </label>
                <div className="relative group">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={cn(
                      "w-full rounded-xl bg-white border border-neutral-200 text-neutral-900 text-base font-medium px-4 py-3.5",
                      "focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all",
                      "group-hover:border-neutral-300"
                    )}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Clock className="h-4 w-4 text-neutral-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-neutral-400 pl-1">{to12h(endTime)}</p>
              </div>

              {/* Duration badge */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Total Duration
                </label>
                <div className="flex h-[60px] items-center justify-center rounded-xl border border-dashed border-brand/30 bg-white/50 px-4">
                  <p className="text-2xl font-black text-neutral-900 tracking-tight">
                    {duration.label.split(' ')[0]}
                    <span className="text-sm font-bold text-neutral-400 ml-1">
                      {duration.label.split(' ').slice(1).join(' ')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Menu items list ── */}
          <div className="space-y-3">
            {allMenuItems.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-neutral-500">
                  No menu items yet. Add items to your Standard menu first.
                </p>
              </div>
            )}

            {itemRows.map((row) => (
              <div
                key={row.menuItemId}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  row.selected
                    ? 'border-brand/20 bg-brand-subtle'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Toggle switch */}
                  <div className="pt-0.5">
                    <Switch
                      checked={row.selected}
                      onCheckedChange={() => toggleItem(row.menuItemId)}
                      className="data-[state=checked]:bg-brand"
                    />
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">{row.name}</p>
                    {row.description && (
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                        {row.description}
                      </p>
                    )}
                    {row.category && (
                      <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                        {row.category}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      Regular Price
                    </p>
                    <p className="text-lg font-bold text-brand">
                      ${row.originalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Expanded discount controls when selected */}
                {row.selected && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-neutral-500 mb-1 block">
                        Happy Hour Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">$</span>
                        <input
                          type="number"
                          value={row.happyHourPrice || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItemRows((prev) =>
                              prev.map((r) => {
                                if (r.menuItemId !== row.menuItemId) return r;
                                const disc =
                                  r.originalPrice > 0
                                    ? Math.round(((r.originalPrice - val) / r.originalPrice) * 100)
                                    : 0;
                                return { ...r, happyHourPrice: val, discountPercent: disc };
                              })
                            );
                          }}
                          min={0}
                          step={0.01}
                          className="w-full rounded-lg bg-neutral-50 border border-neutral-200 text-brand text-sm pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30"
                        />
                      </div>
                    </div>
                    <div className="w-24">
                      <label className="text-xs font-medium text-neutral-500 mb-1 block">
                        Discount
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={row.discountPercent || ''}
                          onChange={(e) => {
                            const disc = parseInt(e.target.value) || 0;
                            setItemRows((prev) =>
                              prev.map((r) => {
                                if (r.menuItemId !== row.menuItemId) return r;
                                const newPrice =
                                  Math.round(r.originalPrice * (1 - disc / 100) * 100) / 100;
                                return { ...r, happyHourPrice: newPrice, discountPercent: disc };
                              })
                            );
                          }}
                          min={0}
                          max={100}
                          className="w-full rounded-lg bg-neutral-50 border border-neutral-200 text-brand text-sm px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-brand">%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="mx-6 rounded-xl bg-neutral-50 border border-neutral-200 px-5 py-3 grid grid-cols-3 text-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">Selected Items</p>
            <p className="text-xl font-bold text-neutral-900">{selectedCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">Avg. Discount</p>
            <p className="text-xl font-bold text-brand">{avgDiscount}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-400">Duration</p>
            <p className="text-xl font-bold text-neutral-900">{duration.hours}h</p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-medium">{selectedCount} items selected</span>
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
              disabled={isSaving || !collectionName.trim() || selectedCount === 0}
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
                  Save Happy Hour Menu ({selectedCount} items)
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

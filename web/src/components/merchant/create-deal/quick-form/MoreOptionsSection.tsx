// src/components/merchant/create-deal/quick-form/MoreOptionsSection.tsx
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Utensils, Tag as TagIcon, FileText, ScrollText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDealCreation, type SelectedMenuItem } from '@/context/DealCreationContext';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import { InlineCategoryGrid } from './InlineCategoryGrid';
import { DealImageUpload } from '../DealImageUpload';
import { Textarea } from '@/components/ui/textarea';
import { SectionCard, FieldLabel } from './SectionCard';

type TabKey = 'category' | 'menu' | 'images' | 'redemption' | 'terms';

interface TabDef {
  key: TabKey;
  label: string;
  icon: typeof Camera;
}

interface MoreOptionsSectionProps {
  hideMenu?: boolean;
}

/**
 * Tab-based "more options" panel. Replaces the previous collapsible UI
 * (which had popover-clipping issues with the category dropdown) with a
 * single visible panel per tab so each section can render its own
 * overlays without conflicting with siblings.
 */
export const MoreOptionsSection = ({ hideMenu = false }: MoreOptionsSectionProps) => {
  const { state, dispatch } = useDealCreation();
  const { data: menuData, isLoading: menuLoading } = useMerchantMenu();
  const menuItems: MenuItem[] = menuData?.menuItems ?? [];
  const selectedIds = useMemo(
    () => new Set((state.selectedMenuItems ?? []).map((i) => i.id)),
    [state.selectedMenuItems],
  );

  const tabs: TabDef[] = useMemo(
    () =>
      [
        { key: 'category' as const, label: 'Category', icon: TagIcon },
        !hideMenu ? { key: 'menu' as const, label: 'Menu items', icon: Utensils } : null,
        { key: 'images' as const, label: 'Images', icon: Camera },
        { key: 'redemption' as const, label: 'Redemption', icon: FileText },
        { key: 'terms' as const, label: 'Terms', icon: ScrollText },
      ].filter(Boolean) as TabDef[],
    [hideMenu],
  );

  const [active, setActive] = useState<TabKey>('category');

  const tabBadge: Record<TabKey, string | null> = {
    category: state.category && state.category !== 'FOOD_AND_BEVERAGE' ? '✓' : null,
    menu: selectedIds.size > 0 ? String(selectedIds.size) : null,
    images: state.imageUrls?.length ? String(state.imageUrls.length) : null,
    redemption:
      state.redemptionInstructions && state.redemptionInstructions !== 'Show this screen to redeem.' ? '✓' : null,
    terms: state.offerTerms ? '✓' : null,
  };

  const toggleMenuItem = (item: MenuItem) => {
    const next: SelectedMenuItem[] = selectedIds.has(item.id)
      ? (state.selectedMenuItems ?? []).filter((i) => i.id !== item.id)
      : [
          ...(state.selectedMenuItems ?? []),
          {
            id: item.id,
            name: item.name,
            price: item.price,
            category: (item.category as 'Bites' | 'Drinks') ?? 'Bites',
            imageUrl: item.imageUrl ?? '',
            isHidden: false,
          } satisfies SelectedMenuItem,
        ];
    dispatch({ type: 'SET_SELECTED_ITEMS', payload: next });
  };

  return (
    <SectionCard>
      <FieldLabel label="More options" hint="Add the extras that make your deal pop" />

      {/* Tab strip */}
      <div className="mt-3 flex flex-wrap gap-1.5 rounded-2xl bg-neutral-100 p-1">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          const badge = tabBadge[tab.key];
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition',
                isActive
                  ? 'bg-white text-neutral-900 shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
                  : 'text-neutral-600 hover:text-neutral-900',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {badge ? (
                <span
                  className={cn(
                    'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-emerald-100/60 text-emerald-600',
                  )}
                >
                  {badge === '✓' ? <Check className="h-2.5 w-2.5" /> : badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {active === 'category' ? (
              <div>
                <p className="mb-3 text-[12px] text-neutral-500">
                  Help guests discover your deal — picking the right category gets it into the right feeds.
                </p>
                <InlineCategoryGrid
                  value={state.category ?? 'FOOD_AND_BEVERAGE'}
                  onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'category', value: v })}
                />
              </div>
            ) : null}

            {active === 'menu' && !hideMenu ? (
              <div>
                <p className="mb-3 text-[12px] text-neutral-500">
                  Pick the items this deal applies to. Leave empty to apply across the whole menu.
                </p>
                {menuLoading ? (
                  <div className="text-[12px] text-neutral-500">Loading menu…</div>
                ) : menuItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-[12px] text-neutral-500">
                    You haven't added any menu items yet. Skip for now, or add items from the Menu page.
                  </div>
                ) : (
                  <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                    {menuItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleMenuItem(item)}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition',
                            isSelected
                              ? 'border-neutral-900 bg-neutral-50'
                              : 'border-neutral-200 bg-white hover:border-neutral-300',
                          )}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-neutral-900">{item.name}</div>
                            <div className="text-[11px] text-neutral-500">
                              ${item.price?.toFixed(2) ?? '—'} {item.category ? `· ${item.category}` : ''}
                            </div>
                          </div>
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border',
                              isSelected
                                ? 'border-neutral-900 bg-neutral-900 text-white'
                                : 'border-neutral-300 bg-white',
                            )}
                          >
                            {isSelected ? <Check className="h-3 w-3" /> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {active === 'images' ? (
              <div>
                <p className="mb-3 text-[12px] text-neutral-500">
                  Upload up to 5 images. The first one is the main hero shown in the preview.
                </p>
                <DealImageUpload
                  images={state.imageUrls ?? []}
                  onImagesChange={(urls) => dispatch({ type: 'SET_IMAGE_URLS', payload: urls })}
                  maxImages={5}
                />
              </div>
            ) : null}

            {active === 'redemption' ? (
              <div>
                <p className="mb-3 text-[12px] text-neutral-500">
                  Tell staff and guests what to show or say to redeem.
                </p>
                <Textarea
                  value={state.redemptionInstructions}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'redemptionInstructions',
                      value: e.target.value.slice(0, 500),
                    })
                  }
                  rows={4}
                  placeholder="Show this screen to redeem."
                  className="resize-none rounded-xl border-neutral-200 bg-white text-[14px]"
                  maxLength={500}
                />
              </div>
            ) : null}

            {active === 'terms' ? (
              <div>
                <p className="mb-3 text-[12px] text-neutral-500">
                  Add any small print — dine-in only, one per guest, can't combine with other offers, etc.
                </p>
                <Textarea
                  value={state.offerTerms}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'offerTerms',
                      value: e.target.value.slice(0, 500),
                    })
                  }
                  rows={4}
                  placeholder="e.g. Dine-in only. One per guest. Cannot combine with other offers."
                  className="resize-none rounded-xl border-neutral-200 bg-white text-[14px]"
                  maxLength={500}
                />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionCard>
  );
};

export default MoreOptionsSection;

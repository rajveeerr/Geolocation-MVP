import React from 'react';
import { Edit2, Trash2, Clock, Layers, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuCollection } from '@/hooks/useMenuCollections';

interface MenuListCardProps {
  collection: MenuCollection;
  merchantItemsById?: Record<number, MenuCollection['items'][number]['menuItem'] | undefined>;
  onEdit: (collection: MenuCollection) => void;
  onDelete: (collection: MenuCollection) => void;
  className?: string;
}

/** Convert "HH:MM" → "H PM/AM" for display */
function formatTime(time: string): string {
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return m > 0 ? `${h}:${mStr} ${suffix}` : `${h} ${suffix}`;
}

function getInventoryTone(status?: string, hasVariants?: boolean) {
  if (hasVariants) {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
  switch (status) {
    case 'OUT_OF_STOCK':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'LOW_STOCK':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'IN_STOCK':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function getInventoryLabel(status?: string, quantity?: number | null, hasVariants?: boolean) {
  if (hasVariants) return 'Per variant';
  if (status === 'OUT_OF_STOCK') return 'Out';
  if (status === 'LOW_STOCK') return quantity != null ? `Low ${quantity}` : 'Low';
  if (status === 'IN_STOCK') return quantity != null ? `${quantity} in stock` : 'In stock';
  return 'Untracked';
}

export const MenuListCard: React.FC<MenuListCardProps> = ({
  collection,
  merchantItemsById = {},
  onEdit,
  onDelete,
  className,
}) => {
  const itemCount = collection._count?.items ?? collection.items?.length ?? 0;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const visibleItems = collection.items ?? [];
  const previewItems = visibleItems.slice(0, 2);
  const hiddenPreviewCount = Math.max(itemCount - previewItems.length, 0);
  const collectionTypeLabel =
    collection.menuType === 'HAPPY_HOUR'
      ? 'Happy Hour'
      : collection.menuType === 'SPECIAL'
        ? 'Special'
        : 'Standard';
  const secondaryMeta =
    collection.menuType === 'HAPPY_HOUR' && collection.startTime && collection.endTime
      ? `${formatTime(collection.startTime)} - ${formatTime(collection.endTime)}`
      : `${itemCount} item${itemCount === 1 ? '' : 's'}`;

  return (
    <div
      className={cn(
        'group relative min-h-[208px] rounded-[1.25rem] border px-5 py-5',
        'border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.04)]',
        'transition-all duration-200 hover:border-neutral-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem]',
            collection.menuType === 'HAPPY_HOUR'
              ? 'bg-amber-100 text-amber-700'
              : collection.menuType === 'SPECIAL'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-brand/10 text-brand'
          )}
        >
          {collection.icon ? (
            <span className="text-base">{collection.icon}</span>
          ) : collection.menuType === 'HAPPY_HOUR' ? (
            <Clock className="h-5 w-5 text-amber-600" />
          ) : (
            <span className="text-sm font-bold">
              {collection.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              {collectionTypeLabel}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shrink-0 shadow-sm transition-all',
                collection.isActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-100 text-neutral-500'
              )}
            >
              {collection.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="truncate text-[1.05rem] font-semibold tracking-tight text-neutral-900">
                {collection.name}
              </p>
              {collection.description ? (
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-500">{collection.description}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                {secondaryMeta}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                {isExpanded ? 'Hide details' : 'Open menu'}
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform duration-200', isExpanded && 'rotate-180')}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(collection)}
            className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(collection)}
            className="rounded-full p-2 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-neutral-100 pt-4">
        {itemCount > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {previewItems.map((item, idx) => {
              const canonicalMenuItem = merchantItemsById[item.menuItemId] ?? item.menuItem;
              return (
                <span
                  key={item.menuItemId || idx}
                  className="inline-flex max-w-full items-center rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700"
                >
                  <span className="truncate">{canonicalMenuItem?.name || 'Unnamed item'}</span>
                </span>
              );
            })}
            {hiddenPreviewCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-500">
                +{hiddenPreviewCount} more
              </span>
            ) : null}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            Needs items before publishing
          </div>
        )}
      </div>

      {isExpanded ? (
        <div className="mt-4 rounded-[1rem] border border-neutral-100 bg-neutral-50/70 p-3">
          {itemCount > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Included items
                </p>
                <button
                  type="button"
                  onClick={() => onEdit(collection)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 transition-colors hover:text-neutral-900"
                >
                  Manage menu
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {visibleItems.map((item, idx) => {
                  const canonicalMenuItem = merchantItemsById[item.menuItemId] ?? item.menuItem;
                  return (
                    <div
                      key={item.menuItemId || idx}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold',
                        'border-neutral-200 bg-white text-neutral-700'
                      )}
                    >
                      <span>{canonicalMenuItem?.name || 'Unnamed'}</span>
                      {canonicalMenuItem?.hasVariants && canonicalMenuItem?.variants && canonicalMenuItem.variants.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                          <Layers className="h-2.5 w-2.5" />
                          {canonicalMenuItem.variants.length}
                        </span>
                      )}
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          getInventoryTone(canonicalMenuItem?.inventoryStatus, canonicalMenuItem?.hasVariants)
                        )}
                      >
                        {getInventoryLabel(
                          canonicalMenuItem?.inventoryStatus,
                          canonicalMenuItem?.inventoryQuantity,
                          canonicalMenuItem?.hasVariants
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-[0.9rem] border border-dashed border-neutral-200 bg-white px-4 py-4">
              <p className="text-sm font-medium text-neutral-700">No items assigned yet</p>
              <p className="mt-1 text-xs text-neutral-500">Open this menu and add items to make it ready for publishing.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

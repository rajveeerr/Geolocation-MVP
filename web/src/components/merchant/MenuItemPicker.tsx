import { useMemo, useState } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import { cn } from '@/lib/utils';

interface MenuItemPickerProps {
  /** Selected menu-item IDs. */
  value: number[];
  onChange: (next: number[]) => void;
  emptyHint?: string;
}

/**
 * Compact multi-select for the merchant's own menu items. Lets the merchant
 * scope a deal (bounty / BOGO / etc.) to specific items inline, without
 * navigating through the multi-step deal creation flow.
 */
export const MenuItemPicker = ({ value, onChange, emptyHint }: MenuItemPickerProps) => {
  const { data, isLoading, error } = useMerchantMenu();
  const [query, setQuery] = useState('');

  const items: MenuItem[] = data?.menuItems ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.category ?? '').toLowerCase().includes(q),
    );
  }, [items, query]);

  const selected = new Set(value);
  const toggle = (id: number) => {
    if (selected.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading menu items…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
        Couldn’t load menu items. Try refreshing.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-center text-sm text-neutral-500">
        {emptyHint ?? 'You haven’t added any menu items yet. Add items from the Menu section to attach them to this deal.'}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="relative border-b border-neutral-200 px-3 py-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search menu items…"
          className="h-8 w-full bg-transparent pl-7 text-sm outline-none placeholder:text-neutral-400"
        />
      </div>
      <div className="max-h-56 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-neutral-500">
            No items match “{query}”.
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition',
                  isSelected ? 'bg-orange-50' : 'hover:bg-neutral-50',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                    isSelected
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-neutral-300 bg-white',
                  )}
                >
                  {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-neutral-900">
                    {item.name}
                  </span>
                  <span className="truncate text-[11px] text-neutral-500">
                    {item.category || 'Uncategorized'}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-neutral-900">
                  ${item.price.toFixed(2)}
                </span>
              </button>
            );
          })
        )}
      </div>
      <div className="border-t border-neutral-200 px-3 py-2 text-[11px] text-neutral-500">
        {value.length === 0
          ? 'No items selected — deal will apply broadly.'
          : `${value.length} item${value.length === 1 ? '' : 's'} selected`}
      </div>
    </div>
  );
};

export default MenuItemPicker;

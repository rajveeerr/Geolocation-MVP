// src/components/merchant/create-deal/quick-form/InlineCategoryGrid.tsx
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';

interface InlineCategoryGridProps {
  value?: string;
  onChange: (value: string) => void;
}

/**
 * Inline grid of category buttons — no popover/dropdown, so it can render
 * inside a tab panel without overflowing siblings. Drop-in replacement
 * for CategorySelector when the surrounding container can't host a floating
 * dropdown.
 */
export const InlineCategoryGrid = ({ value, onChange }: InlineCategoryGridProps) => {
  const { data, isLoading, error } = useCategories();
  const categories = data?.categories ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted px-4 py-6 text-[12px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading categories…
      </div>
    );
  }

  if (error || categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted px-4 py-6 text-center text-[12px] text-muted-foreground">
        Categories unavailable right now — we'll use Food &amp; Beverage by default.
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Deal category"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {categories.map((cat) => {
        const isSelected = value === cat.value;
        return (
          <button
            key={cat.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(cat.value)}
            className={cn(
              'flex items-start gap-3 rounded-xl border-2 p-3 text-left transition',
              isSelected
                ? 'border-foreground bg-muted shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
                : 'border-border bg-card hover:border-border hover:bg-muted',
            )}
          >
            <span className="text-xl leading-none">{cat.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-semibold text-foreground">{cat.label}</span>
                {isSelected ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                ) : null}
              </div>
              {cat.description ? (
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {cat.description}
                </p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default InlineCategoryGrid;

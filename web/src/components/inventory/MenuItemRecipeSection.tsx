import React, { useEffect, useImperativeHandle, useMemo, useState, forwardRef } from 'react';
import { Plus, Trash2, ChefHat, AlertCircle } from 'lucide-react';
import { useIngredients, useMenuItemRecipe, type Ingredient } from '@/hooks/useIngredients';
import { cn } from '@/lib/utils';

export interface RecipeDraft {
  ingredientId: number;
  ingredientName: string;
  ingredientUnit: string;
  quantityPerUnit: number;
}

export interface MenuItemRecipeSectionHandle {
  /** Returns the current set of recipe drafts so the parent can persist them after save. */
  getDrafts: () => RecipeDraft[];
}

interface Props {
  /** Pass null for a new (not-yet-created) menu item. */
  menuItemId: number | null;
}

const MenuItemRecipeSection = forwardRef<MenuItemRecipeSectionHandle, Props>(
  ({ menuItemId }, ref) => {
    const ingredientsQuery = useIngredients();
    const existingRecipe = useMenuItemRecipe(menuItemId);

    const [drafts, setDrafts] = useState<RecipeDraft[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from existing recipe once (or when menuItemId changes)
    useEffect(() => {
      if (!menuItemId || hydrated) return;
      if (existingRecipe.data) {
        setDrafts(
          existingRecipe.data.map((l) => ({
            ingredientId: l.ingredientId,
            ingredientName: l.ingredientName ?? `Ingredient #${l.ingredientId}`,
            ingredientUnit: l.ingredientUnit ?? '',
            quantityPerUnit: l.quantityPerUnit,
          })),
        );
        setHydrated(true);
      }
    }, [menuItemId, existingRecipe.data, hydrated]);

    useImperativeHandle(ref, () => ({
      getDrafts: () => drafts,
    }), [drafts]);

    const ingredients = ingredientsQuery.data ?? [];
    const availableIngredients = useMemo(() => {
      const used = new Set(drafts.map((d) => d.ingredientId));
      return ingredients.filter((i) => !used.has(i.id));
    }, [ingredients, drafts]);

    const addLink = (ing: Ingredient) => {
      setDrafts((prev) => [
        ...prev,
        {
          ingredientId: ing.id,
          ingredientName: ing.name,
          ingredientUnit: ing.unitType,
          quantityPerUnit: 1,
        },
      ]);
    };

    const updateQty = (ingredientId: number, qty: number) => {
      setDrafts((prev) =>
        prev.map((d) => (d.ingredientId === ingredientId ? { ...d, quantityPerUnit: qty } : d)),
      );
    };

    const removeLink = (ingredientId: number) => {
      setDrafts((prev) => prev.filter((d) => d.ingredientId !== ingredientId));
    };

    return (
      <div className="space-y-4 rounded-lg border border-border bg-accent/50 p-4">
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
            <ChefHat className="h-5 w-5 text-brand" />
          </span>
          <div className="flex-1">
            <h3 className="font-heading text-base font-bold text-foreground">
              Recipe / Ingredients used
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Link the ingredients this item is made from. We&apos;ll compute real days-left for your raw inventory from your sales velocity.
            </p>
          </div>
        </div>

        {ingredientsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading ingredients…</p>
        ) : ingredients.length === 0 ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              No ingredients tracked yet. Add ingredients from the{' '}
              <a href="/merchant/inventory?tab=ingredients" className="font-semibold underline">
                Inventory → Ingredients
              </a>{' '}
              tab first, then come back to wire them up here.
            </span>
          </div>
        ) : (
          <>
            {drafts.length === 0 && (
              <p className="text-sm text-muted-foreground">No ingredients linked yet.</p>
            )}

            <div className="space-y-2">
              {drafts.map((d) => (
                <div
                  key={d.ingredientId}
                  className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 ring-1 ring-neutral-200"
                >
                  <span className="flex-1 truncate text-sm font-medium text-foreground">
                    {d.ingredientName}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={d.quantityPerUnit}
                    onChange={(e) => updateQty(d.ingredientId, Number(e.target.value) || 0)}
                    className="w-20 rounded-md border border-border px-2 py-1 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <span className="text-xs text-muted-foreground">{d.ingredientUnit || 'unit'}/item</span>
                  <button
                    type="button"
                    onClick={() => removeLink(d.ingredientId)}
                    className="rounded-full p-1 text-muted-foreground transition hover:bg-red-50 dark:bg-red-950/30 hover:text-red-500"
                    title="Remove ingredient from recipe"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {availableIngredients.length > 0 && (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <select
                  value=""
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const ing = availableIngredients.find((i) => i.id === id);
                    if (ing) addLink(ing);
                  }}
                  className={cn(
                    'flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
                  )}
                >
                  <option value="">Add an ingredient to this recipe…</option>
                  {availableIngredients.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.category}, {i.unitType})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>
    );
  },
);

MenuItemRecipeSection.displayName = 'MenuItemRecipeSection';

export default MenuItemRecipeSection;

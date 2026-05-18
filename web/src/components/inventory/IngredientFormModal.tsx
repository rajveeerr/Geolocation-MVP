import React, { useEffect, useMemo, useState } from 'react';
import { X, Trash2, Save, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';
import {
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
  useUpdateIngredientRecipe,
  type Ingredient,
} from '@/hooks/useIngredients';
import { useMerchantMenu } from '@/hooks/useMerchantMenu';

interface Props {
  open: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
}

const CATEGORY_GROUPS: { label: string; options: string[] }[] = [
  {
    label: 'Food',
    options: ['Produce', 'Citrus', 'Dairy', 'Meat', 'Seafood', 'Poultry', 'Bakery', 'Pantry', 'Spice', 'Garnish', 'Frozen', 'Food'],
  },
  {
    label: 'Beverage',
    options: ['Spirit', 'Beer', 'Wine', 'Syrup', 'Soft Drink', 'Coffee & Tea', 'Mixer', 'Juice'],
  },
  {
    label: 'Non-food',
    options: ['Textile', 'Apparel', 'Merchandise', 'Packaging', 'Paper Goods', 'Cleaning', 'Disposables', 'Bar Tools', 'Equipment'],
  },
  {
    label: 'Other',
    options: ['Waste', 'Other'],
  },
];

const UNIT_OPTIONS = [
  { value: 'oz', label: 'oz (Ounce)' },
  { value: 'fl oz', label: 'fl oz (Fluid Ounce)' },
  { value: 'lb', label: 'lb (Pound)' },
  { value: 'kg', label: 'kg (Kilogram)' },
  { value: 'g', label: 'g (Gram)' },
  { value: 'ea', label: 'ea (Each)' },
  { value: 'case', label: 'case' },
  { value: 'gal', label: 'gal (Gallon)' },
  { value: 'L', label: 'L (Liter)' },
  { value: 'ml', label: 'ml (Milliliter)' },
  { value: 'yd', label: 'yd (Yard)' },
  { value: 'm', label: 'm (Meter)' },
];

const ALL_CATEGORY_OPTIONS = CATEGORY_GROUPS.flatMap((g) => g.options);

interface RecipeLinkDraft {
  menuItemId: number;
  menuItemName: string;
  quantityPerUnit: number;
}

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-widest text-neutral-400';
const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

const IngredientFormModal: React.FC<Props> = ({ open, ingredient, onClose }) => {
  const isEdit = !!ingredient;
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const deleteMutation = useDeleteIngredient();
  const recipeMutation = useUpdateIngredientRecipe();
  const { data: menuData } = useMerchantMenu();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORY_OPTIONS[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [unitType, setUnitType] = useState(UNIT_OPTIONS[0].value);
  const [currentCost, setCurrentCost] = useState('0');
  const [stockLevel, setStockLevel] = useState('0');
  const [avgDailyUsage, setAvgDailyUsage] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierUrl, setSupplierUrl] = useState('');
  const [recipeLinks, setRecipeLinks] = useState<RecipeLinkDraft[]>([]);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (ingredient) {
      setName(ingredient.name);
      const matchesPreset = ALL_CATEGORY_OPTIONS.includes(ingredient.category);
      setCategory(matchesPreset ? ingredient.category : '__custom__');
      setCustomCategory(matchesPreset ? '' : (ingredient.category || ''));
      setUnitType(ingredient.unitType || UNIT_OPTIONS[0].value);
      setCurrentCost(String(ingredient.currentCost));
      setStockLevel(String(ingredient.stockLevel));
      setAvgDailyUsage(ingredient.avgDailyUsage != null ? String(ingredient.avgDailyUsage) : '');
      setSupplierName(ingredient.supplierName || '');
      setSupplierUrl(ingredient.supplierUrl || '');
      setRecipeLinks(
        ingredient.recipeLinks.map((link) => ({
          menuItemId: link.menuItemId,
          menuItemName: link.menuItemName || `Item #${link.menuItemId}`,
          quantityPerUnit: link.quantityPerUnit,
        })),
      );
    } else {
      setName('');
      setCategory(ALL_CATEGORY_OPTIONS[0]);
      setCustomCategory('');
      setUnitType(UNIT_OPTIONS[0].value);
      setCurrentCost('0');
      setStockLevel('0');
      setAvgDailyUsage('');
      setSupplierName('');
      setSupplierUrl('');
      setRecipeLinks([]);
    }
    setConfirmingDelete(false);
  }, [ingredient, open]);

  const availableMenuItems = useMemo(() => {
    const all = menuData?.menuItems ?? [];
    const linkedIds = new Set(recipeLinks.map((l) => l.menuItemId));
    return all.filter((m: any) => !linkedIds.has(m.id));
  }, [menuData, recipeLinks]);

  if (!open) return null;

  const effectiveCategory = category === '__custom__' ? customCategory.trim() : category;

  const validate = (): string | null => {
    if (!name.trim()) return 'Name is required.';
    if (!effectiveCategory) return 'Category is required.';
    if (!unitType.trim()) return 'Unit is required.';
    const cost = Number(currentCost);
    if (!Number.isFinite(cost) || cost < 0) return 'Cost must be a non-negative number.';
    const stock = Number(stockLevel);
    if (!Number.isFinite(stock) || stock < 0) return 'Stock must be a non-negative number.';
    return null;
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || recipeMutation.isPending;

  const handleSave = async () => {
    const err = validate();
    if (err) return;

    const usageNum = avgDailyUsage.trim() === '' ? null : Number(avgDailyUsage);
    const payload = {
      name: name.trim(),
      category: effectiveCategory,
      unitType: unitType.trim(),
      currentCost: Number(currentCost),
      stockLevel: Number(stockLevel),
      avgDailyUsage: usageNum != null && Number.isFinite(usageNum) ? usageNum : null,
      supplierName: supplierName.trim() || null,
      supplierUrl: supplierUrl.trim() || null,
    };

    try {
      let savedId: number;
      if (isEdit && ingredient) {
        const updated = await updateMutation.mutateAsync({ id: ingredient.id, input: payload });
        savedId = updated.id;
      } else {
        const created = await createMutation.mutateAsync(payload);
        savedId = created.id;
      }

      await recipeMutation.mutateAsync({
        id: savedId,
        links: recipeLinks.map((l) => ({
          menuItemId: l.menuItemId,
          quantityPerUnit: l.quantityPerUnit,
        })),
      });
      onClose();
    } catch {
      // toasts surface error
    }
  };

  const handleDelete = async () => {
    if (!ingredient) return;
    try {
      await deleteMutation.mutateAsync(ingredient.id);
      onClose();
    } catch {
      // toast surfaces error
    }
  };

  const addRecipeLink = (menuItemId: number, menuItemName: string) => {
    setRecipeLinks((prev) => [...prev, { menuItemId, menuItemName, quantityPerUnit: 1 }]);
  };

  const updateLinkQty = (menuItemId: number, qty: number) => {
    setRecipeLinks((prev) =>
      prev.map((l) => (l.menuItemId === menuItemId ? { ...l, quantityPerUnit: qty } : l)),
    );
  };

  const removeLink = (menuItemId: number) => {
    setRecipeLinks((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  };

  const validationError = validate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.16)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
              <Save className="h-5 w-5 text-brand" />
            </span>
            <h2 className="font-heading text-xl font-bold text-foreground">
              {isEdit ? 'Edit Ingredient' : 'Add Ingredient'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className={labelClass}>Ingredient name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Fresh Lime Juice"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {CATEGORY_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                ))}
                <option value="__custom__">+ Custom category…</option>
              </select>
              {category === '__custom__' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className={cn(inputClass, 'mt-2')}
                  placeholder="Type a custom category (e.g. Floral, Edibles)"
                  autoFocus
                />
              )}
            </div>
            <div>
              <label className={labelClass}>Unit type</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className={inputClass}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Current cost ($ / {unitType})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentCost}
                onChange={(e) => setCurrentCost(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Stock level ({unitType})</label>
              <input
                type="number"
                step="1"
                min="0"
                value={stockLevel}
                onChange={(e) => setStockLevel(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Avg daily usage ({unitType}/day, optional)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={avgDailyUsage}
              onChange={(e) => setAvgDailyUsage(e.target.value)}
              className={inputClass}
              placeholder="Used to compute days-left"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass}>Supplier name</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Local Produce Wholesale"
              />
            </div>
            <div>
              <label className={labelClass}>Supplier URL (Shopify, wholesale, etc)</label>
              <input
                type="url"
                value={supplierUrl}
                onChange={(e) => setSupplierUrl(e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </div>
          </div>

          {/* Recipe links */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <div className={labelClass + ' mb-0'}>Used in menu items (recipe)</div>
              <div className="text-xs text-neutral-500">
                Used to compute days-left from sales velocity
              </div>
            </div>

            {recipeLinks.length === 0 && (
              <p className="mt-2 text-xs text-neutral-500">No menu items linked yet.</p>
            )}

            <div className="mt-3 space-y-2">
              {recipeLinks.map((link) => (
                <div key={link.menuItemId} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-neutral-200">
                  <span className="flex-1 truncate text-sm font-medium text-neutral-800">
                    {link.menuItemName}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={link.quantityPerUnit}
                    onChange={(e) => updateLinkQty(link.menuItemId, Number(e.target.value) || 0)}
                    className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                  />
                  <span className="text-xs text-neutral-500">{unitType}/unit</span>
                  <button
                    type="button"
                    onClick={() => removeLink(link.menuItemId)}
                    className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {availableMenuItems.length > 0 && (
              <div className="mt-3">
                <select
                  className={cn(inputClass, 'text-sm')}
                  value=""
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const item = availableMenuItems.find((m: any) => m.id === id);
                    if (item) addRecipeLink(item.id, item.name);
                  }}
                >
                  <option value="">+ Add menu item linkage…</option>
                  {availableMenuItems.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {validationError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {validationError}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {isEdit ? (
            confirmingDelete ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Confirm delete
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                title="Delete ingredient"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )
          ) : (
            <span />
          )}

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!!validationError || isSaving}
            icon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IngredientFormModal;

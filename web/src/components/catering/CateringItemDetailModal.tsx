import { useEffect, useMemo, useState } from 'react';
import { ChefHat, MessageSquare, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/common/Button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCateringCart } from '@/context/CateringCartContext';
import { cn } from '@/lib/utils';
import type { CateringItem, CateringItemOption } from '@/types/catering';

interface CateringItemDetailModalProps {
  item: CateringItem | null;
  onClose: () => void;
  merchantId: number;
  merchantName: string;
  onAddedToCart?: () => void;
}

/** Per-option-group selection state: optionId → set of choice ids. */
type Selections = Record<number, Set<number>>;

const buildInitialSelections = (item: CateringItem | null): Selections => {
  const out: Selections = {};
  if (!item) return out;
  for (const opt of item.options) {
    const set = new Set<number>();
    // Pre-select default choices, but never more than maxSelections.
    for (const c of opt.choices) {
      if (c.isDefault && set.size < opt.maxSelections) set.add(c.id);
    }
    // If required and nothing pre-selected, pre-select the first choice for radios.
    if (opt.isRequired && set.size === 0 && opt.maxSelections === 1 && opt.choices.length > 0) {
      set.add(opt.choices[0].id);
    }
    out[opt.id] = set;
  }
  return out;
};

const optionPriceContribution = (option: CateringItemOption, selected: Set<number>) => {
  let total = 0;
  for (const c of option.choices) {
    if (selected.has(c.id)) total += c.priceModifier;
  }
  return total;
};

const formatMoney = (n: number) => `$${n.toFixed(2)}`;

export const CateringItemDetailModal = ({
  item,
  onClose,
  merchantId,
  merchantName,
  onAddedToCart,
}: CateringItemDetailModalProps) => {
  const { toast } = useToast();
  const { addLine } = useCateringCart();
  const [quantity, setQuantity] = useState(item?.minPeople ?? 1);
  const [selections, setSelections] = useState<Selections>(() => buildInitialSelections(item));
  const [notes, setNotes] = useState('');

  // Reset internal state whenever the modal opens for a new item.
  useEffect(() => {
    if (item) {
      setQuantity(item.minPeople);
      setSelections(buildInitialSelections(item));
      setNotes('');
    }
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleChoice = (option: CateringItemOption, choiceId: number) => {
    setSelections((prev) => {
      const current = prev[option.id] ?? new Set<number>();
      const next = new Set(current);
      if (option.maxSelections === 1) {
        // Radio: replace selection with this choice (or clear if already selected and not required)
        if (next.has(choiceId) && !option.isRequired) {
          next.clear();
        } else {
          next.clear();
          next.add(choiceId);
        }
      } else {
        // Checkbox: toggle, respecting maxSelections cap
        if (next.has(choiceId)) {
          next.delete(choiceId);
        } else if (next.size < option.maxSelections) {
          next.add(choiceId);
        }
      }
      return { ...prev, [option.id]: next };
    });
  };

  const totals = useMemo(() => {
    if (!item) return { perUnit: 0, total: 0 };
    const optionsTotal = item.options.reduce(
      (acc, opt) => acc + optionPriceContribution(opt, selections[opt.id] ?? new Set()),
      0,
    );
    if (item.pricingType === 'FIXED' && item.fixedPrice != null) {
      const total = item.fixedPrice + optionsTotal;
      return { perUnit: item.fixedPrice + optionsTotal, total, isFixed: true };
    }
    const perUnit = item.pricePerPerson + optionsTotal;
    return { perUnit, total: perUnit * quantity, isFixed: false };
  }, [item, selections, quantity]);

  const validate = (): { ok: true } | { ok: false; error: string } => {
    if (!item) return { ok: false, error: 'No item selected' };
    if (quantity < item.minPeople) return { ok: false, error: `Minimum ${item.minPeople} people required` };
    if (item.maxPeople != null && quantity > item.maxPeople) {
      return { ok: false, error: `Maximum ${item.maxPeople} people` };
    }
    for (const opt of item.options) {
      const sel = selections[opt.id] ?? new Set<number>();
      if (opt.isRequired && sel.size < Math.max(1, opt.minSelections)) {
        return { ok: false, error: `"${opt.name}" — pick at least ${Math.max(1, opt.minSelections)}` };
      }
      if (sel.size > opt.maxSelections) {
        return { ok: false, error: `"${opt.name}" — pick at most ${opt.maxSelections}` };
      }
    }
    return { ok: true };
  };

  const performAdd = (force = false) => {
    if (!item) return;
    const selectedChoiceIds: number[] = [];
    const labelParts: string[] = [];
    for (const opt of item.options) {
      const sel = selections[opt.id] ?? new Set<number>();
      for (const c of opt.choices) {
        if (sel.has(c.id)) {
          selectedChoiceIds.push(c.id);
          labelParts.push(c.label);
        }
      }
    }

    const result = addLine(
      {
        merchantId,
        merchantName,
        cateringItemId: item.id,
        itemName: item.name,
        itemImageUrl: item.imageUrl,
        itemCategory: item.category,
        pricingType: item.pricingType,
        quantity,
        pricePerUnit: totals.perUnit,
        totalPrice: totals.total,
        selectedChoiceIds,
        selectedOptionsLabel: labelParts.join(', '),
        specialInstructions: notes.trim() ? notes.trim() : null,
      },
      { force },
    );

    if (!result.success && result.conflict) {
      const proceed = confirm(
        `You have items from ${result.conflict.existingMerchantName} in your cart. Replace them with this item from ${merchantName}?`,
      );
      if (proceed) performAdd(true);
      return;
    }

    toast({
      title: 'Added to cart',
      description: `${quantity}× ${item.name} — ${formatMoney(totals.total)}`,
    });
    onClose();
    onAddedToCart?.();
  };

  const handleAddToCart = () => {
    const v = validate();
    if (!v.ok) {
      toast({ title: 'Check your selection', description: v.error, variant: 'destructive' });
      return;
    }
    performAdd();
  };

  if (!item) return null;
  const open = !!item;
  const quantityOptions = useMemo(() => {
    const cap = item.maxPeople ?? item.minPeople + 200;
    const out: number[] = [];
    for (let n = item.minPeople; n <= cap; n++) {
      out.push(n);
      if (out.length >= 250) break;
    }
    return out;
  }, [item.minPeople, item.maxPeople]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0">
        <div className="relative h-48 w-full overflow-hidden bg-neutral-100 sm:h-56">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ChefHat className="h-16 w-16 text-neutral-300" aria-hidden />
            </div>
          )}
          {item.isPopular && (
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              Most ordered
            </span>
          )}
        </div>

        <div className="space-y-5 px-6 pb-2 pt-5">
          <DialogHeader>
            <DialogTitle className="text-xl">{item.name}</DialogTitle>
            {item.description && (
              <DialogDescription className="mt-1 text-sm text-neutral-600">
                {item.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            {item.packagingType && (
              <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                {item.packagingType}
              </span>
            )}
            {item.dietaryInfo.map((d) => (
              <span
                key={d}
                className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
              >
                {d}
              </span>
            ))}
            {item.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="cat-qty" className="text-sm font-medium text-neutral-700">
              {item.pricingType === 'PER_PERSON' ? 'How many people?' : 'How many?'}
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <select
                id="cat-qty"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm sm:max-w-[180px]"
              >
                {quantityOptions.map((n) => (
                  <option key={n} value={n}>
                    {n} {item.pricingType === 'PER_PERSON' ? 'people' : 'unit' + (n > 1 ? 's' : '')}
                  </option>
                ))}
              </select>
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                <Users className="h-3.5 w-3.5" />
                Min {item.minPeople}
                {item.maxPeople ? ` · Max ${item.maxPeople}` : ''}
              </span>
            </div>
          </div>

          {/* Option groups */}
          {item.options.map((opt) => {
            const sel = selections[opt.id] ?? new Set<number>();
            const subtitle = opt.maxSelections === 1
              ? opt.isRequired ? 'Required · Pick 1' : 'Optional · Pick 1'
              : opt.isRequired
                ? `Required · Pick up to ${opt.maxSelections}`
                : `Optional · Pick up to ${opt.maxSelections}`;
            return (
              <div key={opt.id} className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">{opt.name}</h4>
                    <p className="text-[11px] text-neutral-500">{subtitle}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {opt.choices.map((choice) => {
                    const checked = sel.has(choice.id);
                    return (
                      <label
                        key={choice.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 transition',
                          checked
                            ? 'border-brand-primary-500 ring-2 ring-brand-primary-100'
                            : 'border-neutral-200 hover:border-neutral-300',
                        )}
                      >
                        <input
                          type={opt.maxSelections === 1 ? 'radio' : 'checkbox'}
                          name={`option-${opt.id}`}
                          checked={checked}
                          onChange={() => toggleChoice(opt, choice.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-primary-600"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900">{choice.label}</span>
                            {choice.isPopular && (
                              <span className="inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                Most popular
                              </span>
                            )}
                          </div>
                          {choice.description && (
                            <p className="mt-0.5 text-xs text-neutral-500">{choice.description}</p>
                          )}
                        </div>
                        {choice.priceModifier !== 0 && (
                          <span className="shrink-0 text-xs font-semibold text-neutral-700">
                            {choice.priceModifier > 0 ? '+' : ''}
                            {formatMoney(choice.priceModifier)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Special instructions */}
          {item.specialInstructions && (
            <div>
              <Label htmlFor="cat-notes" className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                <MessageSquare className="h-3.5 w-3.5" />
                Add special instructions <span className="text-xs font-normal text-neutral-500">(optional)</span>
              </Label>
              <Textarea
                id="cat-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergies, presentation requests, anything we should know..."
                rows={3}
                maxLength={500}
                className="mt-2 resize-none"
              />
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-6 py-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-xs text-neutral-500">
              {totals.isFixed
                ? `Flat price`
                : `${formatMoney(totals.perUnit)} per person × ${quantity}`}
            </span>
            <span className="text-2xl font-bold tracking-tight text-neutral-900">
              {formatMoney(totals.total)}
            </span>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleAddToCart}
            className="w-full rounded-full py-3 text-base font-semibold"
          >
            Add to cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

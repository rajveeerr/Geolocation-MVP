// web/src/components/merchant/create-deal/DealBogoStep.tsx
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelector } from '@/components/common/CategorySelector';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESETS: Array<{ id: string; label: string; sub: string; buy: number; get: number; discount: number }> = [
  { id: 'b1g1f', label: 'Buy 1 Get 1 Free', sub: 'Classic BOGO', buy: 1, get: 1, discount: 100 },
  { id: 'b2g1f', label: 'Buy 2 Get 1 Free', sub: 'Family-style', buy: 2, get: 1, discount: 100 },
  { id: 'b1g1half', label: 'Buy 1 Get 1 50% Off', sub: 'Half-off second', buy: 1, get: 1, discount: 50 },
  { id: 'b3g1f', label: 'Buy 3 Get 1 Free', sub: 'Group order', buy: 3, get: 1, discount: 100 },
];

const formatBogoLabel = (buy?: number | null, get?: number | null, discount?: number | null) => {
  if (!buy || !get || discount == null) return 'Buy N, Get M';
  const verb = discount === 100 ? 'Free' : `${discount}% Off`;
  return `Buy ${buy}, Get ${get} ${verb}`;
};

export const DealBogoStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  // Lock the deal type and seed defaults.
  useEffect(() => {
    if (state.dealType !== 'BOGO') {
      dispatch({ type: 'UPDATE_FIELD', field: 'dealType', value: 'BOGO' });
    }
    if (!state.category) {
      dispatch({ type: 'UPDATE_FIELD', field: 'category', value: 'FOOD_AND_BEVERAGE' });
    }
    if (state.bogoBuyQuantity == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'bogoBuyQuantity', value: 1 });
    }
    if (state.bogoGetQuantity == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'bogoGetQuantity', value: 1 });
    }
    if (state.bogoGetDiscountPercent == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'bogoGetDiscountPercent', value: 100 });
    }
  }, [state.dealType, state.category, state.bogoBuyQuantity, state.bogoGetQuantity, state.bogoGetDiscountPercent, dispatch]);

  const buy = state.bogoBuyQuantity ?? 0;
  const get = state.bogoGetQuantity ?? 0;
  const discount = state.bogoGetDiscountPercent ?? 0;

  const titleValid = state.title.trim().length >= 3 && state.title.trim().length <= 100;
  const bogoValid =
    buy >= 1 && get >= 1 && Number.isFinite(discount) && discount >= 0 && discount <= 100;
  const isFormValid = titleValid && bogoValid && !!state.category;

  const previewLabel = useMemo(() => formatBogoLabel(buy, get, discount), [buy, get, discount]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'bogoBuyQuantity', value: preset.buy });
    dispatch({ type: 'UPDATE_FIELD', field: 'bogoGetQuantity', value: preset.get });
    dispatch({ type: 'UPDATE_FIELD', field: 'bogoGetDiscountPercent', value: preset.discount });
  };

  const onNext = () => {
    navigate('/merchant/deals/create/bogo/menu');
  };

  return (
    <OnboardingStepLayout
      title="Set up your BOGO offer"
      subtitle="Pick a preset or dial in the buy / get / discount manually. You'll choose eligible items next."
      onNext={onNext}
      onBack={() => navigate('/merchant/deals/create')}
      isNextDisabled={!isFormValid}
      progress={20}
      nextButtonText="Continue to items"
      contentClassName="w-full max-w-3xl"
    >
      <div className="space-y-8">
        {/* Live preview banner */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-white p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">Live preview</div>
              <h3 className="mt-0.5 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{previewLabel}</h3>
            </div>
          </div>
        </motion.section>

        {/* Presets */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <Label className="text-sm font-semibold text-neutral-700">Quick presets</Label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRESETS.map((preset) => {
              const selected = preset.buy === buy && preset.get === get && preset.discount === discount;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition',
                    selected
                      ? 'border-orange-500 bg-orange-50/60'
                      : 'border-neutral-200 bg-white hover:border-neutral-300',
                  )}
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-neutral-900">{preset.label}</div>
                    <div className="text-xs text-neutral-500">{preset.sub}</div>
                  </div>
                  {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-600" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Manual config */}
        <section className="space-y-4">
          <Label className="text-sm font-semibold text-neutral-700">Or set manually</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="bogo-buy" className="text-xs font-medium text-neutral-700">
                Customer buys
              </Label>
              <Input
                id="bogo-buy"
                type="number"
                min={1}
                value={buy || ''}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FIELD', field: 'bogoBuyQuantity', value: Math.max(1, parseInt(e.target.value) || 0) })
                }
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="bogo-get" className="text-xs font-medium text-neutral-700">
                Customer gets
              </Label>
              <Input
                id="bogo-get"
                type="number"
                min={1}
                value={get || ''}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FIELD', field: 'bogoGetQuantity', value: Math.max(1, parseInt(e.target.value) || 0) })
                }
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="bogo-discount" className="text-xs font-medium text-neutral-700">
                Discount on the "get" items
              </Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  id="bogo-discount"
                  type="number"
                  min={0}
                  max={100}
                  value={discount}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'bogoGetDiscountPercent',
                      value: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                    })
                  }
                  className="h-11"
                />
                <span className="text-sm text-neutral-500">%</span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">
                100% = free. 50% = half off the second item.
              </p>
            </div>
          </div>
        </section>

        {/* Deal basics */}
        <section className="space-y-4 border-t border-neutral-200 pt-6">
          <Label className="text-sm font-semibold text-neutral-700">Deal basics</Label>

          <div>
            <Label htmlFor="bogo-title" className="text-xs font-medium text-neutral-700">
              Deal title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bogo-title"
              value={state.title}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value.slice(0, 100) })
              }
              placeholder="e.g. Wing Wednesday — Buy 2 Get 1 Free"
              className="mt-1.5 h-11"
            />
            <p className="mt-1 text-[11px] text-neutral-500">{state.title.length}/100</p>
          </div>

          <div>
            <Label htmlFor="bogo-desc" className="text-xs font-medium text-neutral-700">
              Description
            </Label>
            <Textarea
              id="bogo-desc"
              value={state.description}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value.slice(0, 1000) })
              }
              placeholder="What's included? Any restrictions (e.g. dine-in only, lowest-priced item is the one discounted)?"
              rows={3}
              className="mt-1.5 resize-none"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-neutral-700">Category</Label>
            <div className="mt-1.5">
              <CategorySelector
                value={state.category}
                onChange={(value) => dispatch({ type: 'UPDATE_FIELD', field: 'category', value })}
              />
            </div>
          </div>
        </section>
      </div>
    </OnboardingStepLayout>
  );
};

/** Helper used elsewhere to format any deal's BOGO config into a chip. */
export const bogoSummary = formatBogoLabel;

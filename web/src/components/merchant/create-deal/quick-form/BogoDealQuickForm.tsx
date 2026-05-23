// src/components/merchant/create-deal/quick-form/BogoDealQuickForm.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';
import { useDealCreation } from '@/context/DealCreationContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { QuickFormLayout } from './QuickFormLayout';
import { SectionCard, FieldLabel } from './SectionCard';
import { TimeWindowEditor, type TimeWindowValue } from './TimeWindowEditor';
import { RewardsSection } from './RewardsSection';

const PRESETS: Array<{
  id: string;
  label: string;
  sub: string;
  buy: number;
  get: number;
  discount: number;
}> = [
  { id: 'b1g1f', label: 'Buy 1, Get 1 Free', sub: 'Classic BOGO', buy: 1, get: 1, discount: 100 },
  { id: 'b2g1f', label: 'Buy 2, Get 1 Free', sub: 'Family-style', buy: 2, get: 1, discount: 100 },
  { id: 'b1g1half', label: 'Buy 1, Get 1 50% Off', sub: 'Half-off second', buy: 1, get: 1, discount: 50 },
  { id: 'b3g1f', label: 'Buy 3, Get 1 Free', sub: 'Group order', buy: 3, get: 1, discount: 100 },
];

const DEFAULT_WINDOW: TimeWindowValue = { start: '12:00', end: '21:00' };

export const BogoDealQuickForm = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [window, setWindow] = useState<TimeWindowValue>(DEFAULT_WINDOW);

  useEffect(() => {
    if (state.dealType !== 'BOGO') {
      dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'BOGO' });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayIso = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);
  const startDateValue = state.activeStartDate ? state.activeStartDate.split('T')[0] : '';
  const endDateValue = state.activeEndDate ? state.activeEndDate.split('T')[0] : '';

  useEffect(() => {
    const ymd = startDateValue || todayIso;
    if (!ymd) return;
    const [sh, sm] = window.start.split(':').map(Number);
    const [eh, em] = window.end.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return;
    const start = new Date(`${ymd}T00:00:00`);
    start.setHours(sh, sm, 0, 0);
    dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: start.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'validHours', value: `${window.start}-${window.end}` });
    if (!endDateValue) {
      const end = new Date(start);
      end.setDate(end.getDate() + 14);
      end.setHours(eh, em, 0, 0);
      dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: end.toISOString() });
      dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: end.toISOString() });
    }
  }, [startDateValue, window.start, window.end, todayIso, dispatch, endDateValue]);

  const buy = state.bogoBuyQuantity ?? 1;
  const get = state.bogoGetQuantity ?? 1;
  const discount = state.bogoGetDiscountPercent ?? 100;

  const offerLine = useMemo(() => {
    const verb = discount === 100 ? 'Free' : `${discount}% Off`;
    return `Buy ${buy}, Get ${get} ${verb}`;
  }, [buy, get, discount]);

  // Keep state.customOfferDisplay in sync so the preview/payload show the right label.
  useEffect(() => {
    dispatch({ type: 'UPDATE_FIELD', field: 'customOfferDisplay', value: offerLine });
  }, [offerLine, dispatch]);

  const isWindowValid = (() => {
    const [sh, sm] = window.start.split(':').map(Number);
    const [eh, em] = window.end.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return false;
    return eh * 60 + em > sh * 60 + sm;
  })();

  const canContinue =
    !!state.title?.trim() &&
    !!startDateValue &&
    !!endDateValue &&
    buy >= 1 &&
    get >= 1 &&
    discount >= 0 &&
    discount <= 100 &&
    isWindowValid;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/merchant/deals/create/bogo/review');
  };

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'bogoBuyQuantity', value: preset.buy });
    dispatch({ type: 'UPDATE_FIELD', field: 'bogoGetQuantity', value: preset.get });
    dispatch({ type: 'UPDATE_FIELD', field: 'bogoGetDiscountPercent', value: preset.discount });
  };

  return (
    <QuickFormLayout
      title="Create a BOGO deal"
      subtitle="Set the buy/get mechanics, pick the dates — extras come next."
      wizardStep={{ current: 1, total: 2 }}
      onBack={() => navigate('/merchant/deals/create')}
      primary={{ label: 'Continue', onClick: handleContinue, disabled: !canContinue }}
    >
      <div className="space-y-3">
        <SectionCard>
          <FieldLabel label="Deal name" required htmlFor="deal-name" />
          <Input
            id="deal-name"
            value={state.title}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value.slice(0, 100) })
            }
            placeholder="Wing Wednesday — Buy 2 Get 1 Free"
            className="mt-1.5 h-10 rounded-lg border-border bg-card text-[13.5px]"
            maxLength={100}
          />
        </SectionCard>

        <SectionCard>
          <FieldLabel label="BOGO mechanics" hint={offerLine} />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PRESETS.map((preset) => {
              const selected =
                preset.buy === buy && preset.get === get && preset.discount === discount;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border p-3 text-left transition',
                    selected
                      ? 'border-foreground bg-muted shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
                      : 'border-border bg-card hover:border-border hover:bg-muted',
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-foreground">{preset.label}</div>
                    <div className="text-[11px] text-muted-foreground">{preset.sub}</div>
                  </div>
                  {selected ? <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Or set custom quantities:</span>
          </div>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            <div>
              <FieldLabel label="Customer buys" htmlFor="bogo-buy" />
              <Input
                id="bogo-buy"
                type="number"
                min={1}
                value={buy}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'bogoBuyQuantity',
                    value: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="mt-1.5 h-10 rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
            <div>
              <FieldLabel label="Customer gets" htmlFor="bogo-get" />
              <Input
                id="bogo-get"
                type="number"
                min={1}
                value={get}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'bogoGetQuantity',
                    value: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="mt-1.5 h-10 rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
            <div>
              <FieldLabel label="Discount on get (%)" htmlFor="bogo-discount" />
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
                className="mt-1.5 h-10 rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4 sm:flex-nowrap">
            <div className="shrink-0">
              <FieldLabel label="Start date" htmlFor="bogo-start" />
              <Input
                id="bogo-start"
                type="date"
                lang="en-US"
                min={todayIso}
                value={startDateValue}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'activeStartDate',
                    value: e.target.value ? `${e.target.value}T00:00:00.000Z` : '',
                  })
                }
                className="mt-1.5 h-10 w-[180px] rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
            <div className="shrink-0">
              <FieldLabel label="End date" htmlFor="bogo-end" />
              <Input
                id="bogo-end"
                type="date"
                lang="en-US"
                min={startDateValue || todayIso}
                value={endDateValue}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'activeEndDate',
                    value: e.target.value ? `${e.target.value}T23:59:59.000Z` : '',
                  })
                }
                className="mt-1.5 h-10 w-[180px] rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
            <div className="hidden h-16 w-px shrink-0 bg-accent sm:block" aria-hidden />
            <div className="min-w-0 flex-1">
              <TimeWindowEditor value={window} onChange={setWindow} label="Active window (per day)" />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <FieldLabel label="Max redemptions" hint="Leave blank for unlimited" htmlFor="max-redemptions" />
          <Input
            id="max-redemptions"
            type="number"
            min={1}
            value={state.maxRedemptions ? state.maxRedemptions : ''}
            onChange={(e) => {
              const v = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
              dispatch({ type: 'UPDATE_FIELD', field: 'maxRedemptions', value: v });
            }}
            placeholder="50 uses"
            className="mt-1.5 h-10 w-[200px] rounded-lg border-border bg-card text-[13.5px]"
          />
        </SectionCard>

        <RewardsSection />
      </div>
    </QuickFormLayout>
  );
};

export default BogoDealQuickForm;

// src/components/merchant/create-deal/quick-form/RecurringDealQuickForm.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { AmountSlider } from '@/components/ui/AmountSlider';
import { QuickFormLayout } from './QuickFormLayout';
import { SectionCard, FieldLabel } from './SectionCard';
import { ProLockedField } from './ProLockedField';
import { TimeWindowEditor, type TimeWindowValue } from './TimeWindowEditor';
import { RewardsSection } from './RewardsSection';

const WEEKDAYS: { code: string; short: string }[] = [
  { code: 'MONDAY', short: 'Mon' },
  { code: 'TUESDAY', short: 'Tue' },
  { code: 'WEDNESDAY', short: 'Wed' },
  { code: 'THURSDAY', short: 'Thu' },
  { code: 'FRIDAY', short: 'Fri' },
  { code: 'SATURDAY', short: 'Sat' },
  { code: 'SUNDAY', short: 'Sun' },
];

const FREE_TIER_DEFAULTS = {
  discountPercentage: 20,
  discountAmountCap: 5,
  minOrderAmount: 25,
};

const DEFAULT_WINDOW: TimeWindowValue = { start: '12:00', end: '13:00' };

export const RecurringDealQuickForm = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [window, setWindow] = useState<TimeWindowValue>(DEFAULT_WINDOW);

  useEffect(() => {
    if (state.dealType !== 'RECURRING') {
      dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'RECURRING' });
    }
    if (state.discountPercentage == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: FREE_TIER_DEFAULTS.discountPercentage });
    }
    if (state.discountAmount == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'discountAmount', value: FREE_TIER_DEFAULTS.discountAmountCap });
    }
    if (state.minOrderAmount == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'minOrderAmount', value: FREE_TIER_DEFAULTS.minOrderAmount });
    }
    if (state.standardOfferKind == null) {
      dispatch({ type: 'SET_STANDARD_OFFER_KIND', kind: 'percentage' });
    }
    if (!state.recurringFrequency) {
      dispatch({ type: 'UPDATE_FIELD', field: 'recurringFrequency', value: 'week' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayIso = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);
  const dateValue = state.activeStartDate ? state.activeStartDate.split('T')[0] : '';
  const endDateValue = state.activeEndDate ? state.activeEndDate.split('T')[0] : '';

  useEffect(() => {
    const ymd = dateValue || todayIso;
    if (!ymd) return;
    const [sh, sm] = window.start.split(':').map(Number);
    const [eh, em] = window.end.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return;
    const start = new Date(`${ymd}T00:00:00`);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(`${ymd}T00:00:00`);
    end.setHours(eh, em, 0, 0);
    dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: start.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: end.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'validHours', value: `${window.start}-${window.end}` });
  }, [dateValue, window.start, window.end, todayIso, dispatch]);

  const toggleDay = (code: string) => {
    dispatch({ type: 'TOGGLE_RECURRING_DAY', payload: code });
  };

  const recurringDays = state.recurringDays ?? [];
  const daysLabel =
    recurringDays.length === 0
      ? 'Pick weekdays'
      : recurringDays.map((d) => WEEKDAYS.find((w) => w.code === d)?.short ?? d).join(', ');

  const isWindowValid = (() => {
    const [sh, sm] = window.start.split(':').map(Number);
    const [eh, em] = window.end.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return false;
    return eh * 60 + em > sh * 60 + sm;
  })();

  const canContinue =
    !!state.title?.trim() &&
    recurringDays.length > 0 &&
    !!dateValue &&
    !!endDateValue &&
    isWindowValid;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/merchant/deals/create/daily-deal/review');
  };

  return (
    <QuickFormLayout
      title="Create a daily deal"
      subtitle="Pick the weekdays it repeats on. Set the offer + timing — extras come next."
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
            placeholder="Wine Wednesday — half-price bottles"
            className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
            maxLength={100}
          />
        </SectionCard>

        <SectionCard>
          <FieldLabel label="Repeat on" required hint={daysLabel} />
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const selected = recurringDays.includes(day.code);
              return (
                <button
                  key={day.code}
                  type="button"
                  onClick={() => toggleDay(day.code)}
                  aria-pressed={selected}
                  className={cn(
                    'h-10 min-w-[3rem] rounded-full border px-4 text-[13px] font-semibold transition',
                    selected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-[0_6px_18px_rgba(15,23,42,0.18)]'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                  )}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="grid gap-5 sm:grid-cols-3">
            <ProLockedField label="Discount" hint="Off total bill">
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <AmountSlider
                  value={state.discountPercentage}
                  onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: v })}
                  min={5}
                  max={60}
                  step={5}
                  suffix="%"
                  showEditButton={false}
                />
              </div>
            </ProLockedField>
            <ProLockedField label="Up to" hint="Max discount cap">
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <AmountSlider
                  value={state.discountAmount}
                  onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'discountAmount', value: v })}
                  min={1}
                  max={50}
                  step={1}
                  prefix="$"
                  showEditButton={false}
                />
              </div>
            </ProLockedField>
            <ProLockedField label="Minimum spend">
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <AmountSlider
                  value={state.minOrderAmount}
                  onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'minOrderAmount', value: v })}
                  min={5}
                  max={150}
                  step={5}
                  prefix="$"
                  showEditButton={false}
                />
              </div>
            </ProLockedField>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4 sm:flex-nowrap">
            <div className="shrink-0">
              <FieldLabel label="Start date" htmlFor="deal-start-date" />
              <Input
                id="deal-start-date"
                type="date"
                lang="en-US"
                min={todayIso}
                value={dateValue}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: e.target.value ? `${e.target.value}T00:00:00.000Z` : '' })
                }
                className="mt-1.5 h-10 w-[180px] rounded-lg border-neutral-200 bg-white text-[13.5px]"
              />
            </div>
            <div className="shrink-0">
              <FieldLabel label="End date" htmlFor="deal-end-date" />
              <Input
                id="deal-end-date"
                type="date"
                lang="en-US"
                min={dateValue || todayIso}
                value={endDateValue}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: e.target.value ? `${e.target.value}T23:59:59.000Z` : '' })
                }
                className="mt-1.5 h-10 w-[180px] rounded-lg border-neutral-200 bg-white text-[13.5px]"
              />
            </div>
            <div className="hidden h-16 w-px shrink-0 bg-neutral-200 sm:block" aria-hidden />
            <div className="min-w-0 flex-1">
              <TimeWindowEditor value={window} onChange={setWindow} label="Time window (per day)" />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <FieldLabel label="Max redemptions per day" hint="Leave blank for unlimited" htmlFor="max-redemptions" />
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
            className="mt-1.5 h-10 w-[200px] rounded-lg border-neutral-200 bg-white text-[13.5px]"
          />
        </SectionCard>

        <RewardsSection />
      </div>
    </QuickFormLayout>
  );
};

export default RecurringDealQuickForm;

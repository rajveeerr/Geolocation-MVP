// src/components/merchant/create-deal/quick-form/HiddenDetailsStep.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AmountSlider } from '@/components/ui/AmountSlider';
import { QuickFormLayout } from './QuickFormLayout';
import { SectionCard, FieldLabel } from './SectionCard';
import { ProLockedField } from './ProLockedField';
import { TimeWindowEditor, type TimeWindowValue } from './TimeWindowEditor';
import { RewardsSection } from './RewardsSection';

const FREE_TIER_DEFAULTS = {
  discountPercentage: 25,
  discountAmountCap: 10,
  minOrderAmount: 40,
};

const DEFAULT_WINDOW: TimeWindowValue = { start: '17:00', end: '21:00' };

export const HiddenDetailsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [window, setWindow] = useState<TimeWindowValue>(DEFAULT_WINDOW);

  useEffect(() => {
    if (state.dealType !== 'HIDDEN') {
      dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'HIDDEN' });
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
      end.setDate(end.getDate() + 30);
      end.setHours(23, 59, 59, 999);
      dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: end.toISOString() });
      dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: end.toISOString() });
    }
  }, [startDateValue, window.start, window.end, todayIso, dispatch, endDateValue]);

  const isWindowValid = (() => {
    const [sh, sm] = window.start.split(':').map(Number);
    const [eh, em] = window.end.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return false;
    return eh * 60 + em > sh * 60 + sm;
  })();

  const canContinue =
    !!state.title?.trim() && !!startDateValue && !!endDateValue && isWindowValid;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/merchant/deals/create/hidden/review');
  };

  return (
    <QuickFormLayout
      title="Polish the hidden deal"
      subtitle="Title, discount, schedule — extras come next."
      wizardStep={{ current: 2, total: 3 }}
      onBack={() => navigate('/merchant/deals/create/hidden')}
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
            placeholder="Members-only chef's tasting — 25% OFF"
            className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
            maxLength={100}
          />

          <div className="mt-4">
            <FieldLabel label="Short description" htmlFor="deal-desc" />
            <Textarea
              id="deal-desc"
              value={state.description}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value.slice(0, 500) })
              }
              rows={2}
              placeholder="Optional context for the redeeming guest."
              className="mt-2 resize-none rounded-xl border-neutral-200 bg-white text-[14px]"
              maxLength={500}
            />
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
              <FieldLabel label="Start date" htmlFor="hidden-start" />
              <Input
                id="hidden-start"
                type="date"
                lang="en-US"
                min={todayIso}
                value={startDateValue}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: e.target.value ? `${e.target.value}T00:00:00.000Z` : '' })
                }
                className="mt-1.5 h-10 w-[180px] rounded-lg border-neutral-200 bg-white text-[13.5px]"
              />
            </div>
            <div className="shrink-0">
              <FieldLabel label="End date" htmlFor="hidden-end" />
              <Input
                id="hidden-end"
                type="date"
                lang="en-US"
                min={startDateValue || todayIso}
                value={endDateValue}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: e.target.value ? `${e.target.value}T23:59:59.000Z` : '' })
                }
                className="mt-1.5 h-10 w-[180px] rounded-lg border-neutral-200 bg-white text-[13.5px]"
              />
            </div>
            <div className="hidden h-16 w-px shrink-0 bg-neutral-200 sm:block" aria-hidden />
            <div className="min-w-0 flex-1">
              <TimeWindowEditor value={window} onChange={setWindow} label="Active window (per day)" />
            </div>
          </div>
        </SectionCard>

        <RewardsSection />
      </div>
    </QuickFormLayout>
  );
};

export default HiddenDetailsStep;

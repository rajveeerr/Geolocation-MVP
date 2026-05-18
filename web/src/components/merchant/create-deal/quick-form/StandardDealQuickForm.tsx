// src/components/merchant/create-deal/quick-form/StandardDealQuickForm.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { AmountSlider } from '@/components/ui/AmountSlider';
import { QuickFormLayout } from './QuickFormLayout';
import { SectionCard, FieldLabel } from './SectionCard';
import { DealTypeChips } from './DealTypeChips';
import { ProLockedField } from './ProLockedField';
import { TimeWindowEditor, type TimeWindowValue } from './TimeWindowEditor';
import { RewardsSection } from './RewardsSection';

const FREE_TIER_DEFAULTS = {
  discountPercentage: 20,
  discountAmountCap: 5,
  minOrderAmount: 25,
};

const DEFAULT_WINDOW: TimeWindowValue = { start: '12:00', end: '13:00' };

export const StandardDealQuickForm = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [window, setWindow] = useState<TimeWindowValue>(DEFAULT_WINDOW);

  useEffect(() => {
    if (state.dealType !== 'STANDARD') {
      dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'STANDARD' });
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
  const dateValue = state.activeStartDate ? state.activeStartDate.split('T')[0] : '';

  // Recompute timestamps whenever date or window changes.
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

    dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: start.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: end.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: start.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: end.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'validHours', value: `${window.start}-${window.end}` });
  }, [dateValue, window.start, window.end, todayIso, dispatch]);

  const handleDateChange = (ymd: string) => {
    if (!ymd) {
      dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: '' });
      return;
    }
    dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: `${ymd}T00:00:00.000Z` });
  };

  const isWindowValid = (() => {
    const [sh, sm] = window.start.split(':').map(Number);
    const [eh, em] = window.end.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return false;
    return eh * 60 + em > sh * 60 + sm;
  })();

  const canContinue =
    !!state.title?.trim() && !!dateValue && isWindowValid;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/merchant/deals/create/standard/review');
  };

  return (
    <QuickFormLayout
      title="Create an item deal"
      subtitle="Set the offer, the timing, and the check-in reward. We'll handle the rest on the next screen."
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
            placeholder="Taco Tuesday — 60% OFF"
            className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
            maxLength={100}
          />
        </SectionCard>

        <SectionCard>
          <FieldLabel label="Deal type" hint="Swap to a different format" />
          <DealTypeChips
            value={state.dealType}
            onChange={(value) => {
              dispatch({ type: 'SET_FIELD', field: 'dealType', value });
              if (value === 'REDEEM_NOW') navigate('/merchant/deals/create/redeem-now');
              else if (value === 'BOGO') navigate('/merchant/deals/create/bogo');
            }}
            className="mt-3"
            allowed={['STANDARD', 'REDEEM_NOW', 'BOGO']}
          />
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
              <FieldLabel label="Date" htmlFor="deal-date" />
              <Input
                id="deal-date"
                type="date"
                lang="en-US"
                min={todayIso}
                value={dateValue}
                onChange={(e) => handleDateChange(e.target.value)}
                className="mt-1.5 h-10 w-[180px] rounded-lg border-neutral-200 bg-white text-[13.5px]"
              />
            </div>
            <div className="hidden h-16 w-px shrink-0 bg-neutral-200 sm:block" aria-hidden />
            <div className="min-w-0 flex-1">
              <TimeWindowEditor value={window} onChange={setWindow} label="Time window" />
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
            className="mt-1.5 h-10 w-[200px] rounded-lg border-neutral-200 bg-white text-[13.5px]"
          />
        </SectionCard>

        <RewardsSection />
      </div>
    </QuickFormLayout>
  );
};

export default StandardDealQuickForm;

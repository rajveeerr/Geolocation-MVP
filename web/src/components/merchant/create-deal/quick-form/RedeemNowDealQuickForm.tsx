// src/components/merchant/create-deal/quick-form/RedeemNowDealQuickForm.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useDealCreation } from '@/context/DealCreationContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { AmountSlider } from '@/components/ui/AmountSlider';
import { QuickFormLayout } from './QuickFormLayout';
import { SectionCard, FieldLabel } from './SectionCard';
import { PillGroup } from './PillGroup';
import { ProLockedField } from './ProLockedField';
import { RewardsSection } from './RewardsSection';

type Duration = 60 | 120 | 240 | 720; // capped at 24h for Redeem Now

const DURATION_OPTIONS = [
  { value: 60 as Duration, label: '1 hr' },
  { value: 120 as Duration, label: '2 hrs' },
  { value: 240 as Duration, label: '4 hrs' },
  { value: 720 as Duration, label: '12 hrs' },
];

const FREE_TIER_DEFAULTS = {
  discountPercentage: 50, // backend-enforced fixed
  minOrderAmount: 35,
};

export const RedeemNowDealQuickForm = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [duration, setDuration] = useState<Duration>(60);

  useEffect(() => {
    if (state.dealType !== 'REDEEM_NOW') {
      dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'REDEEM_NOW' });
    }
    dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: FREE_TIER_DEFAULTS.discountPercentage });
    if (state.minOrderAmount == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'minOrderAmount', value: FREE_TIER_DEFAULTS.minOrderAmount });
    }
    if (state.standardOfferKind == null) {
      dispatch({ type: 'SET_STANDARD_OFFER_KIND', kind: 'percentage' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redeem Now starts immediately and ends after the chosen window.
  useEffect(() => {
    const start = new Date();
    start.setSeconds(0, 0);
    start.setMinutes(start.getMinutes() + 1);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: start.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: end.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: start.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: end.toISOString() });
  }, [duration, dispatch]);

  const canContinue = !!state.title?.trim();

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/merchant/deals/create/redeem-now/review');
  };

  return (
    <QuickFormLayout
      title="Run a Redeem Now deal"
      subtitle="Drive instant action. Set a minimum spend, pick a window — extras come next."
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
            placeholder="Spend $35 → 50% off"
            className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
            maxLength={100}
          />
        </SectionCard>

        <SectionCard>
          <div className="grid gap-5 sm:grid-cols-2">
            <ProLockedField label="Discount" hint="Fixed for Redeem Now" forceLocked>
              <div className="flex h-[88px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neutral-900">50%</div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">off the bill</div>
                </div>
              </div>
            </ProLockedField>
            <ProLockedField label="Minimum spend" hint="Unlock threshold">
              <div className="rounded-xl border border-neutral-200 bg-white p-3">
                <AmountSlider
                  value={state.minOrderAmount}
                  onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'minOrderAmount', value: v })}
                  min={10}
                  max={200}
                  step={5}
                  prefix="$"
                  showEditButton={false}
                />
              </div>
            </ProLockedField>
          </div>
        </SectionCard>

        <SectionCard>
          <FieldLabel label="Window" hint="Starts now — capped at 12 hrs" />
          <PillGroup<Duration>
            value={duration}
            onChange={setDuration}
            ariaLabel="Deal window"
            className="mt-3"
            options={DURATION_OPTIONS}
          />
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>Redeem Now deals must end within 24 hours of starting — they're built for "today" urgency.</p>
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
            placeholder="20 uses"
            className="mt-1.5 h-10 w-[200px] rounded-lg border-neutral-200 bg-white text-[13.5px]"
          />
        </SectionCard>

        <RewardsSection />
      </div>
    </QuickFormLayout>
  );
};

export default RedeemNowDealQuickForm;

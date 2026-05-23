// src/components/merchant/create-deal/quick-form/BountyConfigStep.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users } from 'lucide-react';
import { useDealCreation } from '@/context/DealCreationContext';
import { Input } from '@/components/ui/input';
import { AmountSlider } from '@/components/ui/AmountSlider';
import { QuickFormLayout } from './QuickFormLayout';
import { SectionCard, FieldLabel } from './SectionCard';
import { ProLockedField } from './ProLockedField';

const FREE_TIER_DEFAULTS = {
  bountyRewardAmount: 5,
  minReferralsRequired: 2,
};

export const BountyConfigStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.dealType !== 'BOUNTY') {
      dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'BOUNTY' });
    }
    if (state.bountyRewardAmount == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'bountyRewardAmount', value: FREE_TIER_DEFAULTS.bountyRewardAmount });
    }
    if (state.minReferralsRequired == null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'minReferralsRequired', value: FREE_TIER_DEFAULTS.minReferralsRequired });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reward = state.bountyRewardAmount ?? FREE_TIER_DEFAULTS.bountyRewardAmount;
  const minRefs = state.minReferralsRequired ?? FREE_TIER_DEFAULTS.minReferralsRequired;

  return (
    <QuickFormLayout
      title="Bounty mechanics"
      subtitle="Decide what guests earn and how many friends they need to bring before they can redeem."
      wizardStep={{ current: 1, total: 3 }}
      onBack={() => navigate('/merchant/deals/create')}
      primary={{
        label: 'Continue',
        onClick: () => navigate('/merchant/deals/create/bounty/details'),
        disabled: !state.bountyRewardAmount || !state.minReferralsRequired,
      }}
    >
      <div className="space-y-3">
        <SectionCard>
          <div className="grid gap-5 sm:grid-cols-2">
            <ProLockedField label="Reward per check-in" hint="Per friend brought">
              <div className="rounded-xl border border-border bg-card p-3">
                <AmountSlider
                  value={state.bountyRewardAmount}
                  onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'bountyRewardAmount', value: v })}
                  min={1}
                  max={50}
                  step={1}
                  prefix="$"
                  showEditButton={false}
                />
              </div>
            </ProLockedField>

            <div>
              <FieldLabel label="Min friends required" required htmlFor="min-friends" />
              <Input
                id="min-friends"
                type="number"
                min={1}
                max={20}
                value={state.minReferralsRequired ?? ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : Math.max(1, Number(e.target.value));
                  dispatch({ type: 'UPDATE_FIELD', field: 'minReferralsRequired', value: v });
                }}
                placeholder="2"
                className="mt-1.5 h-10 rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-[13px] leading-6 text-foreground">
              <div className="font-semibold text-foreground">
                Bring {minRefs} friend{minRefs === 1 ? '' : 's'}, earn ${(reward * minRefs).toFixed(0)}
              </div>
              <p className="mt-0.5 text-muted-foreground">
                Each verified check-in unlocks <span className="font-semibold">${reward.toFixed(0)}</span> for the
                referring guest. Customers see a QR after publishing.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <FieldLabel label="Coverage" />
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <p className="text-[13px] leading-6 text-foreground">
              Bounty deals work best at peak hours. We recommend running them at the same windows as your
              busiest service — set those next.
            </p>
          </div>
        </SectionCard>
      </div>
    </QuickFormLayout>
  );
};

export default BountyConfigStep;

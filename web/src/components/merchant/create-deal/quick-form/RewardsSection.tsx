// src/components/merchant/create-deal/quick-form/RewardsSection.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Trophy, Users, Flame, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDealCreation } from '@/context/DealCreationContext';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SectionCard, FieldLabel } from './SectionCard';

type RewardTab = 'bounty' | 'checkin' | 'referral' | 'streak';

interface TabDef {
  key: RewardTab;
  label: string;
  icon: typeof Coffee;
}

const TABS: TabDef[] = [
  { key: 'bounty', label: 'Bounty', icon: Trophy },
  { key: 'checkin', label: 'Check-in', icon: Coffee },
  { key: 'referral', label: 'Referral', icon: Users },
  { key: 'streak', label: 'Streak', icon: Flame },
];

interface RewardsSectionProps {
  /** When true (Bounty deal type), the Bounty tab is read-only because the
   * merchant set the bounty in Step 1. They can still configure the other
   * reward types here. */
  bountyReadOnly?: boolean;
}

/**
 * Unified rewards configurator. Replaces the simple check-in pill selector
 * with four tabs (Bounty, Check-in, Referral, Streak) — each with its own
 * enable toggle and max-claims / amount / expiry controls.
 *
 * The Bounty tab reads/writes the existing bountyRewardAmount + minReferralsRequired
 * state (already wired to PATCH /merchants/deals/:id/bounty). For Bounty
 * deal types it renders as a read-only summary because Step 1 is the
 * authoritative bounty editor.
 *
 * Check-in writes new state fields then attached via PATCH
 * /merchants/deals/:id/check-in-reward after publish.
 *
 * Referral writes new state fields then attached via POST
 * /merchants/me/referral-programs after publish.
 *
 * Streak uses the existing streakEnabled/streakMinVisits/streakRewardType/
 * streakRewardValue/streakMaxClaims/streakExpiryHours fields, included in
 * the deal-create payload.
 */
export const RewardsSection = ({ bountyReadOnly = false }: RewardsSectionProps) => {
  const { state, dispatch } = useDealCreation();
  const [active, setActive] = useState<RewardTab>('bounty');

  const isBountyConfigured = (state.bountyRewardAmount ?? 0) > 0;

  const badge: Record<RewardTab, string | null> = {
    bounty: isBountyConfigured ? '✓' : null,
    checkin: state.checkInRewardEnabled ? '✓' : null,
    referral: state.referralRewardEnabled ? '✓' : null,
    streak: state.streakEnabled ? '✓' : null,
  };

  return (
    <SectionCard>
      <FieldLabel label="Rewards" hint="Optional perks for guests" />

      {/* Tab strip */}
      <div className="mt-3 flex flex-wrap gap-1.5 rounded-2xl bg-neutral-100 p-1">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold transition',
                isActive
                  ? 'bg-white text-neutral-900 shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
                  : 'text-neutral-600 hover:text-neutral-900',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {badge[tab.key] ? (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-2.5 w-2.5" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {active === 'bounty' ? (
              <BountyPanel readOnly={bountyReadOnly} />
            ) : active === 'checkin' ? (
              <CheckInPanel />
            ) : active === 'referral' ? (
              <ReferralPanel />
            ) : (
              <StreakPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionCard>
  );
};

// ── Bounty tab ───────────────────────────────────────────────────────────────

const BountyPanel = ({ readOnly }: { readOnly: boolean }) => {
  const { state, dispatch } = useDealCreation();

  if (readOnly) {
    const reward = state.bountyRewardAmount ?? 0;
    const minRefs = state.minReferralsRequired ?? 0;
    return (
      <div>
        <p className="mb-3 text-[12px] text-neutral-500">
          Bounty configured in Step 1. Edit by going back to the previous step.
        </p>
        <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          <div className="text-[13px] leading-6 text-neutral-700">
            <div className="font-semibold text-neutral-900">
              Bring {minRefs} friend{minRefs === 1 ? '' : 's'}, earn ${reward.toFixed(0)}
            </div>
            <p className="text-[12px] text-neutral-500">
              Each verified check-in unlocks <span className="font-semibold">${reward.toFixed(0)}</span> for the
              referring guest.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const enabled = (state.bountyRewardAmount ?? 0) > 0;

  return (
    <div>
      <ToggleRow
        title="Bounty reward"
        description="Pay guests for bringing friends. They earn the reward per verified check-in."
        checked={enabled}
        onChange={(v) => {
          if (!v) {
            dispatch({ type: 'UPDATE_FIELD', field: 'bountyRewardAmount', value: null });
            dispatch({ type: 'UPDATE_FIELD', field: 'minReferralsRequired', value: null });
          } else {
            dispatch({ type: 'UPDATE_FIELD', field: 'bountyRewardAmount', value: 5 });
            dispatch({ type: 'UPDATE_FIELD', field: 'minReferralsRequired', value: 2 });
          }
        }}
      />
      {enabled ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberField
            label="Reward per friend ($)"
            value={state.bountyRewardAmount ?? 0}
            onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'bountyRewardAmount', value: v })}
            min={1}
            max={500}
          />
          <NumberField
            label="Min friends required"
            value={state.minReferralsRequired ?? 0}
            onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'minReferralsRequired', value: v })}
            min={1}
            max={20}
          />
        </div>
      ) : null}
    </div>
  );
};

// ── Check-in tab ─────────────────────────────────────────────────────────────

const CheckInPanel = () => {
  const { state, dispatch } = useDealCreation();
  type Kind = 'BONUS_POINTS' | 'FREE_ITEM' | 'DISCOUNT_PERCENTAGE' | 'DISCOUNT_FIXED';
  const KINDS: Array<{ value: Kind; label: string }> = [
    { value: 'BONUS_POINTS', label: 'Bonus points' },
    { value: 'FREE_ITEM', label: 'Free item' },
    { value: 'DISCOUNT_PERCENTAGE', label: '% off' },
    { value: 'DISCOUNT_FIXED', label: '$ off' },
  ];

  return (
    <div>
      <ToggleRow
        title="Check-in reward"
        description="Customers who check in to this deal automatically earn a reward."
        checked={state.checkInRewardEnabled}
        onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'checkInRewardEnabled', value: v })}
      />
      {state.checkInRewardEnabled ? (
        <>
          <div className="mt-4">
            <FieldLabel label="Reward type" />
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {KINDS.map((k) => {
                const selected = state.checkInRewardKind === k.value;
                return (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'checkInRewardKind', value: k.value })}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-[12px] font-semibold transition',
                      selected
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300',
                    )}
                  >
                    {k.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {state.checkInRewardKind !== 'FREE_ITEM' ? (
              <NumberField
                label={
                  state.checkInRewardKind === 'BONUS_POINTS'
                    ? 'Points awarded'
                    : state.checkInRewardKind === 'DISCOUNT_PERCENTAGE'
                      ? 'Percent off'
                      : 'Dollar amount off'
                }
                value={state.checkInRewardValue}
                onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'checkInRewardValue', value: v })}
                min={1}
                max={state.checkInRewardKind === 'DISCOUNT_PERCENTAGE' ? 100 : 1000}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 px-3 py-2 text-[12px] text-neutral-500">
                Free-item picks a menu item automatically (or falls back to points).
              </div>
            )}
            <NumberField
              label="Max claims"
              value={state.checkInRewardMaxClaims ?? 0}
              onChange={(v) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'checkInRewardMaxClaims', value: v === 0 ? null : v })
              }
              min={0}
              placeholder="∞"
            />
            <NumberField
              label="Expires after (hours)"
              value={state.checkInRewardExpiryHours}
              onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'checkInRewardExpiryHours', value: v })}
              min={1}
              max={720}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

// ── Referral tab ─────────────────────────────────────────────────────────────

const ReferralPanel = () => {
  const { state, dispatch } = useDealCreation();
  return (
    <div>
      <ToggleRow
        title="Referral reward"
        description="Reward guests who refer friends. Both the referrer and the referred friend get rewards on redemption."
        checked={state.referralRewardEnabled}
        onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'referralRewardEnabled', value: v })}
      />
      {state.referralRewardEnabled ? (
        <>
          <div className="mt-4">
            <FieldLabel label="Program name" required htmlFor="referral-name" />
            <Input
              id="referral-name"
              value={state.referralRewardName}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'referralRewardName', value: e.target.value.slice(0, 100) })
              }
              placeholder="Bring-a-friend night"
              className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel label="Reward for referrer" required htmlFor="referral-referrer" />
              <Input
                id="referral-referrer"
                value={state.referralRewardForReferrer}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'referralRewardForReferrer',
                    value: e.target.value.slice(0, 300),
                  })
                }
                placeholder="$5 off next visit"
                className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
              />
            </div>
            <div>
              <FieldLabel label="Reward for referred friend" required htmlFor="referral-referred" />
              <Input
                id="referral-referred"
                value={state.referralRewardForReferred}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'referralRewardForReferred',
                    value: e.target.value.slice(0, 300),
                  })
                }
                placeholder="Free appetizer"
                className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
              />
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Max claims per user"
              value={state.referralMaxPerUser ?? 0}
              onChange={(v) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'referralMaxPerUser', value: v === 0 ? null : v })
              }
              min={0}
              placeholder="∞"
            />
            <div>
              <FieldLabel label="Expires on (optional)" htmlFor="referral-expires" />
              <Input
                id="referral-expires"
                type="date"
                lang="en-US"
                value={state.referralExpiresAt ? state.referralExpiresAt.split('T')[0] : ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'referralExpiresAt',
                    value: e.target.value ? `${e.target.value}T23:59:59.000Z` : null,
                  })
                }
                className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
              />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-neutral-500">
            Configured referral programs appear on the <span className="font-semibold">Referrals</span> page after publishing.
          </p>
        </>
      ) : null}
    </div>
  );
};

// ── Streak tab ───────────────────────────────────────────────────────────────

const StreakPanel = () => {
  const { state, dispatch } = useDealCreation();
  return (
    <div>
      <ToggleRow
        title="Streak reward"
        description="Reward guests for consecutive check-ins. Build the habit loop."
        checked={state.streakEnabled}
        onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'streakEnabled', value: v })}
      />
      {state.streakEnabled ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Streak threshold (visits)"
              value={state.streakMinVisits ?? 0}
              onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'streakMinVisits', value: v })}
              min={2}
              max={365}
            />
            <div>
              <FieldLabel label="Reward type" />
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(['percentage', 'amount'] as const).map((k) => {
                  const selected = state.streakRewardType === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'streakRewardType', value: k })}
                      className={cn(
                        'h-10 rounded-lg border text-[12.5px] font-semibold transition',
                        selected
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300',
                      )}
                    >
                      {k === 'percentage' ? '% off' : '$ off'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <NumberField
              label="Reward value"
              value={state.streakRewardValue ?? 0}
              onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'streakRewardValue', value: v })}
              min={1}
              max={state.streakRewardType === 'percentage' ? 100 : 1000}
            />
            <NumberField
              label="Max claims"
              value={state.streakMaxClaims ?? 0}
              onChange={(v) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'streakMaxClaims', value: v === 0 ? null : v })
              }
              min={0}
              placeholder="∞"
            />
            <NumberField
              label="Expires after (hours)"
              value={state.streakExpiryHours}
              onChange={(v) => dispatch({ type: 'UPDATE_FIELD', field: 'streakExpiryHours', value: v })}
              min={1}
              max={720}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

// ── Shared primitives ────────────────────────────────────────────────────────

const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="text-[13px] font-semibold text-neutral-900">{title}</div>
      <p className="mt-0.5 text-[12px] leading-5 text-neutral-500">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const NumberField = ({
  label,
  value,
  onChange,
  min,
  max,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}) => (
  <div>
    <FieldLabel label={label} />
    <Input
      type="number"
      value={value || ''}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value === '' ? 0 : Number(e.target.value);
        if (Number.isFinite(next)) onChange(Math.max(min ?? 0, Math.min(max ?? Number.MAX_SAFE_INTEGER, next)));
      }}
      className="mt-1.5 h-10 rounded-lg border-neutral-200 bg-white text-[13.5px]"
    />
  </div>
);

export default RewardsSection;

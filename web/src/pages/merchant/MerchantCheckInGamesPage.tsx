import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  CheckCircle2,
  Coins,
  Gift,
  Globe,
  Loader2,
  Percent,
  Pencil,
  Sparkles,
  Target,
  Trash2,
  Utensils,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MenuItemPicker } from '@/components/merchant/MenuItemPicker';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import { useToast } from '@/hooks/use-toast';
import { apiDelete, apiGet, apiPatch } from '@/services/api';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

type CheckInRewardType =
  | 'DISCOUNT_PERCENTAGE'
  | 'DISCOUNT_FIXED'
  | 'FREE_ITEM'
  | 'BONUS_POINTS';

// Wizard-only sentinel. Saved to the backend as isEnabled: false (no rewardType used).
type WizardRewardChoice = CheckInRewardType | 'NONE';

const ITEM_BASED_TYPES: WizardRewardChoice[] = ['DISCOUNT_PERCENTAGE', 'DISCOUNT_FIXED', 'FREE_ITEM'];
const POINT_PRESETS = [50, 100, 200, 500] as const;

type Scope = 'default' | 'deal';

interface MerchantDeal {
  id: number;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  dealType?: { name?: string | null } | null;
  isExpired?: boolean;
  isUpcoming?: boolean;
  currentRedemptions?: number;
}

interface ConfiguredReward {
  id: number;
  label: string;
  imageUrl: string | null;
  rewardType: CheckInRewardType;
  rewardValue: number;
  rewardLabel: string | null;
  isActive: boolean;
  maxWins: number | null;
  currentWins: number;
  dealId: number | null;
  menuItemId: number | null;
  menuItem: { id: number; name: string; imageUrl: string | null; price: number; category: string | null } | null;
}

interface RewardsConfigResponse {
  rewards: ConfiguredReward[];
}

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const REWARD_CHOICE_LABEL: Record<WizardRewardChoice, string> = {
  DISCOUNT_PERCENTAGE: 'Percent off',
  DISCOUNT_FIXED: 'Fixed amount off',
  FREE_ITEM: 'Free item',
  BONUS_POINTS: 'Bonus points',
  NONE: 'No reward',
};

const REWARD_CHOICE_HINT: Record<WizardRewardChoice, string> = {
  DISCOUNT_PERCENTAGE: 'A percentage off the menu item you pick.',
  DISCOUNT_FIXED: 'A flat dollar amount off the menu item you pick.',
  FREE_ITEM: 'Give the item away for free.',
  BONUS_POINTS: 'Credit the customer with loyalty points. Comes in 50 / 100 / 200 / 500 packs.',
  NONE: "Customers checking in to this deal get no automatic reward — and it won't fall back to the default.",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

const dealState = (deal: MerchantDeal) => {
  if (deal.isExpired) return { label: 'Expired', tone: 'bg-neutral-100 text-neutral-600 ring-neutral-400/20' };
  if (deal.isUpcoming) return { label: 'Scheduled', tone: 'bg-sky-100 text-sky-700 ring-sky-600/20' };
  return { label: 'Active', tone: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' };
};

const describeReward = (reward: ConfiguredReward) => {
  if (!reward.isActive) return 'No reward';
  if (reward.rewardLabel) return reward.rewardLabel;
  const name = reward.menuItem?.name ?? reward.label;
  if (reward.rewardType === 'DISCOUNT_PERCENTAGE') return `${Math.round(reward.rewardValue)}% off ${name}`;
  if (reward.rewardType === 'DISCOUNT_FIXED') return `$${Math.round(reward.rewardValue)} off ${name}`;
  if (reward.rewardType === 'BONUS_POINTS') return `${Math.round(reward.rewardValue)} bonus points`;
  return `Free ${name}`;
};

interface WizardState {
  scope: Scope;
  dealId: number | null;
  menuItemId: number | null;
  rewardChoice: WizardRewardChoice;
  rewardValue: string;
  rewardExpiryHours: string;
  maxWins: string;
  editingRewardId: number | null;
}

const emptyWizard: WizardState = {
  scope: 'default',
  dealId: null,
  menuItemId: null,
  rewardChoice: 'DISCOUNT_PERCENTAGE',
  rewardValue: '20',
  rewardExpiryHours: '24',
  maxWins: '',
  editingRewardId: null,
};

const wizardFromReward = (reward: ConfiguredReward): WizardState => ({
  scope: reward.dealId == null ? 'default' : 'deal',
  dealId: reward.dealId,
  menuItemId: reward.menuItemId,
  rewardChoice: reward.isActive ? reward.rewardType : 'NONE',
  rewardValue:
    !reward.isActive || reward.rewardType === 'FREE_ITEM' ? '0' : String(reward.rewardValue ?? ''),
  rewardExpiryHours: '24',
  maxWins: reward.maxWins != null ? String(reward.maxWins) : '',
  editingRewardId: reward.id,
});

const requiresItem = (choice: WizardRewardChoice) => ITEM_BASED_TYPES.includes(choice);
const requiresValueInput = (choice: WizardRewardChoice) =>
  choice === 'DISCOUNT_PERCENTAGE' || choice === 'DISCOUNT_FIXED' || choice === 'BONUS_POINTS';

const STEP_LABELS = ['Scope', 'Reward', 'Details'] as const;

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, index) => {
        const n = (index + 1) as 1 | 2 | 3;
        const state = n < step ? 'done' : n === step ? 'current' : 'upcoming';
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset transition',
                state === 'done' && 'bg-emerald-600 text-white ring-emerald-600',
                state === 'current' && 'bg-emerald-50 text-emerald-700 ring-emerald-300',
                state === 'upcoming' && 'bg-neutral-100 text-neutral-500 ring-neutral-200',
              )}
            >
              {state === 'done' ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            <div
              className={cn(
                'text-xs font-semibold uppercase tracking-[0.18em]',
                state === 'upcoming' ? 'text-neutral-400' : 'text-neutral-700',
              )}
            >
              {label}
            </div>
            {n < 3 && <div className="h-px w-6 bg-neutral-200" aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}

function ScopeStep({
  scope,
  dealId,
  deals,
  alreadyConfiguredDealIds,
  onScopeChange,
  onDealChange,
}: {
  scope: Scope;
  dealId: number | null;
  deals: MerchantDeal[];
  alreadyConfiguredDealIds: Set<number>;
  onScopeChange: (next: Scope) => void;
  onDealChange: (next: number | null) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onScopeChange('default')}
          className={cn(
            'flex items-start gap-3 rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]',
            scope === 'default' ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-neutral-200',
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-900">Default for all deals</div>
            <p className="mt-1 text-xs text-neutral-500">
              Applies to every deal where you haven’t set up a specific check-in reward.
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onScopeChange('deal')}
          className={cn(
            'flex items-start gap-3 rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]',
            scope === 'deal' ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-neutral-200',
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-200">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-900">Specific deal</div>
            <p className="mt-1 text-xs text-neutral-500">
              Override the default with a unique check-in reward for one of your deals.
            </p>
          </div>
        </button>
      </div>

      {scope === 'deal' && (
        <div className={cn(panelClass, 'p-4')}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Pick a deal</div>
              <p className="text-xs text-neutral-500">Expired deals can’t receive new rewards.</p>
            </div>
            <div className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-200">
              {deals.filter((d) => !d.isExpired).length} available
            </div>
          </div>
          <div className="mt-3 grid gap-2 max-h-[320px] overflow-y-auto pr-1 sm:grid-cols-2">
            {deals
              .filter((deal) => !deal.isExpired)
              .map((deal) => {
                const selected = deal.id === dealId;
                const status = dealState(deal);
                const alreadyConfigured = alreadyConfiguredDealIds.has(deal.id);
                return (
                  <button
                    key={deal.id}
                    type="button"
                    onClick={() => onDealChange(deal.id)}
                    className={cn(
                      'flex flex-col gap-2 rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]',
                      selected ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-neutral-200',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-neutral-900">{deal.title}</div>
                        <div className="mt-0.5 text-[11px] text-neutral-500">
                          {formatDate(deal.startTime)} → {formatDate(deal.endTime)}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                          status.tone,
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    {alreadyConfigured && (
                      <div className="inline-flex items-center gap-1 self-start rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Has reward
                      </div>
                    )}
                  </button>
                );
              })}
            {deals.filter((deal) => !deal.isExpired).length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                You have no active or upcoming deals.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const CHOICE_ICON: Record<WizardRewardChoice, typeof Percent> = {
  DISCOUNT_PERCENTAGE: Percent,
  DISCOUNT_FIXED: Gift,
  FREE_ITEM: Sparkles,
  BONUS_POINTS: Coins,
  NONE: Ban,
};

const REWARD_CHOICE_ORDER: WizardRewardChoice[] = [
  'DISCOUNT_PERCENTAGE',
  'DISCOUNT_FIXED',
  'FREE_ITEM',
  'BONUS_POINTS',
  'NONE',
];

function RewardTypeStep({
  rewardChoice,
  menuItemId,
  onChoiceChange,
  onMenuItemChange,
}: {
  rewardChoice: WizardRewardChoice;
  menuItemId: number | null;
  onChoiceChange: (next: WizardRewardChoice) => void;
  onMenuItemChange: (next: number | null) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Reward type</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {REWARD_CHOICE_ORDER.map((choice) => {
            const isActive = choice === rewardChoice;
            const Icon = CHOICE_ICON[choice];
            return (
              <button
                key={choice}
                type="button"
                onClick={() => onChoiceChange(choice)}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(15,23,42,0.06)]',
                  isActive ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-neutral-200',
                  choice === 'NONE' && isActive && 'border-neutral-400 ring-neutral-300',
                )}
              >
                <Icon
                  className={cn('h-5 w-5', isActive ? (choice === 'NONE' ? 'text-neutral-700' : 'text-emerald-600') : 'text-neutral-500')}
                  aria-hidden
                />
                <div className="text-sm font-semibold text-neutral-900">{REWARD_CHOICE_LABEL[choice]}</div>
                <div className="text-[11px] leading-snug text-neutral-500">{REWARD_CHOICE_HINT[choice]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {requiresItem(rewardChoice) && (
        <div>
          <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Menu item</Label>
          <div className="mt-2">
            <MenuItemPicker
              mode="single"
              value={menuItemId == null ? [] : [menuItemId]}
              onChange={(ids) => onMenuItemChange(ids[0] ?? null)}
              maxHeightClass="max-h-[320px]"
              emptyHint="Add an item to your menu first — discount and free-item rewards always apply to a specific menu item."
            />
          </div>
        </div>
      )}

      {rewardChoice === 'BONUS_POINTS' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800">
          Customers receive these as loyalty points credited to their account at check-in — no claim code or staff handoff needed.
        </div>
      )}

      {rewardChoice === 'NONE' && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
          Customers checking in to this deal will get no automatic reward. The merchant default (if any) will NOT apply for this deal.
        </div>
      )}
    </div>
  );
}

function DetailsStep({
  rewardChoice,
  rewardValue,
  rewardExpiryHours,
  maxWins,
  onChange,
}: {
  rewardChoice: WizardRewardChoice;
  rewardValue: string;
  rewardExpiryHours: string;
  maxWins: string;
  onChange: (patch: Partial<WizardState>) => void;
}) {
  if (rewardChoice === 'NONE') {
    return (
      <div className={cn(panelClass, 'p-5')}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
            <Ban className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-900">No reward configured</div>
            <p className="mt-1 text-xs text-neutral-500">
              Nothing else to set. Click Save and check-ins to this deal won't issue a reward.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (rewardChoice === 'FREE_ITEM') {
    return (
      <div className="space-y-5">
        <div className={cn(panelClass, 'p-4 text-sm text-neutral-600')}>
          <div className="font-semibold text-neutral-900">Free item — no value needed</div>
          <p className="mt-1 text-xs text-neutral-500">
            The customer gets the selected menu item free. Set the redemption window below.
          </p>
        </div>
        <ExpiryAndCapInputs
          rewardExpiryHours={rewardExpiryHours}
          maxWins={maxWins}
          onChange={onChange}
        />
      </div>
    );
  }

  if (rewardChoice === 'BONUS_POINTS') {
    return (
      <div className="space-y-5">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Quick presets</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {POINT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ rewardValue: String(preset) })}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset transition',
                  Number(rewardValue) === preset
                    ? 'bg-emerald-600 text-white ring-emerald-600'
                    : 'bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-50',
                )}
              >
                {preset} pts
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="reward-value" className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Custom amount (points)
          </Label>
          <div className="mt-2 flex items-center gap-2">
            <Input
              id="reward-value"
              type="number"
              min={1}
              step={1}
              value={rewardValue}
              onChange={(event) => onChange({ rewardValue: event.target.value })}
              className="h-11 max-w-[160px]"
            />
            <span className="text-sm font-semibold text-neutral-500">pts</span>
          </div>
        </div>
        <ExpiryAndCapInputs
          rewardExpiryHours={rewardExpiryHours}
          maxWins={maxWins}
          onChange={onChange}
          expiryHidden
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="reward-value" className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          {rewardChoice === 'DISCOUNT_PERCENTAGE' ? 'Percent off' : 'Dollar amount off'}
        </Label>
        <div className="mt-2 flex items-center gap-2">
          {rewardChoice === 'DISCOUNT_FIXED' && <span className="text-sm font-semibold text-neutral-500">$</span>}
          <Input
            id="reward-value"
            type="number"
            min={rewardChoice === 'DISCOUNT_PERCENTAGE' ? 1 : 0.5}
            max={rewardChoice === 'DISCOUNT_PERCENTAGE' ? 100 : undefined}
            step={rewardChoice === 'DISCOUNT_PERCENTAGE' ? 1 : 0.5}
            value={rewardValue}
            onChange={(event) => onChange({ rewardValue: event.target.value })}
            className="h-11 max-w-[160px]"
          />
          {rewardChoice === 'DISCOUNT_PERCENTAGE' && <span className="text-sm font-semibold text-neutral-500">%</span>}
        </div>
      </div>
      <ExpiryAndCapInputs
        rewardExpiryHours={rewardExpiryHours}
        maxWins={maxWins}
        onChange={onChange}
      />
    </div>
  );
}

function ExpiryAndCapInputs({
  rewardExpiryHours,
  maxWins,
  onChange,
  expiryHidden = false,
}: {
  rewardExpiryHours: string;
  maxWins: string;
  onChange: (patch: Partial<WizardState>) => void;
  expiryHidden?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {!expiryHidden && (
        <div>
          <Label htmlFor="expiry-hours" className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Expires after (hours)
          </Label>
          <Input
            id="expiry-hours"
            type="number"
            min={1}
            value={rewardExpiryHours}
            onChange={(event) => onChange({ rewardExpiryHours: event.target.value })}
            placeholder="24"
            className="mt-2 h-11"
          />
        </div>
      )}
      <div>
        <Label htmlFor="max-wins" className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Total claim cap
        </Label>
        <Input
          id="max-wins"
          type="number"
          min={1}
          value={maxWins}
          onChange={(event) => onChange({ maxWins: event.target.value })}
          placeholder="Unlimited"
          className="mt-2 h-11"
        />
      </div>
    </div>
  );
}

function ConfiguredRewardsList({
  rewards,
  dealsById,
  onEdit,
  onRemove,
  removingId,
}: {
  rewards: ConfiguredReward[];
  dealsById: Map<number, MerchantDeal>;
  onEdit: (reward: ConfiguredReward) => void;
  onRemove: (reward: ConfiguredReward) => void;
  removingId: number | null;
}) {
  if (rewards.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className={cn(panelClass, 'flex items-center justify-between gap-3 p-4')}>
        <div>
          <h3 className="text-base font-bold text-neutral-900">Configured rewards</h3>
          <p className="text-sm text-neutral-500">Customers get one of these on check-in based on which deal they’re at.</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
          {rewards.length}
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {rewards.map((reward) => {
          const isDefault = reward.dealId == null;
          const deal = !isDefault && reward.dealId != null ? dealsById.get(reward.dealId) : null;
          return (
            <div
              key={reward.id}
              className={cn(
                panelClass,
                'flex items-start gap-3 p-4',
                !reward.isActive && 'opacity-70',
              )}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                {reward.menuItem?.imageUrl || reward.imageUrl ? (
                  <img
                    src={reward.menuItem?.imageUrl ?? reward.imageUrl ?? undefined}
                    alt={reward.menuItem?.name ?? reward.label}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-400">
                    <Utensils className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                      isDefault
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : 'bg-sky-50 text-sky-700 ring-sky-200',
                    )}
                  >
                    {isDefault ? <Globe className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                    {isDefault ? 'Default' : deal?.title ?? `Deal #${reward.dealId}`}
                  </span>
                </div>
                <div className="mt-1 truncate text-sm font-bold text-neutral-900">
                  {describeReward(reward)}
                </div>
                <div className="mt-0.5 text-[11px] text-neutral-500">
                  {reward.menuItem?.category ? `${reward.menuItem.category} · ` : ''}
                  {reward.maxWins != null ? `${reward.currentWins}/${reward.maxWins} claimed` : `${reward.currentWins} claimed`}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(reward)}
                  className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(reward)}
                  disabled={removingId === reward.id}
                  className="rounded-full p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                  title="Remove"
                >
                  {removingId === reward.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MerchantCheckInGamesPage() {
  const { data: merchantData } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const dealsQuery = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: MerchantDeal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const rewardsQuery = useQuery({
    queryKey: ['merchant-check-in-rewards-config'],
    queryFn: () => apiGet<{ success: boolean; data: RewardsConfigResponse }>('/merchants/check-in-rewards/config'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const menuQuery = useMerchantMenu();

  const deals = useMemo<MerchantDeal[]>(() => dealsQuery.data?.data?.deals ?? [], [dealsQuery.data]);
  const rewards = useMemo<ConfiguredReward[]>(
    () => rewardsQuery.data?.data?.data?.rewards ?? [],
    [rewardsQuery.data],
  );
  const menuItems = useMemo<MenuItem[]>(() => menuQuery.data?.menuItems ?? [], [menuQuery.data]);
  const menuItemById = useMemo(() => new Map(menuItems.map((item) => [item.id, item])), [menuItems]);
  const dealsById = useMemo(() => new Map(deals.map((deal) => [deal.id, deal])), [deals]);

  const defaultReward = useMemo(() => rewards.find((reward) => reward.dealId == null) ?? null, [rewards]);
  const dealRewards = useMemo(() => rewards.filter((reward) => reward.dealId != null), [rewards]);
  const dealRewardsByDealId = useMemo(
    () => new Set(dealRewards.map((reward) => reward.dealId!)),
    [dealRewards],
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [wizard, setWizard] = useState<WizardState>(emptyWizard);

  const updateWizard = (patch: Partial<WizardState>) => setWizard((prev) => ({ ...prev, ...patch }));

  const resetWizard = () => {
    setStep(1);
    setWizard(emptyWizard);
  };

  const beginEdit = (reward: ConfiguredReward) => {
    setStep(1);
    setWizard(wizardFromReward(reward));
  };

  const saveReward = useMutation({
    mutationFn: async () => {
      if (wizard.scope === 'deal' && wizard.dealId == null) {
        throw new Error('Pick a deal first');
      }

      const endpoint =
        wizard.scope === 'default'
          ? '/merchants/check-in-rewards/default'
          : `/merchants/deals/${wizard.dealId}/check-in-reward`;

      // "No reward" path: just save with isEnabled=false. Backend ignores other
      // fields in this case.
      if (wizard.rewardChoice === 'NONE') {
        const response = await apiPatch(endpoint, { isEnabled: false });
        if (!response.success) {
          throw new Error(response.error ?? 'Failed to save');
        }
        return response.data;
      }

      if (requiresItem(wizard.rewardChoice) && wizard.menuItemId == null) {
        throw new Error('Pick a menu item first');
      }

      const rewardExpiryHours = wizard.rewardExpiryHours.trim() ? Number(wizard.rewardExpiryHours) : 24;
      if (!Number.isFinite(rewardExpiryHours) || rewardExpiryHours < 0) {
        throw new Error('Expiry must be zero or greater');
      }
      const maxWins = wizard.maxWins.trim() ? Number(wizard.maxWins) : null;
      if (maxWins != null && (!Number.isInteger(maxWins) || maxWins < 1)) {
        throw new Error('Total claim cap must be at least 1');
      }

      const rewardValue =
        wizard.rewardChoice === 'FREE_ITEM' ? 0 : Number(wizard.rewardValue);
      if (wizard.rewardChoice !== 'FREE_ITEM') {
        if (!Number.isFinite(rewardValue) || rewardValue <= 0) {
          throw new Error('Reward value must be a positive number');
        }
        if (wizard.rewardChoice === 'DISCOUNT_PERCENTAGE' && rewardValue > 100) {
          throw new Error('Percent off cannot exceed 100');
        }
        if (wizard.rewardChoice === 'BONUS_POINTS' && !Number.isInteger(rewardValue)) {
          throw new Error('Points must be a whole number');
        }
      }

      const payload = {
        isEnabled: true,
        menuItemId: requiresItem(wizard.rewardChoice) ? wizard.menuItemId : null,
        rewardType: wizard.rewardChoice,
        rewardValue,
        rewardExpiryHours,
        maxWins,
      };

      const response = await apiPatch(endpoint, payload);
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to save check-in reward');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-check-in-rewards-config'] });
      toast({
        title: 'Check-in reward saved',
        description:
          wizard.scope === 'default'
            ? 'Will apply to every deal without its own reward.'
            : 'Will apply when customers check in to this deal.',
      });
      resetWizard();
    },
    onError: (error: Error) => {
      toast({ title: 'Could not save reward', description: error.message, variant: 'destructive' });
    },
  });

  const removeReward = useMutation({
    mutationFn: async (reward: ConfiguredReward) => {
      const endpoint =
        reward.dealId == null
          ? '/merchants/check-in-rewards/default'
          : `/merchants/deals/${reward.dealId}/check-in-reward`;
      const response = await apiDelete(endpoint);
      if (!response.success) throw new Error(response.error ?? 'Failed to remove');
      return reward.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-check-in-rewards-config'] });
      toast({ title: 'Reward removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not remove reward', description: error.message, variant: 'destructive' });
    },
  });

  // If the merchant edits a reward whose item disappeared from the menu, surface
  // a helpful default so the picker doesn't show a stale ID.
  useEffect(() => {
    if (wizard.menuItemId != null && menuItems.length > 0 && !menuItemById.has(wizard.menuItemId)) {
      updateWizard({ menuItemId: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems]);

  const selectedItem = wizard.menuItemId != null ? menuItemById.get(wizard.menuItemId) ?? null : null;
  const selectedDeal = wizard.dealId != null ? dealsById.get(wizard.dealId) ?? null : null;

  const canAdvanceFromScope = wizard.scope === 'default' || wizard.dealId != null;
  const canAdvanceFromReward =
    wizard.rewardChoice === 'NONE' ||
    wizard.rewardChoice === 'BONUS_POINTS' ||
    (requiresItem(wizard.rewardChoice) && wizard.menuItemId != null);
  const valueValid = (() => {
    if (!requiresValueInput(wizard.rewardChoice)) return true;
    const n = Number(wizard.rewardValue);
    if (!Number.isFinite(n) || n <= 0) return false;
    if (wizard.rewardChoice === 'DISCOUNT_PERCENTAGE' && n > 100) return false;
    if (wizard.rewardChoice === 'BONUS_POINTS' && !Number.isInteger(n)) return false;
    return true;
  })();
  const canSave = canAdvanceFromScope && canAdvanceFromReward && valueValid;

  if (dealsQuery.isLoading || rewardsQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (dealsQuery.error || rewardsQuery.error) {
    return (
      <div className={cn(panelClass, 'border-rose-200 bg-rose-50 p-4 text-sm text-rose-700')}>
        {(dealsQuery.error as Error)?.message || (rewardsQuery.error as Error)?.message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      <div
        className={cn(
          panelClass,
          'flex flex-wrap items-center justify-between gap-4 border-emerald-200/70 bg-gradient-to-r from-emerald-50 via-white to-white p-5',
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
            <Gift className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">Check-in Rewards</h2>
            <p className="text-sm text-neutral-600">
              Set a default or per-deal reward. Customers get a discount on one specific menu item when they check in.
            </p>
          </div>
        </div>
        <Link to={PATHS.MERCHANT_DEALS}>
          <Button size="md" variant="secondary" className="rounded-full border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            View all deals
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Default set?</div>
          <div className="mt-1 truncate text-[1.1rem] font-semibold tracking-tight text-emerald-700">
            {defaultReward ? describeReward(defaultReward) : 'Not yet'}
          </div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Deal-specific overrides</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-neutral-950">{dealRewards.length}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Editing</div>
          <div className="mt-1 truncate text-[1.1rem] font-semibold tracking-tight text-neutral-900">
            {wizard.editingRewardId ? 'Existing reward' : 'New reward'}
          </div>
        </div>
      </div>

      <div className={cn(panelClass, 'p-5')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StepIndicator step={step} />
          {wizard.editingRewardId != null && (
            <button
              type="button"
              onClick={resetWizard}
              className="text-xs font-semibold text-neutral-500 underline-offset-4 hover:underline"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="mt-5">
          {step === 1 && (
            <ScopeStep
              scope={wizard.scope}
              dealId={wizard.dealId}
              deals={deals}
              alreadyConfiguredDealIds={dealRewardsByDealId}
              onScopeChange={(scope) =>
                updateWizard({ scope, dealId: scope === 'default' ? null : wizard.dealId })
              }
              onDealChange={(dealId) => updateWizard({ dealId })}
            />
          )}
          {step === 2 && (
            <RewardTypeStep
              rewardChoice={wizard.rewardChoice}
              menuItemId={wizard.menuItemId}
              onChoiceChange={(choice) => updateWizard({
                rewardChoice: choice,
                menuItemId: requiresItem(choice) ? wizard.menuItemId : null,
                rewardValue:
                  choice === 'BONUS_POINTS'
                    ? '100'
                    : choice === 'DISCOUNT_PERCENTAGE'
                      ? '20'
                      : choice === 'DISCOUNT_FIXED'
                        ? '5'
                        : '0',
              })}
              onMenuItemChange={(id) => updateWizard({ menuItemId: id })}
            />
          )}
          {step === 3 && (
            <DetailsStep
              rewardChoice={wizard.rewardChoice}
              rewardValue={wizard.rewardValue}
              rewardExpiryHours={wizard.rewardExpiryHours}
              maxWins={wizard.maxWins}
              onChange={updateWizard}
            />
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-neutral-500">
            {step === 1 && (wizard.scope === 'default'
              ? 'This reward will apply to every deal where you haven’t set a specific reward.'
              : selectedDeal
                ? `Reward will trigger when customers check in to “${selectedDeal.title}”.`
                : 'Pick a deal to continue.')}
            {step === 2 && (() => {
              if (wizard.rewardChoice === 'NONE') return "Explicit opt-out — this deal won't issue any reward.";
              if (wizard.rewardChoice === 'BONUS_POINTS') return 'Bonus points credit the customer\'s loyalty balance — no menu item needed.';
              if (requiresItem(wizard.rewardChoice)) {
                return selectedItem ? `Selected: ${selectedItem.name}` : 'Pick the menu item the reward applies to.';
              }
              return 'Pick a reward type to continue.';
            })()}
            {step === 3 && (canSave
              ? 'Click Save to apply.'
              : wizard.rewardChoice === 'NONE'
                ? 'Click Save to record the no-reward opt-out.'
                : 'Set a reward value to continue.')}
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}
                className="rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1 && !canAdvanceFromScope) return;
                  if (step === 2 && !canAdvanceFromReward) return;
                  setStep((prev) => (prev === 1 ? 2 : 3));
                }}
                disabled={(step === 1 && !canAdvanceFromScope) || (step === 2 && !canAdvanceFromReward)}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => saveReward.mutate()}
                disabled={!canSave || saveReward.isPending}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
              >
                {saveReward.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {wizard.editingRewardId ? 'Update reward' : 'Save reward'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfiguredRewardsList
        rewards={rewards}
        dealsById={dealsById}
        onEdit={beginEdit}
        onRemove={(reward) => removeReward.mutate(reward)}
        removingId={removeReward.isPending ? (removeReward.variables as ConfiguredReward | undefined)?.id ?? null : null}
      />
    </div>
  );
}

export default MerchantCheckInGamesPage;

import { useEffect, useMemo, useState } from 'react';
import {
  BadgePercent,
  CheckCircle2,
  CircleDot,
  Coins,
  Eye,
  Gift,
  Percent,
  Plus,
  Sparkles,
  Ticket,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import {
  useMerchantCheckInGameAnalytics,
  useMerchantCheckInGameConfig,
  useSaveMerchantCheckInGameConfig,
  type MerchantCheckInGameConfig,
  type MerchantCheckInGameReward,
} from '@/hooks/useCheckInGames';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const GAME_TYPES: MerchantCheckInGameConfig['gameType'][] = ['SCRATCH_CARD', 'SPIN_WHEEL', 'PICK_A_CARD'];
const REWARD_TYPES: MerchantCheckInGameReward['rewardType'][] = [
  'DISCOUNT_PERCENTAGE',
  'DISCOUNT_FIXED',
  'FREE_ITEM',
  'COINS',
  'BONUS_POINTS',
];

const createEmptyReward = (): MerchantCheckInGameReward => ({
  label: '',
  rewardType: 'DISCOUNT_PERCENTAGE',
  rewardValue: 5,
  rewardLabel: '',
  probabilityWeight: 1,
  isActive: true,
});

const gameTypeCopy: Record<
  MerchantCheckInGameConfig['gameType'],
  { title: string; description: string; previewTitle: string }
> = {
  SCRATCH_CARD: {
    title: 'Scratch card',
    description: 'Best for fast reveal moments and strong reward anticipation.',
    previewTitle: 'Swipe-to-reveal reward',
  },
  SPIN_WHEEL: {
    title: 'Spin wheel',
    description: 'Best for visual excitement and larger promo-style campaigns.',
    previewTitle: 'Big reveal wheel',
  },
  PICK_A_CARD: {
    title: 'Pick a card',
    description: 'Best for a simple and premium-feeling choose-your-luck flow.',
    previewTitle: 'Choose-your-luck reveal',
  },
};

const rewardTypeLabels: Record<MerchantCheckInGameReward['rewardType'], string> = {
  DISCOUNT_PERCENTAGE: 'Percent off',
  DISCOUNT_FIXED: 'Fixed discount',
  FREE_ITEM: 'Free item',
  COINS: 'Coins',
  BONUS_POINTS: 'Bonus points',
};

const StatCard = ({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'brand' | 'green';
}) => {
  const toneClasses =
    tone === 'brand'
      ? 'bg-brand-primary-50 text-brand-primary-700 border-brand-primary-100'
      : tone === 'green'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
        : 'bg-white text-neutral-900 border-neutral-200';

  return (
    <div className={cn('rounded-2xl border p-5 shadow-sm', toneClasses)}>
      <div className="text-sm font-medium text-neutral-500">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight">{value}</div>
    </div>
  );
};

const previewRewardLabel = (reward: MerchantCheckInGameReward) => {
  if (reward.rewardLabel?.trim()) return reward.rewardLabel.trim();

  switch (reward.rewardType) {
    case 'DISCOUNT_PERCENTAGE':
      return `${reward.rewardValue}% OFF`;
    case 'DISCOUNT_FIXED':
      return `$${reward.rewardValue.toFixed(0)} OFF`;
    case 'COINS':
      return `${reward.rewardValue.toFixed(0)} Coins`;
    case 'BONUS_POINTS':
      return `${reward.rewardValue.toFixed(0)} Points`;
    case 'FREE_ITEM':
      return reward.label || 'Free item';
    default:
      return reward.label || 'Reward';
  }
};

export function MerchantCheckInGamesPage() {
  const { toast } = useToast();
  const { data, isLoading } = useMerchantCheckInGameConfig();
  const { data: analytics } = useMerchantCheckInGameAnalytics();
  const saveMutation = useSaveMerchantCheckInGameConfig();
  const [form, setForm] = useState<MerchantCheckInGameConfig | null>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  const updateReward = (index: number, patch: Partial<MerchantCheckInGameReward>) => {
    setForm((current) => {
      if (!current) return current;
      const rewards = [...current.rewards];
      rewards[index] = { ...rewards[index], ...patch };
      return { ...current, rewards };
    });
  };

  const addReward = () => {
    setForm((current) => (current ? { ...current, rewards: [...current.rewards, createEmptyReward()] } : current));
  };

  const removeReward = (index: number) => {
    setForm((current) => {
      if (!current) return current;
      return { ...current, rewards: current.rewards.filter((_, rewardIndex) => rewardIndex !== index) };
    });
  };

  const activeRewards = useMemo(
    () => (form?.rewards ?? []).filter((reward) => reward.label.trim().length > 0),
    [form?.rewards],
  );

  const totalWeight = useMemo(
    () => activeRewards.reduce((sum, reward) => sum + Math.max(1, Number(reward.probabilityWeight) || 1), 0),
    [activeRewards],
  );

  const topRewards = useMemo(
    () =>
      [...activeRewards]
        .sort((a, b) => (Number(b.probabilityWeight) || 1) - (Number(a.probabilityWeight) || 1))
        .slice(0, 3),
    [activeRewards],
  );

  const handleSave = async () => {
    if (!form) return;

    try {
      await saveMutation.mutateAsync({
        ...form,
        rewards: form.rewards.filter((reward) => reward.label.trim().length > 0),
      });
      toast({ title: 'Saved', description: 'Check-in game settings updated.' });
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message || 'Could not update check-in game settings.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !form) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-sm text-neutral-500 shadow-sm">
        Loading merchant game settings...
      </div>
    );
  }

  const selectedGame = gameTypeCopy[form.gameType];
  const status = !form.isEnabled ? 'draft' : activeRewards.length === 0 ? 'needs_rewards' : 'live';
  const statusLabel =
    status === 'live' ? 'Live' : status === 'needs_rewards' ? 'Needs rewards' : 'Draft';
  const statusClasses =
    status === 'live'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'needs_rewards'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-neutral-100 text-neutral-700 border-neutral-200';

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#f6efe6] via-white to-[#eef4ff] px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-primary-700">
                <Sparkles className="h-3.5 w-3.5" />
                Check-in Games
              </div>
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-[2.15rem]">
                Design your post check-in reward moment
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Keep the experience playful, on-brand, and easy to redeem. Merchants choose the game type, reward mix,
                and how often customers can play.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Current mode</div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-neutral-800">
                  <span className={cn('rounded-full border px-3 py-1', statusClasses)}>{statusLabel}</span>
                </div>
                <p className="mt-3 text-sm text-neutral-600">
                  {status === 'live'
                    ? 'Customers can immediately play after check-in.'
                    : status === 'needs_rewards'
                      ? 'Turn this live by adding at least one named reward.'
                      : 'This setup is saved, but hidden from customers.'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Live setup</div>
                <div className="mt-2 text-lg font-bold text-neutral-900">{selectedGame.title}</div>
                <p className="mt-1 max-w-xs text-sm text-neutral-600">{selectedGame.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-brand-primary-50 p-2.5 text-brand-primary-700">
              <CircleDot className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Status</div>
              <div className="mt-1 text-base font-bold text-neutral-900">{statusLabel}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-neutral-100 p-2.5 text-neutral-700">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Reward mix</div>
              <div className="mt-1 text-base font-bold text-neutral-900">{activeRewards.length} active rewards</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-neutral-100 p-2.5 text-neutral-700">
              <Ticket className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Game style</div>
              <div className="mt-1 text-base font-bold text-neutral-900">{selectedGame.previewTitle}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-neutral-100 p-2.5 text-neutral-700">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Player promise</div>
              <div className="mt-1 text-base font-bold text-neutral-900">
                {form.cooldownMinutes > 0 ? `Replay in ${form.cooldownMinutes} min` : 'Playable every check-in'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Sessions created" value={`${analytics?.sessions ?? 0}`} />
        <StatCard label="Games played" value={`${analytics?.playedSessions ?? 0}`} tone="brand" />
        <StatCard label="Play-through rate" value={`${analytics?.conversionRate ?? 0}%`} tone="green" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-neutral-900">Experience settings</h2>
              <p className="mt-1 text-sm text-neutral-600">Define which game appears and how the reward moment is presented.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Enable post check-in game</span>
                <select
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  value={form.isEnabled ? 'enabled' : 'disabled'}
                  onChange={(event) => setForm({ ...form, isEnabled: event.target.value === 'enabled' })}
                >
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled</option>
                </select>
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Game type</span>
                <select
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  value={form.gameType}
                  onChange={(event) => setForm({ ...form, gameType: event.target.value as MerchantCheckInGameConfig['gameType'] })}
                >
                  {GAME_TYPES.map((gameType) => (
                    <option key={gameType} value={gameType}>
                      {gameType.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Headline</span>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Subheadline</span>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  value={form.subtitle || ''}
                  onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
                />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Cooldown minutes</span>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  type="number"
                  min={0}
                  value={form.cooldownMinutes}
                  onChange={(event) => setForm({ ...form, cooldownMinutes: Number(event.target.value) || 0 })}
                />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Reward expires in hours</span>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  type="number"
                  min={1}
                  value={form.rewardExpiryHours}
                  onChange={(event) => setForm({ ...form, rewardExpiryHours: Number(event.target.value) || 24 })}
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Reward pool</h2>
                <p className="mt-1 text-sm text-neutral-600">Balance win frequency and prize value to shape the experience.</p>
              </div>
              <Button variant="secondary" size="sm" className="rounded-xl" onClick={addReward}>
                <Plus className="mr-1 h-4 w-4" />
                Add reward
              </Button>
            </div>

            <div className="space-y-4">
              {form.rewards.map((reward, index) => (
                <div key={`${reward.id ?? 'new'}-${index}`} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">
                        Reward {index + 1}
                        {reward.label.trim() ? ` · ${reward.label}` : ''}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                        {rewardTypeLabels[reward.rewardType]}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => removeReward(index)}
                      disabled={form.rewards.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <input
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100 xl:col-span-2"
                      placeholder="Reward title"
                      value={reward.label}
                      onChange={(event) => updateReward(index, { label: event.target.value })}
                    />
                    <select
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                      value={reward.rewardType}
                      onChange={(event) => updateReward(index, { rewardType: event.target.value as MerchantCheckInGameReward['rewardType'] })}
                    >
                      {REWARD_TYPES.map((rewardType) => (
                        <option key={rewardType} value={rewardType}>
                          {rewardTypeLabels[rewardType]}
                        </option>
                      ))}
                    </select>
                    <input
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Reward value"
                      value={reward.rewardValue}
                      onChange={(event) => updateReward(index, { rewardValue: Number(event.target.value) || 0 })}
                    />
                    <input
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                      type="number"
                      min={1}
                      placeholder="Weight"
                      value={reward.probabilityWeight}
                      onChange={(event) => updateReward(index, { probabilityWeight: Number(event.target.value) || 1 })}
                    />
                    <input
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100 md:col-span-2 xl:col-span-5"
                      placeholder="Customer-facing label"
                      value={reward.rewardLabel || ''}
                      onChange={(event) => updateReward(index, { rewardLabel: event.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary-100 text-brand-primary-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Player preview</h2>
                <p className="text-sm text-neutral-600">How the experience feels after check-in.</p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[28px] border border-neutral-200 bg-neutral-900 text-white">
              <div className="bg-gradient-to-br from-brand-primary-700 via-brand-primary-600 to-neutral-900 px-5 py-5">
                <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">
                  Bonus game
                </div>
                <div className="mt-4 text-2xl font-black tracking-tight">{form.title || 'Tap to win'}</div>
                <p className="mt-2 text-sm text-white/80">
                  {form.subtitle?.trim() || 'Reward your guests with a polished post check-in surprise.'}
                </p>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-white/55">Customer sees</div>
                      <div className="mt-2 text-base font-bold text-white">{selectedGame.previewTitle}</div>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                      {statusLabel}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {topRewards.map((reward, index) => (
                    <div key={`${reward.id ?? 'preview'}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{previewRewardLabel(reward)}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
                            {rewardTypeLabels[reward.rewardType]}
                          </div>
                        </div>
                        <div className="text-xs uppercase tracking-[0.18em] text-white/60">
                          {totalWeight > 0 ? Math.round((Math.max(1, reward.probabilityWeight) / totalWeight) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeRewards.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/60">
                      Add rewards to preview the customer experience.
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/50">Cooldown</div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {form.cooldownMinutes > 0 ? `${form.cooldownMinutes} min between plays` : 'No extra wait'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/50">Expiry</div>
                    <div className="mt-2 text-sm font-semibold text-white">{form.rewardExpiryHours} hrs after unlock</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-neutral-900">Campaign summary</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-primary-600" />
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{statusLabel}</div>
                  <div className="text-sm text-neutral-600">
                    {form.isEnabled ? 'Customers can play after a successful check-in.' : 'The game is hidden until you enable it.'}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4">
                <Ticket className="mt-0.5 h-4 w-4 text-brand-primary-600" />
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{selectedGame.title}</div>
                  <div className="text-sm text-neutral-600">{selectedGame.description}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4">
                <Coins className="mt-0.5 h-4 w-4 text-brand-primary-600" />
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{activeRewards.length} configured rewards</div>
                  <div className="text-sm text-neutral-600">
                    Cooldown: {form.cooldownMinutes} min · Expires: {form.rewardExpiryHours} hrs
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          className="rounded-xl px-6"
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Check-in Game'}
        </Button>
      </div>
    </div>
  );
}

export default MerchantCheckInGamesPage;

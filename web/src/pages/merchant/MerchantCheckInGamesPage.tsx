import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  CircleDot,
  Coins,
  Eye,
  Gift,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
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

type CheckInGamePreset = {
  id: string;
  name: string;
  description: string;
  badge: string;
  config: Pick<
    MerchantCheckInGameConfig,
    'gameType' | 'title' | 'subtitle' | 'cooldownMinutes' | 'rewardExpiryHours'
  > & {
    rewards: MerchantCheckInGameReward[];
  };
};

const createEmptyReward = (): MerchantCheckInGameReward => ({
  label: '',
  imageUrl: '',
  rewardType: 'DISCOUNT_PERCENTAGE',
  rewardValue: 5,
  rewardLabel: '',
  probabilityWeight: 1,
  isActive: true,
});

const CHECK_IN_GAME_PRESETS: CheckInGamePreset[] = [
  {
    id: 'daily-delight',
    name: 'Daily delight',
    badge: 'Balanced',
    description: 'A dependable everyday setup with a mix of small wins and one standout reward.',
    config: {
      gameType: 'SPIN_WHEEL',
      title: "Spin for today's surprise",
      subtitle: 'Every check-in could unlock a fresh perk before you leave.',
      cooldownMinutes: 0,
      rewardExpiryHours: 24,
      rewards: [
        { label: '5% Off', rewardType: 'DISCOUNT_PERCENTAGE', rewardValue: 5, rewardLabel: '5% OFF', probabilityWeight: 5, isActive: true },
        { label: '10 Coins', rewardType: 'COINS', rewardValue: 10, rewardLabel: '10 Bonus Coins', probabilityWeight: 4, isActive: true },
        { label: '10% Off', rewardType: 'DISCOUNT_PERCENTAGE', rewardValue: 10, rewardLabel: '10% OFF', probabilityWeight: 2, isActive: true },
        { label: 'Free Drink', rewardType: 'FREE_ITEM', rewardValue: 1, rewardLabel: 'Free Drink', probabilityWeight: 1, isActive: true },
      ],
    },
  },
  {
    id: 'vip-burst',
    name: 'VIP burst',
    badge: 'Premium',
    description: 'A higher-impact reveal meant for premium brands and special customer moments.',
    config: {
      gameType: 'PICK_A_CARD',
      title: 'Pick your VIP reward',
      subtitle: 'Choose a card and unlock an elevated check-in bonus.',
      cooldownMinutes: 60,
      rewardExpiryHours: 48,
      rewards: [
        { label: '$5 Off', rewardType: 'DISCOUNT_FIXED', rewardValue: 5, rewardLabel: '$5 OFF', probabilityWeight: 4, isActive: true },
        { label: '15% Off', rewardType: 'DISCOUNT_PERCENTAGE', rewardValue: 15, rewardLabel: '15% OFF', probabilityWeight: 2, isActive: true },
        { label: '25 Coins', rewardType: 'COINS', rewardValue: 25, rewardLabel: '25 Bonus Coins', probabilityWeight: 2, isActive: true },
        { label: 'Free Dessert', rewardType: 'FREE_ITEM', rewardValue: 1, rewardLabel: 'Free Dessert', probabilityWeight: 1, isActive: true },
      ],
    },
  },
  {
    id: 'quick-scratch',
    name: 'Quick scratch',
    badge: 'Fast',
    description: 'A lightweight scratch-card flow for fast-moving queues and instant gratification.',
    config: {
      gameType: 'SCRATCH_CARD',
      title: 'Scratch to reveal your reward',
      subtitle: 'A quick post check-in surprise with fast wins.',
      cooldownMinutes: 15,
      rewardExpiryHours: 12,
      rewards: [
        { label: '5 Coins', rewardType: 'COINS', rewardValue: 5, rewardLabel: '5 Bonus Coins', probabilityWeight: 5, isActive: true },
        { label: '5% Off', rewardType: 'DISCOUNT_PERCENTAGE', rewardValue: 5, rewardLabel: '5% OFF', probabilityWeight: 4, isActive: true },
        { label: '$3 Off', rewardType: 'DISCOUNT_FIXED', rewardValue: 3, rewardLabel: '$3 OFF', probabilityWeight: 2, isActive: true },
        { label: 'Free Add-on', rewardType: 'FREE_ITEM', rewardValue: 1, rewardLabel: 'Free Add-on', probabilityWeight: 1, isActive: true },
      ],
    },
  },
];

const cloneReward = (reward: MerchantCheckInGameReward): MerchantCheckInGameReward => ({ ...reward });

const normalizeReward = (reward: MerchantCheckInGameReward) => ({
  label: reward.label.trim(),
  rewardType: reward.rewardType,
  rewardValue: Number(reward.rewardValue) || 0,
  rewardLabel: reward.rewardLabel?.trim() || '',
  probabilityWeight: Number(reward.probabilityWeight) || 0,
  isActive: reward.isActive,
  imageUrl: reward.imageUrl?.trim() || '',
});

const getMatchingPresetId = (config: MerchantCheckInGameConfig | null) => {
  if (!config) return 'custom';

  const normalizedRewards = config.rewards.map(normalizeReward);

  const matchedPreset = CHECK_IN_GAME_PRESETS.find((preset) => {
    if (
      preset.config.gameType !== config.gameType ||
      preset.config.title !== config.title ||
      (preset.config.subtitle || '') !== (config.subtitle || '') ||
      preset.config.cooldownMinutes !== config.cooldownMinutes ||
      preset.config.rewardExpiryHours !== config.rewardExpiryHours ||
      preset.config.rewards.length !== normalizedRewards.length
    ) {
      return false;
    }

    return preset.config.rewards.every((reward, index) => {
      const currentReward = normalizedRewards[index];
      const presetReward = normalizeReward(reward);

      return JSON.stringify(currentReward) === JSON.stringify(presetReward);
    });
  });

  return matchedPreset?.id || 'custom';
};

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
  const [builderMode, setBuilderMode] = useState<'preset' | 'manual'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');
  const [uploadRewardIndex, setUploadRewardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
      const matchedPresetId = getMatchingPresetId(data);
      setSelectedPresetId(matchedPresetId);
      setBuilderMode(matchedPresetId === 'custom' ? 'manual' : 'preset');
    }
  }, [data]);

  const applyPreset = (presetId: string) => {
    const preset = CHECK_IN_GAME_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);
    setBuilderMode('preset');
    setForm((current) =>
      current
        ? {
            ...current,
            gameType: preset.config.gameType,
            title: preset.config.title,
            subtitle: preset.config.subtitle,
            cooldownMinutes: preset.config.cooldownMinutes,
            rewardExpiryHours: preset.config.rewardExpiryHours,
            rewards: preset.config.rewards.map(cloneReward),
          }
        : current,
    );
  };

  const updateReward = (index: number, patch: Partial<MerchantCheckInGameReward>) => {
    setForm((current) => {
      if (!current) return current;
      const rewards = [...current.rewards];
      rewards[index] = { ...rewards[index], ...patch };
      setSelectedPresetId('custom');
      setBuilderMode('manual');
      return { ...current, rewards };
    });
  };

  const addReward = () => {
    setSelectedPresetId('custom');
    setBuilderMode('manual');
    setForm((current) => (current ? { ...current, rewards: [...current.rewards, createEmptyReward()] } : current));
  };

  const removeReward = (index: number) => {
    setSelectedPresetId('custom');
    setBuilderMode('manual');
    setForm((current) => {
      if (!current) return current;
      return { ...current, rewards: current.rewards.filter((_, rewardIndex) => rewardIndex !== index) };
    });
  };

  const handleRewardImageUpload = (urls: string[]) => {
    const imageUrl = urls[0];
    if (uploadRewardIndex === null || !imageUrl) return;

    updateReward(uploadRewardIndex, { imageUrl });
    setUploadRewardIndex(null);
  };

  const clearRewardImage = (index: number) => {
    updateReward(index, { imageUrl: '' });
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

            <div className="mb-5 grid grid-cols-1 gap-2 rounded-2xl bg-neutral-100 p-1 sm:grid-cols-2">
              <button
                type="button"
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                  builderMode === 'preset' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900',
                )}
                onClick={() => setBuilderMode('preset')}
              >
                Choose preset
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                  builderMode === 'manual' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900',
                )}
                onClick={() => {
                  setBuilderMode('manual');
                  setSelectedPresetId('custom');
                }}
              >
                Manual creation
              </button>
            </div>

            {builderMode === 'preset' && (
              <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {CHECK_IN_GAME_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className={cn(
                        'rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-brand-primary-100',
                        isSelected
                          ? 'border-brand-primary-300 bg-brand-primary-50/70 shadow-sm'
                          : 'border-neutral-200 bg-neutral-50/70 hover:border-neutral-300 hover:bg-white',
                      )}
                      onClick={() => applyPreset(preset.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-base font-bold text-neutral-900">{preset.name}</div>
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                            {gameTypeCopy[preset.config.gameType].title}
                          </div>
                        </div>
                        <div className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-600">
                          {preset.badge}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{preset.description}</p>
                      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        {gameTypeCopy[preset.config.gameType].title} • {preset.config.rewards.length} rewards
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

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
                  onChange={(event) => {
                    setSelectedPresetId('custom');
                    setBuilderMode('manual');
                    setForm({ ...form, gameType: event.target.value as MerchantCheckInGameConfig['gameType'] });
                  }}
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
                  onChange={(event) => {
                    setSelectedPresetId('custom');
                    setBuilderMode('manual');
                    setForm({ ...form, title: event.target.value });
                  }}
                />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Subheadline</span>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  value={form.subtitle || ''}
                  onChange={(event) => {
                    setSelectedPresetId('custom');
                    setBuilderMode('manual');
                    setForm({ ...form, subtitle: event.target.value });
                  }}
                />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Cooldown minutes</span>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  type="number"
                  min={0}
                  value={form.cooldownMinutes}
                  onChange={(event) => {
                    setSelectedPresetId('custom');
                    setBuilderMode('manual');
                    setForm({ ...form, cooldownMinutes: Number(event.target.value) || 0 });
                  }}
                />
              </label>

              <label className="space-y-2 text-sm text-neutral-700">
                <span className="font-semibold">Reward expires in hours</span>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
                  type="number"
                  min={1}
                  value={form.rewardExpiryHours}
                  onChange={(event) => {
                    setSelectedPresetId('custom');
                    setBuilderMode('manual');
                    setForm({ ...form, rewardExpiryHours: Number(event.target.value) || 24 });
                  }}
                />
              </label>
            </div>

            {builderMode === 'manual' && (
              <div className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                Manual mode keeps everything editable. You can build from scratch here or tweak a preset and it will automatically become custom.
              </div>
            )}
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
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                        {reward.imageUrl ? (
                          <img src={reward.imageUrl} alt={reward.label || `Reward ${index + 1}`} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-neutral-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-neutral-900">
                        Reward {index + 1}
                        {reward.label.trim() ? ` · ${reward.label}` : ''}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-500">
                          {rewardTypeLabels[reward.rewardType]}
                        </div>
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
                    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-3 md:col-span-2 xl:col-span-1">
                      {reward.imageUrl ? (
                        <div className="space-y-3">
                          <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
                            <img src={reward.imageUrl} alt={reward.label || `Reward ${index + 1}`} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="flex-1 rounded-xl"
                              onClick={() => setUploadRewardIndex(index)}
                            >
                              Replace
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-red-600 hover:text-red-700"
                              onClick={() => clearRewardImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-6 text-center text-sm text-neutral-500 transition hover:border-brand-primary-300 hover:bg-brand-primary-50/40 hover:text-brand-primary-700"
                          onClick={() => setUploadRewardIndex(index)}
                        >
                          <ImageIcon className="h-5 w-5" />
                          <span className="font-medium">Upload reward image</span>
                          <span className="text-xs text-neutral-400">Optional artwork for this reward</span>
                        </button>
                      )}
                    </div>
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
                        <div className="flex min-w-0 items-center gap-3">
                          {reward.imageUrl ? (
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                              <img src={reward.imageUrl} alt={previewRewardLabel(reward)} className="h-full w-full object-cover" />
                            </div>
                          ) : null}
                          <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">{previewRewardLabel(reward)}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
                            {rewardTypeLabels[reward.rewardType]}
                          </div>
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

      <div className="flex justify-stretch sm:justify-end">
        <Button
          variant="primary"
          size="md"
          className="w-full rounded-xl px-6 sm:w-auto"
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Check-in Game'}
        </Button>
      </div>

      <ImageUploadModal
        open={uploadRewardIndex !== null}
        onOpenChange={(open) => {
          if (!open) setUploadRewardIndex(null);
        }}
        onUploadComplete={handleRewardImageUpload}
        context="checkin_game_reward"
        maxFiles={1}
        title="Upload reward image"
      />
    </div>
  );
}

export default MerchantCheckInGamesPage;

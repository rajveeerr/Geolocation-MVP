import { useEffect, useState } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import {
  useMerchantCheckInGameAnalytics,
  useMerchantCheckInGameConfig,
  useSaveMerchantCheckInGameConfig,
  type MerchantCheckInGameConfig,
  type MerchantCheckInGameReward,
} from '@/hooks/useCheckInGames';
import { useToast } from '@/hooks/use-toast';

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
    return <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-sm text-neutral-500">Loading merchant game settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary-100">
            <Sparkles className="h-6 w-6 text-brand-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Post Check-in Games</h1>
            <p className="mt-1 text-sm text-neutral-600">Choose what customers play right after a successful check-in and control the reward pool yourself.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Sessions created</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900">{analytics?.sessions ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Games played</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900">{analytics?.playedSessions ?? 0}</div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-neutral-500">Play-through rate</div>
          <div className="mt-2 text-3xl font-bold text-neutral-900">{analytics?.conversionRate ?? 0}%</div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-neutral-700">
            <span className="font-semibold">Enable post check-in game</span>
            <select
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
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
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
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
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </label>

          <label className="space-y-2 text-sm text-neutral-700">
            <span className="font-semibold">Subheadline</span>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={form.subtitle || ''}
              onChange={(event) => setForm({ ...form, subtitle: event.target.value })}
            />
          </label>

          <label className="space-y-2 text-sm text-neutral-700">
            <span className="font-semibold">Cooldown minutes</span>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              type="number"
              min={0}
              value={form.cooldownMinutes}
              onChange={(event) => setForm({ ...form, cooldownMinutes: Number(event.target.value) || 0 })}
            />
          </label>

          <label className="space-y-2 text-sm text-neutral-700">
            <span className="font-semibold">Reward expires in hours</span>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              type="number"
              min={1}
              value={form.rewardExpiryHours}
              onChange={(event) => setForm({ ...form, rewardExpiryHours: Number(event.target.value) || 24 })}
            />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Reward pool</h2>
            <p className="text-sm text-neutral-600">Each reward can have its own type, value, and probability weight.</p>
          </div>
          <Button variant="secondary" size="sm" className="rounded-xl" onClick={addReward}>
            <Plus className="mr-1 h-4 w-4" />
            Add reward
          </Button>
        </div>

        <div className="space-y-4">
          {form.rewards.map((reward, index) => (
            <div key={`${reward.id ?? 'new'}-${index}`} className="rounded-2xl border border-neutral-200 p-4">
              <div className="grid gap-3 md:grid-cols-5">
                <input
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Reward title"
                  value={reward.label}
                  onChange={(event) => updateReward(index, { label: event.target.value })}
                />
                <select
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  value={reward.rewardType}
                  onChange={(event) => updateReward(index, { rewardType: event.target.value as MerchantCheckInGameReward['rewardType'] })}
                >
                  {REWARD_TYPES.map((rewardType) => (
                    <option key={rewardType} value={rewardType}>
                      {rewardType.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Reward value"
                  value={reward.rewardValue}
                  onChange={(event) => updateReward(index, { rewardValue: Number(event.target.value) || 0 })}
                />
                <input
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  type="number"
                  min={1}
                  placeholder="Weight"
                  value={reward.probabilityWeight}
                  onChange={(event) => updateReward(index, { probabilityWeight: Number(event.target.value) || 1 })}
                />
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                    placeholder="Shown to customer"
                    value={reward.rewardLabel || ''}
                    onChange={(event) => updateReward(index, { rewardLabel: event.target.value })}
                  />
                  <button
                    type="button"
                    className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                    onClick={() => removeReward(index)}
                    disabled={form.rewards.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          className="rounded-xl"
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

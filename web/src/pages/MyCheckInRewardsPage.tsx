import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coins,
  Gift,
  Loader2,
  Percent,
  Sparkles,
  Ticket,
  X,
} from 'lucide-react';
import { useMyCheckInGameRewards, type CheckInGameIssuedReward } from '@/hooks/useCheckInGames';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

type StatusFilter = 'AVAILABLE' | 'REDEEMED' | 'EXPIRED' | 'ALL';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const STATUS_TONE: Record<NonNullable<CheckInGameIssuedReward['status']>, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REDEEMED: 'bg-neutral-100 text-neutral-600 ring-neutral-300',
  EXPIRED: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const STATUS_LABEL: Record<NonNullable<CheckInGameIssuedReward['status']>, string> = {
  AVAILABLE: 'Ready to use',
  REDEEMED: 'Redeemed',
  EXPIRED: 'Expired',
};

const TYPE_ICON: Record<CheckInGameIssuedReward['rewardType'], typeof Gift> = {
  DISCOUNT_PERCENTAGE: Percent,
  DISCOUNT_FIXED: Gift,
  FREE_ITEM: Sparkles,
  BONUS_POINTS: Coins,
  COINS: Coins,
};

const friendlyLabel = (reward: CheckInGameIssuedReward) => {
  if (reward.rewardLabel) return reward.rewardLabel;
  const v = Math.round(reward.rewardValue);
  switch (reward.rewardType) {
    case 'DISCOUNT_PERCENTAGE': return `${v}% off`;
    case 'DISCOUNT_FIXED': return `$${v} off`;
    case 'FREE_ITEM': return 'Free item';
    case 'BONUS_POINTS': return `${v} bonus points`;
    case 'COINS': return `${v} coins`;
    default: return 'Reward';
  }
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

function RewardCard({
  reward,
  onOpen,
}: {
  reward: CheckInGameIssuedReward;
  onOpen: (reward: CheckInGameIssuedReward) => void;
}) {
  const Icon = TYPE_ICON[reward.rewardType] ?? Gift;
  const status = reward.status ?? 'AVAILABLE';
  const isPoints = reward.rewardType === 'BONUS_POINTS' || reward.rewardType === 'COINS';

  return (
    <button
      type="button"
      onClick={() => onOpen(reward)}
      className={cn(
        panelClass,
        'flex w-full items-start gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]',
        status !== 'AVAILABLE' && 'opacity-75',
      )}
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {reward.imageUrl ? (
          <img src={reward.imageUrl} alt={friendlyLabel(reward)} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
              STATUS_TONE[status],
            )}
          >
            {STATUS_LABEL[status]}
          </span>
          {reward.merchant?.businessName && (
            <span className="text-[11px] font-medium text-neutral-500">
              {reward.merchant.businessName}
            </span>
          )}
        </div>
        <div className="mt-1 truncate text-sm font-bold text-neutral-900">{friendlyLabel(reward)}</div>
        <div className="mt-0.5 text-[11px] text-neutral-500">
          {reward.deal?.title ? `From ${reward.deal.title} · ` : ''}
          {reward.expiresAt && status === 'AVAILABLE'
            ? `Expires ${formatDateTime(reward.expiresAt)}`
            : `Earned ${formatDateTime(reward.createdAt)}`}
        </div>
        {!isPoints && status === 'AVAILABLE' && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold text-white">
            <Ticket className="h-3 w-3" /> Tap to show staff
          </div>
        )}
      </div>
    </button>
  );
}

function ClaimSheet({
  reward,
  onClose,
}: {
  reward: CheckInGameIssuedReward;
  onClose: () => void;
}) {
  const Icon = TYPE_ICON[reward.rewardType] ?? Gift;
  const isPoints = reward.rewardType === 'BONUS_POINTS' || reward.rewardType === 'COINS';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
            {reward.imageUrl ? (
              <img src={reward.imageUrl} alt={friendlyLabel(reward)} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <Icon className="h-8 w-8 text-white" />
            )}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
            Check-in reward
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{friendlyLabel(reward)}</h2>
          {reward.merchant?.businessName && (
            <p className="mt-1 text-sm text-emerald-50/90">{reward.merchant.businessName}</p>
          )}
        </div>

        <div className="space-y-4 px-6 py-6">
          {isPoints ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              These points were already credited to your loyalty balance. No code needed — they'll apply at your next redemption.
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/30 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
                  Show this code to staff
                </div>
                <div className="mt-2 select-all rounded-xl bg-neutral-950 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.18em] text-white">
                  {reward.claimCode}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Status</div>
                  <div className="mt-0.5 font-semibold text-white">{STATUS_LABEL[reward.status ?? 'AVAILABLE']}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Expires</div>
                  <div className="mt-0.5 font-semibold text-white">
                    {reward.expiresAt ? formatDateTime(reward.expiresAt) : 'No expiry'}
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-neutral-300">
                Staff verifies your claim code at the counter. Once they ring it in, the reward updates to Redeemed.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function MyCheckInRewardsPage() {
  const { data: rewards = [], isLoading, error } = useMyCheckInGameRewards();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('AVAILABLE');
  const [openReward, setOpenReward] = useState<CheckInGameIssuedReward | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return rewards;
    return rewards.filter((r) => (r.status ?? 'AVAILABLE') === statusFilter);
  }, [rewards, statusFilter]);

  const counts = useMemo(() => {
    const initial: Record<StatusFilter, number> = { ALL: rewards.length, AVAILABLE: 0, REDEEMED: 0, EXPIRED: 0 };
    rewards.forEach((r) => {
      const k = (r.status ?? 'AVAILABLE') as Exclude<StatusFilter, 'ALL'>;
      initial[k] += 1;
    });
    return initial;
  }, [rewards]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-screen-md px-4 py-6">
        <div className={cn(panelClass, 'border-rose-200 bg-rose-50 p-4 text-sm text-rose-700')}>
          {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-md space-y-5 px-4 py-4">
      <div
        className={cn(
          panelClass,
          'flex flex-wrap items-center justify-between gap-3 border-emerald-200/70 bg-gradient-to-r from-emerald-50 via-white to-white p-5',
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">My check-in rewards</h1>
            <p className="text-sm text-neutral-600">
              Tap any reward to show the claim code to staff. Points and bonuses are credited automatically.
            </p>
          </div>
        </div>
        <Link to={PATHS.ALL_DEALS}>
          <Button size="md" variant="secondary" className="rounded-full border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50">
            Browse deals
          </Button>
        </Link>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(['AVAILABLE', 'REDEEMED', 'EXPIRED', 'ALL'] as StatusFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={cn(
              'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition',
              statusFilter === key
                ? 'bg-emerald-600 text-white ring-emerald-600'
                : 'bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-50',
            )}
          >
            {key === 'ALL'
              ? `All · ${counts.ALL}`
              : key === 'AVAILABLE'
                ? `Ready · ${counts.AVAILABLE}`
                : key === 'REDEEMED'
                  ? `Redeemed · ${counts.REDEEMED}`
                  : `Expired · ${counts.EXPIRED}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed p-8 text-center')}>
          <Gift className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-base font-semibold text-neutral-900">
            {statusFilter === 'AVAILABLE' ? 'No rewards waiting' : 'Nothing here yet'}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {statusFilter === 'AVAILABLE'
              ? 'Check in to participating deals to earn rewards.'
              : 'Your past rewards will appear here once you start checking in.'}
          </p>
          <div className="mt-4 flex justify-center">
            <Link to={PATHS.ALL_DEALS}>
              <Button className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">Browse deals</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reward) => (
            <RewardCard key={reward.id} reward={reward} onOpen={setOpenReward} />
          ))}
        </div>
      )}

      {openReward && <ClaimSheet reward={openReward} onClose={() => setOpenReward(null)} />}
    </div>
  );
}

export default MyCheckInRewardsPage;

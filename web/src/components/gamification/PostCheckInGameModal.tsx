import { useMemo, useState } from 'react';
import { CheckCircle, ChevronDown, Coins, Gift, Percent, Sparkles, Ticket, Trophy, X } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { useCheckInGameSession, usePlayCheckInGameSession } from '@/hooks/useCheckInGames';
import { cn } from '@/lib/utils';

type EligibleReward = {
  id: number;
  title: string;
  description?: string | null;
  rewardType: string;
  rewardAmount: number;
  checkInCondition: 'ANY_CHECKIN' | 'FIRST_VISIT' | 'BIRTHDAY';
  expiresAt: string;
};

type LotteryEntry = {
  gameId: string;
  entered: boolean;
  newEntry: boolean;
  totalEntries: number;
  drawAt: string;
};

type CheckInGameSessionSummary = {
  sessionToken: string;
  gameType: 'SCRATCH_CARD' | 'SPIN_WHEEL' | 'PICK_A_CARD';
  title: string;
  subtitle?: string | null;
  expiresAt: string;
};

interface PostCheckInGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DetailedDeal;
  pointsEarned: number;
  eligibleRewards?: EligibleReward[];
  lotteryEntry?: LotteryEntry | null;
  gameSession?: CheckInGameSessionSummary | null;
  onCheckOut?: () => void;
}

const rewardValueLabel = (type: string, value: number, label?: string | null) => {
  if (label) return label;
  if (type === 'DISCOUNT_PERCENTAGE') return `${value}% OFF`;
  if (type === 'DISCOUNT_FIXED') return `$${value.toFixed(0)} OFF`;
  if (type === 'COINS') return `${value} Coins`;
  if (type === 'BONUS_POINTS') return `${value} Points`;
  return 'Reward Unlocked';
};

const ScratchOrPickGame = ({
  gameType,
  board,
  onPlay,
  isPlaying,
  resultSlot,
  rewardLabel,
}: {
  gameType: 'SCRATCH_CARD' | 'PICK_A_CARD';
  board: Array<{ imageUrl?: string | null }>;
  onPlay: () => void;
  isPlaying: boolean;
  resultSlot: number | null;
  rewardLabel: string | null;
}) => (
  <div className="space-y-4">
    <div className={cn('grid gap-3', board.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3')}>
      {board.map((slot, index) => {
        const isWinner = resultSlot === index;
        const isRevealed = resultSlot !== null;

        return (
          <button
            key={index}
            onClick={onPlay}
            disabled={isPlaying || isRevealed}
            className={cn(
              'rounded-2xl border px-4 py-8 text-center transition-all',
              isWinner
                ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-50 shadow-lg shadow-emerald-950/20'
                : 'border-white/10 bg-neutral-900/80 text-white hover:border-brand-primary-400/60 hover:bg-neutral-900',
              isPlaying && 'animate-pulse',
            )}
          >
            {slot.imageUrl && !isRevealed && (
              <div className="mx-auto mb-3 h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img src={slot.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            {!isRevealed && (
              <>
                <Sparkles className="mx-auto mb-3 h-6 w-6 text-yellow-400" />
                <div className="text-sm font-semibold">
                  {gameType === 'SCRATCH_CARD' ? 'Scratch Me' : 'Pick Me'}
                </div>
              </>
            )}
            {isRevealed && isWinner && (
              <>
                <Gift className="mx-auto mb-3 h-6 w-6 text-emerald-200" />
                <div className="text-sm font-semibold">{rewardLabel}</div>
              </>
            )}
            {isRevealed && !isWinner && (
              <div className="text-sm font-medium text-neutral-400">Try again next check-in</div>
            )}
          </button>
        );
      })}
    </div>
    <p className="text-center text-xs text-neutral-400">
      {gameType === 'SCRATCH_CARD' ? 'Tap a card to scratch and reveal your prize.' : 'Choose one card to reveal your prize.'}
    </p>
  </div>
);

const SpinWheelGame = ({
  onPlay,
  isPlaying,
  resultSlot,
  labels,
}: {
  onPlay: () => void;
  isPlaying: boolean;
  resultSlot: number | null;
  labels: string[];
}) => {
  const [spinCount, setSpinCount] = useState(0);
  const slotCount = Math.max(labels.length, 1);
  const segmentAngle = 360 / slotCount;
  const rotation = resultSlot != null ? 2520 + resultSlot * segmentAngle + spinCount * 540 : spinCount * 540;

  const handleSpin = () => {
    setSpinCount((count) => count + 1);
    onPlay();
  };

  return (
    <div className="space-y-5">
      <div className="mx-auto flex items-center justify-center py-2">
        <div className="relative h-72 w-72">
          <div className="absolute left-1/2 top-1 z-20 -translate-x-1/2 rounded-full bg-yellow-400/10 p-1.5 shadow-[0_0_20px_rgba(250,204,21,0.18)]">
            <ChevronDown className="h-5 w-5 text-yellow-400" />
          </div>
          <div
            className="relative h-full w-full overflow-hidden rounded-full border-8 border-neutral-950 bg-neutral-100 shadow-xl transition-transform duration-[4200ms] [transition-timing-function:cubic-bezier(0.18,0.82,0.22,1)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${labels
                  .map((_, index) => {
                    const start = index * segmentAngle;
                    const end = start + segmentAngle;
                    const color = index % 2 === 0 ? '#f3f4f6' : '#fee2e2';
                    return `${color} ${start}deg ${end}deg`;
                  })
                  .join(', ')})`,
              }}
            />
            {labels.map((label, index) => {
              const angle = index * segmentAngle + segmentAngle / 2;
              return (
                <div
                  key={`${label}-${index}`}
                  className="absolute left-1/2 top-1/2 z-10 origin-center"
                  style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                >
                  <div className="flex w-[7.5rem] -translate-y-[6.6rem] justify-center">
                    <span
                      className={cn(
                        'block max-w-[4.75rem] text-center text-[11px] font-bold uppercase leading-tight tracking-wide',
                        index % 2 === 0 ? 'text-brand-primary-700' : 'text-red-600',
                      )}
                      style={{ transform: `rotate(${-angle}deg)` }}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="pointer-events-none absolute inset-[18%] rounded-full border border-black/5" />
          </div>
          <button
            onClick={handleSpin}
            disabled={isPlaying || resultSlot !== null}
            className={cn(
              'absolute left-1/2 top-1/2 z-20 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950 text-sm font-bold text-white shadow-xl transition-all disabled:opacity-60',
              !isPlaying && resultSlot === null && 'ring-8 ring-white/5 hover:scale-[1.03]',
            )}
          >
            {isPlaying ? '...' : resultSlot !== null ? 'Won' : 'Spin'}
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-neutral-400">Give the wheel one spin and unlock your check-in reward.</p>
    </div>
  );
};

export function PostCheckInGameModal({
  isOpen,
  onClose,
  deal,
  pointsEarned,
  eligibleRewards = [],
  lotteryEntry = null,
  gameSession = null,
  onCheckOut,
}: PostCheckInGameModalProps) {
  const { data: session } = useCheckInGameSession(gameSession?.sessionToken ?? null, isOpen && !!gameSession);
  const playSession = usePlayCheckInGameSession(gameSession?.sessionToken ?? null);
  const [playResult, setPlayResult] = useState<{
    resultSlot: number;
    reward: {
      rewardType: string;
      rewardValue: number;
      rewardLabel?: string | null;
      imageUrl?: string | null;
      claimCode: string;
      expiresAt?: string | null;
    };
  } | null>(null);

  const boardLabels = useMemo(
    () => (session?.board ?? []).map((slot) => rewardValueLabel(slot.rewardType, 0, slot.label)),
    [session?.board],
  );

  const handlePlay = async () => {
    if (!gameSession || playSession.isPending || playResult) return;

    try {
      const result = await playSession.mutateAsync();
      setPlayResult({
        resultSlot: result.resultSlot,
        reward: result.reward,
      });
    } catch {
      // Existing toast patterns handle surfacing failures.
    }
  };

  if (!isOpen) return null;

  const resultSlot = playResult?.resultSlot ?? session?.resultSlot ?? null;
  const reward = playResult?.reward ?? session?.reward ?? null;
  const rewardLabel = reward ? rewardValueLabel(reward.rewardType, reward.rewardValue, reward.rewardLabel) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-neutral-900 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-gradient-to-br from-brand-primary-700 via-brand-primary-600 to-neutral-900 px-6 py-8 text-white">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              Check-in complete
            </div>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-950/40">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">You&apos;re checked in at {deal.merchant.businessName}</h2>
            <p className="mt-2 text-xl font-semibold text-emerald-300">+{pointsEarned} coins earned</p>
            <p className="mt-3 text-sm text-white/80">
              {gameSession ? 'Your merchant has a bonus game ready below.' : 'Your rewards are ready below.'}
            </p>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          {gameSession && session && !reward && (
            <section className="rounded-3xl border border-white/10 bg-neutral-800 p-5">
              <div className="mb-4 text-center">
                <div className="mb-3 inline-flex rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                  Bonus game
                </div>
                <h3 className="text-xl font-bold text-white">{session.title}</h3>
                {session.subtitle && <p className="mt-1 text-sm text-neutral-300">{session.subtitle}</p>}
              </div>

              {session.gameType === 'SCRATCH_CARD' && (
                <ScratchOrPickGame
                  gameType="SCRATCH_CARD"
                  board={session.board.length > 0 ? session.board : Array.from({ length: 6 }, () => ({ imageUrl: null }))}
                  onPlay={handlePlay}
                  isPlaying={playSession.isPending}
                  resultSlot={resultSlot}
                  rewardLabel={rewardLabel}
                />
              )}

              {session.gameType === 'PICK_A_CARD' && (
                <ScratchOrPickGame
                  gameType="PICK_A_CARD"
                  board={session.board.length > 0 ? session.board : Array.from({ length: 3 }, () => ({ imageUrl: null }))}
                  onPlay={handlePlay}
                  isPlaying={playSession.isPending}
                  resultSlot={resultSlot}
                  rewardLabel={rewardLabel}
                />
              )}

              {session.gameType === 'SPIN_WHEEL' && (
                <SpinWheelGame
                  onPlay={handlePlay}
                  isPlaying={playSession.isPending}
                  resultSlot={resultSlot}
                  labels={boardLabels.length > 0 ? boardLabels : ['Reward', 'Reward', 'Reward', 'Reward', 'Reward', 'Reward']}
                />
              )}
            </section>
          )}

          {reward && (
            <section className="rounded-3xl border border-emerald-500/30 bg-emerald-900/30 p-5">
              <div className="flex items-center gap-3">
                {reward.imageUrl ? (
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/40">
                    <img src={reward.imageUrl} alt={rewardLabel || 'Reward'} className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                  {reward.rewardType.includes('DISCOUNT') ? <Percent className="h-6 w-6" /> : reward.rewardType === 'COINS' ? <Coins className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-100">Bonus reward unlocked</h3>
                  <p className="text-sm text-emerald-200">{rewardLabel}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/40 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-200/70">Claim code</div>
                  <div className="mt-1 text-lg font-bold text-white">{reward.claimCode}</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/40 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-200/70">Expires</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {reward.expiresAt ? new Date(reward.expiresAt).toLocaleString() : 'No expiry'}
                  </div>
                </div>
              </div>
            </section>
          )}

          {eligibleRewards.length > 0 && (
            <section className="rounded-3xl border border-white/10 bg-neutral-800 p-5">
              <h3 className="text-lg font-bold text-white">Check-in rewards unlocked</h3>
              <div className="mt-4 space-y-3">
                {eligibleRewards.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{item.title}</div>
                        {item.description && <div className="text-sm text-neutral-300">{item.description}</div>}
                      </div>
                      <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-neutral-200">
                        {item.rewardType.replaceAll('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {lotteryEntry?.entered && (
            <section className="rounded-3xl border border-blue-500/30 bg-blue-900/30 p-5">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-300" />
                <h3 className="text-lg font-bold text-blue-100">You&apos;re entered in the global lottery</h3>
              </div>
              <p className="mt-2 text-sm text-blue-100/90">
                Total entries so far: {lotteryEntry.totalEntries}. Draw time: {new Date(lotteryEntry.drawAt).toLocaleString()}.
              </p>
            </section>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {onCheckOut && (
              <button
                onClick={onCheckOut}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCheckInGameModal;

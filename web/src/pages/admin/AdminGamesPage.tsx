import { useMemo, useState } from 'react';
import { Gift, PlayCircle, Ban, Sparkles, Clock3 } from 'lucide-react';
import {
  useAdminCheckInLotteryGames,
  useAdminCurrentCheckInLotteryGame,
  useCreateCheckInLotteryGame,
  useResolveCheckInLotteryGame,
  useCancelCheckInLotteryGame,
  type CheckInLotteryRewardType,
} from '@/hooks/useCheckInLottery';
import { useToast } from '@/hooks/use-toast';

const rewardTypes: CheckInLotteryRewardType[] = ['CASH', 'FREE_REWARD', 'COINS'];

export function AdminGamesPage() {
  const { toast } = useToast();
  const { data: currentGame } = useAdminCurrentCheckInLotteryGame();
  const { data: games = [], isLoading } = useAdminCheckInLotteryGames(50);
  const createGame = useCreateCheckInLotteryGame();
  const resolveGame = useResolveCheckInLotteryGame();
  const cancelGame = useCancelCheckInLotteryGame();

  const [title, setTitle] = useState('Daily Check-in Giveaway');
  const [rewardType, setRewardType] = useState<CheckInLotteryRewardType>('COINS');
  const [rewardValue, setRewardValue] = useState(100);
  const [rewardLabel, setRewardLabel] = useState('');
  const [startAt, setStartAt] = useState('');
  const [cutoffAt, setCutoffAt] = useState('');
  const [drawAt, setDrawAt] = useState('');

  const hasActiveGame = useMemo(
    () => !!currentGame && (currentGame.status === 'ACTIVE' || currentGame.status === 'SCHEDULED'),
    [currentGame]
  );

  const onCreate = async () => {
    if (!title || !startAt || !cutoffAt || !drawAt) {
      toast({ title: 'Missing fields', description: 'Title and all date fields are required', variant: 'destructive' });
      return;
    }
    try {
      await createGame.mutateAsync({
        title,
        rewardType,
        rewardValue,
        rewardLabel: rewardLabel || undefined,
        startAt: new Date(startAt).toISOString(),
        cutoffAt: new Date(cutoffAt).toISOString(),
        drawAt: new Date(drawAt).toISOString(),
      });
      toast({ title: 'Game created', description: 'Check-in lottery game is now configured' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not create game';
      toast({ title: 'Create failed', description: message, variant: 'destructive' });
    }
  };

  const onResolve = async (gameId: string) => {
    try {
      await resolveGame.mutateAsync(gameId);
      toast({ title: 'Game resolved', description: 'Winner selection complete' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not resolve game';
      toast({ title: 'Resolve failed', description: message, variant: 'destructive' });
    }
  };

  const onCancel = async (gameId: string) => {
    try {
      await cancelGame.mutateAsync(gameId);
      toast({ title: 'Game cancelled' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not cancel game';
      toast({ title: 'Cancel failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-brand-primary-600" />
          <h1 className="text-xl font-bold text-neutral-900">Admin Games</h1>
        </div>
        <p className="text-sm text-neutral-600">Configure timed check-in giveaways and resolve winners.</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Create Check-in Lottery</h2>
        {hasActiveGame && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            A game is already active/scheduled. You can still create another, but only one current game is tracked for live eligibility.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" placeholder="Game title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <select className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" value={rewardType} onChange={(e) => setRewardType(e.target.value as CheckInLotteryRewardType)}>
            {rewardTypes.map((rt) => (
              <option key={rt} value={rt}>{rt.replace('_', ' ')}</option>
            ))}
          </select>
          <input className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="number" min={1} placeholder="Reward value" value={rewardValue} onChange={(e) => setRewardValue(Number(e.target.value) || 0)} />
          <input className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" placeholder="Reward label (optional)" value={rewardLabel} onChange={(e) => setRewardLabel(e.target.value)} />
          <label className="text-sm text-neutral-700">Start at
            <input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </label>
          <label className="text-sm text-neutral-700">Cutoff at
            <input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="datetime-local" value={cutoffAt} onChange={(e) => setCutoffAt(e.target.value)} />
          </label>
          <label className="text-sm text-neutral-700 md:col-span-2">Draw at
            <input className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" type="datetime-local" value={drawAt} onChange={(e) => setDrawAt(e.target.value)} />
          </label>
        </div>
        <button
          onClick={onCreate}
          disabled={createGame.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          <Gift className="h-4 w-4" />
          {createGame.isPending ? 'Creating...' : 'Create Game'}
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Games</h2>
        {isLoading && <p className="text-sm text-neutral-500">Loading games...</p>}
        {!isLoading && games.length === 0 && <p className="text-sm text-neutral-500">No games yet.</p>}
        {games.map((game) => (
          <div key={game.id} className="rounded-xl border border-neutral-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{game.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{game.rewardType} • {game.rewardValue} {game.rewardLabel || ''}</p>
                <div className="mt-2 text-xs text-neutral-600 space-y-1">
                  <p className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Start: {new Date(game.startAt).toLocaleString()}</p>
                  <p>Cutoff: {new Date(game.cutoffAt).toLocaleString()} • Draw: {new Date(game.drawAt).toLocaleString()}</p>
                  <p>Entries: {game.totalEntries} • Status: {game.status}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onResolve(game.id)}
                  disabled={resolveGame.isPending || game.status === 'DRAWN' || game.status === 'CANCELLED'}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  <PlayCircle className="h-3.5 w-3.5" /> Resolve
                </button>
                <button
                  onClick={() => onCancel(game.id)}
                  disabled={cancelGame.isPending || game.status === 'DRAWN' || game.status === 'CANCELLED'}
                  className="inline-flex items-center gap-1 rounded-md bg-neutral-700 text-white px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  <Ban className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminGamesPage;

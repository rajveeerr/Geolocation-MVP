import { Ticket, Clock3 } from 'lucide-react';
import { useUserCheckInLotteryStatus } from '@/hooks/useCheckInLottery';

export function CheckInLotteryCard() {
  const { data, isLoading } = useUserCheckInLotteryStatus();

  if (isLoading) {
    return <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">Loading lottery status...</div>;
  }

  if (!data?.game) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <Ticket className="h-4 w-4 text-brand-primary-600" />
          <h3 className="text-sm font-semibold text-neutral-900">Check-in Lottery</h3>
        </div>
        <p className="text-sm text-neutral-600">No active check-in lottery right now.</p>
      </div>
    );
  }

  const game = data.game;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Ticket className="h-4 w-4 text-blue-700" />
        <h3 className="text-sm font-semibold text-blue-900">{game.title}</h3>
      </div>
      <p className="text-sm text-blue-800">Reward: {game.rewardType.replace('_', ' ')} • {game.rewardValue} {game.rewardLabel || ''}</p>
      <p className="mt-1 text-xs text-blue-700 inline-flex items-center gap-1">
        <Clock3 className="h-3.5 w-3.5" /> Draw: {new Date(game.drawAt).toLocaleString()}
      </p>
      <p className="mt-2 text-sm font-medium text-blue-900">
        {data.entered ? 'You are entered in this draw.' : 'Check in at any listed business before cutoff to become eligible.'}
      </p>
      <p className="text-xs text-blue-700 mt-1">Current entries: {data.totalEntries}</p>
    </div>
  );
}

export default CheckInLotteryCard;

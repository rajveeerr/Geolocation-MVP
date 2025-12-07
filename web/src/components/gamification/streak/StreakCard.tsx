import type { StreakInfo } from '@/types/streak';
import { StreakProgress } from './StreakProgress';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

export const StreakCard = ({ streak, loading }: { streak?: StreakInfo; loading?: boolean }) => {
  if (loading) {
    return <div className="h-36 w-full animate-pulse rounded-xl bg-neutral-100" />;
  }
  if (!streak) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Your Weekly Streak</h3>
          <p className="text-neutral-600">Week {streak.currentStreak} · {streak.currentDiscountPercent}% OFF</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500">Next week</p>
          <p className="text-base font-semibold text-neutral-800">{streak.nextWeekDiscountPercent ?? Math.min((streak.currentDiscountPercent || 0) + 5, 45)}% OFF</p>
        </div>
      </div>
      <div className="mt-4">
        <StreakProgress streak={streak} />
      </div>
      <div className="mt-4">
        <Link
          to={PATHS.STREAK_LEADERBOARD}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-neutral-100"
        >
          View leaderboard
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-neutral-500">Longest Streak</p>
          <p className="font-semibold text-neutral-800">{streak.longestStreak ?? 0} weeks</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-neutral-500">Total Check-ins</p>
          <p className="font-semibold text-neutral-800">{streak.totalCheckIns ?? 0}</p>
        </div>
      </div>
    </div>
  );
};



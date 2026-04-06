import type { StreakInfo } from '@/types/streak';
import { StreakProgress } from './StreakProgress';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

export const StreakCard = ({
  streak,
  loading,
}: {
  streak?: StreakInfo;
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <div className="h-36 w-full animate-pulse rounded-[1.75rem] bg-neutral-100/80" />
    );
  }
  if (!streak) return null;

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
            Weekly Momentum
          </p>
          <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-neutral-950">
            Your Weekly Streak
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            Week {streak.currentStreak} · {streak.currentDiscountPercent}% OFF
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-black/[0.03] px-5 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:min-w-44 sm:text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Next week
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-900">
            {streak.nextWeekDiscountPercent ??
              Math.min((streak.currentDiscountPercent || 0) + 5, 45)}
            % OFF
          </p>
        </div>
      </div>

      <div className="mt-6">
        <StreakProgress streak={streak} />
      </div>

      <div className="mt-6">
        <Link
          to={PATHS.STREAK_LEADERBOARD}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/85 px-4 py-2 text-xs font-medium text-neutral-800 shadow-[0_10px_25px_rgba(15,23,42,0.08)] backdrop-blur transition-colors hover:bg-white"
        >
          View leaderboard
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <p className="text-neutral-500">Longest Streak</p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-900">
            {streak.longestStreak ?? 0} weeks
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <p className="text-neutral-500">Total Check-ins</p>
          <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-900">
            {streak.totalCheckIns ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
};

import { Flame } from 'lucide-react';
import type { StreakInfo } from '@/types/streak';

export const StreakBadge = ({ streak, loading }: { streak?: StreakInfo; loading?: boolean }) => {
  if (loading) {
    return <div className="h-8 w-40 animate-pulse rounded-full bg-neutral-200" />;
  }
  if (!streak) return null;

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-3 py-1 text-amber-700 shadow-sm"
      title={`Week ${streak.currentStreak} · ${streak.currentDiscountPercent}% OFF`}
      aria-label={`Streak week ${streak.currentStreak}. ${streak.currentDiscountPercent} percent off`}
    >
      <Flame className="h-4 w-4 text-amber-500" />
      <span className="text-sm font-semibold">Week {streak.currentStreak}</span>
      <span className="text-neutral-400">·</span>
      <span className="text-xs font-extrabold text-amber-700">{streak.currentDiscountPercent}% OFF</span>
    </div>
  );
};



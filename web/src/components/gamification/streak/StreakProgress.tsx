import type { StreakInfo } from '@/types/streak';

const TOTAL_WEEKS = 7;

export const StreakProgress = ({ streak }: { streak?: StreakInfo }) => {
  if (!streak) return null;
  const current = Math.min(streak.currentStreak ?? 0, TOTAL_WEEKS);

  return (
    <div className="flex items-center gap-2" aria-label={`Streak progress ${current} of ${TOTAL_WEEKS} weeks`}>
      {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= current;
        return (
          <div
            key={idx}
            className={
              'h-7 w-7 rounded-full border flex items-center justify-center text-[11px] font-bold ' +
              (filled
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                : 'bg-neutral-100 border-neutral-200 text-neutral-400')
            }
            title={`Week ${idx}${filled ? ' achieved' : ''}`}
          >
            {idx}
          </div>
        );
      })}
    </div>
  );
};



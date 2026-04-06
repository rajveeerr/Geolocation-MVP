import type { StreakInfo } from '@/types/streak';

const TOTAL_WEEKS = 7;

export const StreakProgress = ({ streak }: { streak?: StreakInfo }) => {
  if (!streak) return null;
  const current = Math.min(streak.currentStreak ?? 0, TOTAL_WEEKS);

  return (
    <div
      className="flex flex-wrap items-center gap-3"
      aria-label={`Streak progress ${current} of ${TOTAL_WEEKS} weeks`}
    >
      {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= current;
        return (
          <div
            key={idx}
            className={
              'flex h-11 w-11 items-center justify-center rounded-full border text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-all duration-300 ' +
              (filled
                ? 'border-neutral-900 bg-neutral-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)]'
                : 'border-black/10 bg-white/70 text-neutral-400 backdrop-blur')
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

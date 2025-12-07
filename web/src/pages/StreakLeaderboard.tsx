import { StreakLeaderboardTable } from '@/components/gamification/streak/StreakLeaderboardTable';

export const StreakLeaderboardPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pt-24">
      <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Streak Leaderboard</h1>
            <p className="text-neutral-600">See who’s maintaining the longest weekly streaks.</p>
          </div>
        </div>
        <StreakLeaderboardTable />
      </div>
    </div>
  );
};



import { useQuery } from '@tanstack/react-query';
import { fetchStreakLeaderboard } from '@/lib/api/streak';

export const StreakLeaderboardTable = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['streak-leaderboard'],
    queryFn: async () => {
      const res = await fetchStreakLeaderboard(20);
      return (res.data as any)?.leaderboard as any[];
    },
  });

  if (isLoading) return <div className="h-40 animate-pulse rounded-xl bg-neutral-100" />;

  const rows = data || [];

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <table className="min-w-full">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">#</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">User</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Current Streak</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Discount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.userId} className="border-t">
              <td className="px-4 py-3 text-sm text-neutral-700">{i + 1}</td>
              <td className="px-4 py-3 text-sm text-neutral-900 flex items-center gap-2">
                {r.user?.avatarUrl ? (
                  <img src={r.user.avatarUrl} alt={r.user?.name || 'User'} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-neutral-200" />
                )}
                <span>{r.user?.name || 'User #' + r.userId}</span>
              </td>
              <td className="px-4 py-3 text-sm">{r.currentStreak} weeks</td>
              <td className="px-4 py-3 text-sm font-semibold">{r.currentDiscountPercent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};



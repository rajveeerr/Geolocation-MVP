import { Crown, Medal, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/context/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const LeaderboardPage = () => {
  const { user: currentUser } = useAuth();
  const { data: leaderboardData, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }
  if (error) {
    return <div className="text-center py-20 text-red-600">Failed to load leaderboard.</div>;
  }
  
  // Combine the top list and the current user's rank (if they aren't in the top list)
  let displayUsers = [...(leaderboardData?.top || [])];
  if (leaderboardData?.me && !leaderboardData.me.inTop) {
    displayUsers.push(leaderboardData.me);
  }

  return (
    <div className="bg-neutral-50 min-h-screen pt-24">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900">This Month's Leaderboard</h1>
          <p className="text-neutral-600 mt-2">Check in to deals to climb the ranks and earn rewards!</p>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto">The leaderboard showcases users who checked in the most this month. Earn points by visiting merchants and checking in at their deals — your points update on your profile and you'll move up the leaderboard. Top performers may receive special rewards from participating merchants.</p>
        </div>

        <div className="space-y-3">
          {displayUsers.length > 0 ? (
            displayUsers.map((user) => (
              <LeaderboardRow
                key={user.userId}
                user={{
                  rank: user.rank,
                  name: currentUser?.id === user.userId ? "You" : user.name,
                  points: user.periodPoints,
                  isCurrentUser: currentUser?.id === user.userId
                }}
              />
            ))
          ) : (
            <p className="text-center text-neutral-500">The leaderboard is empty. Be the first to check in and get on the board!</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Reusable Row Component ---
const LeaderboardRow = ({ user }: { user: any }) => {
  const isTopThree = user.rank <= 3;
  const rankIcon =
    user.rank === 1 ? <Crown className="h-6 w-6 text-amber-500 fill-current" /> :
    user.rank === 2 ? <Medal className="h-6 w-6 text-slate-400 fill-current" /> :
    user.rank === 3 ? <Award className="h-6 w-6 text-amber-700 fill-current" /> :
    <span className="font-bold text-neutral-500">{user.rank}</span>;

  return (
    <div className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all",
        user.isCurrentUser ? "bg-brand-primary-50 border-brand-primary-200 ring-2 ring-brand-primary-500" : "bg-white border-neutral-200",
        isTopThree && "shadow-lg"
    )}>
      <div className="flex-shrink-0 w-8 text-center">{rankIcon}</div>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p className="font-bold text-neutral-800">{user.name}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-brand-primary-600">{user.points.toLocaleString()}</p>
        <p className="text-xs text-neutral-500">Points</p>
      </div>
    </div>
  );
};

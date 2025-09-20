import { Crown, Medal, Award } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/context/useAuth';
import { LeaderboardSkeleton } from '@/components/common/LeaderboardSkeleton';

export const LeaderboardPage = () => {
  const { user: currentUser } = useAuth();
  const { data: leaderboardData, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-neutral-900">
              This Month's Leaderboard
            </h1>
            <p className="mt-2 text-neutral-600">
              Check in to deals to climb the ranks and earn rewards!
            </p>
          </div>
          <LeaderboardSkeleton />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-20 text-center text-red-600">
        Failed to load leaderboard.
      </div>
    );
  }

  // Combine the top list and the current user's rank (if they aren't in the top list)
  const displayUsers = [...(leaderboardData?.top || [])];
  if (leaderboardData?.me && !leaderboardData.me.inTop) {
    displayUsers.push(leaderboardData.me);
  }

  return (
    <>
      <Helmet>
        <title>This Month's Leaderboard | CitySpark</title>
        <meta name="description" content="See who topped the leaderboard this month by checking in to deals and earning points on CitySpark." />
      </Helmet>
    <div className="min-h-screen bg-neutral-50 pt-24">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-neutral-900">
            This Month's Leaderboard
          </h1>
          <p className="mt-2 text-neutral-600">
            Check in to deals to climb the ranks and earn rewards!
          </p>
          <p className="mx-auto mt-4 max-w-xl text-neutral-500">
            The leaderboard showcases users who checked in the most this month.
            Earn points by visiting merchants and checking in at their deals —
            your points update on your profile and you'll move up the
            leaderboard. Top performers may receive special rewards from
            participating merchants.
          </p>
        </div>

        <div className="space-y-3">
          {displayUsers.length > 0 ? (
            displayUsers.map((user) => (
              <LeaderboardRow
                key={user.userId}
                user={{
                  rank: user.rank,
                  name: currentUser?.id === user.userId ? 'You' : user.name,
                  points: user.periodPoints,
                  isCurrentUser: currentUser?.id === user.userId,
                }}
              />
            ))
          ) : (
            <p className="text-center text-neutral-500">
              The leaderboard is empty. Be the first to check in and get on the
              board!
            </p>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

// --- Reusable Row Component ---
const LeaderboardRow = ({ user }: { user: any }) => {
  const isTopThree = user.rank <= 3;
  const rankIcon =
    user.rank === 1 ? (
      <Crown className="h-6 w-6 fill-current text-amber-500" />
    ) : user.rank === 2 ? (
      <Medal className="h-6 w-6 fill-current text-slate-400" />
    ) : user.rank === 3 ? (
      <Award className="h-6 w-6 fill-current text-amber-700" />
    ) : (
      <span className="font-bold text-neutral-500">{user.rank}</span>
    );

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border p-4 transition-all',
        user.isCurrentUser
          ? 'border-brand-primary-200 bg-brand-primary-50 ring-2 ring-brand-primary-500'
          : 'border-neutral-200 bg-white',
        isTopThree && 'shadow-lg',
      )}
    >
      <div className="w-8 flex-shrink-0 text-center">{rankIcon}</div>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p className="font-bold text-neutral-800">{user.name}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-brand-primary-600">
          {user.points.toLocaleString()}
        </p>
        <p className="text-xs text-neutral-500">Points</p>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Crown, Medal, Award, ChevronsUpDown, UserPlus, MapPin } from 'lucide-react'; // Import new icons
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/context/useAuth';
import { LeaderboardSkeleton } from '@/components/common/LeaderboardSkeleton';
import { TabSelector } from '@/components/common/TabSelector';
import { DiscoverSection } from '@/components/landing/DiscoverSection';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion
import { StreakLeaderboardTable } from '@/components/gamification/streak/StreakLeaderboardTable';
import { HeistActionButton } from '@/components/heist/HeistActionButton';
import { HeistSuccessAnimation } from '@/components/heist/HeistSuccessAnimation';
import { useQueryClient } from '@tanstack/react-query';
import { useUserActivity } from '@/hooks/useUserActivity';

const tabs = [
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'streaks', label: 'Streak Leaderboard' },
  { id: 'discover', label: 'Discover Deals' },
];

export const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');

  return (
    <div className="bg-neutral-50 min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-neutral-900">Grow your influence</h1>
          <p className="mt-2 text-neutral-600 max-w-md mx-auto">
            You deserve an experience that does it all. Climb the ranks or discover your next favorite spot.
          </p>
        </div>

        {/* --- NEW: Tab Navigation --- */}
        <div className="flex justify-center">
          <TabSelector tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* --- Conditional Content --- */}
        {activeTab === 'leaderboard' && <LeaderboardContent />}
        {activeTab === 'streaks' && (
          <div className="max-w-4xl mx-auto space-y-4 mt-6">
            <h2 className="text-2xl font-semibold text-neutral-900 text-center">Weekly Streak Leaderboard</h2>
            <p className="mx-auto max-w-xl text-neutral-500 text-center">
              Ranked by current weekly streak and discount tier. Keep checking in every week to climb.
            </p>
            <StreakLeaderboardTable />
          </div>
        )}
        {activeTab === 'discover' && <DiscoverSection />}
      </div>
    </div>
  );
};

// --- NEW: Extracted Leaderboard Content into its own component ---
const LeaderboardContent = () => {
  const { user: currentUser } = useAuth();
  const { data: leaderboardData, isLoading, error } = useLeaderboard();
  // --- NEW: State to track the currently expanded row ---
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }
  if (error) {
    return <div className="text-center py-20 text-status-expired">Failed to load leaderboard.</div>;
  }
  
  let displayUsers = [...(leaderboardData?.top || [])];
  if (leaderboardData?.me && !leaderboardData.me.inTop) {
    displayUsers.push(leaderboardData.me);
  }
  displayUsers.sort((a, b) => a.rank - b.rank);

  return (
    <div className="max-w-2xl mx-auto space-y-3 mt-6">
      <h2 className="text-2xl font-semibold text-neutral-900 text-center">This Month's Leaderboard</h2>
      <p className="mx-auto mt-2 max-w-xl text-neutral-500 text-center">
        The leaderboard showcases users who checked in the most this month.
        Earn points by visiting merchants and checking in at their deals — your
        points update on your profile and you'll move up the leaderboard. Top
        performers may receive special rewards from participating merchants.
      </p>
      {displayUsers.length > 0 ? (
        displayUsers.map((user) => {
          const isCurrentUserRow = currentUser?.id === user.userId;
          return (
            <LeaderboardRow
              key={user.userId}
              user={{
                userId: user.userId,
                rank: user.rank,
                name: isCurrentUserRow ? 'You' : user.name,
                points: user.periodPoints,
                isCurrentUser: isCurrentUserRow,
              }}
              isExpanded={expandedId === user.userId}
              onToggle={() => setExpandedId(expandedId === user.userId ? null : user.userId)}
              isCurrentUser={isCurrentUserRow}
            />
          );
        })
      ) : (
        <p className="text-center text-neutral-500 py-12">
          The leaderboard is empty. Be the first to check in and claim the top spot!
        </p>
      )}
    </div>
  );
};

// --- Reusable Row Component (expandable) ---
const LeaderboardRow = ({ user, isExpanded, onToggle, isCurrentUser }: { user: any; isExpanded: boolean; onToggle: () => void; isCurrentUser: boolean }) => {
  const isTopThree = user.rank <= 3;
  const queryClient = useQueryClient();
  const [heistSuccess, setHeistSuccess] = useState<{ pointsStolen: number; newTokenBalance: number } | null>(null);
  // Only fetch activity for current user when expanded
  const { data: activityData, isLoading: isLoadingActivity } = useUserActivity(
    isCurrentUser && isExpanded ? user.userId : undefined,
    10,
    0
  );

  const rankIcon =
    user.rank === 1 ? (
      <Crown className="h-6 w-6 text-leaderboard-gold fill-current" />
    ) : user.rank === 2 ? (
      <Medal className="h-6 w-6 text-leaderboard-silver fill-current" />
    ) : user.rank === 3 ? (
      <Award className="h-6 w-6 text-leaderboard-bronze fill-current" />
    ) : (
      <span className="font-bold text-neutral-500">{user.rank}</span>
    );

  // Function to get an icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'SIGNUP':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'CHECKIN':
        return <MapPin className="h-4 w-4 text-blue-500" />;
      default:
        return <UserPlus className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        user.isCurrentUser ? 'bg-brand-primary-50 border-brand-primary-200 ring-2 ring-brand-primary-500' : 'bg-white border-neutral-200',
        isTopThree && 'shadow-lg'
      )}
    >
      {/* --- Main Clickable Row --- */}
      <div className="flex items-center w-full p-4">
        <button onClick={onToggle} className="flex items-center flex-1 text-left">
          <div className="flex-shrink-0 w-8 text-center">{rankIcon}</div>
          <Avatar className="ml-2">
            <AvatarImage src="https://avatars.githubusercontent.com/u/124599?v=4" />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="ml-4 flex-grow">
            <p className="font-bold text-neutral-800 flex items-center gap-2">
              {user.name}
              {user.isCurrentUser && <span className="text-xs font-bold text-white bg-brand-primary-500 rounded-full px-2 py-0.5">You</span>}
            </p>
          </div>
          <div className="text-right mr-4">
            <p className="font-bold text-lg text-brand-primary-600">{user.points.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">Points</p>
          </div>
        </button>
        
        {/* Heist Action Button - Outside the toggle button */}
        {!user.isCurrentUser && (
          <div className="flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
            <HeistActionButton
              victimId={user.userId}
              victimName={user.name || 'Unknown'}
              victimPoints={user.points}
              onSuccess={(data) => {
                queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
                queryClient.invalidateQueries({ queryKey: ['heist', 'tokens'] });
                // Show success animation
                queryClient.invalidateQueries({ queryKey: ['heist', 'tokens'] }).then(() => {
                  const tokens = queryClient.getQueryData(['heist', 'tokens']) as any;
                  setHeistSuccess({
                    pointsStolen: data.pointsStolen,
                    newTokenBalance: tokens?.balance || 0,
                  });
                });
              }}
            />
          </div>
        )}
        
        <button onClick={onToggle} className="flex-shrink-0 ml-2">
          <ChevronsUpDown className={cn('h-5 w-5 text-neutral-400 transition-transform', isExpanded && 'rotate-180')} />
        </button>
      </div>

      {/* --- Expandable Activity Section --- */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-neutral-200">
              <h4 className="text-sm font-semibold text-neutral-600 mb-2">Recent Activity</h4>
              {!isCurrentUser ? (
                <p className="text-sm text-neutral-500 text-center py-4">Activity is only visible for your own profile</p>
              ) : isLoadingActivity ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-neutral-200 animate-pulse rounded-md" />
                  ))}
                </div>
              ) : activityData && activityData.activities.length > 0 ? (
                <div className="space-y-2">
                  {activityData.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-neutral-50">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className="text-neutral-700">{activity.description}</span>
                      </div>
                      <span className="font-bold text-green-600">+{activity.points} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 text-center py-4">No activity yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Heist Success Animation */}
      {heistSuccess && (
        <HeistSuccessAnimation
          pointsStolen={heistSuccess.pointsStolen}
          newTokenBalance={heistSuccess.newTokenBalance}
          onClose={() => setHeistSuccess(null)}
        />
      )}
    </div>
  );
};

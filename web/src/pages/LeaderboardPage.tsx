import { useState } from 'react';
import { Crown, Medal, Award, ChevronsUpDown, UserPlus, MapPin, Trophy } from 'lucide-react'; // Import new icons
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
import { useUserActivity, type UserActivity, type UserActivityResponse } from '@/hooks/useUserActivity';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { Button } from '@/components/common/Button';
import { ShoppingBag } from 'lucide-react';
import { ActiveItemsBadge } from '@/components/heist/ActiveItemsBadge';

const tabs = [
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'streaks', label: 'Streak Leaderboard' },
  { id: 'discover', label: 'Discover Deals' },
];

export const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-brand-primary-50 via-blue-50 to-brand-primary-100 min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center relative">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/3 w-20 h-20 bg-yellow-300 rounded-full opacity-20 blur-2xl animate-pulse" />
          <div className="absolute top-0 right-1/3 w-24 h-24 bg-brand-primary-300 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-2">

              <h1 className="text-5xl font-bold text-brand-primary-700">
                Grow your influence
              </h1>
              
            </div>
            <p className="mt-2 text-neutral-700 max-w-md mx-auto font-medium">
              You deserve an experience that does it all. Climb the ranks or discover your next favorite spot.
            </p>
            <div className="mt-4">
              <button
                onClick={() => navigate(PATHS.LEADERBOARD_COMPREHENSIVE)}
                className="text-sm text-brand-primary-600 hover:text-brand-primary-700 font-semibold hover:underline transition-all"
              >
                View Comprehensive Leaderboard →
              </button>
            </div>
          </div>
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
  const { data: leaderboardData, isLoading, error } = useLeaderboard({
    period: 'month',
    showMore: true,
    includeBreakdown: true, // Enable breakdown for all users
  });
  const navigate = useNavigate();
  // --- NEW: State to track the currently expanded row ---
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }
  if (error) {
    return <div className="text-center py-20 text-status-expired">Failed to load leaderboard.</div>;
  }
  
  const displayUsers = [...(leaderboardData?.top || [])];
  if (leaderboardData?.me && !leaderboardData.me.inTop) {
    displayUsers.push(leaderboardData.me);
  }
  displayUsers.sort((a, b) => a.rank - b.rank);

  // Ensure ranks are properly set (1, 2, 3, ...) if backend doesn't provide them
  displayUsers.forEach((user, index) => {
    if (!user.rank || user.rank === 0) {
      user.rank = index + 1;
    }
  });

  // Debug: Log the ranks
  console.log('Leaderboard users:', displayUsers.map(u => ({ name: u.name, rank: u.rank, points: u.points })));

  return (
    <div className="max-w-2xl mx-auto space-y-3 mt-6">
      <div className="mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-brand-primary-200 mb-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-brand-primary-700">
                This Month's Leaderboard
              </h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(PATHS.HEIST_ITEM_SHOP)}
              icon={<ShoppingBag className="h-4 w-4" />}
              className="flex-shrink-0"
            >
              Item Shop
            </Button>
          </div>
          
          {/* Active Items Display */}
          <div className="bg-brand-primary-50 rounded-lg border-2 border-brand-primary-200 p-3">
            <ActiveItemsBadge variant="detailed" />
          </div>
        </div>
      </div>
      {displayUsers.length > 0 ? (
        displayUsers.map((user) => {
          const isCurrentUserRow = currentUser?.id === user.userId;
          const userBreakdown = leaderboardData?.pointBreakdowns?.[user.userId.toString()];
          
          return (
            <LeaderboardRow
              key={user.userId}
              user={{
                userId: user.userId,
                rank: user.rank,
                name: isCurrentUserRow ? 'You' : user.name,
                points: user.points ?? user.periodPoints ?? 0,
                isCurrentUser: isCurrentUserRow,
              }}
              pointBreakdown={userBreakdown}
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
interface PointBreakdown {
  eventType: string;
  eventTypeName: string;
  points: number;
  count: number;
}

const LeaderboardRow = ({ 
  user, 
  pointBreakdown,
  isExpanded, 
  onToggle, 
  isCurrentUser 
}: { 
  user: any; 
  pointBreakdown?: PointBreakdown[];
  isExpanded: boolean; 
  onToggle: () => void; 
  isCurrentUser: boolean;
}) => {
  const isTopThree = user.rank <= 3;
  const queryClient = useQueryClient();
  const [heistSuccess, setHeistSuccess] = useState<{ pointsStolen: number; newTokenBalance: number } | null>(null);
  // Only fetch activity for current user when expanded
  const { data: activityData, isLoading: isLoadingActivity } = useUserActivity(
    isCurrentUser && isExpanded ? user.userId : undefined,
    10,
    0
  );

  // Type-safe access to activities with proper type assertion
  const activities = (activityData as UserActivityResponse)?.activities || [];

  const rankIcon =
    user.rank === 1 ? (
      <div className="relative flex items-center justify-center">
        <Crown className="h-8 w-8 text-yellow-400 fill-yellow-400 drop-shadow-lg animate-pulse" />
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm" />
      </div>
    ) : user.rank === 2 ? (
      <div className="relative flex items-center justify-center">
        <Medal className="h-7 w-7 text-gray-400 fill-gray-400 drop-shadow-md" />
        <div className="absolute inset-0 bg-gray-400/10 rounded-full blur-sm" />
      </div>
    ) : user.rank === 3 ? (
      <div className="relative flex items-center justify-center">
        <Award className="h-7 w-7 text-amber-600 fill-amber-600 drop-shadow-md" />
        <div className="absolute inset-0 bg-amber-600/10 rounded-full blur-sm" />
      </div>
    ) : (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 border-2 border-neutral-300">
        <span className="font-bold text-sm text-neutral-600">{user.rank}</span>
      </div>
    );

  // Function to get an icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'SIGNUP':
      case 'REFERRAL':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'CHECKIN':
      case 'CHECK_IN':
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'DEAL_SAVE':
        return <Award className="h-4 w-4 text-yellow-500" />;
      default:
        return <Award className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border-2 transition-all hover:shadow-xl',
        user.isCurrentUser 
          ? 'bg-gradient-to-br from-brand-primary-50 to-brand-primary-100 border-brand-primary-300 ring-2 ring-brand-primary-400 shadow-lg' 
          : 'bg-white border-neutral-200 hover:border-brand-primary-200',
        user.rank === 1 && 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-xl shadow-yellow-200/50',
        user.rank === 2 && 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300 shadow-lg shadow-gray-200/50',
        user.rank === 3 && 'bg-gradient-to-br from-orange-50 to-amber-50 border-amber-400 shadow-lg shadow-amber-200/50',
        isTopThree && 'border-2'
      )}
    >
      {/* --- Main Clickable Row --- */}
      <div className="flex items-center w-full p-4 relative">
        {/* Decorative corner for top 3 */}
        {user.rank === 1 && (
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full opacity-20 blur-md" />
          </div>
        )}
        
        <button onClick={onToggle} className="flex items-center flex-1 text-left">
          <div className="flex-shrink-0 w-10 text-center">{rankIcon}</div>
          <Avatar className={cn(
            "ml-3 ring-2",
            user.rank === 1 && "ring-yellow-400 shadow-lg shadow-yellow-200",
            user.rank === 2 && "ring-gray-400 shadow-md shadow-gray-200",
            user.rank === 3 && "ring-amber-500 shadow-md shadow-amber-200",
            user.rank > 3 && "ring-neutral-200"
          )}>
            <AvatarImage src="https://avatars.githubusercontent.com/u/124599?v=4" />
            <AvatarFallback className={cn(
              user.rank === 1 && "bg-yellow-100 text-yellow-700",
              user.rank === 2 && "bg-gray-100 text-gray-700",
              user.rank === 3 && "bg-amber-100 text-amber-700"
            )}>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="ml-4 flex-grow">
            <p className={cn(
              "font-bold flex items-center gap-2",
              user.rank === 1 && "text-yellow-900",
              user.rank === 2 && "text-gray-800",
              user.rank === 3 && "text-amber-900",
              user.rank > 3 && "text-neutral-800"
            )}>
              {user.name}
              {user.isCurrentUser && <span className="text-xs font-bold text-white bg-brand-primary-500 rounded-full px-2 py-0.5">You</span>}
            </p>
            {user.isCurrentUser && (
              <div className="mt-1">
                <ActiveItemsBadge variant="compact" className="text-xs" />
              </div>
            )}
          </div>
          <div className="text-right mr-4">
            <p className={cn(
              "font-bold text-xl",
              user.rank === 1 && "text-yellow-600",
              user.rank === 2 && "text-gray-600",
              user.rank === 3 && "text-amber-600",
              user.rank > 3 && "text-brand-primary-600"
            )}>{user.points.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 font-medium">Points</p>
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
              {/* Point Breakdown Section - Available for ALL users */}
              {pointBreakdown && pointBreakdown.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-neutral-600 mb-2">Point Breakdown</h4>
                  <div className="space-y-2">
                    {pointBreakdown.map((breakdown) => (
                      <div 
                        key={breakdown.eventType} 
                        className="flex items-center justify-between text-sm p-2 rounded-md bg-neutral-50"
                      >
                        <div className="flex items-center gap-2">
                          {getActivityIcon(breakdown.eventType)}
                          <div>
                            <span className="text-neutral-700 font-medium">{breakdown.eventTypeName}</span>
                            <span className="text-neutral-500 text-xs ml-2">({breakdown.count}x)</span>
                          </div>
                        </div>
                        <span className="font-bold text-brand-primary-600">
                          {breakdown.points.toLocaleString()} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity Section - Only for current user */}
              {isCurrentUser && (
                <>
                  <h4 className="text-sm font-semibold text-neutral-600 mb-2">Recent Activity</h4>
                  {isLoadingActivity ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-neutral-200 animate-pulse rounded-md" />
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-2">
                      {activities.map((activity: UserActivity) => (
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
                    <p className="text-sm text-neutral-500 text-center py-4">No recent activity</p>
                  )}
                </>
              )}

              {/* Message for other users without breakdown */}
              {!isCurrentUser && (!pointBreakdown || pointBreakdown.length === 0) && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  Activity breakdown not available
                </p>
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

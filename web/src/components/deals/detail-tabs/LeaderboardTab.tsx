// web/src/components/deals/detail-tabs/LeaderboardTab.tsx
import { useState } from 'react';
import { Trophy, Crown, Lock, Hammer, Zap, X, Coins, CheckCircle, Loader2 } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardSkeleton } from '@/components/common/LeaderboardSkeleton';
import { cn } from '@/lib/utils';
import { useHeistEligibility } from '@/hooks/useHeistEligibility';
import { useHeistExecute } from '@/hooks/useHeistExecute';
import { useHeistTokens } from '@/hooks/useHeistTokens';
import { useHeistInventory } from '@/hooks/useHeistItems';

interface LeaderboardTabProps {
  deal: DetailedDeal;
}

export const LeaderboardTab = ({ deal }: LeaderboardTabProps) => {
  const [showStealModal, setShowStealModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [stolenAmount, setStolenAmount] = useState(0);
  
  const { data: leaderboardData, isLoading } = useLeaderboard({
    period: 'month',
    limit: 50,
    includeBreakdown: true,
  });

  // Heist hooks
  const { data: tokens } = useHeistTokens();
  const { data: inventory } = useHeistInventory();
  
  // Get eligibility for selected user
  const { data: eligibility, isLoading: isLoadingEligibility } = useHeistEligibility(
    selectedUser?.userId || null,
    showStealModal && selectedUser !== null
  );
  
  const { mutate: executeHeist, isPending: isExecuting } = useHeistExecute();

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  const topUser = leaderboardData?.top?.[0];
  const currentUser = leaderboardData?.me;
  const displayUsers = [...(leaderboardData?.top || [])];
  if (currentUser && !currentUser.inTop) {
    displayUsers.push(currentUser);
  }

  // Helper to get user display name
  const getUserName = (user: any) => user.name || user.email?.split('@')[0] || 'Anonymous';

  // Helper to get check-ins count from point breakdown
  const getCheckInsCount = (user: any) => {
    if (!leaderboardData?.pointBreakdowns || !user) return 0;
    const breakdown = leaderboardData.pointBreakdowns[user.userId];
    if (!breakdown) return 0;
    const checkInEvent = breakdown.find(e => 
      e.eventTypeName?.toLowerCase().includes('check') || 
      e.eventType?.toLowerCase().includes('check')
    );
    return checkInEvent?.count || 0;
  };

  // Helper to get spending amount (mock for now, should come from backend)
  const getSpendingAmount = (user: any) => {
    // Calculate from points or use mock data
    // In real implementation, this should come from backend
    const baseAmount = (user.points || 0) * 0.5; // Rough estimate
    return Math.floor(baseAmount);
  };

  // Helper to check if user is friend (mock for now - should come from backend)
  const isFriend = (_userId: number) => {
    // TODO: Implement actual friend check using userId
    return Math.random() > 0.5; // Mock: 50% chance
  };

  // Helper to get rank change (mock for now)
  const getRankChange = () => {
    // TODO: Get actual rank change from backend
    const change = Math.floor(Math.random() * 3) - 1;
    return change !== 0 ? change : null;
  };

  // Check if user has hammer in inventory
  const hasHammer = inventory?.some(item => item.type === 'HAMMER' && (item.usesRemaining === null || item.usesRemaining > 0)) || false;


  // Handle steal action
  const handleStealClick = (targetUser: any) => {
    setSelectedUser(targetUser);
    setShowStealModal(true);
  };

  // Handle hammer usage
  const handleUseHammer = (targetUser: any) => {
    setSelectedUser(targetUser);
    setShowStealModal(true);
  };

  // Handle steal confirmation
  const handleStealConfirm = () => {
    if (!selectedUser) return;
    
    executeHeist(selectedUser.userId, {
      onSuccess: (data) => {
        setStolenAmount(data.pointsStolen);
        setShowStealModal(false);
        setShowSuccessModal(true);
        // Leaderboard will auto-refresh due to query invalidation in useHeistExecute
      },
      onError: () => {
        // Error toast is already shown by useHeistExecute hook
        setShowStealModal(false);
      },
    });
  };

  // Check if user can steal (has tokens or hammer)
  const canSteal = (user: any) => {
    if (!user) return false;
    // User can steal if they have tokens OR a hammer
    return (tokens?.balance || 0) > 0 || hasHammer;
  };

  const topUserCheckIns = getCheckInsCount(topUser);
  const topUserSpending = topUser ? getSpendingAmount(topUser) : 0;
  const topUserCoins = topUser?.points || 0;

  return (
    <div className="space-y-6">
      {/* Restaurant BOSS Section */}
      {topUser && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Crown className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold">Restaurant BOSS</span>
                  <span className="text-xl">✨</span>
                </div>
                <h3 className="text-3xl font-bold mb-3">{getUserName(topUser)}</h3>
                <div className="flex items-center gap-6 text-base">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-5 w-5" />
                    {topUserCheckIns} check-ins
                  </span>
                  <span>${topUserSpending.toLocaleString()} spent</span>
                </div>
              </div>
            </div>
            <div className="bg-pink-600/30 rounded-xl px-6 py-4 text-center backdrop-blur-sm min-w-[180px]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Coins className="h-5 w-5" />
                <p className="text-sm opacity-90">Loyalty Coins</p>
              </div>
              <p className="text-3xl font-bold">{topUserCoins.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-neutral-900">How It Works</h3>
        </div>
        <ul className="space-y-3 text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Earn coins by checking in, ordering, and spending at {deal.merchant.businessName}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Steal coins from friends, but watch out - they can get revenge!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>
              Some coins are locked 🔒 - you need to be friends or buy a hammer 🔨 to steal them
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Top earner becomes the Restaurant BOSS and gets exclusive perks!</span>
          </li>
        </ul>
      </div>

      {/* Leaderboard List */}
      {displayUsers.length > 0 ? (
        <div className="space-y-3">
          {displayUsers.map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = currentUser && user.userId === currentUser.userId;
            const isBoss = rank === 1;
            const userIsFriend = isFriend(user.userId);
            const rankChange = getRankChange();
            const checkIns = getCheckInsCount(user);
            const spending = getSpendingAmount(user);
            const coins = user.points || 0;
            const showSpending = Math.random() > 0.2; // Mock: 80% show spending, 20% hidden

            return (
              <div
                key={user.userId}
                className={cn(
                  'bg-white rounded-xl p-4 border transition-all',
                  isCurrentUser ? 'border-blue-500 bg-blue-50' : 'border-neutral-200',
                  isBoss && 'border-yellow-400'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Rank */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0',
                        rank === 1 
                          ? 'bg-yellow-400 text-neutral-900' 
                          : rank === 2 
                          ? 'bg-green-500 text-white' 
                          : rank === 3
                          ? 'bg-orange-500 text-white'
                          : 'bg-neutral-300 text-neutral-700'
                      )}
                    >
                      {isBoss ? <Crown className="h-6 w-6" /> : rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={getUserName(user)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-neutral-600 font-semibold text-lg">
                            {getUserName(user).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-neutral-900">{getUserName(user)}</span>
                        {isCurrentUser && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">You</span>
                        )}
                        {userIsFriend && !isCurrentUser && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
                            Friend
                            {rankChange !== null && (
                              <span className={cn('ml-1', rankChange > 0 ? 'text-green-600' : 'text-red-600')}>
                                {rankChange > 0 ? '↑' : '↓'}{Math.abs(rankChange)}
                              </span>
                            )}
                          </span>
                        )}
                        {!userIsFriend && !isCurrentUser && rankChange !== null && (
                          <span className={cn('text-xs font-semibold', rankChange > 0 ? 'text-green-600' : 'text-red-600')}>
                            {rankChange > 0 ? '↑' : '↓'}{Math.abs(rankChange)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-sm text-neutral-700">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {checkIns}
                        </span>
                        <span>
                          {showSpending ? `$${spending.toLocaleString()}` : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    {/* Coins and Action */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">{coins.toLocaleString()} coins</p>
                      </div>
                      
                      {/* Action Button */}
                      {isCurrentUser ? (
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-purple-700 transition-colors">
                          <Zap className="h-4 w-4" />
                          + BOOST
                        </button>
                      ) : canSteal(user) ? (
                        userIsFriend ? (
                          <button 
                            onClick={() => handleStealClick(user)}
                            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-semibold hover:bg-neutral-300 transition-colors"
                          >
                            Steal
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleUseHammer(user)}
                            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-neutral-300 transition-colors"
                          >
                            <Hammer className="h-4 w-4" />
                            Use Hammer
                          </button>
                        )
                      ) : (
                        <button 
                          disabled
                          className="px-4 py-2 bg-neutral-100 text-neutral-400 rounded-lg text-sm font-semibold cursor-not-allowed"
                        >
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-neutral-500">
          <p>No leaderboard data available yet.</p>
        </div>
      )}

      {/* Steal Coins Modal */}
      {showStealModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-orange-600" />
                <h3 className="text-xl font-bold">Steal Coins</h3>
              </div>
              <button
                onClick={() => setShowStealModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-neutral-700 mb-4">
              {isLoadingEligibility ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking eligibility...
                </span>
              ) : eligibility?.eligible ? (
                isFriend(selectedUser.userId)
                  ? "Attempt to steal coins from this user. They can get revenge later!"
                  : "This user's coins are locked. Use a hammer to break the lock!"
              ) : (
                eligibility?.reason || "You cannot steal from this user at this time."
              )}
            </p>

            {/* User Info */}
            <div className="bg-neutral-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-200 flex-shrink-0 overflow-hidden">
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} alt={getUserName(selectedUser)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-neutral-600 font-semibold">
                        {getUserName(selectedUser).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{getUserName(selectedUser)}</p>
                  {isFriend(selectedUser.userId) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Friend</span>
                  )}
                  <p className="text-sm text-neutral-600 mt-1">Has {(selectedUser.points || 0).toLocaleString()} coins</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            {eligibility && !eligibility.eligible ? (
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 mb-1">Cannot Steal</p>
                    <p className="text-sm text-red-800">
                      {eligibility.reason || 'You cannot steal from this user at this time.'}
                    </p>
                    {eligibility.details?.hoursRemaining && (
                      <p className="text-xs text-red-700 mt-1">
                        Wait {eligibility.details.hoursRemaining} more hour{eligibility.details.hoursRemaining !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : !isFriend(selectedUser.userId) ? (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 mb-1">Coins are locked!</p>
                    <p className="text-sm text-yellow-800">
                      You need to use a hammer to break the lock and steal their coins.
                    </p>
                  </div>
                </div>
                {hasHammer ? (
                  <div className="mt-3 flex items-center gap-3 bg-white rounded-lg p-3">
                    <Hammer className="h-6 w-6 text-orange-600" />
                    <div>
                      <p className="font-semibold text-neutral-900">Hammer</p>
                      <p className="text-xs text-neutral-600">One-time use</p>
                    </div>
                    <div className="ml-auto">
                      <p className="font-bold text-green-600">Available</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-3 bg-white rounded-lg p-3">
                    <Hammer className="h-6 w-6 text-neutral-400" />
                    <div>
                      <p className="font-semibold text-neutral-900">Hammer</p>
                      <p className="text-xs text-neutral-600">Purchase required</p>
                    </div>
                    <div className="ml-auto">
                      <p className="font-bold text-orange-600">500 coins</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">▲</span>
                  <p className="text-sm text-yellow-800">
                    Watch out! This user will be notified and can steal coins back from you as revenge.
                  </p>
                </div>
                {eligibility?.pointsWouldSteal && (
                  <p className="text-sm font-semibold text-yellow-900 mt-2">
                    Potential steal: {eligibility.pointsWouldSteal} coins
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowStealModal(false)}
                className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStealConfirm}
                disabled={!eligibility?.eligible || isExecuting || isLoadingEligibility}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    {!isFriend(selectedUser.userId) && <Hammer className="h-4 w-4" />}
                    {!isFriend(selectedUser.userId) ? 'Use Hammer & Steal' : 'Steal Now'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steal Successful Modal */}
      {showSuccessModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl text-center">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedUser(null);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Steal Successful!</h3>
            </div>

            <p className="text-neutral-700 mb-6 text-lg">
              You stole <span className="font-bold text-orange-600">{stolenAmount.toLocaleString()}</span> coins from {getUserName(selectedUser)}!
            </p>

            <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-900">
                {getUserName(selectedUser)} has been notified. Watch your back - they might come for revenge!
              </p>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedUser(null);
              }}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


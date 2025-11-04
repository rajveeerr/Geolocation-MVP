import React from 'react';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useGamificationProfile, useAchievements } from '../../hooks/useGamification';
import { Coins, Trophy, Star, TrendingUp, Gift, History, CreditCard, Award, Zap } from 'lucide-react';
import { LoyaltyTier } from '../../types/gamification';
import CoinPurchase from './CoinPurchase';
import AchievementsList from './AchievementsList';
import TransactionHistory from './TransactionHistory';
import PaymentHistory from './PaymentHistory';
import { cn } from '@/lib/utils';

const GamificationDashboard: React.FC = () => {
  const { data: profile, isLoading: profileLoading, error: profileError } = useGamificationProfile();
  const { data: achievements } = useAchievements();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center text-neutral-600">
          <p className="font-semibold text-neutral-900 mb-1">Failed to load gamification data</p>
          <p className="text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center text-neutral-600">
          <p className="font-semibold text-neutral-900 mb-1">No gamification data available</p>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: LoyaltyTier) => {
    const colors = {
      BRONZE: 'bg-amber-600 text-white',
      SILVER: 'bg-neutral-400 text-white',
      GOLD: 'bg-yellow-500 text-white',
      PLATINUM: 'bg-purple-600 text-white',
      DIAMOND: 'bg-blue-600 text-white',
    };
    return colors[tier] || 'bg-neutral-400 text-white';
  };

  const getTierIcon = (tier: LoyaltyTier) => {
    const IconComponent = {
      BRONZE: Award,
      SILVER: Award,
      GOLD: Trophy,
      PLATINUM: Star,
      DIAMOND: Zap,
    };
    return IconComponent[tier] || Trophy;
  };

  const getTierLabel = (tier: LoyaltyTier) => {
    return tier.charAt(0) + tier.slice(1).toLowerCase();
  };

  const completedAchievements = achievements?.filter(a => a.userProgress?.isCompleted) || [];
  const totalAchievements = achievements?.length || 0;

  const TierIcon = getTierIcon(profile.loyaltyTier);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Coins className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{profile.coins.toLocaleString()}</p>
              <p className="text-sm text-neutral-600">Coins</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", getTierColor(profile.loyaltyTier))}>
              <TierIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900">{getTierLabel(profile.loyaltyTier)}</p>
              <p className="text-sm text-neutral-600">Loyalty Tier</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{completedAchievements.length}/{totalAchievements}</p>
              <p className="text-sm text-neutral-600">Achievements</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{profile.experiencePoints.toLocaleString()}</p>
              <p className="text-sm text-neutral-600">XP Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Progress */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-neutral-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Loyalty Progress</h2>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium", getTierColor(profile.loyaltyTier))}>
                <TierIcon className="h-4 w-4" />
                <span>{getTierLabel(profile.loyaltyTier)}</span>
              </div>
              <span className="text-sm text-neutral-600">
                ${profile.totalSpent.toFixed(2)} spent
              </span>
            </div>
            {profile.nextTier && (
              <div className="text-sm text-neutral-600">
                Next: {getTierLabel(profile.nextTier)}
              </div>
            )}
          </div>
          
          {profile.nextTier && profile.nextTierThreshold && (
            <div className="space-y-3">
              <Progress value={profile.progressToNextTier} className="h-2" />
              <div className="flex justify-between text-sm text-neutral-600">
                <span>${profile.totalSpent.toFixed(2)}</span>
                <span>${profile.nextTierThreshold.toFixed(2)}</span>
              </div>
              <p className="text-sm text-center text-neutral-600">
                ${(profile.nextTierThreshold - profile.totalSpent).toFixed(2)} to reach {getTierLabel(profile.nextTier)}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
            <Gift className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Earning {(profile.coinMultiplier * 100).toFixed(0)}% bonus coins
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Tabs defaultValue="purchase" className="space-y-6">
          <TabsList className="flex items-center gap-2 overflow-x-auto rounded-full bg-neutral-100 p-1 w-full">
            <TabsTrigger 
              value="purchase" 
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                "data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:text-neutral-600 data-[state=inactive]:hover:bg-neutral-200/50"
              )}
            >
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Buy Coins</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                "data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:text-neutral-600 data-[state=inactive]:hover:bg-neutral-200/50"
              )}
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                "data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:text-neutral-600 data-[state=inactive]:hover:bg-neutral-200/50"
              )}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200",
                "data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm",
                "data-[state=inactive]:text-neutral-600 data-[state=inactive]:hover:bg-neutral-200/50"
              )}
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
          </TabsList>

        <TabsContent value="purchase">
          <CoinPurchase />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsList />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistory />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamificationDashboard;
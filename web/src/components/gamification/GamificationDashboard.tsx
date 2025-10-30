import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useGamificationProfile, useAchievements } from '../../hooks/useGamification';
import { Coins, Trophy, Star, TrendingUp, Gift, History, CreditCard } from 'lucide-react';
import { LoyaltyTier } from '../../types/gamification';
import CoinPurchase from './CoinPurchase';
import AchievementsList from './AchievementsList';
import TransactionHistory from './TransactionHistory';
import PaymentHistory from './PaymentHistory';

const GamificationDashboard: React.FC = () => {
  const { data: profile, isLoading: profileLoading, error: profileError } = useGamificationProfile();
  const { data: achievements } = useAchievements();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Failed to load gamification data. Please try again later.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p>No gamification data available.</p>
      </div>
    );
  }

  const getTierColor = (tier: LoyaltyTier) => {
    const colors = {
      BRONZE: 'bg-amber-600',
      SILVER: 'bg-gray-400',
      GOLD: 'bg-yellow-500',
      PLATINUM: 'bg-purple-500',
      DIAMOND: 'bg-blue-500',
    };
    return colors[tier] || 'bg-gray-400';
  };

  const getTierIcon = (tier: LoyaltyTier) => {
    const icons = {
      BRONZE: '🥉',
      SILVER: '🥈',
      GOLD: '🥇',
      PLATINUM: '💠',
      DIAMOND: '💎',
    };
    return icons[tier] || '🏆';
  };

  const completedAchievements = achievements?.filter(a => a.userProgress?.isCompleted) || [];
  const totalAchievements = achievements?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{profile.coins.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Coins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTierColor(profile.loyaltyTier)}`}>
                <span className="text-white text-lg">{getTierIcon(profile.loyaltyTier)}</span>
              </div>
              <div>
                <p className="text-lg font-bold">{profile.loyaltyTier}</p>
                <p className="text-sm text-gray-600">Loyalty Tier</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{completedAchievements.length}/{totalAchievements}</p>
                <p className="text-sm text-gray-600">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{profile.experiencePoints.toLocaleString()}</p>
                <p className="text-sm text-gray-600">XP Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Loyalty Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={getTierColor(profile.loyaltyTier)}>
                  {getTierIcon(profile.loyaltyTier)} {profile.loyaltyTier}
                </Badge>
                <span className="text-sm text-gray-600">
                  ${profile.totalSpent.toFixed(2)} spent
                </span>
              </div>
              {profile.nextTier && (
                <div className="text-sm text-gray-600">
                  Next: {getTierIcon(profile.nextTier)} {profile.nextTier}
                </div>
              )}
            </div>
            
            {profile.nextTier && profile.nextTierThreshold && (
              <div className="space-y-2">
                <Progress value={profile.progressToNextTier} className="h-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${profile.totalSpent.toFixed(2)}</span>
                  <span>${profile.nextTierThreshold.toFixed(2)}</span>
                </div>
                <p className="text-sm text-center text-gray-600">
                  ${(profile.nextTierThreshold - profile.totalSpent).toFixed(2)} to reach {profile.nextTier}
                </p>
              </div>
            )}

            <div className="text-sm text-green-600">
              <Gift className="h-4 w-4 inline mr-1" />
              Earning {(profile.coinMultiplier * 100).toFixed(0)}% bonus coins
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="purchase" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="purchase" className="flex items-center space-x-2">
            <Coins className="h-4 w-4" />
            <span>Buy Coins</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Payments</span>
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
  );
};

export default GamificationDashboard;
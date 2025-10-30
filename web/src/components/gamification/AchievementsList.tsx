import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAchievements } from '../../hooks/useGamification';
import { Trophy, Star, Coins, CheckCircle2, Clock } from 'lucide-react';
import type { Achievement, AchievementType } from '../../types/gamification';

const AchievementsList: React.FC = () => {
  const { data: achievements, isLoading, error } = useAchievements();

  const getAchievementIcon = (type: AchievementType) => {
    switch (type) {
      case AchievementType.FIRST_PURCHASE:
        return <Star className="h-5 w-5 text-yellow-500" />;
      case AchievementType.SPENDING_MILESTONE:
        return <Coins className="h-5 w-5 text-green-500" />;
      case AchievementType.CHECK_IN_STREAK:
        return <Trophy className="h-5 w-5 text-blue-500" />;
      case AchievementType.REFERRAL_COUNT:
        return <Star className="h-5 w-5 text-purple-500" />;
      case AchievementType.DEAL_SAVER:
        return <Star className="h-5 w-5 text-pink-500" />;
      case AchievementType.LOYALTY_TIER:
        return <Trophy className="h-5 w-5 text-orange-500" />;
      default:
        return <Trophy className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (!achievement.userProgress) return 0;
    if (achievement.userProgress.isCompleted) return 100;

    const progress = achievement.userProgress.progress;
    const criteria = achievement.criteria;

    // Calculate progress based on achievement type
    switch (achievement.type) {
      case AchievementType.SPENDING_MILESTONE:
        return Math.min(100, (progress.spent || 0) / criteria.amount * 100);
      case AchievementType.CHECK_IN_STREAK:
        return Math.min(100, (progress.checkIns || 0) / criteria.streak * 100);
      case AchievementType.REFERRAL_COUNT:
        return Math.min(100, (progress.referrals || 0) / criteria.count * 100);
      case AchievementType.DEAL_SAVER:
        return Math.min(100, (progress.saved || 0) / criteria.count * 100);
      default:
        return achievement.userProgress.isCompleted ? 100 : 0;
    }
  };

  const getProgressText = (achievement: Achievement) => {
    if (!achievement.userProgress) return 'Not started';
    if (achievement.userProgress.isCompleted) return 'Completed';

    const progress = achievement.userProgress.progress;
    const criteria = achievement.criteria;

    switch (achievement.type) {
      case AchievementType.SPENDING_MILESTONE:
        return `$${(progress.spent || 0).toFixed(2)} / $${criteria.amount}`;
      case AchievementType.CHECK_IN_STREAK:
        return `${progress.checkIns || 0} / ${criteria.streak} check-ins`;
      case AchievementType.REFERRAL_COUNT:
        return `${progress.referrals || 0} / ${criteria.count} referrals`;
      case AchievementType.DEAL_SAVER:
        return `${progress.saved || 0} / ${criteria.count} deals saved`;
      default:
        return 'In progress';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Failed to load achievements. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No achievements available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const completedAchievements = achievements.filter(a => a.userProgress?.isCompleted);
  const inProgressAchievements = achievements.filter(a => !a.userProgress?.isCompleted);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Achievements</span>
            </div>
            <Badge variant="secondary">
              {completedAchievements.length} / {achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{completedAchievements.length} / {achievements.length}</span>
            </div>
            <Progress 
              value={(completedAchievements.length / achievements.length) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Completed Achievements */}
      {completedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Completed Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedAchievements.map((achievement) => (
                <Card key={achievement.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {achievement.icon ? (
                          <span className="text-2xl">{achievement.icon}</span>
                        ) : (
                          getAchievementIcon(achievement.type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-green-800">{achievement.name}</h4>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-green-700 mb-2">{achievement.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3 text-yellow-600" />
                            <span className="text-yellow-700">+{achievement.coinReward}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-purple-600" />
                            <span className="text-purple-700">+{achievement.xpReward} XP</span>
                          </div>
                        </div>
                        {achievement.userProgress?.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed {new Date(achievement.userProgress.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>In Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressAchievements.map((achievement) => (
                <Card key={achievement.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {achievement.icon ? (
                          <span className="text-2xl opacity-60">{achievement.icon}</span>
                        ) : (
                          <div className="opacity-60">
                            {getAchievementIcon(achievement.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-blue-800 mb-1">{achievement.name}</h4>
                        <p className="text-sm text-blue-700 mb-3">{achievement.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-blue-700">
                            <span>{getProgressText(achievement)}</span>
                            <span>{getProgressPercentage(achievement).toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={getProgressPercentage(achievement)} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm mt-3">
                          <div className="flex items-center space-x-1">
                            <Coins className="h-3 w-3 text-yellow-600" />
                            <span className="text-yellow-700">+{achievement.coinReward}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-purple-600" />
                            <span className="text-purple-700">+{achievement.xpReward} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AchievementsList;
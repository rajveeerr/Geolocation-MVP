import React from 'react';
import { Progress } from '../ui/progress';
import { useAchievements } from '../../hooks/useGamification';
import { Trophy, Star, Coins, CheckCircle2, Clock, Sparkles, DollarSign, Gem, Users, Heart, Award } from 'lucide-react';
import type { Achievement } from '../../types/gamification';
import { AchievementType } from '../../types/gamification';

const AchievementsList: React.FC = () => {
  const { data: achievements, isLoading, error } = useAchievements();

  const getAchievementIcon = (achievement: Achievement) => {
    // If achievement has a specific icon preference in name/description, use that
    const name = achievement.name.toLowerCase();
    
    // Check achievement type first
    switch (achievement.type) {
      case AchievementType.FIRST_PURCHASE:
        return <Sparkles className="h-5 w-5 text-amber-600" />;
      case AchievementType.SPENDING_MILESTONE:
        if (name.includes('premium') || name.includes('diamond')) {
          return <Gem className="h-5 w-5 text-blue-600" />;
        }
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case AchievementType.CHECK_IN_STREAK:
        return <Trophy className="h-5 w-5 text-blue-600" />;
      case AchievementType.REFERRAL_COUNT:
        return <Users className="h-5 w-5 text-purple-600" />;
      case AchievementType.DEAL_SAVER:
        return <Heart className="h-5 w-5 text-red-600" />;
      case AchievementType.LOYALTY_TIER:
        if (name.includes('silver')) {
          return <Award className="h-5 w-5 text-neutral-400" />;
        } else if (name.includes('gold')) {
          return <Award className="h-5 w-5 text-yellow-600" />;
        } else if (name.includes('platinum')) {
          return <Award className="h-5 w-5 text-purple-600" />;
        } else if (name.includes('diamond')) {
          return <Gem className="h-5 w-5 text-blue-600" />;
        }
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-neutral-600" />;
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
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center text-neutral-600">
          <p className="font-semibold text-neutral-900 mb-1">Failed to load achievements</p>
          <p className="text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center text-neutral-600">
          <Trophy className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p>No achievements available yet.</p>
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter(a => a.userProgress?.isCompleted);
  const inProgressAchievements = achievements.filter(a => !a.userProgress?.isCompleted);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Achievements</h3>
            </div>
            <div className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
              {completedAchievements.length} / {achievements.length}
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-neutral-600 mb-2">
              <span>Overall Progress</span>
              <span>{completedAchievements.length} / {achievements.length}</span>
            </div>
            <Progress 
              value={(completedAchievements.length / achievements.length) * 100} 
              className="h-2" 
            />
          </div>
        </div>
      </div>

      {/* Completed Achievements */}
      {completedAchievements.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Completed Achievements</h3>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedAchievements.map((achievement) => (
                <div key={achievement.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getAchievementIcon(achievement)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-neutral-900">{achievement.name}</h4>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Coins className="h-3 w-3 text-amber-600" />
                          <span className="text-neutral-700">+{achievement.coinReward}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-purple-600" />
                          <span className="text-neutral-700">+{achievement.xpReward} XP</span>
                        </div>
                      </div>
                      {achievement.userProgress?.completedAt && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Completed {new Date(achievement.userProgress.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-neutral-900">In Progress</h3>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressAchievements.map((achievement) => (
                <div key={achievement.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 opacity-60">
                      {getAchievementIcon(achievement)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-900 mb-1">{achievement.name}</h4>
                      <p className="text-sm text-neutral-600 mb-3">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-neutral-700">
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
                          <Coins className="h-3 w-3 text-amber-600" />
                          <span className="text-neutral-700">+{achievement.coinReward}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-purple-600" />
                          <span className="text-neutral-700">+{achievement.xpReward} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsList;
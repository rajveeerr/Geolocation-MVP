export type StreakInfo = {
  currentStreak: number;
  longestStreak?: number;
  lastCheckInDate?: string;
  currentWeekCheckIns?: number;
  totalCheckIns?: number;
  streakStartDate?: string;
  currentDiscountPercent: number;
  nextWeekDiscountPercent?: number;
  maxDiscountReached?: boolean;
  weeksUntilMaxDiscount?: number;
  maxPossibleDiscount?: number;
};

export type DiscountTier = {
  week: number;
  discountPercent: number;
  description?: string;
};

export type DiscountCalculation = {
  originalAmount: number;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
};

export type StreakApiResponse = {
  success: boolean;
  streak: StreakInfo;
};

export type DiscountTiersResponse = {
  success: boolean;
  tiers: DiscountTier[];
  maxWeeks: number;
  maxDiscount: number;
};

export type LeaderboardEntry = {
  userId: number;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  currentStreak: number;
  longestStreak?: number;
  totalCheckIns?: number;
  currentDiscountPercent: number;
  maxDiscountReached?: boolean;
};

export type StreakLeaderboardResponse = {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  total?: number;
};



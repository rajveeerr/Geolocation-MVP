// Gamification types
export interface GamificationProfile {
  coins: number;
  loyaltyTier: LoyaltyTier;
  totalSpent: number;
  experiencePoints: number;
  coinMultiplier: number;
  progressToNextTier: number;
  nextTier?: LoyaltyTier;
  nextTierThreshold?: number;
  achievements: Achievement[];
}

export interface CoinTransaction {
  id: number;
  type: CoinTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface PaymentTransaction {
  id: number;
  amount: number;
  coinsPurchased: number;
  status: PaymentStatus;
  createdAt: string;
  paypalOrderId?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  type: AchievementType;
  icon?: string;
  coinReward: number;
  xpReward: number;
  criteria: any;
  isActive: boolean;
  userProgress?: {
    progress: any;
    isCompleted: boolean;
    completedAt?: string;
  };
}

export interface CoinPackage {
  coins: number;
  price: number;
  label: string;
}

export interface LoyaltyTierConfig {
  id: number;
  tier: LoyaltyTier;
  minSpent: number;
  coinMultiplier: number;
  discountPercentage: number;
  specialPerks?: any;
  tierColor?: string;
  tierIcon?: string;
}

// Enums
export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND'
}

export enum CoinTransactionType {
  PURCHASE = 'PURCHASE',
  EARNED = 'EARNED',
  SPENT = 'SPENT',
  BONUS = 'BONUS',
  REFUND = 'REFUND'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum AchievementType {
  FIRST_PURCHASE = 'FIRST_PURCHASE',
  SPENDING_MILESTONE = 'SPENDING_MILESTONE',
  CHECK_IN_STREAK = 'CHECK_IN_STREAK',
  REFERRAL_COUNT = 'REFERRAL_COUNT',
  DEAL_SAVER = 'DEAL_SAVER',
  LOYALTY_TIER = 'LOYALTY_TIER',
  SPECIAL_EVENT = 'SPECIAL_EVENT'
}
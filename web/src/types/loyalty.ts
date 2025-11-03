// Loyalty Points types

export type LoyaltyBalance = {
  userId: number;
  merchantId: number;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  lastEarnedAt?: string | null;
  lastRedeemedAt?: string | null;
  merchantName?: string;
  merchantLogo?: string;
  programConfig?: LoyaltyProgramConfig;
};

export type LoyaltyProgramConfig = {
  pointsPerDollar: number; // e.g., 0.4
  minimumPurchase?: number;
  minimumRedemption: number; // e.g., 25
  redemptionValue: number; // e.g., 5.0 ($)
  pointExpirationDays?: number | null;
  allowCombineWithDeals?: boolean;
  earnOnDiscounted?: boolean;
};

export type LoyaltyProgramInfo = {
  merchantId: number;
  merchantName: string;
  isActive: boolean;
  pointsPerDollar: number;
  minimumRedemption: number;
  redemptionValue: number;
  description?: string;
};

export type RedemptionTier = {
  points: number; // 25, 50, ...
  value: number; // $5, $10, ...
  available: boolean;
  pointsNeeded: number; // 0 if available
};

export type RedemptionOptionsResponse = {
  success: boolean;
  currentBalance: number;
  merchantName: string;
  tiers: RedemptionTier[];
};

export type CalculatePointsResponse = {
  success: boolean;
  calculation: {
    orderAmount: number;
    pointsEarned: number;
    pointsPerDollar: number;
    calculation: string;
  };
};

export type CalculateRedemptionResponse = {
  success: boolean;
  calculation: {
    pointsToRedeem: number;
    discountValue: number;
    remainingPoints: number;
    calculation: string;
  };
};

export type ValidateRedemptionResponse = {
  success: boolean;
  validation: {
    valid: boolean;
    availablePoints: number;
    discountValue: number;
    error?: string;
  };
};

export type LoyaltyTransactionType =
  | 'EARNED'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'ADJUSTED'
  | 'BONUS'
  | 'REFUNDED';

export type LoyaltyTransaction = {
  id: number;
  type: LoyaltyTransactionType;
  points: number; // positive for EARNED/BONUS, negative for REDEEMED/ADJUSTED
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  order?: {
    id: number;
    orderNumber: string;
    finalAmount: number;
  };
};

export type LoyaltyTransactionsResponse = {
  success: boolean;
  transactions: LoyaltyTransaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type LoyaltyBalancesResponse = {
  success: boolean;
  balances: Array<Pick<LoyaltyBalance, 'currentBalance' | 'lifetimeEarned' | 'lifetimeRedeemed' | 'merchantId'> & {
    merchantName: string;
    merchantLogo?: string;
  }>;
  total: number;
  totalPoints: number;
};

export type LoyaltyBalanceResponse = {
  success: boolean;
  balance: LoyaltyBalance;
};

export type LoyaltyProgramResponse = {
  success: boolean;
  program: LoyaltyProgramInfo;
};

// Merchant analytics and customers
export type LoyaltyAnalytics = {
  program: {
    isActive: boolean;
    pointsPerDollar: number;
    minimumRedemption: number;
    redemptionValue: number;
  };
  users: { total: number; active: number; inactivePercent: string };
  points: { issued: number; redeemed: number; outstanding: number };
  discounts: { totalValue: number; averagePerRedemption: number };
  recentRedemptions: any[];
};

export type LoyaltyAnalyticsResponse = {
  success: boolean;
  analytics: LoyaltyAnalytics;
};

export type LoyaltyCustomer = {
  userId: number;
  userName: string;
  userEmail: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  lastEarnedAt?: string | null;
};

export type LoyaltyCustomersResponse = {
  success: boolean;
  customers: LoyaltyCustomer[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type AdjustPointsPayload = {
  userId: number;
  points: number;
  reason: string;
  type: 'BONUS' | 'ADJUSTED' | 'REFUNDED';
};

export type AdjustPointsResponse = {
  success: boolean;
  adjustment: {
    points: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
  };
  message: string;
};

export type CancelRedemptionPayload = {
  redemptionId: number;
  reason: string;
};

export type CancelRedemptionResponse = {
  success: boolean;
  pointsRefunded: number;
  balanceBefore: number;
  balanceAfter: number;
  message: string;
};



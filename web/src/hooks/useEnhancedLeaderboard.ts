import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

// Enhanced Leaderboard Types

// Global Leaderboard - Updated to match backend response
export interface GlobalLeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  email: string;
  avatarUrl?: string;
  totalPoints: number;
  periodPoints: number;
  monthlyPoints: number;
  eventCount: number;
  checkInCount: number;
  uniqueDealsCheckedIn: number;
  memberSince: string;
  inTop: boolean;
}

export interface GlobalLeaderboardStats {
  totalUsers: number;
  activeUsers: number;
  avgPointsPerUser: number;
  maxPoints: number;
  minPoints: number;
  totalPointsEarned: number;
  totalCheckIns: number;
  uniqueDealsUsed: number;
  distribution: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export interface GlobalLeaderboardResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  leaderboard: GlobalLeaderboardEntry[];
  personalPosition?: {
    rank: number;
    totalPoints: number;
    periodPoints: number;
    monthlyPoints: number;
    eventCount: number;
    checkInCount: number;
    uniqueDealsCheckedIn: number;
    memberSince: string;
    inTop: boolean;
  };
  globalStats?: GlobalLeaderboardStats;
  metadata: {
    totalShown: number;
    limit: number;
    includeSelf: boolean;
    includeStats: boolean;
    queryTime: number;
  };
}

// City Leaderboard - Updated to match backend response
export interface CityLeaderboardEntry {
  rank: number;
  cityId: number;
  cityName: string;
  state: string;
  country: string;
  active: boolean;
  totalPoints: number;
  totalUsers: number;
  totalCheckIns: number;
  totalDealSaves: number;
  averagePointsPerUser: number;
  averageCheckInsPerUser: number;
  averageDealSavesPerUser: number;
  topPerformer: {
    userId: number;
    name: string;
    totalPoints: number;
  };
}

export interface CityLeaderboardResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  entries: CityLeaderboardEntry[];
  metadata: {
    totalShown: number;
    limit: number;
    includeInactive: boolean;
    queryTime: number;
  };
}


// City Comparison Leaderboard - Updated to match backend response
export interface CityComparisonEntry {
  rank: number;
  cityId: number;
  cityName: string;
  state: string;
  country: string;
  active: boolean;
  totalPoints: number;
  totalUsers: number;
  totalCheckIns: number;
  totalDealSaves: number;
  averagePointsPerUser: number;
  averageCheckInsPerUser: number;
  averageDealSavesPerUser: number;
  topPerformer: {
    userId: number;
    name: string;
    totalPoints: number;
  };
}

export interface CityComparisonResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  entries: CityComparisonEntry[];
  metadata: {
    totalShown: number;
    limit: number;
    includeInactive: boolean;
    queryTime: number;
  };
}

// Analytics Types - Updated to match backend response
export interface LeaderboardAnalytics {
  summary: {
    totalUsers: number;
    activeUsers: number;
    avgPointsPerUser: number;
    maxPoints: number;
    minPoints: number;
    totalPointsEarned: number;
    totalCheckIns: number;
    uniqueDealsUsed: number;
  };
  distribution: Array<{
    pointRange: string;
    userCount: number;
  }>;
  trends: Array<{
    date: string;
    activeUsers: number;
    totalEvents: number;
    totalPointsEarned: number;
    totalCheckIns: number;
    avgActiveUsers7d: number;
    avgPointsEarned7d: number;
  }>;
}

export interface LeaderboardAnalyticsResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  cityId: number | null;
  analytics: LeaderboardAnalytics;
  metadata: {
    includeDistribution: boolean;
    includeTrends: boolean;
    queryTime: number;
  };
}

// Insights Types - Updated to match backend response
export interface LeaderboardInsights {
  engagementSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    averagePoints: number;
  }>;
  topPerformers: Array<{
    id: number;
    name: string;
    avatarUrl?: string;
    periodPoints: number;
    uniqueMerchantsVisited: number;
    uniqueDealsCheckedIn: number;
    rank: number;
  }>;
}

export interface LeaderboardInsightsResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  cityId: number | null;
  insights: LeaderboardInsights;
  metadata: {
    includePredictions: boolean;
    queryTime: number;
  };
}

// Category Leaderboard
export interface CategoryLeaderboardEntry {
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
    city?: {
      id: number;
      name: string;
    };
  };
  totalPoints: number;
  totalCheckIns: number;
  totalDealSaves: number;
  totalKickbackEvents: number;
  totalSpent: number;
  totalEarned: number;
  rank: number;
  rankChange: number;
  isCurrentUser: boolean;
  stats: {
    averageTransactionValue: number;
    favoriteMerchant: {
      id: number;
      name: string;
    };
    streak: number;
    level: number;
  };
}

export interface CategoryLeaderboardStats {
  category: {
    id: number;
    name: string;
    icon: string;
  };
  totalUsers: number;
  totalPoints: number;
  totalCheckIns: number;
  totalDealSaves: number;
  totalKickbackEvents: number;
  totalSpent: number;
  totalEarned: number;
  averagePointsPerUser: number;
  averageCheckInsPerUser: number;
  averageDealSavesPerUser: number;
  averageKickbackEventsPerUser: number;
  averageSpentPerUser: number;
  averageEarnedPerUser: number;
  topPerformingCity: {
    id: number;
    name: string;
    totalPoints: number;
    totalUsers: number;
  };
  topPerformingMerchant: {
    id: number;
    name: string;
    totalPoints: number;
    totalUsers: number;
  };
}

export interface CategoryLeaderboardResponse {
  period: string;
  category: {
    id: number;
    name: string;
    icon: string;
  };
  entries: CategoryLeaderboardEntry[];
  stats: CategoryLeaderboardStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  currentUserRank?: {
    rank: number;
    totalPoints: number;
    totalCheckIns: number;
    totalDealSaves: number;
    totalKickbackEvents: number;
    totalSpent: number;
    totalEarned: number;
    rankChange: number;
  };
}

// Analytics
export interface PointDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface CategoryDistribution {
  category: {
    id: number;
    name: string;
    icon: string;
  };
  totalPoints: number;
  totalUsers: number;
  percentage: number;
}

export interface CityDistribution {
  city: {
    id: number;
    name: string;
  };
  totalPoints: number;
  totalUsers: number;
  percentage: number;
}

export interface MerchantDistribution {
  merchant: {
    id: number;
    name: string;
  };
  totalPoints: number;
  totalUsers: number;
  percentage: number;
}

export interface AnalyticsResponse {
  period: string;
  pointDistribution: PointDistribution[];
  categoryDistribution: CategoryDistribution[];
  cityDistribution: CityDistribution[];
  merchantDistribution: MerchantDistribution[];
  summary: {
    totalUsers: number;
    totalPoints: number;
    averagePointsPerUser: number;
    medianPointsPerUser: number;
    top10PercentPoints: number;
    bottom10PercentPoints: number;
  };
}

// Insights
export interface TrendData {
  date: string;
  value: number;
}

export interface UserSegment {
  segment: string;
  count: number;
  percentage: number;
  averagePoints: number;
  averageCheckIns: number;
  averageDealSaves: number;
  averageKickbackEvents: number;
  averageSpent: number;
  averageEarned: number;
}

export interface EngagementPattern {
  pattern: string;
  count: number;
  percentage: number;
  description: string;
}

export interface InsightsResponse {
  period: string;
  trends: {
    totalPoints: TrendData[];
    totalCheckIns: TrendData[];
    totalDealSaves: TrendData[];
    totalKickbackEvents: TrendData[];
    totalSpent: TrendData[];
    totalEarned: TrendData[];
  };
  userSegments: UserSegment[];
  engagementPatterns: EngagementPattern[];
  insights: {
    topInsight: string;
    growthInsight: string;
    engagementInsight: string;
    recommendation: string;
  };
}

// Hooks for Enhanced Leaderboard

export const useGlobalLeaderboard = (options?: {
  period?: string;
  limit?: number;
  includeSelf?: boolean;
  includeStats?: boolean;
  page?: number;
}) => {
  const {
    period = 'last_30_days',
    limit = 50,
    includeSelf = true,
    includeStats = true,
    page = 1,
  } = options || {};

  return useQuery<GlobalLeaderboardResponse>({
    queryKey: ['globalLeaderboard', period, limit, includeSelf, includeStats, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        includeSelf: includeSelf.toString(),
        includeStats: includeStats.toString(),
        page: page.toString(),
      });

      const res = await apiGet<GlobalLeaderboardResponse>(`/leaderboard/global?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch global leaderboard');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useCityLeaderboard = (cityId: number, options?: {
  period?: string;
  limit?: number;
  includeSelf?: boolean;
  includeStats?: boolean;
  page?: number;
}) => {
  const {
    period = 'last_30_days',
    limit = 50,
    includeSelf = true,
    includeStats = true,
    page = 1,
  } = options || {};

  return useQuery<CityLeaderboardResponse>({
    queryKey: ['cityLeaderboard', cityId, period, limit, includeSelf, includeStats, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        includeSelf: includeSelf.toString(),
        includeStats: includeStats.toString(),
        page: page.toString(),
      });

      const res = await apiGet<CityLeaderboardResponse>(`/leaderboard/cities/${cityId}?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch city leaderboard');
      }
      return res.data;
    },
    enabled: !!cityId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useCityComparisonLeaderboard = (options?: {
  period?: string;
  limit?: number;
  page?: number;
}) => {
  const { period = 'last_30_days', limit = 50, page = 1 } = options || {};

  return useQuery<CityComparisonResponse>({
    queryKey: ['cityComparisonLeaderboard', period, limit, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        page: page.toString(),
      });

      const res = await apiGet<CityComparisonResponse>(`/leaderboard/cities?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch city comparison leaderboard');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useCategoryLeaderboard = (categoryId: number, options?: {
  period?: string;
  limit?: number;
  includeSelf?: boolean;
  includeStats?: boolean;
  page?: number;
}) => {
  const {
    period = 'last_30_days',
    limit = 50,
    includeSelf = true,
    includeStats = true,
    page = 1,
  } = options || {};

  return useQuery<CategoryLeaderboardResponse>({
    queryKey: ['categoryLeaderboard', categoryId, period, limit, includeSelf, includeStats, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
        includeSelf: includeSelf.toString(),
        includeStats: includeStats.toString(),
        page: page.toString(),
      });

      const res = await apiGet<CategoryLeaderboardResponse>(`/leaderboard/categories?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch category leaderboard');
      }
      return res.data;
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useLeaderboardAnalytics = (options?: {
  period?: string;
  cityId?: number;
}) => {
  const { period = 'last_30_days', cityId } = options || {};

  return useQuery<LeaderboardAnalyticsResponse>({
    queryKey: ['leaderboardAnalytics', period, cityId],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (cityId) params.append('cityId', cityId.toString());

      const res = await apiGet<LeaderboardAnalyticsResponse>(`/leaderboard/analytics?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch leaderboard analytics');
      }
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useLeaderboardInsights = (options?: {
  period?: string;
  cityId?: number;
}) => {
  const { period = 'last_30_days', cityId } = options || {};

  return useQuery<LeaderboardInsightsResponse>({
    queryKey: ['leaderboardInsights', period, cityId],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (cityId) params.append('cityId', cityId.toString());

      const res = await apiGet<LeaderboardInsightsResponse>(`/leaderboard/insights?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch leaderboard insights');
      }
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};
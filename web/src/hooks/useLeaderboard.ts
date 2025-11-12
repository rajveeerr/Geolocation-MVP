import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

interface PointBreakdown {
  eventType: string;
  eventTypeName: string;
  points: number;
  count: number;
}

interface LeaderboardRowData {
  rank: number;
  userId: number;
  name: string | null;
  email?: string;
  avatarUrl?: string;
  points: number;
  periodPoints?: number;
  monthlyPoints?: number;
}

interface LeaderboardResponse {
  top: LeaderboardRowData[];
  me?: LeaderboardRowData & { inTop: boolean };
  pointBreakdowns?: Record<string, PointBreakdown[]>;
  pagination?: {
    defaultLimit: number;
    currentLimit: number;
    showMore: boolean;
    hasMore: boolean;
  };
}

// Legacy hook for backward compatibility
export const useLeaderboard = (options?: {
  period?: string;
  limit?: number;
  showMore?: boolean;
  includeBreakdown?: boolean;
}) => {
  const {
    period = 'month',
    limit,
    showMore = true,
    includeBreakdown = false,
  } = options || {};

  return useQuery<LeaderboardResponse | null, Error>({
    queryKey: ['leaderboard', period, limit, showMore, includeBreakdown],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        includeSelf: 'true',
        showMore: showMore.toString(),
      });
      
      if (limit) params.append('limit', limit.toString());
      if (includeBreakdown) params.append('includeBreakdown', 'true');

      const response = await apiGet<LeaderboardResponse>(
        `/leaderboard?${params.toString()}`,
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Global Leaderboard with advanced options
export const useGlobalLeaderboardBasic = (options?: {
  period?: string;
  showMore?: boolean;
  includeStats?: boolean;
  includeBreakdown?: boolean;
  limit?: number;
}) => {
  const {
    period = 'this_month',
    showMore = false,
    includeStats = false,
    includeBreakdown = false,
    limit,
  } = options || {};

  return useQuery<LeaderboardResponse | null, Error>({
    queryKey: ['leaderboard', 'global', period, showMore, includeStats, includeBreakdown, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        showMore: showMore.toString(),
        includeStats: includeStats.toString(),
      });
      
      if (limit) params.append('limit', limit.toString());
      if (includeBreakdown) params.append('includeBreakdown', 'true');

      const response = await apiGet<LeaderboardResponse>(
        `/leaderboard/global?${params.toString()}`,
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// City-specific leaderboard
export const useCityLeaderboardBasic = (cityId: number, options?: {
  period?: string;
  showMore?: boolean;
  includeBreakdown?: boolean;
  limit?: number;
}) => {
  const {
    period = 'last_7_days',
    showMore = false,
    includeBreakdown = false,
    limit,
  } = options || {};

  return useQuery<LeaderboardResponse | null, Error>({
    queryKey: ['leaderboard', 'city', cityId, period, showMore, includeBreakdown, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        showMore: showMore.toString(),
      });
      
      if (limit) params.append('limit', limit.toString());
      if (includeBreakdown) params.append('includeBreakdown', 'true');

      const response = await apiGet<LeaderboardResponse>(
        `/leaderboard/city/${cityId}?${params.toString()}`,
      );
      return response.data;
    },
    enabled: !!cityId,
    staleTime: 5 * 60 * 1000,
  });
};

// Categories leaderboard
export interface CategoryLeaderboardResponse extends LeaderboardResponse {
  categories?: Array<{
    categoryId: number;
    categoryName: string;
    top: LeaderboardRowData[];
    pointBreakdowns?: Record<string, PointBreakdown[]>;
  }>;
}

export const useCategoriesLeaderboard = (options?: {
  period?: string;
  showMore?: boolean;
  includeBreakdown?: boolean;
  limit?: number;
}) => {
  const {
    period = 'this_month',
    showMore = false,
    includeBreakdown = false,
    limit,
  } = options || {};

  return useQuery<CategoryLeaderboardResponse | null, Error>({
    queryKey: ['leaderboard', 'categories', period, showMore, includeBreakdown, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        showMore: showMore.toString(),
      });
      
      if (limit) params.append('limit', limit.toString());
      if (includeBreakdown) params.append('includeBreakdown', 'true');

      const response = await apiGet<CategoryLeaderboardResponse>(
        `/leaderboard/categories?${params.toString()}`,
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Leaderboard insights
export interface LeaderboardInsightsData {
  topGrowth: Array<{
    userId: number;
    name: string;
    pointsGained: number;
    percentageChange: number;
  }>;
  topEngagement: Array<{
    userId: number;
    name: string;
    engagementScore: number;
    checkIns: number;
  }>;
  trends: {
    daily: Array<{ date: string; totalPoints: number; activeUsers: number }>;
    weekly: Array<{ week: string; totalPoints: number; activeUsers: number }>;
  };
}

export const useLeaderboardInsightsBasic = (options?: {
  period?: string;
  includeBreakdown?: boolean;
}) => {
  const {
    period = 'last_30_days',
    includeBreakdown = false,
  } = options || {};

  return useQuery<LeaderboardInsightsData | null, Error>({
    queryKey: ['leaderboard', 'insights', period, includeBreakdown],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      
      if (includeBreakdown) params.append('includeBreakdown', 'true');

      const response = await apiGet<LeaderboardInsightsData>(
        `/leaderboard/insights?${params.toString()}`,
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Re-export enhanced leaderboard hooks for easy access
export { 
  useGlobalLeaderboard,
  useCityLeaderboard,
  useCityComparisonLeaderboard,
  useCategoryLeaderboard,
  useLeaderboardAnalytics,
  useLeaderboardInsights
} from './useEnhancedLeaderboard';

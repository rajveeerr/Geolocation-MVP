import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

// Enhanced Merchant Dashboard Analytics Types

// Deal Performance Analytics
export interface DealPerformance {
  id: number;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
    icon: string;
  };
  dealType: {
    id: number;
    name: string;
  };
  isActive: boolean;
  kickbackEnabled: boolean;
  performance: {
    checkIns: number;
    saves: number;
    kickbackEvents: number;
    uniqueUsers: number;
    returningUsers: number;
    conversionRates: {
      saveToCheckIn: number;
      checkInToKickback: number;
    };
  };
  timeSeries: {
    date: string;
    checkIns: number;
    saves: number;
    revenue: number;
    kickbackEarnings: number;
  }[];
  menuItems: {
    id: number;
    name: string;
    price: number;
    category: string;
    isHidden: boolean;
  }[];
}

export interface DealPerformanceResponse {
  period: string;
  deals: DealPerformance[];
  summary: {
    totalDeals: number;
    activeDeals: number;
    totalCheckIns: number;
    totalSaves: number;
    totalKickbackEvents: number;
    averageSaveToCheckInRate: number;
  };
}

// Customer Insights Analytics
export interface CustomerOverview {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
}

export interface ActivityLevels {
  high: number;
  medium: number;
  low: number;
}

export interface TopCustomer {
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
    createdAt: string;
  };
  totalSpent: number;
  totalEarned: number;
  kickbackEvents: number;
}

export interface ReferralEngagement {
  customer: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  referrer: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  checkIns: number;
  savedDeals: number;
}

export interface ActivityPatterns {
  hourlyDistribution: number[];
  peakHours: {
    hour: number;
    count: number;
  }[];
}

export interface CustomerInsightsResponse {
  period: string;
  customerOverview: CustomerOverview;
  activityLevels: ActivityLevels;
  customerValue: {
    averageCustomerValue: number;
    topCustomers: TopCustomer[];
  };
  referralInsights: {
    referredCustomers: number;
    referralEngagement: ReferralEngagement[];
  };
  activityPatterns: ActivityPatterns;
}

// Revenue Analytics
export interface RevenueSummary {
  totalRevenue: number;
  totalKickbackPaid: number;
  totalTransactions: number;
  averageTransactionValue: number;
  kickbackRate: number;
}

export interface RevenueByCategory {
  category: {
    name: string;
    icon: string;
  };
  revenue: number;
  kickbackPaid: number;
  transactions: number;
}

export interface RevenueByDealType {
  dealType: string;
  revenue: number;
  kickbackPaid: number;
  transactions: number;
}

export interface TopDeal {
  deal: {
    id: number;
    title: string;
    category: {
      name: string;
      icon: string;
    };
    dealType: {
      name: string;
    };
  };
  revenue: number;
  kickbackPaid: number;
  transactions: number;
  uniqueCustomers: number;
}

export interface DailyTrend {
  date: string;
  revenue: number;
  kickbackPaid: number;
  transactions: number;
}

export interface RevenueAnalyticsResponse {
  period: string;
  summary: RevenueSummary;
  revenueByCategory: RevenueByCategory[];
  revenueByDealType: RevenueByDealType[];
  topDeals: TopDeal[];
  dailyTrends: DailyTrend[];
}

// Engagement Metrics
export interface FunnelMetrics {
  totalDealViews: number;
  totalDealSaves: number;
  totalCheckIns: number;
  totalKickbackEvents: number;
  conversionRates: {
    saveRate: number;
    checkInRate: number;
    kickbackRate: number;
  };
}

export interface UserEngagement {
  totalEngagedUsers: number;
  engagementLevels: {
    high: number;
    medium: number;
    low: number;
  };
  customerRetentionRate: number;
  averageEngagementPerUser: number;
}

export interface DailyEngagement {
  date: string;
  saves: number;
  checkIns: number;
  kickbackEvents: number;
  engagementScore: number;
}

export interface TopEngagingDeal {
  id: number;
  title: string;
  category: {
    name: string;
    icon: string;
  };
  engagementScore: number;
  saves: number;
  checkIns: number;
  kickbackEvents: number;
}

export interface EngagementMetricsResponse {
  period: string;
  funnelMetrics: FunnelMetrics;
  userEngagement: UserEngagement;
  dailyEngagement: DailyEngagement[];
  topEngagingDeals: TopEngagingDeal[];
}

// Performance Comparison
export interface PerformanceMetrics {
  checkIns: number;
  dealSaves: number;
  grossSales: number;
  kickbackPaid: number;
  uniqueUsers: number;
  activeDeals?: number;
}

export interface PerformanceChanges {
  checkIns: number;
  dealSaves: number;
  grossSales: number;
  kickbackPaid: number;
  uniqueUsers: number;
  activeDeals?: number;
}

export interface PerformanceTrends {
  checkIns: 'up' | 'down';
  dealSaves: 'up' | 'down';
  grossSales: 'up' | 'down';
  kickbackPaid: 'up' | 'down';
  uniqueUsers: 'up' | 'down';
  activeDeals?: 'up' | 'down';
}

export interface DateRange {
  from: string;
  to: string;
}

export interface TimeSeriesData {
  period: 'current' | 'compare';
  date: string;
  checkIns: number;
  dealSaves: number;
  grossSales: number;
}

export interface PerformanceComparisonResponse {
  currentPeriod: string;
  comparePeriod: string;
  customDates: boolean;
  currentMetrics: PerformanceMetrics;
  compareMetrics: PerformanceMetrics;
  changes: PerformanceChanges;
  trends: PerformanceTrends;
  dateRanges: {
    current: DateRange;
    compare: DateRange;
  };
  timeSeriesData: TimeSeriesData[];
  filters: {
    metrics: string;
    granularity: string;
    groupBy: string;
  };
  summary: {
    totalDaysCurrent: number;
    totalDaysCompare: number;
    periodDifference: number;
  };
}

// Hooks for Enhanced Merchant Analytics

export const useMerchantDealPerformance = (options?: {
  period?: string;
  dealId?: number;
  limit?: number;
}) => {
  const { period = 'last_30_days', dealId, limit = 10 } = options || {};

  return useQuery<DealPerformanceResponse>({
    queryKey: ['merchantDealPerformance', period, dealId, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        period,
        limit: limit.toString(),
      });
      if (dealId) params.append('dealId', dealId.toString());

      const res = await apiGet<DealPerformanceResponse>(`/merchants/dashboard/deal-performance?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch deal performance');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useMerchantCustomerInsights = (options?: {
  period?: string;
}) => {
  const { period = 'last_30_days' } = options || {};

  return useQuery<CustomerInsightsResponse>({
    queryKey: ['merchantCustomerInsights', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });

      const res = await apiGet<CustomerInsightsResponse>(`/merchants/dashboard/customer-insights?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch customer insights');
      }
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useMerchantRevenueAnalytics = (options?: {
  period?: string;
}) => {
  const { period = 'last_30_days' } = options || {};

  return useQuery<RevenueAnalyticsResponse>({
    queryKey: ['merchantRevenueAnalytics', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });

      const res = await apiGet<RevenueAnalyticsResponse>(`/merchants/dashboard/revenue-analytics?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch revenue analytics');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useMerchantEngagementMetrics = (options?: {
  period?: string;
}) => {
  const { period = 'last_30_days' } = options || {};

  return useQuery<EngagementMetricsResponse>({
    queryKey: ['merchantEngagementMetrics', period],
    queryFn: async () => {
      const params = new URLSearchParams({ period });

      const res = await apiGet<EngagementMetricsResponse>(`/merchants/dashboard/engagement-metrics?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch engagement metrics');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useMerchantPerformanceComparison = (options?: {
  currentPeriod?: string;
  comparePeriod?: string;
  currentFrom?: string;
  currentTo?: string;
  compareFrom?: string;
  compareTo?: string;
  metrics?: string;
  granularity?: string;
  groupBy?: string;
}) => {
  const {
    currentPeriod = 'last_30_days',
    comparePeriod = 'previous_30_days',
    currentFrom,
    currentTo,
    compareFrom,
    compareTo,
    metrics = 'all',
    granularity = 'day',
    groupBy = 'date',
  } = options || {};

  return useQuery<PerformanceComparisonResponse>({
    queryKey: [
      'merchantPerformanceComparison',
      currentPeriod,
      comparePeriod,
      currentFrom,
      currentTo,
      compareFrom,
      compareTo,
      metrics,
      granularity,
      groupBy,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        currentPeriod,
        comparePeriod,
        metrics,
        granularity,
        groupBy,
      });

      if (currentFrom) params.append('currentFrom', currentFrom);
      if (currentTo) params.append('currentTo', currentTo);
      if (compareFrom) params.append('compareFrom', compareFrom);
      if (compareTo) params.append('compareTo', compareTo);

      const res = await apiGet<PerformanceComparisonResponse>(`/merchants/dashboard/performance-comparison-custom?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch performance comparison');
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

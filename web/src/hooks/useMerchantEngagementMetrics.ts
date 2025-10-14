import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface EngagementMetrics {
  funnelMetrics: {
    totalViews: number;
    totalSaves: number;
    totalCheckIns: number;
    totalKickbackEvents: number;
    conversionRates: {
      viewToSave: number;
      saveToCheckIn: number;
      checkInToKickback: number;
    };
  };
  engagementLevels: {
    high: number;
    medium: number;
    low: number;
  };
  userBehavior: {
    averageSessionDuration: number;
    averageDealsPerUser: number;
    averageCheckInsPerUser: number;
    repeatCustomerRate: number;
  };
  timeBasedEngagement: {
    period: string;
    views: number;
    saves: number;
    checkIns: number;
    kickbackEvents: number;
  }[];
  topEngagingDeals: {
    dealId: number;
    title: string;
    views: number;
    saves: number;
    checkIns: number;
    engagementRate: number;
  }[];
}

export interface MerchantEngagementMetricsResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  metrics: EngagementMetrics;
}

interface UseMerchantEngagementMetricsParams {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year';
}

export const useMerchantEngagementMetrics = (params: UseMerchantEngagementMetricsParams = {}) => {
  const { period = 'last_30_days' } = params;

  return useQuery<MerchantEngagementMetricsResponse, Error>({
    queryKey: ['merchant-engagement-metrics', period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);

      const response = await apiGet<MerchantEngagementMetricsResponse>(
        `/merchants/dashboard/engagement-metrics?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant engagement metrics');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

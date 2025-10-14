import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

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
}

export interface MerchantDealPerformanceResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  deals: DealPerformance[];
  summary: {
    totalDeals: number;
    activeDeals: number;
    totalCheckIns: number;
    totalSaves: number;
    totalRevenue: number;
    totalKickbackEarnings: number;
    averageConversionRate: number;
  };
}

interface UseMerchantDealPerformanceParams {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year';
  dealId?: number;
  limit?: number;
}

export const useMerchantDealPerformance = (params: UseMerchantDealPerformanceParams = {}) => {
  const { period = 'last_30_days', dealId, limit = 10 } = params;

  return useQuery<MerchantDealPerformanceResponse, Error>({
    queryKey: ['merchant-deal-performance', period, dealId, limit],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);
      if (dealId) searchParams.append('dealId', dealId.toString());
      if (limit) searchParams.append('limit', limit.toString());

      const response = await apiGet<MerchantDealPerformanceResponse>(
        `/merchants/dashboard/deal-performance?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant deal performance');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

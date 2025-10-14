import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface PerformanceComparison {
  currentPeriod: {
    period: string;
    metrics: {
      grossSales: number;
      orderVolume: number;
      averageOrderValue: number;
      totalCustomers: number;
      activeDeals: number;
      kickbackEarnings: number;
    };
  };
  previousPeriod: {
    period: string;
    metrics: {
      grossSales: number;
      orderVolume: number;
      averageOrderValue: number;
      totalCustomers: number;
      activeDeals: number;
      kickbackEarnings: number;
    };
  };
  comparisons: {
    grossSales: {
      change: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'stable';
    };
    orderVolume: {
      change: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'stable';
    };
    averageOrderValue: {
      change: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'stable';
    };
    totalCustomers: {
      change: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'stable';
    };
    activeDeals: {
      change: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'stable';
    };
    kickbackEarnings: {
      change: number;
      percentageChange: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  trends: {
    period: string;
    grossSales: number;
    orderVolume: number;
    averageOrderValue: number;
  }[];
}

export interface MerchantPerformanceComparisonResponse {
  success: boolean;
  currentPeriod: string;
  previousPeriod: string;
  comparison: PerformanceComparison;
}

interface UseMerchantPerformanceComparisonParams {
  currentPeriod?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year';
  previousPeriod?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year';
}

export const useMerchantPerformanceComparison = (params: UseMerchantPerformanceComparisonParams = {}) => {
  const { currentPeriod = 'last_30_days', previousPeriod = 'last_30_days' } = params;

  return useQuery<MerchantPerformanceComparisonResponse, Error>({
    queryKey: ['merchant-performance-comparison', currentPeriod, previousPeriod],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('currentPeriod', currentPeriod);
      searchParams.append('previousPeriod', previousPeriod);

      const response = await apiGet<MerchantPerformanceComparisonResponse>(
        `/merchants/dashboard/performance-comparison?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant performance comparison');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface MerchantCityPerformance {
  cityId: number;
  cityName: string;
  stores: {
    id: number;
    address: string;
    active: boolean;
    performance: {
      grossSales: number;
      orderVolume: number;
      averageOrderValue: number;
      activeDeals: number;
      kickbackEarnings: number;
    };
  }[];
  totalPerformance: {
    grossSales: number;
    orderVolume: number;
    averageOrderValue: number;
    activeDeals: number;
    kickbackEarnings: number;
  };
}

export interface MerchantCityPerformanceResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  cities: MerchantCityPerformance[];
}

interface UseMerchantCityPerformanceParams {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year';
}

export const useMerchantCityPerformance = (params: UseMerchantCityPerformanceParams = {}) => {
  const { period = 'last_30_days' } = params;

  return useQuery<MerchantCityPerformanceResponse, Error>({
    queryKey: ['merchant-city-performance', period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);

      const response = await apiGet<MerchantCityPerformanceResponse>(
        `/merchants/dashboard/city-performance?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant city performance');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

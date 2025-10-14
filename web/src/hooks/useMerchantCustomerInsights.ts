import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface CustomerInsights {
  customerOverview: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
  };
  activityLevels: {
    high: number;
    medium: number;
    low: number;
  };
  customerSegments: {
    segment: string;
    count: number;
    percentage: number;
    averageSpend: number;
    averagePoints: number;
  }[];
  topCustomers: {
    id: number;
    name: string;
    email: string;
    totalSpend: number;
    totalPoints: number;
    lastActive: string;
    checkInCount: number;
  }[];
  customerBehavior: {
    averageSessionDuration: number;
    averageDealsPerCustomer: number;
    mostPopularCategories: {
      category: string;
      count: number;
      percentage: number;
    }[];
  };
}

export interface MerchantCustomerInsightsResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  insights: CustomerInsights;
}

interface UseMerchantCustomerInsightsParams {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year';
}

export const useMerchantCustomerInsights = (params: UseMerchantCustomerInsightsParams = {}) => {
  const { period = 'last_30_days' } = params;

  return useQuery<MerchantCustomerInsightsResponse, Error>({
    queryKey: ['merchant-customer-insights', period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);

      const response = await apiGet<MerchantCustomerInsightsResponse>(
        `/merchants/dashboard/customer-insights?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant customer insights');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

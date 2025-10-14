import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminCustomerAnalytics {
  id: number;
  name: string;
  email: string;
  points: number;
  totalSpend: number;
  checkIns: number;
  lastActive: string;
  location: string;
}

export interface AdminCustomerAnalyticsResponse {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  overview: {
    totalCustomers: number;
    newCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    engagementRate: string;
  };
  topCustomers: AdminCustomerAnalytics[];
}

interface UseAdminCustomerAnalyticsParams {
  period?: '1d' | '7d' | '30d' | '90d';
  cityId?: number;
}

export const useAdminCustomerAnalytics = (params: UseAdminCustomerAnalyticsParams = {}) => {
  const { period = '7d', cityId } = params;

  return useQuery<AdminCustomerAnalyticsResponse, Error>({
    queryKey: ['admin-customer-analytics', period, cityId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);
      if (cityId) {
        searchParams.append('cityId', cityId.toString());
      }

      const response = await apiGet<AdminCustomerAnalyticsResponse>(
        `/admin/customers/analytics?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch customer analytics');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    // Backend API is now working
    enabled: true,
  });
};

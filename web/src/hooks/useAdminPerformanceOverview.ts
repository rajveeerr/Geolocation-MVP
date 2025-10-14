import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminPerformanceMetrics {
  grossSales: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  orderVolume: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  averageOrderValue: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  totalApprovedMerchants: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface AdminPerformanceOverview {
  success: boolean;
  period: string;
  dateRange: {
    from: string;
    to: string;
  };
  metrics: AdminPerformanceMetrics;
  filters: {
    cityId: number | null;
    merchantId: number | null;
  };
}

interface UseAdminPerformanceOverviewParams {
  period?: '1d' | '7d' | '30d' | '90d';
  cityId?: number;
  merchantId?: number;
}

export const useAdminPerformanceOverview = (params: UseAdminPerformanceOverviewParams = {}) => {
  const { period = '7d', cityId, merchantId } = params;

  return useQuery<AdminPerformanceOverview, Error>({
    queryKey: ['admin-performance-overview', period, cityId, merchantId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);
      if (cityId) searchParams.append('cityId', cityId.toString());
      if (merchantId) searchParams.append('merchantId', merchantId.toString());

      const response = await apiGet<AdminPerformanceOverview>(
        `/admin/performance/overview?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin performance overview');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

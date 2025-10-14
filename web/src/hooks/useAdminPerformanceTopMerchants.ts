import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminTopMerchant {
  id: number;
  name: string;
  description: string;
  logoUrl: string | null;
  revenue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AdminPerformanceTopMerchants {
  success: boolean;
  period: string;
  merchants: AdminTopMerchant[];
}

interface UseAdminPerformanceTopMerchantsParams {
  limit?: number;
  period?: '1d' | '7d' | '30d';
}

export const useAdminPerformanceTopMerchants = (params: UseAdminPerformanceTopMerchantsParams = {}) => {
  const { limit = 10, period = '7d' } = params;

  return useQuery<AdminPerformanceTopMerchants, Error>({
    queryKey: ['admin-performance-top-merchants', limit, period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('limit', limit.toString());
      searchParams.append('period', period);

      const response = await apiGet<AdminPerformanceTopMerchants>(
        `/admin/performance/top-merchants?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin performance top merchants');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

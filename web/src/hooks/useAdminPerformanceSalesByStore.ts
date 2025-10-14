import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminStoreSales {
  id: number;
  name: string;
  city: string;
  sales: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AdminPerformanceSalesByStore {
  success: boolean;
  period: string;
  stores: AdminStoreSales[];
}

interface UseAdminPerformanceSalesByStoreParams {
  cityId?: number;
  limit?: number;
  period?: '1d' | '7d' | '30d';
}

export const useAdminPerformanceSalesByStore = (params: UseAdminPerformanceSalesByStoreParams = {}) => {
  const { cityId, limit = 10, period = '7d' } = params;

  return useQuery<AdminPerformanceSalesByStore, Error>({
    queryKey: ['admin-performance-sales-by-store', cityId, limit, period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('limit', limit.toString());
      searchParams.append('period', period);
      
      if (cityId) {
        searchParams.append('cityId', cityId.toString());
      }

      const response = await apiGet<AdminPerformanceSalesByStore>(
        `/admin/performance/sales-by-store?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin performance sales by store');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

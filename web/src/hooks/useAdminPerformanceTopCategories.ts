import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminTopCategory {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  color: string | null;
  deals: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AdminPerformanceTopCategories {
  success: boolean;
  period: string;
  categories: AdminTopCategory[];
}

interface UseAdminPerformanceTopCategoriesParams {
  limit?: number;
  period?: '1d' | '7d' | '30d';
  cityId?: number;
}

export const useAdminPerformanceTopCategories = (params: UseAdminPerformanceTopCategoriesParams = {}) => {
  const { limit = 10, period = '7d', cityId } = params;

  return useQuery<AdminPerformanceTopCategories, Error>({
    queryKey: ['admin-performance-top-categories', limit, period, cityId],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('limit', limit.toString());
      searchParams.append('period', period);
      if (cityId) {
        searchParams.append('cityId', cityId.toString());
      }

      const response = await apiGet<AdminPerformanceTopCategories>(
        `/admin/performance/top-categories?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin performance top categories');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

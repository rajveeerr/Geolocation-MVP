import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminTopCity {
  id: number;
  name: string;
  state: string;
  revenue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AdminPerformanceTopCities {
  success: boolean;
  period: string;
  cities: AdminTopCity[];
}

interface UseAdminPerformanceTopCitiesParams {
  limit?: number;
  period?: '1d' | '7d' | '30d';
}

export const useAdminPerformanceTopCities = (params: UseAdminPerformanceTopCitiesParams = {}) => {
  const { limit = 10, period = '7d' } = params;

  return useQuery<AdminPerformanceTopCities, Error>({
    queryKey: ['admin-performance-top-cities', limit, period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('limit', limit.toString());
      searchParams.append('period', period);

      const response = await apiGet<AdminPerformanceTopCities>(
        `/admin/performance/top-cities?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin performance top cities');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

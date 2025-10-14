import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminCityPerformance {
  id: number;
  name: string;
  state: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AdminPerformanceCities {
  success: boolean;
  period: string;
  cities: AdminCityPerformance[];
}

interface UseAdminPerformanceCitiesParams {
  period?: '1d' | '7d' | '30d';
}

export const useAdminPerformanceCities = (params: UseAdminPerformanceCitiesParams = {}) => {
  const { period = '7d' } = params;

  return useQuery<AdminPerformanceCities, Error>({
    queryKey: ['admin-performance-cities', period],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('period', period);

      const response = await apiGet<AdminPerformanceCities>(
        `/admin/performance/cities?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin performance cities');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminWeeklyChartData {
  days: string[];
  data: number[];
}

export interface AdminPerformanceWeeklyChart {
  success: boolean;
  cityId: number | null;
  merchantId: number | null;
  metric: 'checkins' | 'saves' | 'sales';
  chartData: AdminWeeklyChartData;
}

interface UseAdminPerformanceWeeklyChartParams {
  cityId?: number;
  merchantId?: number;
  metric?: 'checkins' | 'saves' | 'sales';
}

export const useAdminPerformanceWeeklyChart = (params: UseAdminPerformanceWeeklyChartParams = {}) => {
  const { cityId, merchantId, metric = 'checkins' } = params;

  return useQuery<AdminPerformanceWeeklyChart, Error>({
    queryKey: ['admin-performance-weekly-chart', cityId, merchantId, metric],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('metric', metric);
      
      if (cityId) {
        searchParams.append('cityId', cityId.toString());
      } else if (merchantId) {
        searchParams.append('merchantId', merchantId.toString());
      } else {
        throw new Error('Either cityId or merchantId must be provided');
      }

      const response = await apiGet<AdminPerformanceWeeklyChart>(
        `/admin/performance/weekly-chart?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch admin performance weekly chart');
      }

      return response.data;
    },
    enabled: !!(cityId || merchantId), // Only run query if cityId or merchantId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { Deal } from '@/data/deals';
import type { ApiDeal } from '@/data/deals-placeholder';
import { adaptApiDealToFrontend } from '@/data/deals-placeholder';

interface TodaysDealsParams {
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface TodaysDealsResponse {
  deals: ApiDeal[];
  total: number;
}

export const useTodaysDeals = (params: TodaysDealsParams = {}) => {
  const { limit = 8, latitude, longitude, radius = 10 } = params;

  return useQuery<TodaysDealsResponse, Error, Deal[]>({
    queryKey: ['todaysDeals', limit, latitude, longitude, radius],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (limit) searchParams.append('limit', limit.toString());
      if (latitude) searchParams.append('latitude', latitude.toString());
      if (longitude) searchParams.append('longitude', longitude.toString());
      if (radius) searchParams.append('radius', radius.toString());
      
      // Filter for deals that are active today
      const today = new Date().toISOString().split('T')[0];
      searchParams.append('startDate', today);
      searchParams.append('endDate', today);

      const response = await apiGet<TodaysDealsResponse>(
        `/deals?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch today\'s deals');
      }

      return response.data;
    },
    select: (data) => (data?.deals || []).map(adaptApiDealToFrontend),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

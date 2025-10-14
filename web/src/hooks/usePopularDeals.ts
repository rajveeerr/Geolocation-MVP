import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { Deal } from '@/data/deals';
import type { ApiDeal } from '@/data/deals-placeholder';
import { adaptApiDealToFrontend } from '@/data/deals-placeholder';

interface PopularDealsParams {
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface PopularDealsResponse {
  deals: ApiDeal[];
  total: number;
}

export const usePopularDeals = (params: PopularDealsParams = {}) => {
  const { limit = 8, latitude, longitude, radius = 10 } = params;

  return useQuery<PopularDealsResponse, Error, Deal[]>({
    queryKey: ['popularDeals', limit, latitude, longitude, radius],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (limit) searchParams.append('limit', limit.toString());
      if (latitude) searchParams.append('latitude', latitude.toString());
      if (longitude) searchParams.append('longitude', longitude.toString());
      if (radius) searchParams.append('radius', radius.toString());
      
      // Add sorting by popularity (most saves/check-ins)
      searchParams.append('sortBy', 'popularity');

      const response = await apiGet<PopularDealsResponse>(
        `/deals?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch popular deals');
      }

      return response.data;
    },
    select: (data) => (data?.deals || []).map(adaptApiDealToFrontend),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

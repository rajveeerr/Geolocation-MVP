import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { Deal } from '@/data/deals';

type FeaturedDealsResponse = {
  deals: Deal[];
};

export const useFeaturedDeals = () => {
  return useQuery<FeaturedDealsResponse, Error, Deal[]>({
    queryKey: ['featuredDeals'],
    queryFn: async () => {
      const res = await apiGet<FeaturedDealsResponse>('/deals/featured');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch featured deals');
      }
      return res.data;
    },
    select: (data) => data?.deals || [], // Select the nested deals array
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

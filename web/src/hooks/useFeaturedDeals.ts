import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { Deal } from '@/data/deals';
import type { ApiDeal } from '@/data/deals-placeholder';
import { adaptApiDealToFrontend } from '@/data/deals-placeholder';

type FeaturedDealsResponse = {
  deals: ApiDeal[];
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
    select: (data) => (data?.deals || []).map(adaptApiDealToFrontend), // Map backend deals to frontend shape
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

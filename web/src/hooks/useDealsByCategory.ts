import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { Deal } from '@/data/deals';
import type { ApiDeal } from '@/data/deals-placeholder';
import { adaptApiDealToFrontend } from '@/data/deals-placeholder';

interface DealsByCategoryParams {
  category?: string;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface DealsByCategoryResponse {
  deals: ApiDeal[];
  total: number;
  filters: {
    category?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  };
}

export const useDealsByCategory = (params: DealsByCategoryParams = {}) => {
  const { category, limit = 8, latitude, longitude, radius = 10 } = params;

  return useQuery<DealsByCategoryResponse, Error, Deal[]>({
    queryKey: ['dealsByCategory', category, limit, latitude, longitude, radius],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (category) searchParams.append('category', category);
      if (limit) searchParams.append('limit', limit.toString());
      if (latitude) searchParams.append('latitude', latitude.toString());
      if (longitude) searchParams.append('longitude', longitude.toString());
      if (radius) searchParams.append('radius', radius.toString());

      const response = await apiGet<DealsByCategoryResponse>(
        `/deals?${searchParams.toString()}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch deals by category');
      }

      return response.data;
    },
    select: (data) => (data?.deals || []).map(adaptApiDealToFrontend),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Specific hooks for different deal types
export const useHappyHourDeals = (params: Omit<DealsByCategoryParams, 'category'> = {}) => {
  return useDealsByCategory({ ...params, category: 'FOOD_AND_BEVERAGE' });
};

export const useExperienceDeals = (params: Omit<DealsByCategoryParams, 'category'> = {}) => {
  return useDealsByCategory({ ...params, category: 'ENTERTAINMENT' });
};

export const useFoodDeals = (params: Omit<DealsByCategoryParams, 'category'> = {}) => {
  return useDealsByCategory({ ...params, category: 'FOOD_AND_BEVERAGE' });
};

export const useRetailDeals = (params: Omit<DealsByCategoryParams, 'category'> = {}) => {
  return useDealsByCategory({ ...params, category: 'RETAIL' });
};

export const useServiceDeals = (params: Omit<DealsByCategoryParams, 'category'> = {}) => {
  return useDealsByCategory({ ...params, category: 'SERVICES' });
};

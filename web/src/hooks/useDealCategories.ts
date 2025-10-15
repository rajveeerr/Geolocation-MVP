import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface DealCategory {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface DealCategoriesResponse {
  categories: DealCategory[];
  total: number;
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

export const useDealCategories = () => {
  return useQuery<DealCategoriesResponse, Error>({
    queryKey: ['deal-categories'],
    queryFn: async () => {
      const response = await apiGet<DealCategoriesResponse>('/deals/categories');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch deal categories');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Provide fallback categories if API fails
    placeholderData: {
      categories: [
        { value: 'FOOD_AND_BEVERAGE', label: 'Food & Beverage', description: 'Restaurants and food deals', icon: '🍽️' },
        { value: 'RETAIL', label: 'Retail', description: 'Shopping and retail deals', icon: '🛍️' },
        { value: 'ENTERTAINMENT', label: 'Entertainment', description: 'Entertainment and events', icon: '🎬' },
        { value: 'OTHER', label: 'Other', description: 'Other deals and offers', icon: '📦' },
      ],
      total: 4,
      metadata: { lastUpdated: new Date().toISOString(), version: '1.0.0' }
    },
  });
};

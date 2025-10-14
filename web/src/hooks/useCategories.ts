import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface Category {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export const useCategories = () => {
  return useQuery<CategoriesResponse, Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiGet<CategoriesResponse>('/deals/categories');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    retry: 2,
  });
};

// web/src/hooks/useAdminCities.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminCity {
  id: number;
  name: string;
  state: string;
  active: boolean;
  totalStores: number;
  activeStores: number;
  approvedMerchants: number;
}

interface CitiesApiResponse {
  cities: AdminCity[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

// This hook will accept filters for pagination, search, etc.
export const useAdminCities = (filters: { page?: number; limit?: number; active?: boolean; search?: string }) => {
  const queryParams = new URLSearchParams();
  if (filters.page) queryParams.append('page', String(filters.page));
  if (filters.limit) queryParams.append('limit', String(filters.limit));
  if (filters.active !== undefined) queryParams.append('active', String(filters.active));
  if (filters.search) queryParams.append('search', filters.search);

  return useQuery<CitiesApiResponse, Error>({
    queryKey: ['admin-cities', filters],
    queryFn: async (): Promise<CitiesApiResponse> => {
      const res = await apiGet(`/admin/cities?${queryParams.toString()}`);
      return res.data as CitiesApiResponse;
    },
  });
};

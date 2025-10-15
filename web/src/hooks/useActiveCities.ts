import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface City {
  id: number;
  name: string;
  state: string;
  country: string;
  isActive: boolean;
}

export interface CitiesResponse {
  cities: City[];
  total: number;
}

export const useActiveCities = () => {
  return useQuery<CitiesResponse, Error>({
    queryKey: ['active-cities'],
    queryFn: async () => {
      const response = await apiGet<CitiesResponse>('/admin/cities?active=true&limit=100');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch active cities');
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Provide fallback cities if API fails
    placeholderData: {
      cities: [
        { id: 1, name: 'New York', state: 'NY', country: 'USA', isActive: true },
        { id: 2, name: 'Los Angeles', state: 'CA', country: 'USA', isActive: true },
        { id: 3, name: 'Chicago', state: 'IL', country: 'USA', isActive: true },
        { id: 4, name: 'Atlanta', state: 'GA', country: 'USA', isActive: true },
      ],
      total: 4,
    },
  });
};

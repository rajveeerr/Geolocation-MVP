import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface PublicCity {
  id: number;
  name: string;
  state: string;
  country: string;
  active: boolean;
}

interface PublicCitiesResponse {
  cities: PublicCity[];
  total: number;
}

/**
 * Fetches active cities from the public /cities endpoint (no auth required).
 */
export const usePublicCities = () => {
  return useQuery<PublicCitiesResponse, Error>({
    queryKey: ['public-cities'],
    queryFn: async () => {
      const response = await apiGet<PublicCitiesResponse>('/cities?active=true');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch cities');
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    placeholderData: {
      cities: [
        { id: 1, name: 'New York', state: 'NY', country: 'USA', active: true },
        { id: 2, name: 'Los Angeles', state: 'CA', country: 'USA', active: true },
        { id: 3, name: 'Chicago', state: 'IL', country: 'USA', active: true },
        { id: 4, name: 'Atlanta', state: 'GA', country: 'USA', active: true },
      ],
      total: 4,
    },
  });
};

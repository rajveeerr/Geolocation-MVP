// web/src/hooks/useWhitelistedCities.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface City {
  id: number;
  name: string;
  state: string;
  active: boolean;
}

export const useWhitelistedCities = () => {
  return useQuery<City[], Error>({
    queryKey: ['whitelistedCities'],
    // Fetch only active cities as per the API documentation
    queryFn: async () => {
      const res = await apiGet<{ cities?: City[] }>('/cities?active=true');
      // apiGet should return an object with `data` property. Guard the shapes.
      const payload = (res && (res.data ?? res)) as { cities?: City[] } | undefined;
      if (payload && Array.isArray(payload.cities)) return payload.cities;
      return [] as City[];
    },
    select: (data) => data ?? [],
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });
};

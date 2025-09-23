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
    // --- THE FIX: Call the correct public endpoint and handle failures ---
    queryFn: async () => {
      const response = await apiGet<{ cities: City[] }>('/cities?active=true');
      if ((response as any).success === false) {
        console.error('Failed to fetch whitelisted cities:', (response as any).error);
        return [] as City[];
      }
      const payload = (response && (response.data ?? response)) as { cities?: City[] } | undefined;
      if (payload && Array.isArray(payload.cities)) return payload.cities;
      return [] as City[];
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });
};

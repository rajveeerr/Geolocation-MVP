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
  return useQuery<{ cities: City[] }, Error>({
    queryKey: ['whitelistedCities'],
    // --- THE FIX: Call the correct public endpoint and handle failures ---
    queryFn: async () => {
      const response = await apiGet<{ cities: City[] }>('/cities?active=true');
      if ((response as any).success === false) {
        console.error('Failed to fetch whitelisted cities:', (response as any).error);
        return { cities: [] };
      }
      const payload = (response && (response.data ?? response)) as { cities?: City[] } | undefined;
      if (payload && Array.isArray(payload.cities)) return { cities: payload.cities };
      return { cities: [] };
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });
};

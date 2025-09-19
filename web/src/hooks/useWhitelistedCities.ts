// web/src/hooks/useWhitelistedCities.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

const FALLBACK_CITIES = [
  "Atlanta",
  "Florida", 
  "New York",
  "Texas",   
  "Washington DC"
];

const processCityList = (cities: string[]): Set<string> => {
  return new Set(cities.map(city => city.toLowerCase().trim()));
};

export const useWhitelistedCities = () => {
  return useQuery<Set<string>, Error>({
    queryKey: ['whitelistedCities'],
    queryFn: async () => {
      try {
        const response = await apiGet<{ cities: string[] }>('/cities/whitelist');
        if (response.success && response.data && response.data.cities.length > 0) {
          return processCityList(response.data.cities);
        }
        return processCityList(FALLBACK_CITIES);
      } catch (error) {
        console.warn("Could not fetch whitelisted cities from API, using fallback list.", error);
        return processCityList(FALLBACK_CITIES);
      }
    },
    staleTime: 60 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
};

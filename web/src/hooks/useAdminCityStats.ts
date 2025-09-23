// web/src/hooks/useAdminCityStats.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

interface CityStats {
  totalCities: number;
  activeCities: number;
  // ... other stats from the API response
}

export const useAdminCityStats = () => {
  return useQuery<{ stats: CityStats }, Error>({
    queryKey: ['admin-city-stats'],
    queryFn: async (): Promise<{ stats: CityStats }> => {
      const res = await apiGet('/admin/cities/stats');
      return res.data as { stats: CityStats };
    },
  });
};

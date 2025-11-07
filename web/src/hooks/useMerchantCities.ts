// web/src/hooks/useMerchantCities.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface City {
  id: number;
  name: string;
  state: string;
  active: boolean;
}

export function useMerchantCities() {
  return useQuery({
    queryKey: ['merchant', 'cities'],
    queryFn: async () => {
      // Fetch cities from merchant stores
      const storesResponse = await apiGet<{ stores: Array<{ city: City }> }>('/merchants/stores');
      if (storesResponse.success && storesResponse.data) {
        // Extract unique cities from stores
        const cityMap = new Map<number, City>();
        storesResponse.data.stores.forEach(store => {
          if (store.city && !cityMap.has(store.city.id)) {
            cityMap.set(store.city.id, store.city);
          }
        });
        
        if (cityMap.size > 0) {
          return Array.from(cityMap.values());
        }
      }
      
      // Fallback: try to get all cities
      const citiesResponse = await apiGet<{ cities: City[] }>('/cities');
      if (!citiesResponse.success || !citiesResponse.data) {
        throw new Error(citiesResponse.error || 'Failed to fetch cities');
      }
      return citiesResponse.data.cities || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


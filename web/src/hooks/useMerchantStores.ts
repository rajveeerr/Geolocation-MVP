// web/src/hooks/useMerchantStores.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface Store {
  id: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  city?: {
    id: number;
    name: string;
    state: string;
  };
}

export function useMerchantStores() {
  return useQuery({
    queryKey: ['merchant', 'stores'],
    queryFn: async () => {
      const response = await apiGet<{ stores: Store[] }>('/merchants/stores');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch stores');
      }
      return response.data.stores || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

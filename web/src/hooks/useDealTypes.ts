import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface DealTypeInfo {
  value: string;
  label: string;
  description?: string;
  category?: string;
}

export interface DealTypesResponse {
  dealTypes: DealTypeInfo[];
  total: number;
}

export const useDealTypes = () => {
  return useQuery<DealTypesResponse, Error>({
    queryKey: ['deal-types'],
    queryFn: async () => {
      const res = await apiGet<DealTypesResponse>('/menu/deal-types');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch deal types');
      }
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};



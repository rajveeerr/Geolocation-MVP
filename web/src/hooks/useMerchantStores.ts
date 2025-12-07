// web/src/hooks/useMerchantStores.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiDelete } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

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
  createdAt?: string;
}

export function useMerchantStores() {
  return useQuery({
    queryKey: ['merchant', 'stores'],
    queryFn: async () => {
      const response = await apiGet<{ total: number; stores: Store[] }>('/merchants/stores');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch stores');
      }
      return { stores: response.data.stores || [], total: response.data.total || 0 };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (storeId: number) => {
      const response = await apiDelete<{ message: string }>(`/merchants/stores/${storeId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete store');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant', 'stores'] });
      toast({
        title: 'Store Deleted',
        description: 'Store has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Store',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

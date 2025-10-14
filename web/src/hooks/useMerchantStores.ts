import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export interface Store {
  id: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  cityId: number;
  merchantId: number;
  city: {
    id: number;
    name: string;
    state: string;
    active: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreData {
  address: string;
  latitude?: number;
  longitude?: number;
  cityId: number;
  active?: boolean;
}

export interface UpdateStoreData {
  address?: string;
  latitude?: number;
  longitude?: number;
  cityId?: number;
  active?: boolean;
}

export interface StoresResponse {
  total: number;
  stores: Store[];
}

// Hook to fetch all stores for the authenticated merchant
export const useMerchantStores = () => {
  return useQuery<StoresResponse, Error>({
    queryKey: ['merchant-stores'],
    queryFn: async () => {
      const response = await apiGet<StoresResponse>('/merchants/stores');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch stores');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
// Hook to create a new store
export const useCreateStore = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateStoreData) => {
      const response = await apiPost<{ message: string; store: Store }, CreateStoreData>('/merchants/stores', data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create store');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-stores'] });
      toast({
        title: 'Store Created!',
        description: data.message || 'Your new store has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Store',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to update an existing store
export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: number; data: UpdateStoreData }) => {
      const response = await apiPut<{ message: string; store: Store }, UpdateStoreData>(`/merchants/stores/${storeId}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update store');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-stores'] });
      toast({
        title: 'Store Updated!',
        description: data.message || 'Your store has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Store',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to delete a store
export const useDeleteStore = () => {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-stores'] });
      toast({
        title: 'Store Deleted',
        description: data?.message || 'Your store has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      // Don't show error toast for authentication errors - they're handled globally
      if (!error.message.includes('401') && !error.message.includes('Unauthorized')) {
        toast({
          title: 'Error Deleting Store',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });
};


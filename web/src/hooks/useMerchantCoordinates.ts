import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPut } from '@/services/api';

export interface MerchantCoordinatesResponse {
  message: string;
  merchant: {
    id: number;
    businessName: string;
    businessType: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  };
}

export function useUpdateMerchantCoordinates() {
  const queryClient = useQueryClient();

  return useMutation<
    MerchantCoordinatesResponse,
    Error,
    { latitude: number; longitude: number }
  >({
    mutationFn: async (payload) => {
      const response = await apiPut<MerchantCoordinatesResponse, { latitude: number; longitude: number }>(
        '/merchants/coordinates',
        payload,
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update merchant coordinates');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantStatus'] });
    },
  });
}

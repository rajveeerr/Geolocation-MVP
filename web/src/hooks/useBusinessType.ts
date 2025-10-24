import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '@/services/api';

// Types
export interface BusinessType {
  id: number;
  businessName: string;
  businessType: 'NATIONAL' | 'LOCAL';
  status: string;
  updatedAt: string;
}

export interface BusinessTypeUpdateRequest {
  businessType: 'NATIONAL' | 'LOCAL';
}

export interface BusinessTypeUpdateResponse {
  success: boolean;
  message: string;
  merchant: BusinessType;
}

export interface MerchantStatusResponse {
  merchant: {
    id: number;
    status: string;
    businessName: string;
    businessType: 'NATIONAL' | 'LOCAL';
    address: string;
    description: string;
    logoUrl: string;
    phoneNumber: string;
    city: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Hooks

// Get merchant status and business type
export const useMerchantStatus = () => {
  return useQuery<MerchantStatusResponse, Error>({
    queryKey: ['merchant-status'],
    queryFn: async () => {
      const response = await apiGet<MerchantStatusResponse>('/merchants/status');
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch merchant status');
      }
      
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Update business type
export const useUpdateBusinessType = () => {
  const queryClient = useQueryClient();

  return useMutation<BusinessTypeUpdateResponse, Error, BusinessTypeUpdateRequest>({
    mutationFn: async (businessTypeData) => {
      const response = await apiPut<BusinessTypeUpdateResponse, BusinessTypeUpdateRequest>(
        '/merchants/business-type',
        businessTypeData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update business type');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate merchant status query to refresh data
      queryClient.invalidateQueries({
        queryKey: ['merchant-status']
      });
    },
  });
};

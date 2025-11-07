// src/hooks/useMerchantStatus.ts
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { useAuth } from '@/context/useAuth';

interface MerchantStatus {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  businessName: string;
  businessType: 'NATIONAL' | 'LOCAL';
  address: string;
  description?: string;
  logoUrl?: string;
  phoneNumber?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export const useMerchantStatus = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['merchantStatus', user?.id],
    queryFn: async () => {
      try {
        const res = await apiGet<{ merchant: MerchantStatus }>('/merchants/status');
        return res;
      } catch (error: any) {
        // 404 is expected for non-merchants, return null instead of throwing
        if (error?.response?.status === 404 || error?.status === 404) {
          return { success: false, data: null, error: 'Not a merchant' };
        }
        throw error;
      }
    },
    enabled: !!user, // Only run this query if the user is logged in
    retry: false, // Don't retry if it fails (e.g., 404 for non-merchants)
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface AdminMerchantDetails {
  id: number;
  businessName: string;
  description: string;
  address: string;
  logoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    email: string;
    name: string;
  };
  stores: Array<{
    id: number;
    address: string;
    latitude: number | null;
    longitude: number | null;
    active: boolean;
    city: {
      id: number;
      name: string;
      state: string;
    };
  }>;
  totalDeals: number;
  totalStores: number;
  rejectionReason?: string;
  suspendedUntil?: string;
  suspendedReason?: string;
}

export interface AdminMerchantPerformance {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  activeDeals: number;
  totalCheckins: number;
  totalSaves: number;
}

export const useAdminMerchantDetails = (merchantId: number) => {
  return useQuery({
    queryKey: ['admin-merchant-details', merchantId],
    queryFn: async (): Promise<AdminMerchantDetails> => {
      const response = await apiGet<AdminMerchantDetails>(`/admin/merchants/${merchantId}`);
      return response.data!;
    },
    enabled: !!merchantId,
  });
};

export const useAdminMerchantPerformance = (merchantId: number) => {
  return useQuery({
    queryKey: ['admin-merchant-performance', merchantId],
    queryFn: async (): Promise<AdminMerchantPerformance> => {
      // For now, we'll return mock data since the backend doesn't have a specific endpoint for merchant performance
      // In a real implementation, this would call a specific endpoint like /admin/merchants/:id/performance
      return {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        activeDeals: 0,
        totalCheckins: 0,
        totalSaves: 0,
      };
    },
    enabled: !!merchantId,
  });
};

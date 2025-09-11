import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { useMerchantStatus } from './useMerchantStatus';

// This interface should match the deal structure from your /merchants/deals endpoint
interface MerchantDeal {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isExpired: boolean;
  isUpcoming: boolean;
}

export const useMerchantDeals = () => {
  const { data: merchantStatusData } = useMerchantStatus();
  const isMerchant = !!merchantStatusData?.data?.merchant;

  // This query will fetch all deals created by the logged-in merchant
  return useQuery<{ deals: MerchantDeal[] }>({
    queryKey: ['my-merchant-deals'],
    queryFn: async () => {
      const res = await apiGet<{ deals: MerchantDeal[] }>('/merchants/deals');
      return res.data ?? { deals: [] };
    },
    enabled: isMerchant, // Only run this query if the user is a confirmed merchant
  });
};

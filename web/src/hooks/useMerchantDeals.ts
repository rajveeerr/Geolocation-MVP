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

  // Query returns the raw ApiResponse<{ deals: MerchantDeal[] }>, but consumers
  // expect just MerchantDeal[] so we use `select` to transform the response.
  return useQuery<
    /* TQueryFnData */ { deals: MerchantDeal[] } | null,
    /* TError */ unknown,
    /* TData (selected) */ MerchantDeal[]
  >({
    queryKey: ['my-merchant-deals'],
    queryFn: async () => {
      const res = await apiGet<{ deals: MerchantDeal[] }>('/merchants/deals');
      return res.data ?? { deals: [] };
    },
    enabled: isMerchant,
    select: (response) => response?.deals ?? [],
  });
};

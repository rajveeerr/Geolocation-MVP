import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/services/api';

// Deal Sharing Types

export interface ShareDealRequest {
  dealId: number;
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'email' | 'copy_link';
  message?: string;
  recipientEmail?: string; // For email sharing
}

export interface ShareDealResponse {
  success: boolean;
  shareUrl?: string;
  message?: string;
  error?: string;
}

// Hook for Deal Sharing

export const useShareDeal = () => {
  return useMutation<ShareDealResponse, Error, ShareDealRequest>({
    mutationFn: async (data) => {
      const res = await apiPost<ShareDealResponse>(`/deals/${data.dealId}/share`, data);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to share deal');
      }
      return res.data;
    },
  });
};

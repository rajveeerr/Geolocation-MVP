import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

// Types
export interface DetailedDeal {
  id: number;
  title: string;
  description: string;
  category: {
    value: string;
    label: string;
    description: string;
    icon: string;
    color: string;
  };
  imageUrl: string | null;
  images: string[];
  offerDisplay: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  offerTerms: string | null;
  dealType: string | {
    name: string;
    description: string;
  };
  bountyQRCode?: string | null;
  startTime: string;
  endTime: string;
  recurringDays: string[];
  status: {
    isActive: boolean;
    isExpired: boolean;
    isUpcoming: boolean;
    timeRemaining: {
      total: number;
      hours: number;
      minutes: number;
      formatted: string;
      percentageRemaining?: number;
    };
  };
  redemptionInstructions: string;
  kickbackEnabled: boolean;
  menuItems: Array<{
    id: number;
    name: string;
    description: string;
    originalPrice: number;
    discountedPrice: number;
    imageUrl: string | null;
    images?: string[];
    category: string;
  }>;
  hasMenuItems: boolean;
  merchant: {
    id: number;
    businessName: string;
    description: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    logoUrl: string | null;
    phoneNumber?: string | null;
    totalDeals: number;
    totalStores: number;
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
        active: boolean;
      };
    }>;
  };
  socialProof: {
    totalSaves: number;
    totalCheckIns?: number;
    recentSavers: Array<{
      id: number;
      name: string;
      avatarUrl: string | null;
      savedAt: string;
    }>;
    recentCheckIns?: Array<{
      id: number;
      name: string;
      avatarUrl: string | null;
      checkedInAt: string;
    }>;
    recentActivity?: Array<{
      id: number;
      name: string;
      avatarUrl: string | null;
      type: string;
      savedAt?: string;
      checkedInAt?: string;
      user?: {
        id: number;
        name: string;
        avatarUrl: string | null;
      };
    }>;
    totalEngagement?: number;
  };
  createdAt: string;
  updatedAt: string;
  context: {
    isRecurring: boolean;
    isHappyHour: boolean;
    hasMultipleImages: boolean;
    hasMultipleStores: boolean;
    isPopular: boolean;
  };
}

export const useDealDetail = (dealId: string) => {
  return useQuery<DetailedDeal, Error>({
    queryKey: ['deal-detail', dealId],
    queryFn: async () => {
      const response = await apiGet<{ success: boolean; deal: DetailedDeal }>(`/deals/${dealId}`);
      
      if (response.success && response.data?.deal) {
        return response.data.deal;
      }
      throw new Error(response.error || 'Deal not found');
    },
    enabled: !!dealId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 (deal not found)
      if (error.message.includes('404') || error.message.includes('not found')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { getLandingDealById } from '@/data/landing-deals';
import { dealToDetailedDeal } from '@/lib/dealToDetailedDeal';

// Types (id can be string for landing/hardcoded deals)
export interface DetailedDeal {
  id: number | string;
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
    status?: string;
    totalDeals: number;
    totalStores: number;
    stores: Array<{
      id: number;
      address: string;
      latitude: number | null;
      longitude: number | null;
      active: boolean;
      description?: string | null;
      operatingHours?: Record<string, { open: string; close: string; closed: boolean }> | null;
      galleryUrls?: string[];
      isFoodTruck?: boolean;
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

export interface PublicMenuCollectionItem {
  collectionId: number;
  menuItemId: number;
  sortOrder: number;
  isActive: boolean;
  customPrice: number | null;
  customDiscount: number | null;
  notes: string | null;
  menuItem: {
    id: number;
    name: string;
    price: number;
    category: string;
    imageUrl: string | null;
    imageUrls?: string[];
    description: string;
    dealType?: string | null;
    isHappyHour?: boolean;
    happyHourPrice?: number | null;
  };
}

export interface PublicMenuCollection {
  id: number;
  merchantId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  menuType?: string | null;
  subType?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  themeName?: string | null;
  icon?: string | null;
  color?: string | null;
  items: PublicMenuCollectionItem[];
  _count?: {
    items: number;
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
      // Fallback to hardcoded landing deals when API returns 404 or error
      const landingDeal = getLandingDealById(dealId);
      if (landingDeal) {
        return dealToDetailedDeal(landingDeal);
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

export const usePublicMenuCollections = (merchantId: number | null | undefined) => {
  return useQuery<{ collections: PublicMenuCollection[] }, Error>({
    queryKey: ['public-menu-collections', merchantId],
    queryFn: async () => {
      const response = await apiGet<{ collections: PublicMenuCollection[] }>(
        `/menu-collections/${merchantId}`,
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch menu collections');
      }

      return response.data;
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  });
};

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
    recentSavers: Array<{
      id: number;
      name: string;
      avatarUrl: string | null;
      savedAt: string;
    }>;
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

// Mock data for development/fallback
const createMockDeal = (id: string): DetailedDeal => {
  const now = new Date();
  const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  return {
    id: parseInt(id),
    title: "Premium Dining Experience",
    description: "Enjoy a luxurious dining experience with our signature dishes and premium service. Perfect for special occasions or business meetings.",
    category: {
      value: "FOOD_AND_BEVERAGE",
      label: "Food & Beverage",
      description: "Restaurants, cafes, bars, food delivery",
      icon: "🍽️",
      color: "#FF6B6B"
    },
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop"
    ],
    offerDisplay: "30% OFF",
    discountPercentage: 30,
    discountAmount: null,
    offerTerms: "Valid for dine-in only. Cannot be combined with other offers. Excludes alcohol.",
    dealType: {
      name: "Standard",
      description: "Regular promotional deal"
    },
    startTime: now.toISOString(),
    endTime: endTime.toISOString(),
    recurringDays: [],
    status: {
      isActive: true,
      isExpired: false,
      isUpcoming: false,
      timeRemaining: {
        total: 24 * 60 * 60 * 1000,
        hours: 24,
        minutes: 0,
        formatted: "24h 0m"
      }
    },
    redemptionInstructions: "1. Show this deal to your server when ordering\n2. Present valid ID if requested\n3. Deal applies to food items only\n4. Gratuity not included in discount",
    kickbackEnabled: true,
    menuItems: [
      {
        id: 1,
        name: "Signature Steak",
        description: "Premium ribeye steak with seasonal vegetables",
        originalPrice: 45.00,
        discountedPrice: 31.50,
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
        category: "Main Course"
      },
      {
        id: 2,
        name: "Lobster Pasta",
        description: "Fresh lobster with house-made pasta in cream sauce",
        originalPrice: 38.00,
        discountedPrice: 26.60,
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
        category: "Main Course"
      },
      {
        id: 3,
        name: "Truffle Risotto",
        description: "Creamy risotto with black truffle and parmesan",
        originalPrice: 32.00,
        discountedPrice: 22.40,
        imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
        category: "Main Course"
      },
      {
        id: 4,
        name: "Chocolate Soufflé",
        description: "Warm chocolate soufflé with vanilla ice cream",
        originalPrice: 16.00,
        discountedPrice: 11.20,
        imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
        category: "Dessert"
      }
    ],
    hasMenuItems: true,
    merchant: {
      id: 1,
      businessName: "Echoes Living Room",
      description: "A sophisticated dining establishment offering contemporary cuisine in an elegant atmosphere. Known for our exceptional service and innovative menu.",
      address: "123 Main Street, Midtown, Atlanta, GA 30309",
      latitude: 33.7849,
      longitude: -84.3841,
      logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop",
      totalDeals: 12,
      totalStores: 3,
      stores: [
        {
          id: 1,
          address: "123 Main Street, Midtown, Atlanta, GA 30309",
          latitude: 33.7849,
          longitude: -84.3841,
          active: true,
          city: {
            id: 1,
            name: "Atlanta",
            state: "Georgia",
            active: true
          }
        },
        {
          id: 2,
          address: "456 Times Square, New York, NY 10036",
          latitude: 40.7589,
          longitude: -73.9851,
          active: true,
          city: {
            id: 2,
            name: "New York",
            state: "New York",
            active: true
          }
        },
        {
          id: 3,
          address: "789 Rittenhouse Square, Philadelphia, PA 19103",
          latitude: 39.9496,
          longitude: -75.1714,
          active: false,
          city: {
            id: 3,
            name: "Philadelphia",
            state: "Pennsylvania",
            active: true
          }
        }
      ]
    },
    socialProof: {
      totalSaves: 47,
      recentSavers: [
        {
          id: 1,
          name: "Sarah Johnson",
          avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
          savedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          name: "Mike Chen",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          savedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          name: "Emily Davis",
          avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          savedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          name: "Alex Rodriguez",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          savedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 5,
          name: "Lisa Wang",
          avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
          savedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    context: {
      isRecurring: false,
      isHappyHour: false,
      hasMultipleImages: true,
      hasMultipleStores: true,
      isPopular: true
    }
  };
};

export const useDealDetail = (dealId: string) => {
  return useQuery<DetailedDeal, Error>({
    queryKey: ['deal-detail', dealId],
    queryFn: async () => {
      try {
        // Try to fetch from real API first
        const response = await apiGet<{ success: boolean; deal: DetailedDeal }>(`/deals/${dealId}`);
        
        if (response.success && response.data?.deal) {
          return response.data.deal;
        } else {
          throw new Error('Deal not found');
        }
      } catch (error) {
        // If API fails, use mock data for development
        console.warn('API call failed, using mock data:', error);
        return createMockDeal(dealId);
      }
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

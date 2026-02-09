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
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=1200&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=1200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=1200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&h=1200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=1200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&h=1200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=1200&h=1200&fit=crop&q=80"
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
        description: "Premium ribeye steak with seasonal vegetables & truffle jus",
        originalPrice: 45.00,
        discountedPrice: 31.50,
        imageUrl: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=1000&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=1000&fit=crop&q=80",
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1000&fit=crop&q=80",
          "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&h=1000&fit=crop&q=80"
        ],
        category: "Chef's Signature"
      },
      {
        id: 2,
        name: "Monster Wagyu",
        description: "Truffle aioli, gold-leaf brioche & organic greens",
        originalPrice: 32.00,
        discountedPrice: 22.00,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=1000&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=1000&fit=crop&q=80",
          "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=1000&fit=crop&q=80",
          "https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&h=1000&fit=crop&q=80"
        ],
        category: "Bestseller"
      },
      {
        id: 3,
        name: "Pepperoni Feast",
        description: "Double-aged, hot honey drizzle & classic mozzarella",
        originalPrice: 26.00,
        discountedPrice: 18.00,
        imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=1000&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=1000&fit=crop&q=80",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=1000&fit=crop&q=80"
        ],
        category: "Chef's Signature"
      },
      {
        id: 4,
        name: "Lobster Pasta",
        description: "Fresh lobster with house-made pasta in cream sauce",
        originalPrice: 38.00,
        discountedPrice: 26.60,
        imageUrl: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=1000&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=1000&fit=crop&q=80",
          "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=1000&fit=crop&q=80",
          "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=1000&fit=crop&q=80"
        ],
        category: "Main Course"
      },
      {
        id: 5,
        name: "Truffle Risotto",
        description: "Creamy risotto with black truffle shavings and aged parmesan",
        originalPrice: 32.00,
        discountedPrice: 22.40,
        imageUrl: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c1?w=800&h=1000&fit=crop&q=80",
        category: "Main Course"
      },
      {
        id: 6,
        name: "Chocolate Soufflé",
        description: "Warm chocolate soufflé with vanilla bean ice cream",
        originalPrice: 16.00,
        discountedPrice: 11.20,
        imageUrl: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=800&h=1000&fit=crop&q=80",
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

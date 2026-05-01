import { useMutation, useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';

// Menu System Types

export interface MenuItem {
  id: number;
  merchantId: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  allergens?: string[];
  dietaryInfo?: string[];
  preparationTime?: number;
  calories?: number;
  ingredients?: string[];
  inventoryTrackingEnabled?: boolean;
  inventoryQuantity?: number | null;
  lowStockThreshold?: number | null;
  allowBackorder?: boolean;
  inventoryStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNTRACKED';
  merchant: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItemsResponse {
  success: boolean;
  items: MenuItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface BulkOrderLineInput {
  menuItemId: number;
  variantId?: number | null;
  quantity: number;
}

export interface BulkQuoteResponse {
  ok: boolean;
  peopleCount: number;
  merchantId: number;
  lines: Array<{
    menuItemId: number;
    variantId: number | null;
    name: string;
    variantLabel: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    servesCount: number | null;
    servesTotal: number | null;
    recommendedQty: number | null;
    coverageDelta: number | null;
    backorder: boolean;
    availableQty: number | null;
  }>;
  subtotal: number;
  effectivePerPerson: number;
  coverageSummary: {
    servedPeople: number;
    peopleCount: number;
    shortBy: number;
    overBy: number;
  };
}

export interface CreateBulkOrderPayload {
  peopleCount: number;
  items: BulkOrderLineInput[];
  notes?: string;
  paymentMethod?: string;
}

export interface MenuCategoriesResponse {
  success: boolean;
  categories: MenuCategory[];
  error?: string;
}

// Hooks for Menu System

export const useMenuItems = (options?: {
  merchantId?: number;
  category?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const { merchantId, category, isAvailable, page = 1, limit = 50, search } = options || {};

  return useQuery<MenuItem[]>({
    queryKey: ['menuItems', merchantId, category, isAvailable, page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (merchantId) params.append('merchantId', merchantId.toString());
      if (category) params.append('category', category);
      if (isAvailable !== undefined) params.append('isAvailable', isAvailable.toString());
      if (search) params.append('search', search);

      const res = await apiGet<MenuItemsResponse>(`/menu/items?${params}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch menu items');
      }
      return res.data.items;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useMenuCategories = () => {
  return useQuery<MenuCategory[]>({
    queryKey: ['menuCategories'],
    queryFn: async () => {
      const res = await apiGet<MenuCategoriesResponse>('/menu/categories');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch menu categories');
      }
      return res.data.categories;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useBulkQuote = () => {
  return useMutation({
    mutationFn: async (payload: { peopleCount: number; items: BulkOrderLineInput[] }) => {
      const res = await apiPost<BulkQuoteResponse, typeof payload>('/menu/bulk-quote', payload);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to compute bulk quote');
      }
      return res.data;
    },
  });
};

export const useCreateBulkOrder = () => {
  return useMutation({
    mutationFn: async (payload: CreateBulkOrderPayload) => {
      const res = await apiPost<{ ok: boolean; order: { id: number; orderNumber: string } }, CreateBulkOrderPayload>(
        '/menu/orders',
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create bulk order');
      }
      return res.data;
    },
  });
};

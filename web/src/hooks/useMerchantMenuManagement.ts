import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';

// Merchant Menu Management Types

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
  preparationTime?: number; // in minutes
  calories?: number;
  ingredients?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable?: boolean;
  imageUrl?: string;
  allergens?: string[];
  dietaryInfo?: string[];
  preparationTime?: number;
  calories?: number;
  ingredients?: string[];
}

export interface UpdateMenuItemRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  isAvailable?: boolean;
  imageUrl?: string;
  allergens?: string[];
  dietaryInfo?: string[];
  preparationTime?: number;
  calories?: number;
  ingredients?: string[];
}

export interface MenuItemsResponse {
  success: boolean;
  items: MenuItem[];
  error?: string;
}

export interface MenuItemResponse {
  success: boolean;
  item: MenuItem;
  error?: string;
}

// Hooks for Merchant Menu Management

export const useMerchantMenuItems = () => {
  return useQuery<MenuItem[]>({
    queryKey: ['merchantMenuItems'],
    queryFn: async () => {
      const res = await apiGet<MenuItemsResponse>('/merchants/me/menu');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch menu items');
      }
      return res.data.items;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, CreateMenuItemRequest>({
    mutationFn: async (data) => {
      const res = await apiPost<MenuItemResponse>('/merchants/me/menu/item', data);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create menu item');
      }
      return res.data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, { itemId: number; data: UpdateMenuItemRequest }>({
    mutationFn: async ({ itemId, data }) => {
      const res = await apiPut<MenuItemResponse>(`/merchants/me/menu/item/${itemId}`, data);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update menu item');
      }
      return res.data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (itemId) => {
      const res = await apiDelete(`/merchants/me/menu/item/${itemId}`);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete menu item');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
    },
  });
};

// Bulk upload interface
export interface BulkUploadMenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable?: boolean;
  imageUrl?: string;
  allergens?: string[];
  dietaryInfo?: string[];
  preparationTime?: number;
  calories?: number;
  ingredients?: string[];
}

export interface BulkUploadResponse {
  message: string;
  created: number;
  total: number;
}

export interface BulkUploadError {
  error: string;
  details?: string[];
  validItems?: number;
  totalItems?: number;
}

export const useBulkUploadMenuItems = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkUploadResponse, BulkUploadError, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.yohop.com/api';
      const response = await fetch(`${API_BASE_URL}/merchants/me/menu/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload menu items');
      }

      const data = await response.json();
      return {
        message: data.message || 'Menu items uploaded successfully',
        created: data.created || 0,
        total: data.total || 0,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
    },
  });
};

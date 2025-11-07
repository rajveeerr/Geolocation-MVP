import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export interface MenuItemImage {
  id: string;
  url: string;
  publicId: string;
  name: string;
}

export type MenuDealType = 
  | 'STANDARD'
  | 'HAPPY_HOUR_BOUNTY'
  | 'HAPPY_HOUR_SURPRISE'
  | 'HAPPY_HOUR_LATE_NIGHT'
  | 'HAPPY_HOUR_MID_DAY'
  | 'HAPPY_HOUR_MORNINGS'
  | 'REDEEM_NOW_BOUNTY'
  | 'REDEEM_NOW_SURPRISE'
  | 'RECURRING';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imageUrl: string | null; // Keep for backward compatibility
  images: MenuItemImage[]; // New field for multiple images
  merchantId: number;
  dealType?: MenuDealType;
  isHappyHour?: boolean;
  happyHourPrice?: number | null;
  isSurprise?: boolean;
  surpriseRevealTime?: string | null;
  validStartTime?: string | null;
  validEndTime?: string | null;
  validDays?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string; // Keep for backward compatibility
  images?: MenuItemImage[]; // New field for multiple images
  dealType?: MenuDealType;
  isHappyHour?: boolean;
  happyHourPrice?: number | null;
  isSurprise?: boolean;
  surpriseRevealTime?: string | null;
  validStartTime?: string | null;
  validEndTime?: string | null;
  validDays?: string | null;
}

export interface UpdateMenuItemData {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  imageUrl?: string; // Keep for backward compatibility
  images?: MenuItemImage[]; // New field for multiple images
  dealType?: MenuDealType;
  isHappyHour?: boolean;
  happyHourPrice?: number | null;
  isSurprise?: boolean;
  surpriseRevealTime?: string | null;
  validStartTime?: string | null;
  validEndTime?: string | null;
  validDays?: string | null;
}

export interface MenuItemsResponse {
  menuItems: MenuItem[];
}

// Hook to fetch all menu items for the authenticated merchant
export const useMerchantMenu = () => {
  return useQuery<MenuItemsResponse, Error>({
    queryKey: ['merchant-menu'],
    queryFn: async () => {
      const response = await apiGet<MenuItemsResponse>('/merchants/me/menu');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch menu items');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a new menu item
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateMenuItemData) => {
      const response = await apiPost<{ menuItem: MenuItem }, CreateMenuItemData>('/merchants/me/menu/item', data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create menu item');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      toast({
        title: 'Menu Item Created!',
        description: `${data.menuItem.name} has been added to your menu.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Menu Item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to update an existing menu item
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: number; data: UpdateMenuItemData }) => {
      const response = await apiPut<{ menuItem: MenuItem }, UpdateMenuItemData>(`/merchants/me/menu/item/${itemId}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update menu item');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      toast({
        title: 'Menu Item Updated!',
        description: `${data.menuItem.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Menu Item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to delete a menu item
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiDelete<{ message: string }>(`/merchants/me/menu/item/${itemId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete menu item');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      toast({
        title: 'Menu Item Deleted',
        description: data?.message || 'Menu item has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      // Don't show error toast for authentication errors - they're handled globally
      if (!error.message.includes('401') && !error.message.includes('Unauthorized')) {
        toast({
          title: 'Error Deleting Menu Item',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });
};

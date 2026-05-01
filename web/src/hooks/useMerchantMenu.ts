import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api';
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

export interface MenuItemVariant {
  id: number;
  sku: string;
  label: string;
  price: number;
  servesCount?: number | null;
  inventoryQuantity?: number | null;
  lowStockThreshold?: number | null;
  isAvailable: boolean;
  sortOrder: number;
  inventoryStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNTRACKED';
}

export interface MenuItemVariantInput {
  id?: number;
  sku?: string;
  label: string;
  price: number;
  servesCount?: number | null;
  inventoryQuantity?: number | null;
  lowStockThreshold?: number | null;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imageUrl: string | null; // Keep for backward compatibility
  imageUrls: string[];
  images: MenuItemImage[];
  merchantId: number;
  dealType?: MenuDealType;
  isHappyHour?: boolean;
  happyHourPrice?: number | null;
  isSurprise?: boolean;
  surpriseRevealTime?: string | null;
  validStartTime?: string | null;
  validEndTime?: string | null;
  validDays?: string | null;
  isAvailable: boolean;
  inventoryTrackingEnabled: boolean;
  inventoryQuantity?: number | null;
  lowStockThreshold?: number | null;
  allowBackorder: boolean;
  inventoryStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNTRACKED';
  hasVariants: boolean;
  isBulkOrderEnabled: boolean;
  defaultPeopleCount?: number | null;
  minPeopleCount?: number | null;
  variants?: MenuItemVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string; // Keep for backward compatibility
  imageUrls?: string[];
  images?: MenuItemImage[];
  dealType?: MenuDealType;
  isHappyHour?: boolean;
  happyHourPrice?: number | null;
  isSurprise?: boolean;
  surpriseRevealTime?: string | null;
  validStartTime?: string | null;
  validEndTime?: string | null;
  validDays?: string | null;
  isAvailable?: boolean;
  inventoryTrackingEnabled?: boolean;
  inventoryQuantity?: number | null;
  lowStockThreshold?: number | null;
  allowBackorder?: boolean;
  hasVariants?: boolean;
  isBulkOrderEnabled?: boolean;
  defaultPeopleCount?: number | null;
  minPeopleCount?: number | null;
  variants?: MenuItemVariantInput[];
}

export interface UpdateMenuItemData {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  imageUrl?: string; // Keep for backward compatibility
  imageUrls?: string[];
  images?: MenuItemImage[];
  dealType?: MenuDealType;
  isHappyHour?: boolean;
  happyHourPrice?: number | null;
  isSurprise?: boolean;
  surpriseRevealTime?: string | null;
  validStartTime?: string | null;
  validEndTime?: string | null;
  validDays?: string | null;
  isAvailable?: boolean;
  inventoryTrackingEnabled?: boolean;
  inventoryQuantity?: number | null;
  lowStockThreshold?: number | null;
  allowBackorder?: boolean;
  hasVariants?: boolean;
  isBulkOrderEnabled?: boolean;
  defaultPeopleCount?: number | null;
  minPeopleCount?: number | null;
  variants?: MenuItemVariantInput[];
}

export interface MenuItemsResponse {
  menuItems: MenuItem[];
}

export interface InventoryAlert {
  level: 'LOW_STOCK' | 'OUT_OF_STOCK';
  title: string;
  message: string;
}

const toMenuItemImages = (imageUrls?: string[] | null): MenuItemImage[] =>
  (imageUrls || []).map((url, index) => ({
    id: `image-${index}`,
    url,
    publicId: `image-${index}`,
    name: `Image ${index + 1}`,
  }));

const normalizeMenuItem = (item: Omit<MenuItem, 'images'> & { images?: MenuItemImage[] }): MenuItem => ({
  ...item,
  imageUrls: item.imageUrls || [],
  images: item.images && item.images.length > 0 ? item.images : toMenuItemImages(item.imageUrls),
});

const serializeMenuItemPayload = (data: CreateMenuItemData | UpdateMenuItemData) => {
  const imageUrls =
    data.imageUrls && data.imageUrls.length > 0
      ? data.imageUrls
      : data.images?.map((image) => image.url).filter(Boolean) || [];

  return {
    ...data,
    imageUrls,
    imageUrl: imageUrls[0] || data.imageUrl || undefined,
  };
};

// Hook to fetch all menu items for the authenticated merchant
export const useMerchantMenu = () => {
  return useQuery<MenuItemsResponse, Error>({
    queryKey: ['merchant-menu'],
    queryFn: async () => {
      const response = await apiGet<MenuItemsResponse>('/merchants/me/menu');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch menu items');
      }
      return {
        ...response.data,
        menuItems: response.data.menuItems.map(normalizeMenuItem),
      };
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
      const payload = serializeMenuItemPayload(data);
      const response = await apiPost<{ menuItem: MenuItem }, typeof payload>('/merchants/me/menu/item', payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create menu item');
      }
      return {
        menuItem: normalizeMenuItem(response.data.menuItem),
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
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
      const payload = serializeMenuItemPayload(data);
      const response = await apiPut<{ menuItem: MenuItem }, typeof payload>(`/merchants/me/menu/item/${itemId}`, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update menu item');
      }
      return {
        menuItem: normalizeMenuItem(response.data.menuItem),
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
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
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
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

export const useUpdateMenuItemInventory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      itemId: number;
      data: Pick<
        UpdateMenuItemData,
        'isAvailable' | 'inventoryTrackingEnabled' | 'inventoryQuantity' | 'lowStockThreshold' | 'allowBackorder'
      >;
    }) => {
      const response = await apiPatch<{ menuItem: MenuItem; inventoryAlert?: InventoryAlert }, typeof data>(
        `/merchants/me/menu/item/${itemId}/inventory`,
        data,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update menu item inventory');
      }
      return {
        menuItem: normalizeMenuItem(response.data.menuItem),
        inventoryAlert: response.data.inventoryAlert,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
      toast({
        title: 'Inventory Updated',
        description: `${data.menuItem.name} inventory has been updated.`,
      });
      if (data.inventoryAlert) {
        toast({
          title: data.inventoryAlert.title,
          description: data.inventoryAlert.message,
          variant: data.inventoryAlert.level === 'OUT_OF_STOCK' ? 'destructive' : undefined,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Inventory',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateVariantInventory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      itemId,
      variantId,
      data,
    }: {
      itemId: number;
      variantId: number;
      data: {
        inventoryQuantity?: number | null;
        lowStockThreshold?: number | null;
        isAvailable?: boolean;
      };
    }) => {
      const response = await apiPatch<{ variant: MenuItemVariant; inventoryAlert?: InventoryAlert }, typeof data>(
        `/merchants/me/menu/item/${itemId}/variant/${variantId}/inventory`,
        data,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update variant inventory');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-menu'] });
      queryClient.invalidateQueries({ queryKey: ['merchantMenuItems'] });
      toast({
        title: 'Variant Updated',
        description: 'Variant inventory has been updated.',
      });
      if (data.inventoryAlert) {
        toast({
          title: data.inventoryAlert.title,
          description: data.inventoryAlert.message,
          variant: data.inventoryAlert.level === 'OUT_OF_STOCK' ? 'destructive' : undefined,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Variant',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

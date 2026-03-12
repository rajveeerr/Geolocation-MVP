import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem } from './useMerchantMenu';

export interface MenuCollectionItem {
  collectionId: number;
  menuItemId: number;
  sortOrder: number;
  isActive: boolean;
  customPrice: number | null;
  customDiscount: number | null;
  notes: string | null;
  menuItem: MenuItem;
}

export type MenuCollectionType = 'STANDARD' | 'HAPPY_HOUR' | 'SPECIAL';

export interface MenuCollection {
  id: number;
  merchantId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  menuType: MenuCollectionType;
  subType: string | null;
  startTime: string | null;
  endTime: string | null;
  themeName: string | null;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  items: MenuCollectionItem[];
  _count?: {
    items: number;
  };
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  menuType?: MenuCollectionType;
  subType?: string;
  startTime?: string;
  endTime?: string;
  themeName?: string;
  icon?: string;
  color?: string;
  menuItems?: Array<{
    id: number;
    sortOrder?: number;
    customPrice?: number | null;
    customDiscount?: number | null;
    notes?: string | null;
  }>;
  storeId?: number; // Optional store ID to link the menu to a specific store
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  isActive?: boolean;
  menuType?: MenuCollectionType;
  subType?: string;
  startTime?: string;
  endTime?: string;
  themeName?: string;
  icon?: string;
  color?: string;
}

export interface BulkItemData {
  id?: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  imageUrls?: string[];
  isHappyHour?: boolean;
  happyHourPrice?: number;
  discountPercent?: number;
}

export interface CreateFromDealTypeData {
  dealType: string;
  collectionName: string;
  description?: string;
  category?: string;
}

export interface MenuCollectionsResponse {
  collections: MenuCollection[];
}

export interface MenuCollectionResponse {
  collection: MenuCollection;
}

// Hook to fetch all menu collections for the authenticated merchant
// Optionally filter by menuType and storeId
export const useMenuCollections = (menuType?: MenuCollectionType, storeId?: number | null) => {
  return useQuery<MenuCollectionsResponse, Error>({
    queryKey: ['menu-collections', menuType ?? 'all', storeId ?? 'all-stores'],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (menuType) queryParams.append('menuType', menuType);
      if (storeId) queryParams.append('storeId', storeId.toString());
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await apiGet<MenuCollectionsResponse>(`/merchants/me/menu-collections${queryString}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch menu collections');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a single menu collection
export const useMenuCollection = (collectionId: number | null) => {
  return useQuery<MenuCollectionResponse, Error>({
    queryKey: ['menu-collection', collectionId],
    queryFn: async () => {
      if (!collectionId) throw new Error('Collection ID is required');
      const response = await apiGet<MenuCollectionResponse>(`/merchants/me/menu-collections/${collectionId}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch menu collection');
      }
      return response.data;
    },
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to create a new menu collection
export const useCreateMenuCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCollectionData) => {
      const response = await apiPost<MenuCollectionResponse, CreateCollectionData>('/merchants/me/menu-collections', data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create menu collection');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu-collections'] });
      toast({
        title: 'Collection Created!',
        description: `${data.collection.name} has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Collection',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to create a collection from deal type (one-click)
export const useCreateCollectionFromDealType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateFromDealTypeData) => {
      const response = await apiPost<MenuCollectionResponse & { message: string; itemsAdded: number }, CreateFromDealTypeData>(
        '/merchants/me/menu-collections/from-deal-type',
        data
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create collection from deal type');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu-collections'] });
      toast({
        title: 'Collection Created!',
        description: data.message || `${data.collection.name} has been created with ${data.itemsAdded || 0} items.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Collection',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to update a menu collection
export const useUpdateMenuCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ collectionId, data }: { collectionId: number; data: UpdateCollectionData }) => {
      const response = await apiPut<MenuCollectionResponse, UpdateCollectionData>(
        `/merchants/me/menu-collections/${collectionId}`,
        data
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update menu collection');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu-collections'] });
      queryClient.invalidateQueries({ queryKey: ['menu-collection', data.collection.id] });
      toast({
        title: 'Collection Updated!',
        description: `${data.collection.name} has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Collection',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to delete a menu collection
export const useDeleteMenuCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (collectionId: number) => {
      const response = await apiDelete<{ message: string }>(`/merchants/me/menu-collections/${collectionId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete menu collection');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-collections'] });
      toast({
        title: 'Collection Deleted',
        description: 'Menu collection has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Collection',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to get menu items by deal type
export const useMenuByDealType = (dealType: string | null, category?: string) => {
  return useQuery<{ menuItems: MenuItem[]; dealType: string; total: number; category: string | null }, Error>({
    queryKey: ['menu-by-deal-type', dealType, category],
    queryFn: async () => {
      if (!dealType) throw new Error('Deal type is required');
      const params = new URLSearchParams({ dealType });
      if (category) params.append('category', category);
      
      const response = await apiGet<{ menuItems: MenuItem[]; dealType: string; total: number; category: string | null }>(
        `/merchants/me/menu/by-deal-type?${params.toString()}`
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch menu items by deal type');
      }
      return response.data;
    },
    enabled: !!dealType,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to add items to a collection
export const useAddItemsToCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ collectionId, menuItems }: { collectionId: number; menuItems: Array<{ id: number; sortOrder?: number; customPrice?: number | null; customDiscount?: number | null; notes?: string | null }> }) => {
      const response = await apiPost<{ message: string; itemsAdded: number }, { menuItems: Array<{ id: number; sortOrder?: number; customPrice?: number | null; customDiscount?: number | null; notes?: string | null }> }>(
        `/merchants/me/menu-collections/${collectionId}/items`,
        { menuItems }
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to add items to collection');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-collections'] });
      queryClient.invalidateQueries({ queryKey: ['menu-collection', variables.collectionId] });
      toast({
        title: 'Items Added!',
        description: data.message || `Added ${data.itemsAdded} items to the collection.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Adding Items',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to remove an item from a collection
export const useRemoveItemFromCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ collectionId, itemId }: { collectionId: number; itemId: number }) => {
      const response = await apiDelete<{ message: string }>(
        `/merchants/me/menu-collections/${collectionId}/items/${itemId}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove item from collection');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-collections'] });
      queryClient.invalidateQueries({ queryKey: ['menu-collection', variables.collectionId] });
      toast({
        title: 'Item Removed',
        description: data?.message || 'Item has been removed from the collection.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Removing Item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to bulk create/update items in a collection (for inline editor save)
export const useBulkUpdateCollectionItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ collectionId, items }: { collectionId: number; items: BulkItemData[] }) => {
      const response = await apiPut<MenuCollectionResponse & { itemsProcessed: number }, { items: BulkItemData[] }>(
        `/merchants/me/menu-collections/${collectionId}/items/bulk`,
        { items }
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to bulk update collection items');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu-collections'] });
      queryClient.invalidateQueries({ queryKey: ['menu-collection', variables.collectionId] });
      toast({
        title: 'Menu Saved!',
        description: `${data.itemsProcessed} items saved successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Saving Menu',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};


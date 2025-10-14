import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Category Management
export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  active: boolean;
  dealCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  active?: boolean;
}

// Deal Type Management
export interface DealType {
  id: number;
  name: string;
  description: string;
  sortOrder?: number;
  active: boolean;
  dealCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealTypeData {
  name: string;
  description: string;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateDealTypeData {
  name?: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

// Point Event Type Management
export interface PointEventType {
  id: number;
  name: string;
  description: string;
  points: number;
  sortOrder?: number;
  active: boolean;
  eventCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePointEventTypeData {
  name: string;
  description: string;
  points: number;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdatePointEventTypeData {
  name?: string;
  description?: string;
  points?: number;
  sortOrder?: number;
  active?: boolean;
}

// API Response Types
export interface MasterDataResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface MasterDataListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  message: string;
}

export interface CategoriesResponse {
  message: string;
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DealTypesResponse {
  message: string;
  dealTypes: DealType[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PointEventTypesResponse {
  message: string;
  pointEventTypes: PointEventType[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Category Hooks
export const useAdminCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await apiGet<CategoriesResponse>('/admin/master-data/categories');
      console.log('Categories API Response:', response);
      if (!response.success || !response.data) {
        console.error('Categories API Error:', response.error);
        throw new Error(response.error || 'Failed to fetch categories');
      }
      console.log('Categories Data:', response.data.categories);
      return response.data.categories;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await apiPost<MasterDataResponse<Category>, CreateCategoryData>('/admin/master-data/categories', data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create category');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'Category Created!',
        description: data.message || 'Category has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCategoryData }) => {
      const response = await apiPut<MasterDataResponse<Category>, UpdateCategoryData>(`/admin/master-data/categories/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update category');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'Category Updated!',
        description: data.message || 'Category has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiDelete<MasterDataResponse<null>>(`/admin/master-data/categories/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete category');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: 'Category Deleted',
        description: data?.message || 'Category has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Category',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Deal Type Hooks
export const useAdminDealTypes = () => {
  return useQuery<DealType[], Error>({
    queryKey: ['admin-deal-types'],
    queryFn: async () => {
      const response = await apiGet<DealTypesResponse>('/admin/master-data/deal-types');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch deal types');
      }
      return response.data.dealTypes;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateDealType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateDealTypeData) => {
      const response = await apiPost<MasterDataResponse<DealType>, CreateDealTypeData>('/admin/master-data/deal-types', data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create deal type');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-deal-types'] });
      toast({
        title: 'Deal Type Created!',
        description: data.message || 'Deal type has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Deal Type',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateDealType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDealTypeData }) => {
      const response = await apiPut<MasterDataResponse<DealType>, UpdateDealTypeData>(`/admin/master-data/deal-types/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update deal type');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-deal-types'] });
      toast({
        title: 'Deal Type Updated!',
        description: data.message || 'Deal type has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Deal Type',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteDealType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiDelete<MasterDataResponse<null>>(`/admin/master-data/deal-types/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete deal type');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-deal-types'] });
      toast({
        title: 'Deal Type Deleted',
        description: data?.message || 'Deal type has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Deal Type',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Point Event Type Hooks
export const useAdminPointEventTypes = () => {
  return useQuery<PointEventType[], Error>({
    queryKey: ['admin-point-event-types'],
    queryFn: async () => {
      const response = await apiGet<PointEventTypesResponse>('/admin/master-data/point-event-types');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch point event types');
      }
      return response.data.pointEventTypes;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreatePointEventType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePointEventTypeData) => {
      const response = await apiPost<MasterDataResponse<PointEventType>, CreatePointEventTypeData>('/admin/master-data/point-event-types', data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create point event type');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-point-event-types'] });
      toast({
        title: 'Point Event Type Created!',
        description: data.message || 'Point event type has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Point Event Type',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePointEventType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePointEventTypeData }) => {
      const response = await apiPut<MasterDataResponse<PointEventType>, UpdatePointEventTypeData>(`/admin/master-data/point-event-types/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update point event type');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-point-event-types'] });
      toast({
        title: 'Point Event Type Updated!',
        description: data.message || 'Point event type has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Updating Point Event Type',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePointEventType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiDelete<MasterDataResponse<null>>(`/admin/master-data/point-event-types/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete point event type');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-point-event-types'] });
      toast({
        title: 'Point Event Type Deleted',
        description: data?.message || 'Point event type has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Deleting Point Event Type',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

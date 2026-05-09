import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type {
  CateringItem,
  CateringItemOption,
  CateringItemPayload,
  CateringOptionInput,
} from '@/types/catering';

const KEYS = {
  list: (includeInactive: boolean) => ['merchant', 'catering-items', { includeInactive }] as const,
  detail: (id: number) => ['merchant', 'catering-items', 'detail', id] as const,
  categories: () => ['merchant', 'catering-categories'] as const,
  publicMenu: (merchantId: number) => ['catering', 'public', merchantId] as const,
  publicCategories: (merchantId: number) => ['catering', 'public', merchantId, 'categories'] as const,
};

// ─── Public ──────────────────────────────────────────────────────────────────

export interface PublicCateringMerchant {
  id: number;
  businessName: string;
  logoUrl: string | null;
  description: string | null;
  priceRange: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PublicCateringResponse {
  merchant: PublicCateringMerchant;
  items: CateringItem[];
  total: number;
}

export const usePublicCateringMenu = (merchantId: number | null) => {
  return useQuery({
    queryKey: KEYS.publicMenu(merchantId ?? 0),
    queryFn: async () => {
      const res = await apiGet<PublicCateringResponse>(`/catering/${merchantId}`);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Catering menu not available');
      return res.data;
    },
    enabled: merchantId !== null,
    staleTime: 60_000,
  });
};

export const usePublicCateringCategories = (merchantId: number | null) => {
  return useQuery({
    queryKey: KEYS.publicCategories(merchantId ?? 0),
    queryFn: async () => {
      const res = await apiGet<{ categories: string[] }>(`/catering/${merchantId}/categories`);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load categories');
      return res.data.categories;
    },
    enabled: merchantId !== null,
    staleTime: 60_000,
  });
};

// ─── Order placement ─────────────────────────────────────────────────────────

export interface CateringOrderItemPayload {
  cateringItemId: number;
  quantity: number;
  selectedChoiceIds: number[];
  specialInstructions?: string | null;
}

export interface PlaceCateringOrderPayload {
  customerName: string;
  contactEmail: string;
  contactPhone: string;
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string | null;
  eventDate?: string | null;
  notes?: string | null;
  items: CateringOrderItemPayload[];
}

export interface PlacedCateringOrderItem {
  id: number;
  cateringItemId: number;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  specialInstructions: string | null;
  selectedOptions: Array<{
    optionId: number;
    optionName: string;
    choices: Array<{ choiceId: number; label: string; priceModifier: number }>;
  }> | null;
  cateringItem: {
    id: number;
    name: string;
    imageUrl: string | null;
    category: string;
  };
}

export interface PlacedCateringOrder {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  finalAmount: number;
  createdAt: string;
  metadata: Record<string, any> | null;
  cateringOrderItems: PlacedCateringOrderItem[];
  merchant?: { id: number; businessName: string; logoUrl?: string | null };
}

export const usePlaceCateringOrder = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      merchantId,
      payload,
    }: {
      merchantId: number;
      payload: PlaceCateringOrderPayload;
    }) => {
      const res = await apiPost<{ order: PlacedCateringOrder }, PlaceCateringOrderPayload>(
        `/catering/${merchantId}/orders`,
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to place order');
      return res.data.order;
    },
    onError: (error: Error) => {
      toast({ title: 'Could not place order', description: error.message, variant: 'destructive' });
    },
  });
};

export const useCateringOrder = (orderId: number | null) => {
  return useQuery({
    queryKey: ['catering', 'order', orderId ?? 0],
    queryFn: async () => {
      const res = await apiGet<{ order: PlacedCateringOrder }>(`/catering/orders/${orderId}`);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Order not found');
      return res.data.order;
    },
    enabled: orderId !== null,
    staleTime: 30_000,
  });
};

// ─── Customer order history ──────────────────────────────────────────────────

export interface MyCateringOrderListItem {
  id: number;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  subtotal: number;
  finalAmount: number;
  createdAt: string;
  metadata: Record<string, any> | null;
  merchant: { id: number; businessName: string; logoUrl: string | null };
  cateringOrderItems: Array<{
    id: number;
    quantity: number;
    totalPrice: number;
    cateringItem: { id: number; name: string; imageUrl: string | null; category: string };
  }>;
}

export interface MyCateringOrdersResponse {
  orders: MyCateringOrderListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  statusCounts: Record<string, number>;
}

export const useMyCateringOrders = (
  opts: { status?: string; page?: number; limit?: number } = {},
) => {
  const status = opts.status ?? 'ALL';
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  return useQuery({
    queryKey: ['catering', 'my-orders', { status, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status !== 'ALL') params.set('status', status);
      const res = await apiGet<MyCateringOrdersResponse>(`/catering/my-orders?${params.toString()}`);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load your orders');
      return res.data;
    },
    staleTime: 30_000,
  });
};

// ─── Merchant orders inbox ───────────────────────────────────────────────────

export type CateringOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export const CATERING_STATUSES: CateringOrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
];

export interface MerchantCateringOrder extends PlacedCateringOrder {
  status: CateringOrderStatus;
  user: { id: number; name: string | null; email: string | null; avatarUrl: string | null };
}

export interface MerchantCateringOrdersResponse {
  orders: MerchantCateringOrder[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  statusCounts: Record<string, number>;
}

const MERCHANT_ORDER_KEYS = {
  list: (status: string, page: number) => ['merchant', 'catering-orders', { status, page }] as const,
  detail: (id: number) => ['merchant', 'catering-orders', 'detail', id] as const,
};

export const useMerchantCateringOrders = (
  opts: { status?: CateringOrderStatus | 'ALL'; page?: number; limit?: number } = {},
) => {
  const status = opts.status ?? 'ALL';
  const page = opts.page ?? 1;
  const limit = opts.limit ?? 20;
  return useQuery({
    queryKey: MERCHANT_ORDER_KEYS.list(status, page),
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status !== 'ALL') params.set('status', status);
      const res = await apiGet<MerchantCateringOrdersResponse>(
        `/merchants/me/catering-orders?${params.toString()}`,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load orders');
      return res.data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};

export const useMerchantCateringOrder = (orderId: number | null) => {
  return useQuery({
    queryKey: MERCHANT_ORDER_KEYS.detail(orderId ?? 0),
    queryFn: async () => {
      const res = await apiGet<{ order: MerchantCateringOrder }>(
        `/merchants/me/catering-orders/${orderId}`,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Order not found');
      return res.data.order;
    },
    enabled: orderId !== null,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};

export const useUpdateMerchantCateringOrderStatus = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      merchantNote,
    }: {
      orderId: number;
      status: CateringOrderStatus;
      merchantNote?: string | null;
    }) => {
      const res = await apiPut<{ order: MerchantCateringOrder }, { status: CateringOrderStatus; merchantNote?: string | null }>(
        `/merchants/me/catering-orders/${orderId}/status`,
        { status, merchantNote: merchantNote ?? null },
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Could not update status');
      return res.data.order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['merchant', 'catering-orders'] });
      toast({ title: 'Order updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Status update failed', description: error.message, variant: 'destructive' });
    },
  });
};

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['merchant', 'catering-items'] });
  qc.invalidateQueries({ queryKey: ['merchant', 'catering-categories'] });
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useCateringItems = (opts: { includeInactive?: boolean } = {}) => {
  const includeInactive = opts.includeInactive ?? true;
  return useQuery({
    queryKey: KEYS.list(includeInactive),
    queryFn: async () => {
      const qs = includeInactive ? '?includeInactive=true' : '';
      const res = await apiGet<{ items: CateringItem[]; total: number }>(`/merchants/me/catering-items${qs}`);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load catering items');
      return res.data;
    },
    staleTime: 30_000,
  });
};

export const useCateringItem = (id: number | null) => {
  return useQuery({
    queryKey: KEYS.detail(id ?? 0),
    queryFn: async () => {
      const res = await apiGet<{ item: CateringItem }>(`/merchants/me/catering-items/${id}`);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load catering item');
      return res.data.item;
    },
    enabled: id !== null,
    staleTime: 30_000,
  });
};

export const useCateringCategories = () => {
  return useQuery({
    queryKey: KEYS.categories(),
    queryFn: async () => {
      const res = await apiGet<{ categories: string[] }>('/merchants/me/catering-categories');
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load categories');
      return res.data.categories;
    },
    staleTime: 60_000,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateCateringItem = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: CateringItemPayload) => {
      const res = await apiPost<{ item: CateringItem }, CateringItemPayload>(
        '/merchants/me/catering-items',
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to create catering item');
      return res.data.item;
    },
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: 'Catering item created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not create item', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateCateringItem = (id: number) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: CateringItemPayload) => {
      const res = await apiPut<{ item: CateringItem }, CateringItemPayload>(
        `/merchants/me/catering-items/${id}`,
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to update catering item');
      return res.data.item;
    },
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: 'Catering item saved' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not save', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteCateringItem = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, hard = false }: { id: number; hard?: boolean }) => {
      const qs = hard ? '?hard=true' : '';
      const res = await apiDelete<{ message: string }>(`/merchants/me/catering-items/${id}${qs}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete catering item');
      return res.data;
    },
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: 'Catering item removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not remove', description: error.message, variant: 'destructive' });
    },
  });
};

export const useAddCateringOption = (itemId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CateringOptionInput) => {
      const res = await apiPost<{ option: CateringItemOption }, CateringOptionInput>(
        `/merchants/me/catering-items/${itemId}/options`,
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to add option');
      return res.data.option;
    },
    onSuccess: () => invalidateAll(qc),
  });
};

export const useUpdateCateringOption = (itemId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ optionId, payload }: { optionId: number; payload: CateringOptionInput }) => {
      const res = await apiPut<{ option: CateringItemOption }, CateringOptionInput>(
        `/merchants/me/catering-items/${itemId}/options/${optionId}`,
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to update option');
      return res.data.option;
    },
    onSuccess: () => invalidateAll(qc),
  });
};

export const useDeleteCateringOption = (itemId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (optionId: number) => {
      const res = await apiDelete<{ message: string }>(
        `/merchants/me/catering-items/${itemId}/options/${optionId}`,
      );
      if (!res.success) throw new Error(res.error ?? 'Failed to delete option');
      return res.data;
    },
    onSuccess: () => invalidateAll(qc),
  });
};

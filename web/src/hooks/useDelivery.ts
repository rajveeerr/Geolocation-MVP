import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';

export interface DeliveryCoordinate {
  lat: number;
  lng: number;
  address?: string;
}

export interface DeliveryProviderStatusResponse {
  providers: {
    ubereats: { enabled: boolean; mode: 'live' | 'heuristic' | 'disabled' };
    doordash: { enabled: boolean; mode: 'live' | 'heuristic' | 'disabled' };
  };
}

export interface DeliveryQuote {
  provider: 'ubereats' | 'doordash';
  serviceLevel: string;
  deliveryType: string;
  estimatedFee: number | null;
  estimatedMinMinutes: number | null;
  estimatedMaxMinutes: number | null;
  currency: string;
  deepLink: string;
  availability: 'available' | 'deep_link_only' | 'unavailable';
  rawMeta: Record<string, unknown>;
}

export interface DeliveryCompareResponse {
  quotes: DeliveryQuote[];
  errors: Array<{ provider: string; message: string }>;
  cacheHit: boolean;
  bestByPrice: DeliveryQuote | null;
  bestByEta: DeliveryQuote | null;
}

export function useDeliveryProviderStatus() {
  return useQuery<DeliveryProviderStatusResponse>({
    queryKey: ['deliveryProviderStatus'],
    queryFn: async () => {
      const response = await apiGet<DeliveryProviderStatusResponse>('/delivery/providers/status');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load delivery provider status');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeliveryComparison(params: {
  origin?: DeliveryCoordinate | null;
  merchantId?: number;
  eventId?: number;
  serviceId?: number;
  cartSubtotal?: number;
  enabled?: boolean;
}) {
  return useQuery<DeliveryCompareResponse>({
    queryKey: ['deliveryComparison', params],
    queryFn: async () => {
      const response = await apiPost<DeliveryCompareResponse, Omit<typeof params, 'enabled'>>('/delivery/compare', {
        origin: params.origin!,
        merchantId: params.merchantId,
        eventId: params.eventId,
        serviceId: params.serviceId,
        cartSubtotal: params.cartSubtotal,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to compare delivery options');
      }
      return response.data;
    },
    enabled: !!params.enabled && !!params.origin,
    staleTime: 60 * 1000,
  });
}

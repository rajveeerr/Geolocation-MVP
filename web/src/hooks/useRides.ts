import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';

export interface RideCoordinate {
  lat: number;
  lng: number;
  address?: string;
}

export interface RideProviderStatusResponse {
  providers: {
    uber: { enabled: boolean; mode: 'live' | 'deep_link_only' | 'disabled' };
    lyft: { enabled: boolean; mode: 'live' | 'deep_link_only' | 'disabled' };
  };
}

export interface RideEstimate {
  provider: 'uber' | 'lyft';
  rideType: string;
  estimatedFareMin: number | null;
  estimatedFareMax: number | null;
  estimatedArrivalMinutes: number | null;
  estimatedTripMinutes: number | null;
  currency: string;
  deepLink: string;
  availability: 'available' | 'deep_link_only' | 'unavailable';
  rawMeta: Record<string, unknown>;
}

export interface RideEstimatesResponse {
  estimates: RideEstimate[];
  errors: Array<{ provider: string; message: string }>;
  cacheHit: boolean;
}

export function useRideProviderStatus() {
  return useQuery<RideProviderStatusResponse>({
    queryKey: ['rideProviderStatus'],
    queryFn: async () => {
      const response = await apiGet<RideProviderStatusResponse>('/rides/providers/status');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load ride provider status');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRideEstimates(params: {
  pickup?: RideCoordinate | null;
  merchantId?: number;
  eventId?: number;
  serviceId?: number;
  enabled?: boolean;
}) {
  return useQuery<RideEstimatesResponse>({
    queryKey: ['rideEstimates', params],
    queryFn: async () => {
      const response = await apiPost<RideEstimatesResponse, Omit<typeof params, 'enabled'>>('/rides/estimates', {
        pickup: params.pickup!,
        merchantId: params.merchantId,
        eventId: params.eventId,
        serviceId: params.serviceId,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch ride estimates');
      }
      return response.data;
    },
    enabled: !!params.enabled && !!params.pickup,
    staleTime: 60 * 1000,
  });
}

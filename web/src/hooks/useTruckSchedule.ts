import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Store } from '@/hooks/useMerchantStores';
import type {
  CreateTruckStopPayload,
  ScheduledStop,
  TruckScheduleStatus,
  TruckSummary,
  UpdateTruckStopPayload,
} from '@/types/truckSchedule';

const KEYS = {
  merchantTrucks: () => ['merchant', 'trucks'] as const,
  schedule: (storeId: number, from?: string, to?: string) =>
    ['merchant', 'truck-schedule', storeId, from ?? null, to ?? null] as const,
  scheduleByStore: (storeId: number) =>
    ['merchant', 'truck-schedule', storeId] as const,
  currentStop: (storeId: number) =>
    ['merchant', 'truck-schedule', storeId, 'current'] as const,
  nearbyTrucks: (lat: number, lng: number, radius: number, liveOnly: boolean) =>
    ['food-trucks', 'nearby', lat, lng, radius, liveOnly] as const,
};

const buildScheduleQuery = (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

// ─── Merchant ──────────────────────────────────────────────────────────────────

export interface MerchantTruckOverviewItem extends Store {
  isFoodTruck: true;
  currentStop: ScheduledStop | null;
  nextStop: ScheduledStop | null;
  upcomingStopCount: number;
}

export const useMerchantTrucksOverview = () => {
  return useQuery({
    queryKey: KEYS.merchantTrucks(),
    queryFn: async () => {
      const res = await apiGet<{ trucks: MerchantTruckOverviewItem[]; total: number }>(
        '/merchants/trucks',
      );
      if (!res.success || !res.data) {
        throw new Error(res.error ?? 'Failed to load trucks');
      }
      return res.data;
    },
    // Refresh every minute so "live now" badges stay accurate.
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};

export const useTruckSchedule = (
  storeId: number | null,
  range?: { from?: string; to?: string },
) => {
  return useQuery({
    queryKey: KEYS.schedule(storeId ?? 0, range?.from, range?.to),
    queryFn: async () => {
      const qs = buildScheduleQuery(range?.from, range?.to);
      const res = await apiGet<{ stops: ScheduledStop[] }>(
        `/merchants/stores/${storeId}/schedule${qs}`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error ?? 'Failed to load schedule');
      }
      return res.data;
    },
    enabled: storeId !== null,
    staleTime: 30_000,
  });
};

export const useCurrentTruckStop = (storeId: number | null) => {
  return useQuery({
    queryKey: KEYS.currentStop(storeId ?? 0),
    queryFn: async () => {
      const res = await apiGet<TruckScheduleStatus>(
        `/merchants/stores/${storeId}/schedule/current`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error ?? 'Failed to load current stop');
      }
      return res.data;
    },
    enabled: storeId !== null,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};

const invalidateScheduleFor = (
  queryClient: ReturnType<typeof useQueryClient>,
  storeId: number,
) => {
  queryClient.invalidateQueries({ queryKey: KEYS.scheduleByStore(storeId) });
  queryClient.invalidateQueries({ queryKey: KEYS.merchantTrucks() });
};

export const useCreateTruckStop = (storeId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: CreateTruckStopPayload) => {
      const res = await apiPost<{ stop: ScheduledStop }, CreateTruckStopPayload>(
        `/merchants/stores/${storeId}/schedule`,
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error ?? 'Failed to create stop');
      }
      return res.data.stop;
    },
    onSuccess: () => {
      invalidateScheduleFor(queryClient, storeId);
      toast({ title: 'Stop scheduled', description: 'Your stop is now live for customers to see.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not schedule stop', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateTruckStop = (storeId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ stopId, payload }: { stopId: number; payload: UpdateTruckStopPayload }) => {
      const res = await apiPut<{ stop: ScheduledStop }, UpdateTruckStopPayload>(
        `/merchants/stores/${storeId}/schedule/${stopId}`,
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error ?? 'Failed to update stop');
      }
      return res.data.stop;
    },
    onSuccess: () => {
      invalidateScheduleFor(queryClient, storeId);
      toast({ title: 'Stop updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not update stop', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteTruckStop = (storeId: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (stopId: number) => {
      const res = await apiDelete<{ message: string }>(
        `/merchants/stores/${storeId}/schedule/${stopId}`,
      );
      if (!res.success) {
        throw new Error(res.error ?? 'Failed to delete stop');
      }
      return res.data;
    },
    onSuccess: () => {
      invalidateScheduleFor(queryClient, storeId);
      toast({ title: 'Stop removed' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not remove stop', description: error.message, variant: 'destructive' });
    },
  });
};

// ─── Consumer ──────────────────────────────────────────────────────────────────

export interface NearbyTrucksResponse {
  liveNow: TruckSummary[];
  upcoming: TruckSummary[];
  total: number;
}

export const useNearbyTrucks = (
  lat: number | null,
  lng: number | null,
  radiusMi: number = 10,
  opts: { liveOnly?: boolean } = {},
) => {
  const liveOnly = opts.liveOnly ?? false;
  return useQuery({
    queryKey: KEYS.nearbyTrucks(lat ?? 0, lng ?? 0, radiusMi, liveOnly),
    queryFn: async () => {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(radiusMi),
      });
      if (liveOnly) params.set('liveOnly', 'true');
      const res = await apiGet<NearbyTrucksResponse>(
        `/food-trucks/nearby?${params.toString()}`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error ?? 'Failed to load nearby trucks');
      }
      return res.data;
    },
    enabled: lat !== null && lng !== null,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};

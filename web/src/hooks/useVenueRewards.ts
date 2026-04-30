import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete, apiPut, apiPostFormData } from '@/services/api';

export type VenueRewardType =
  | 'COINS'
  | 'DISCOUNT_PERCENTAGE'
  | 'DISCOUNT_FIXED'
  | 'BONUS_POINTS'
  | 'FREE_ITEM'
  | 'SPECIAL_OFFER';

export type CheckInRewardCondition = 'ANY_CHECKIN' | 'FIRST_VISIT' | 'BIRTHDAY';

export interface VenueReward {
  id: number;
  merchantId: number;
  storeId?: number | null;
  title: string;
  description?: string | null;
  rewardType: VenueRewardType;
  rewardAmount: number;
  geoFenceRadiusMeters: number;
  latitude: number | null;
  longitude: number | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  maxTotalClaims: number | null;
  maxClaimsPerUser: number;
  cooldownHours: number;
  requiresCheckIn: boolean;
  checkInCondition?: CheckInRewardCondition;
  imageUrl?: string | null;
  currentClaims: number;
  merchant?: {
    id: number;
    businessName: string;
    logoUrl?: string | null;
  };
  store?: {
    id: number;
    address: string;
  };
  distanceMeters?: number;
  userClaimCount?: number;
  lastClaimedAt?: string | null;
  canClaim?: boolean;
  _count?: {
    claims: number;
  };
}

export interface MerchantVenueRewardsResponse {
  rewards: VenueReward[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    totalRewards: number;
    activeRewards: number;
    totalClaims: number;
  };
}

export interface NearbyVenueRewardsResponse {
  rewards: VenueReward[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CreateVenueRewardPayload {
  title: string;
  description?: string;
  rewardType: VenueRewardType;
  rewardAmount: number;
  geoFenceRadiusMeters?: number;
  storeId?: number;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
  maxTotalClaims?: number;
  maxClaimsPerUser?: number;
  cooldownHours?: number;
  requiresCheckIn?: boolean;
  checkInCondition?: CheckInRewardCondition;
  imageUrl?: string;
}

export interface VenueRewardVerificationStatus {
  steps: Array<{
    id: number;
    stepType: string;
    status: string;
    documentUrl?: string | null;
    rejectionReason?: string | null;
    notes?: string | null;
  }>;
  isFullyVerified: boolean;
  pendingSteps: string[];
}

export function useNearbyVenueRewards(params: {
  latitude?: number | null;
  longitude?: number | null;
  radius?: number;
  page?: number;
  limit?: number;
}) {
  return useQuery<NearbyVenueRewardsResponse>({
    queryKey: ['venueRewards', 'nearby', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        latitude: String(params.latitude),
        longitude: String(params.longitude),
        radius: String(params.radius ?? 5000),
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 20),
      });
      const response = await apiGet<NearbyVenueRewardsResponse>(`/venue-rewards/rewards/nearby?${searchParams.toString()}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load nearby venue rewards');
      }
      return response.data;
    },
    enabled: params.latitude != null && params.longitude != null,
    staleTime: 60 * 1000,
  });
}

export function useMerchantVenueRewards(status?: string) {
  return useQuery<MerchantVenueRewardsResponse>({
    queryKey: ['venueRewards', 'merchant', status ?? 'all'],
    queryFn: async () => {
      const response = await apiGet<MerchantVenueRewardsResponse>(
        `/venue-rewards/rewards/my${status ? `?status=${status}` : ''}`,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load merchant venue rewards');
      }
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useVenueRewardDetail(rewardId: number | null) {
  return useQuery<VenueReward>({
    queryKey: ['venueRewards', 'detail', rewardId],
    queryFn: async () => {
      const response = await apiGet<VenueReward>(`/venue-rewards/rewards/${rewardId}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load venue reward');
      }
      return response.data;
    },
    enabled: !!rewardId,
    staleTime: 60 * 1000,
  });
}

export function useCreateVenueReward() {
  const queryClient = useQueryClient();
  return useMutation<VenueReward, Error, CreateVenueRewardPayload>({
    mutationFn: async (payload) => {
      const response = await apiPost<VenueReward, CreateVenueRewardPayload>('/venue-rewards/rewards', payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create venue reward');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venueRewards', 'merchant'] });
    },
  });
}

export function useUpdateVenueReward(rewardId: number) {
  const queryClient = useQueryClient();
  return useMutation<VenueReward, Error, Partial<CreateVenueRewardPayload>>({
    mutationFn: async (payload) => {
      const response = await apiPut<VenueReward, Partial<CreateVenueRewardPayload>>(
        `/venue-rewards/rewards/${rewardId}`,
        payload,
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update venue reward');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venueRewards', 'merchant'] });
      queryClient.invalidateQueries({ queryKey: ['venueRewards', 'detail', rewardId] });
    },
  });
}

export function useDeleteVenueReward() {
  const queryClient = useQueryClient();
  return useMutation<{ message?: string; soft?: boolean }, Error, number>({
    mutationFn: async (rewardId) => {
      const response = await apiDelete<{ message?: string; soft?: boolean }>(`/venue-rewards/rewards/${rewardId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete venue reward');
      }
      return response.data || {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venueRewards', 'merchant'] });
    },
  });
}

export function useActivateVenueReward() {
  const queryClient = useQueryClient();
  return useMutation<VenueReward, Error, number>({
    mutationFn: async (rewardId) => {
      const response = await apiPost<VenueReward, Record<string, never>>(`/venue-rewards/rewards/${rewardId}/activate`, {});
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to activate venue reward');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venueRewards', 'merchant'] });
    },
  });
}

export function useDeactivateVenueReward() {
  const queryClient = useQueryClient();
  return useMutation<VenueReward, Error, number>({
    mutationFn: async (rewardId) => {
      const response = await apiPost<VenueReward, Record<string, never>>(`/venue-rewards/rewards/${rewardId}/deactivate`, {});
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to pause venue reward');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venueRewards', 'merchant'] });
    },
  });
}

export function useClaimVenueReward() {
  const queryClient = useQueryClient();
  return useMutation<
    { claim: unknown; coinsAwarded?: number; balanceAfter?: number; distanceMeters?: number; cooldownHours?: number },
    Error,
    { rewardId: number; latitude: number; longitude: number; verificationMethod?: 'GPS' | 'QR_CODE'; qrData?: string }
  >({
    mutationFn: async ({ rewardId, ...payload }) => {
      const response = await apiPost<
        { claim: unknown; coinsAwarded?: number; balanceAfter?: number; distanceMeters?: number; cooldownHours?: number },
        typeof payload
      >(`/venue-rewards/rewards/${rewardId}/claim`, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to claim venue reward');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venueRewards'] });
    },
  });
}

export function useVenueRewardVerificationStatus() {
  return useQuery<VenueRewardVerificationStatus>({
    queryKey: ['venueRewards', 'verificationStatus'],
    queryFn: async () => {
      const response = await apiGet<VenueRewardVerificationStatus>('/venue-rewards/verification/status');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load verification status');
      }
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useUploadVenueRewardVerificationDocument() {
  return useMutation<{ documentUrl: string; publicId: string }, Error, { file: File; stepType: string }>({
    mutationFn: async ({ file, stepType }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('stepType', stepType);

      const response = await apiPostFormData<{ documentUrl: string; publicId: string }>(
        '/venue-rewards/verification/upload-document',
        formData,
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to upload verification document');
      }

      return response.data;
    },
  });
}

export function useSubmitVenueRewardVerification() {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { stepType: string; documentUrl: string; documentType?: string }
  >({
    mutationFn: async (payload) => {
      const response = await apiPost<unknown, typeof payload>('/venue-rewards/verification/submit', payload);
      if (!response.success) {
        throw new Error(response.error || 'Failed to submit verification');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venueRewards', 'verificationStatus'] });
    },
  });
}

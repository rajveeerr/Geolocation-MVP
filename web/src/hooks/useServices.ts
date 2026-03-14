import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api';

export const SERVICE_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export const SERVICE_BOOKING_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number]['value'];
export type ServiceBookingStatus = (typeof SERVICE_BOOKING_STATUSES)[number]['value'];

export interface ServicePricingTier {
  id: number;
  serviceId: number;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  totalSlots: number | null;
  maxPerUser: number;
  isActive: boolean;
}

export interface ServiceAddOn {
  id: number;
  serviceId: number;
  name: string;
  description: string | null;
  price: number;
  isOptional: boolean;
  isActive: boolean;
}

export interface Service {
  id: number;
  merchantId: number;
  title: string;
  description: string;
  shortDescription: string | null;
  serviceType: string;
  category: string | null;
  durationMinutes: number;
  coverImageUrl: string | null;
  imageGallery: string[];
  tags: string[];
  requiresApproval: boolean;
  advanceBookingDays: number;
  cancellationHours: number;
  maxBookingsPerDay: number | null;
  status: ServiceStatus | string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  merchant?: {
    id: number;
    businessName: string;
    logoUrl: string | null;
    address: string | null;
    phoneNumber?: string | null;
  };
  pricingTiers?: ServicePricingTier[];
  addOns?: ServiceAddOn[];
  _count?: {
    bookings: number;
  };
}

export interface ServiceBooking {
  id: number;
  serviceId: number;
  tierId: number;
  userId: number;
  status: ServiceBookingStatus | string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  confirmationCode: string;
  qrCodeData: string;
  totalAmount: number;
  notes: string | null;
  specialRequests: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  tier?: ServicePricingTier;
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
}

export interface PaginatedResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  services?: T[];
  bookings?: T[];
}

export interface PublicServicesQuery {
  serviceType?: string;
  merchantId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateServicePayload {
  title: string;
  description: string;
  shortDescription?: string;
  serviceType: string;
  category?: string;
  durationMinutes: number;
  coverImageUrl?: string;
  imageGallery?: string[];
  tags?: string[];
  requiresApproval?: boolean;
  advanceBookingDays?: number;
  cancellationHours?: number;
  maxBookingsPerDay?: number;
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

export interface CreateServicePricingTierPayload {
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  totalSlots?: number;
  maxPerUser?: number;
}

export type UpdateServicePricingTierPayload = Partial<CreateServicePricingTierPayload & { isActive: boolean }>;

export interface CreateServiceAddOnPayload {
  name: string;
  description?: string;
  price: number;
  isOptional?: boolean;
}

export type UpdateServiceAddOnPayload = Partial<CreateServiceAddOnPayload & { isActive: boolean }>;

export interface CreateServiceBookingPayload {
  tierId: number;
  bookingDate: string;
  startTime: string;
  notes?: string;
  specialRequests?: string;
  contactPhone?: string;
  contactEmail?: string;
  addOns?: { addOnId: number; quantity: number }[];
}

export function usePublicServices(params: PublicServicesQuery) {
  return useQuery<{ services: Service[]; pagination: PaginatedResponse<Service>['pagination'] }>({
    queryKey: ['publicServices', params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params.serviceType) qs.set('serviceType', params.serviceType);
      if (params.merchantId) qs.set('merchantId', String(params.merchantId));
      if (params.search) qs.set('search', params.search);
      qs.set('page', String(params.page ?? 1));
      qs.set('limit', String(params.limit ?? 20));

      const res = await apiGet<{ services: Service[]; pagination: PaginatedResponse<Service>['pagination'] }>(
        `/services${qs.toString() ? `?${qs.toString()}` : ''}`,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch services');
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function usePublicServiceDetail(serviceId: number | undefined) {
  return useQuery<Service>({
    queryKey: ['publicService', serviceId],
    queryFn: async () => {
      const res = await apiGet<{ service: Service }>(`/services/${serviceId}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch service');
      return res.data.service;
    },
    enabled: !!serviceId,
    staleTime: 60 * 1000,
  });
}

export function usePublicServicesByMerchant(merchantId: number | undefined) {
  return useQuery<{ services: Service[]; pagination: PaginatedResponse<Service>['pagination'] }>({
    queryKey: ['publicServicesByMerchant', merchantId],
    queryFn: async () => {
      const res = await apiGet<{ services: Service[]; pagination: PaginatedResponse<Service>['pagination'] }>(
        `/merchants/${merchantId}/services`,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch merchant services');
      return res.data;
    },
    enabled: !!merchantId,
    staleTime: 60 * 1000,
  });
}

export function useMerchantServices(status?: string) {
  return useQuery<Service[]>({
    queryKey: ['merchantServices', status],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (status) qs.set('status', status);
      const res = await apiGet<{ services: Service[] }>(`/services/me/list${qs.toString() ? `?${qs.toString()}` : ''}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch your services');
      return res.data.services;
    },
    staleTime: 60 * 1000,
  });
}

export function useMerchantService(serviceId: number | undefined) {
  return useQuery<Service>({
    queryKey: ['merchantService', serviceId],
    queryFn: async () => {
      const res = await apiGet<{ service: Service }>(`/services/${serviceId}`);
      if (res.success && res.data) return res.data.service;

      const listRes = await apiGet<{ services: Service[] }>('/services/me/list');
      if (!listRes.success || !listRes.data) {
        throw new Error(res.error || listRes.error || 'Failed to fetch service');
      }
      const found = listRes.data.services.find((service) => service.id === serviceId);
      if (!found) throw new Error('Service not found');
      return found;
    },
    enabled: !!serviceId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, CreateServicePayload>({
    mutationFn: async (payload) => {
      const res = await apiPost<{ service: Service; message: string }, CreateServicePayload>('/services', payload);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to create service');
      return res.data.service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantServices'] });
    },
  });
}

export function useUpdateService(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, UpdateServicePayload>({
    mutationFn: async (payload) => {
      const res = await apiPut<{ service: Service; message: string }, UpdateServicePayload>(`/services/${serviceId}`, payload);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update service');
      return res.data.service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['merchantServices'] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicServices'] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation<{ result: unknown; message: string }, Error, number>({
    mutationFn: async (serviceId) => {
      const res = await apiDelete<{ result: unknown; message: string }>(`/services/${serviceId}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to delete service');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantServices'] });
      queryClient.invalidateQueries({ queryKey: ['publicServices'] });
    },
  });
}

export function usePublishService(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, void>({
    mutationFn: async () => {
      const res = await apiPost<{ service: Service; message: string }, Record<string, never>>(`/services/${serviceId}/publish`, {});
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to publish service');
      return res.data.service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['merchantServices'] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicServices'] });
    },
  });
}

export function usePauseService(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, void>({
    mutationFn: async () => {
      const res = await apiPost<{ service: Service; message: string }, Record<string, never>>(`/services/${serviceId}/pause`, {});
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to pause service');
      return res.data.service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['merchantServices'] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicServices'] });
    },
  });
}

export function useCancelService(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<Service, Error, void>({
    mutationFn: async () => {
      const res = await apiPost<{ service: Service; message: string }, Record<string, never>>(`/services/${serviceId}/cancel`, {});
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to cancel service');
      return res.data.service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['merchantServices'] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicServices'] });
      queryClient.invalidateQueries({ queryKey: ['merchantServiceBookings'] });
    },
  });
}

export function useCreateServicePricingTier(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<ServicePricingTier, Error, CreateServicePricingTierPayload>({
    mutationFn: async (payload) => {
      const res = await apiPost<{ tier: ServicePricingTier; message: string }, CreateServicePricingTierPayload>(
        `/services/${serviceId}/pricing-tiers`,
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to create pricing tier');
      return res.data.tier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['merchantServices'] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicServices'] });
    },
  });
}

export function useUpdateServicePricingTier(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<ServicePricingTier, Error, { tierId: number; data: UpdateServicePricingTierPayload }>({
    mutationFn: async ({ tierId, data }) => {
      const res = await apiPut<{ tier: ServicePricingTier; message: string }, UpdateServicePricingTierPayload>(
        `/services/${serviceId}/pricing-tiers/${tierId}`,
        data,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update pricing tier');
      return res.data.tier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
    },
  });
}

export function useDeleteServicePricingTier(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<{ result: unknown; message: string }, Error, number>({
    mutationFn: async (tierId) => {
      const res = await apiDelete<{ result: unknown; message: string }>(`/services/${serviceId}/pricing-tiers/${tierId}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to delete pricing tier');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
    },
  });
}

export function useCreateServiceAddOn(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<ServiceAddOn, Error, CreateServiceAddOnPayload>({
    mutationFn: async (payload) => {
      const res = await apiPost<{ addOn: ServiceAddOn; message: string }, CreateServiceAddOnPayload>(
        `/services/${serviceId}/add-ons`,
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to create add-on');
      return res.data.addOn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
    },
  });
}

export function useUpdateServiceAddOn(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<ServiceAddOn, Error, { addOnId: number; data: UpdateServiceAddOnPayload }>({
    mutationFn: async ({ addOnId, data }) => {
      const res = await apiPut<{ addOn: ServiceAddOn; message: string }, UpdateServiceAddOnPayload>(
        `/services/${serviceId}/add-ons/${addOnId}`,
        data,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update add-on');
      return res.data.addOn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
    },
  });
}

export function useDeleteServiceAddOn(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<{ result: unknown; message: string }, Error, number>({
    mutationFn: async (addOnId) => {
      const res = await apiDelete<{ result: unknown; message: string }>(`/services/${serviceId}/add-ons/${addOnId}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to delete add-on');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['publicService', serviceId] });
    },
  });
}

export function useMerchantServiceBookings(params?: {
  status?: string;
  serviceId?: number;
  date?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<{ bookings: ServiceBooking[]; pagination: PaginatedResponse<ServiceBooking>['pagination'] }>({
    queryKey: ['merchantServiceBookings', params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.serviceId) qs.set('serviceId', String(params.serviceId));
      if (params?.date) qs.set('date', params.date);
      qs.set('page', String(params?.page ?? 1));
      qs.set('limit', String(params?.limit ?? 20));

      const res = await apiGet<{ bookings: ServiceBooking[]; pagination: PaginatedResponse<ServiceBooking>['pagination'] }>(
        `/services/me/bookings${qs.toString() ? `?${qs.toString()}` : ''}`,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch bookings');
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useConfirmServiceBooking() {
  const queryClient = useQueryClient();
  return useMutation<ServiceBooking, Error, number>({
    mutationFn: async (bookingId) => {
      const res = await apiPut<{ booking: ServiceBooking; message: string }, Record<string, never>>(
        `/services/bookings/${bookingId}/confirm`,
        {},
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to confirm booking');
      return res.data.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantServiceBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myServiceBookings'] });
    },
  });
}

export function useCompleteServiceBooking() {
  const queryClient = useQueryClient();
  return useMutation<ServiceBooking, Error, number>({
    mutationFn: async (bookingId) => {
      const res = await apiPut<{ booking: ServiceBooking; message: string }, Record<string, never>>(
        `/services/bookings/${bookingId}/complete`,
        {},
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to complete booking');
      return res.data.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantServiceBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myServiceBookings'] });
    },
  });
}

export function useNoShowServiceBooking() {
  const queryClient = useQueryClient();
  return useMutation<ServiceBooking, Error, number>({
    mutationFn: async (bookingId) => {
      const res = await apiPut<{ booking: ServiceBooking; message: string }, Record<string, never>>(
        `/services/bookings/${bookingId}/no-show`,
        {},
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to mark booking as no-show');
      return res.data.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantServiceBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myServiceBookings'] });
    },
  });
}

export function useServiceCheckIn() {
  const queryClient = useQueryClient();
  return useMutation<{ checkIn: unknown; message: string }, Error, { bookingId: number; qrData: string }>({
    mutationFn: async ({ bookingId, qrData }) => {
      const res = await apiPost<{ checkIn: unknown; message: string }, { qrData: string }>(
        `/services/bookings/${bookingId}/check-in`,
        { qrData },
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to check in booking');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantServiceBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myServiceBookings'] });
    },
  });
}

export function useCreateServiceBooking(serviceId: number) {
  const queryClient = useQueryClient();
  return useMutation<ServiceBooking, Error, CreateServiceBookingPayload>({
    mutationFn: async (payload) => {
      const res = await apiPost<{ booking: ServiceBooking; message: string }, CreateServiceBookingPayload>(
        `/services/${serviceId}/bookings`,
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to create booking');
      return res.data.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServiceBookings'] });
      queryClient.invalidateQueries({ queryKey: ['merchantServiceBookings'] });
    },
  });
}

export function useMyServiceBookings(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery<{ bookings: ServiceBooking[]; pagination: PaginatedResponse<ServiceBooking>['pagination'] }>({
    queryKey: ['myServiceBookings', params],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      qs.set('page', String(params?.page ?? 1));
      qs.set('limit', String(params?.limit ?? 20));
      const res = await apiGet<{ bookings: ServiceBooking[]; pagination: PaginatedResponse<ServiceBooking>['pagination'] }>(
        `/users/me/service-bookings${qs.toString() ? `?${qs.toString()}` : ''}`,
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch your service bookings');
      return res.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useCancelMyServiceBooking() {
  const queryClient = useQueryClient();
  return useMutation<ServiceBooking, Error, { bookingId: number }>({
    mutationFn: async ({ bookingId }) => {
      const res = await apiDelete<{ booking: ServiceBooking; message: string }>(`/services/bookings/${bookingId}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to cancel booking');
      return res.data.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myServiceBookings'] });
      queryClient.invalidateQueries({ queryKey: ['merchantServiceBookings'] });
    },
  });
}

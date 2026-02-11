import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import type { EventDetail, EventTicketTier } from './useEventDetail';

// ─── Enums ──────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  { value: 'PARTY', label: 'Party' },
  { value: 'BAR_CRAWL', label: 'Bar Crawl' },
  { value: 'SPORTS_TOURNAMENT', label: 'Sports Tournament' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'RSVP_EVENT', label: 'RSVP Event' },
  { value: 'WAGBT', label: 'WAGBT' },
] as const;

export const EVENT_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'SOLD_OUT', label: 'Sold Out' },
] as const;

export const TICKET_TIERS = [
  { value: 'GENERAL_ADMISSION', label: 'General Admission' },
  { value: 'VIP', label: 'VIP' },
  { value: 'PREMIUM', label: 'Premium' },
  { value: 'EARLY_BIRD', label: 'Early Bird' },
  { value: 'ALL_ACCESS', label: 'All Access' },
  { value: 'DAY_PASS', label: 'Day Pass' },
] as const;

export type EventType = (typeof EVENT_TYPES)[number]['value'];
export type EventStatus = (typeof EVENT_STATUSES)[number]['value'];
export type TicketTierType = (typeof TICKET_TIERS)[number]['value'];

// ─── Request Types ──────────────────────────────────────────────────

export interface CreateEventPayload {
  title: string;
  description: string;
  shortDescription?: string;
  eventType: EventType;
  merchantId?: number;
  venueName?: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  cityId?: number;
  isVirtualEvent?: boolean;
  virtualEventUrl?: string;
  startDate: string;
  endDate: string;
  timezone?: string;
  isMultiDay?: boolean;
  maxAttendees?: number;
  enableWaitlist?: boolean;
  waitlistCapacity?: number;
  isFreeEvent?: boolean;
  enablePresale?: boolean;
  presaleStartDate?: string;
  presaleEndDate?: string;
  coverImageUrl?: string;
  imageGallery?: string[];
  videoUrl?: string;
  isPrivate?: boolean;
  requiresApproval?: boolean;
  minAge?: number;
  ageVerificationReq?: boolean;
  tags?: string[];
  categoryId?: number;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface CreateTicketTierPayload {
  name: string;
  tier: TicketTierType;
  price: number;
  totalQuantity: number;
  description?: string;
  serviceFee?: number;
  taxRate?: number;
  minPerOrder?: number;
  maxPerOrder?: number;
  maxPerUser?: number;
  isPresaleOnly?: boolean;
  presaleCode?: string;
  validDates?: string[];
  salesStartDate?: string;
  salesEndDate?: string;
}

export type UpdateTicketTierPayload = Partial<CreateTicketTierPayload>;

export interface CreateAddOnPayload {
  name: string;
  category: string;
  price: number;
  description?: string;
  isOptional?: boolean;
  totalQuantity?: number;
  maxPerUser?: number;
  availableFrom?: string;
  availableUntil?: string;
}

export type UpdateAddOnPayload = Partial<CreateAddOnPayload>;

// ─── Response Types ─────────────────────────────────────────────────

export interface EventAddOn {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  category: string;
  price: number;
  isOptional: boolean;
  totalQuantity: number | null;
  maxPerUser: number;
  availableFrom: string | null;
  availableUntil: string | null;
  isActive: boolean;
}

// ─── Hooks ──────────────────────────────────────────────────────────

/**
 * Fetch organizer's own events (GET /events/my-events)
 */
export function useMyEvents(status?: EventStatus) {
  return useQuery<EventDetail[]>({
    queryKey: ['myEvents', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const qs = params.toString();
      const res = await apiGet<{ events: EventDetail[] }>(
        `/events/my-events${qs ? `?${qs}` : ''}`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch events');
      }
      return res.data.events;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch a single event by ID (for manage/edit page)
 */
export function useEventForManage(eventId: number | undefined) {
  return useQuery<EventDetail>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await apiGet<{ event: EventDetail }>(
        `/events/events/${eventId}`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch event');
      }
      return res.data.event;
    },
    enabled: !!eventId,
    staleTime: 60 * 1000,
  });
}

/**
 * Create a new event (POST /events/events)
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<EventDetail, Error, CreateEventPayload>({
    mutationFn: async (payload) => {
      const res = await apiPost<{ event: EventDetail; message: string }, CreateEventPayload>(
        '/events/events',
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create event');
      }
      return res.data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
    },
  });
}

/**
 * Update an event (PUT /events/events/:id)
 */
export function useUpdateEvent(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation<EventDetail, Error, UpdateEventPayload>({
    mutationFn: async (payload) => {
      const res = await apiPut<{ event: EventDetail; message: string }, UpdateEventPayload>(
        `/events/events/${eventId}`,
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update event');
      }
      return res.data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
    },
  });
}

/**
 * Delete/cancel an event (DELETE /events/events/:id)
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; action: string }, Error, number>({
    mutationFn: async (eventId) => {
      const res = await apiDelete<{ message: string; action: string }>(
        `/events/events/${eventId}`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to delete event');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
    },
  });
}

/**
 * Publish an event (POST /events/events/:id/publish)
 */
export function usePublishEvent(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation<EventDetail, Error, void>({
    mutationFn: async () => {
      const res = await apiPost<{ event: EventDetail; message: string }, Record<string, never>>(
        `/events/events/${eventId}/publish`,
        {},
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to publish event');
      }
      return res.data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
    },
  });
}

// ─── Ticket Tier Hooks ──────────────────────────────────────────────

/**
 * Create a ticket tier (POST /events/events/:eventId/ticket-tiers)
 */
export function useCreateTicketTier(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation<EventTicketTier, Error, CreateTicketTierPayload>({
    mutationFn: async (payload) => {
      const res = await apiPost<{ ticketTier: EventTicketTier; message: string }, CreateTicketTierPayload>(
        `/events/events/${eventId}/ticket-tiers`,
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create ticket tier');
      }
      return res.data.ticketTier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

/**
 * Update a ticket tier (PUT /events/events/:eventId/ticket-tiers/:tierId)
 */
export function useUpdateTicketTier(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation<EventTicketTier, Error, { tierId: number; data: UpdateTicketTierPayload }>({
    mutationFn: async ({ tierId, data }) => {
      const res = await apiPut<{ ticketTier: EventTicketTier; message: string }, UpdateTicketTierPayload>(
        `/events/events/${eventId}/ticket-tiers/${tierId}`,
        data,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update ticket tier');
      }
      return res.data.ticketTier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

/**
 * Delete a ticket tier (DELETE /events/events/:eventId/ticket-tiers/:tierId)
 */
export function useDeleteTicketTier(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; action: string }, Error, number>({
    mutationFn: async (tierId) => {
      const res = await apiDelete<{ message: string; action: string }>(
        `/events/events/${eventId}/ticket-tiers/${tierId}`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to delete ticket tier');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

// ─── Add-On Hooks ───────────────────────────────────────────────────

/**
 * Create an add-on (POST /events/events/:eventId/add-ons)
 */
export function useCreateAddOn(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation<EventAddOn, Error, CreateAddOnPayload>({
    mutationFn: async (payload) => {
      const res = await apiPost<{ addOn: EventAddOn; message: string }, CreateAddOnPayload>(
        `/events/events/${eventId}/add-ons`,
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create add-on');
      }
      return res.data.addOn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

/**
 * Update an add-on (PUT /events/events/:eventId/add-ons/:addOnId)
 */
export function useUpdateAddOn(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation<EventAddOn, Error, { addOnId: number; data: UpdateAddOnPayload }>({
    mutationFn: async ({ addOnId, data }) => {
      const res = await apiPut<{ addOn: EventAddOn; message: string }, UpdateAddOnPayload>(
        `/events/events/${eventId}/add-ons/${addOnId}`,
        data,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update add-on');
      }
      return res.data.addOn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

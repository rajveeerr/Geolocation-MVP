import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';
import type { EventTicket, EventDetail } from './useEventDetail';

// ─── Types ──────────────────────────────────────────────────────────

export interface MyTicket extends EventTicket {
  event: EventDetail & {
    organizer: { id: number; name: string | null; email: string };
    merchant: { id: number; businessName: string; logoUrl: string | null } | null;
  };
  ticketTier: {
    id: number;
    name: string;
    tier: string;
    price: number;
    description: string | null;
  };
}

export interface TicketQRResponse {
  qrCode: string;
  qrCodeImage: string; // base64 data URI
  event: {
    title: string;
    startDate: string;
  };
}

export interface RefundResponse {
  success: boolean;
  ticket: EventTicket;
  refundAmount: number;
  message: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  ticket: EventTicket;
  checkIn: {
    id: number;
    userId: number;
    eventId: number;
    latitude: number | null;
    longitude: number | null;
    locationName: string | null;
    checkedInAt: string;
  };
  bonusPoints: number;
}

// ─── Ticketmaster Types ────────────────────────────────────────────

export interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images: { url: string; width: number; height: number; ratio: string }[];
  dates: {
    start: { localDate: string; localTime: string; dateTime: string };
    end?: { localDate: string; localTime: string; dateTime: string };
    timezone: string;
    status: { code: string };
  };
  priceRanges?: { type: string; currency: string; min: number; max: number }[];
  _embedded?: {
    venues?: TicketmasterVenue[];
    attractions?: TicketmasterAttraction[];
  };
  [key: string]: unknown;
}

export interface TicketmasterVenue {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images?: { url: string; width: number; height: number }[];
  city?: { name: string };
  state?: { name: string; stateCode: string };
  country?: { name: string; countryCode: string };
  address?: { line1: string; line2?: string };
  location?: { latitude: string; longitude: string };
  [key: string]: unknown;
}

export interface TicketmasterAttraction {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images?: { url: string; width: number; height: number }[];
  classifications?: { segment: { name: string }; genre: { name: string }; subGenre?: { name: string } }[];
  [key: string]: unknown;
}

export interface TicketmasterPagination {
  page: number;
  size: number;
  total: number;
  totalPages?: number;
}

// ─── Consumer Hooks ─────────────────────────────────────────────────

/**
 * Fetch the current user's purchased tickets.
 * GET /events/my-tickets?status=&upcoming=
 */
export function useMyTickets(params?: { status?: string; upcoming?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.upcoming !== undefined) qs.set('upcoming', String(params.upcoming));

  return useQuery<{ tickets: MyTicket[] }>({
    queryKey: ['myTickets', params],
    queryFn: async () => {
      const res = await apiGet<{ tickets: MyTicket[] }>(
        `/events/my-tickets${qs.toString() ? `?${qs.toString()}` : ''}`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch your tickets');
      }
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch the QR code for a specific ticket.
 * GET /events/tickets/:ticketId/qr
 */
export function useTicketQR(ticketId: number | null) {
  return useQuery<TicketQRResponse>({
    queryKey: ['ticketQR', ticketId],
    queryFn: async () => {
      const res = await apiGet<TicketQRResponse>(`/events/tickets/${ticketId}/qr`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to get ticket QR code');
      }
      return res.data;
    },
    enabled: !!ticketId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Refund a specific ticket.
 * POST /events/tickets/:ticketId/refund
 */
export function useRefundTicket() {
  const queryClient = useQueryClient();

  return useMutation<RefundResponse, Error, { ticketId: number; reason?: string }>({
    mutationFn: async ({ ticketId, reason }) => {
      const res = await apiPost<RefundResponse, { reason?: string }>(
        `/events/tickets/${ticketId}/refund`,
        { reason },
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to refund ticket');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    },
  });
}

// ─── Organizer / Merchant Hooks ────────────────────────────────────

/**
 * Check in an attendee via QR code (organizer/admin only).
 * POST /events/events/:eventId/checkin
 */
export function useCheckIn(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation<
    CheckInResponse,
    Error,
    { qrCode: string; latitude?: number; longitude?: number; locationName?: string }
  >({
    mutationFn: async (body) => {
      const res = await apiPost<CheckInResponse, typeof body>(
        `/events/events/${eventId}/checkin`,
        body,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to check in attendee');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['merchantEvent', eventId] });
    },
  });
}

// ─── Ticketmaster Hooks ─────────────────────────────────────────────

/**
 * Search Ticketmaster events.
 * GET /events/ticketmaster/search
 */
export function useTicketmasterSearch(params: {
  keyword?: string;
  city?: string;
  stateCode?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  genre?: string;
  page?: number;
  size?: number;
  sort?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...searchParams } = params;
  const qs = new URLSearchParams();
  if (searchParams.keyword) qs.set('keyword', searchParams.keyword);
  if (searchParams.city) qs.set('city', searchParams.city);
  if (searchParams.stateCode) qs.set('stateCode', searchParams.stateCode);
  if (searchParams.postalCode) qs.set('postalCode', searchParams.postalCode);
  if (searchParams.latitude) qs.set('latitude', String(searchParams.latitude));
  if (searchParams.longitude) qs.set('longitude', String(searchParams.longitude));
  if (searchParams.radius) qs.set('radius', String(searchParams.radius));
  if (searchParams.startDate) qs.set('startDate', searchParams.startDate);
  if (searchParams.endDate) qs.set('endDate', searchParams.endDate);
  if (searchParams.genre) qs.set('genre', searchParams.genre);
  qs.set('page', String(searchParams.page ?? 0));
  qs.set('size', String(searchParams.size ?? 20));
  if (searchParams.sort) qs.set('sort', searchParams.sort);

  return useQuery<{
    events: TicketmasterEvent[];
    pagination: TicketmasterPagination;
    source: string;
  }>({
    queryKey: ['ticketmasterSearch', searchParams],
    queryFn: async () => {
      const res = await apiGet<{
        events: TicketmasterEvent[];
        pagination: TicketmasterPagination;
        source: string;
      }>(`/events/ticketmaster/search?${qs.toString()}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to search Ticketmaster events');
      }
      return res.data;
    },
    enabled: enabled && !!(searchParams.keyword || searchParams.city),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Get a single Ticketmaster event detail.
 * GET /events/ticketmaster/:eventId
 */
export function useTicketmasterEvent(eventId: string | null) {
  return useQuery<{ event: TicketmasterEvent; source: string }>({
    queryKey: ['ticketmasterEvent', eventId],
    queryFn: async () => {
      const res = await apiGet<{ event: TicketmasterEvent; source: string }>(
        `/events/ticketmaster/${eventId}`,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to get Ticketmaster event');
      }
      return res.data;
    },
    enabled: !!eventId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Search Ticketmaster venues.
 * GET /events/ticketmaster/venues/search
 */
export function useTicketmasterVenues(params: {
  keyword?: string;
  city?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...searchParams } = params;
  const qs = new URLSearchParams();
  if (searchParams.keyword) qs.set('keyword', searchParams.keyword);
  if (searchParams.city) qs.set('city', searchParams.city);
  if (searchParams.stateCode) qs.set('stateCode', searchParams.stateCode);
  if (searchParams.latitude) qs.set('latitude', String(searchParams.latitude));
  if (searchParams.longitude) qs.set('longitude', String(searchParams.longitude));
  if (searchParams.radius) qs.set('radius', String(searchParams.radius));

  return useQuery<{ venues: TicketmasterVenue[]; pagination: TicketmasterPagination }>({
    queryKey: ['ticketmasterVenues', searchParams],
    queryFn: async () => {
      const res = await apiGet<{
        venues: TicketmasterVenue[];
        pagination: TicketmasterPagination;
      }>(`/events/ticketmaster/venues/search?${qs.toString()}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to search venues');
      }
      return res.data;
    },
    enabled: enabled && !!(searchParams.keyword || searchParams.city),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Search Ticketmaster attractions.
 * GET /events/ticketmaster/attractions/search
 */
export function useTicketmasterAttractions(params: {
  keyword?: string;
  page?: number;
  size?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...searchParams } = params;
  const qs = new URLSearchParams();
  if (searchParams.keyword) qs.set('keyword', searchParams.keyword);
  qs.set('page', String(searchParams.page ?? 0));
  qs.set('size', String(searchParams.size ?? 20));

  return useQuery<{ attractions: TicketmasterAttraction[]; pagination: TicketmasterPagination }>({
    queryKey: ['ticketmasterAttractions', searchParams],
    queryFn: async () => {
      const res = await apiGet<{
        attractions: TicketmasterAttraction[];
        pagination: TicketmasterPagination;
      }>(`/events/ticketmaster/attractions/search?${qs.toString()}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to search attractions');
      }
      return res.data;
    },
    enabled: enabled && !!searchParams.keyword,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

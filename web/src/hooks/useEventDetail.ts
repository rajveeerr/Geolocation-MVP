import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';

// ─── Types ──────────────────────────────────────────────────────────

export interface EventTicketTier {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  tier: string;
  price: number;
  serviceFee: number;
  taxRate: number;
  totalQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  minPerOrder: number;
  maxPerOrder: number;
  maxPerUser: number | null;
  isPresaleOnly: boolean;
  presaleCode: string | null;
  validDates: string[];
  isActive: boolean;
  salesStartDate: string | null;
  salesEndDate: string | null;
}

export interface EventOrganizer {
  id: number;
  name: string | null;
  email: string;
  avatarUrl?: string | null;
}

export interface EventMerchant {
  id: number;
  businessName: string;
  logoUrl: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phoneNumber?: string | null;
}

export interface EventAddOn {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  category: string;
  price: number;
  isOptional: boolean;
  totalQuantity: number | null;
  soldQuantity: number;
  maxPerUser: number;
  isActive: boolean;
}

export interface EventCity {
  id: number;
  name: string;
  state: string;
}

export interface EventDetail {
  id: number;
  title: string;
  description: string;
  shortDescription: string | null;
  eventType: string;
  status: string;
  organizerId: number;
  merchantId: number | null;
  venueName: string | null;
  venueAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  cityId: number | null;
  isVirtualEvent: boolean;
  virtualEventUrl: string | null;
  startDate: string;
  endDate: string;
  timezone: string;
  isMultiDay: boolean;
  maxAttendees: number | null;
  currentAttendees: number;
  enableWaitlist: boolean;
  waitlistCapacity: number | null;
  isFreeEvent: boolean;
  enablePresale: boolean;
  presaleStartDate: string | null;
  presaleEndDate: string | null;
  coverImageUrl: string | null;
  imageGallery: string[];
  videoUrl: string | null;
  isPrivate: boolean;
  accessCode: string | null;
  requiresApproval: boolean;
  minAge: number | null;
  ageVerificationReq: boolean;
  tags: string[];
  socialProofCount: number;
  trendingScore: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  cancelledAt: string | null;

  organizer: EventOrganizer;
  merchant: EventMerchant | null;
  city: EventCity | null;
  ticketTiers: EventTicketTier[];
  addOns?: EventAddOn[];
  _count?: {
    attendees: number;
    ticketTiers: number;
    checkIns?: number;
  };

  // Auth-dependent fields
  userAttendee?: { id: number; attendeeType: string; waitlistPosition: number | null } | null;
  userTickets?: EventTicket[] | null;
  isUserAttending?: boolean;

  // Computed fields from formatEventResponse
  availableTickets: number;
  isSoldOut: boolean;
  isUpcoming: boolean;
  isPast: boolean;
}

export interface EventTicket {
  id: number;
  ticketTierId: number;
  eventId: number;
  userId: number;
  ticketNumber: string;
  qrCode: string;
  status: string;
  purchasePrice: number;
  purchasedAt: string | null;
  checkedInAt: string | null;
}

export interface PurchaseResponse {
  tickets: EventTicket[];
  message: string;
  totalPrice: number;
  paymentTransaction?: {
    id: number;
    amount: number;
    status: string;
  };
  pointsEarned?: number;
}

export interface WaitlistResponse {
  attendee: {
    id: number;
    eventId: number;
    userId: number;
    attendeeType: string;
    waitlistPosition: number;
  };
  position: number;
  message: string;
}

// ─── Mock Data (fallback when API isn't running) ────────────────────

function createMockEvent(id: number): EventDetail {
  const mockEvents: Record<number, Partial<EventDetail>> = {
    1: {
      title: 'Neon Nights: Electronics Festival',
      description:
        'Experience the ultimate electronic music festival with world-class DJs, mesmerizing light shows, and an electric atmosphere that will keep you dancing until dawn.',
      shortDescription: "Downtown's biggest electronic music festival with top DJs and immersive light shows.",
      eventType: 'PARTY',
      venueName: 'Club Electro',
      venueAddress: '420 Sunset Blvd, Los Angeles, CA 90028',
      latitude: 34.0928,
      longitude: -118.3287,
      startDate: '2026-03-20T21:00:00.000Z',
      endDate: '2026-03-21T03:00:00.000Z',
      maxAttendees: 500,
      currentAttendees: 127,
      enableWaitlist: true,
      isFreeEvent: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      imageGallery: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
      ],
      videoUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600',
      minAge: 21,
      ageVerificationReq: true,
      tags: ['Electronic', 'DJ', 'Nightlife', 'Festival'],
      socialProofCount: 48,
      trendingScore: 87.5,
      ticketTiers: [
        {
          id: 101,
          eventId: 1,
          name: 'Early Bird',
          description: 'Limited early bird pricing — grab them fast!',
          tier: 'EARLY_BIRD',
          price: 15.0,
          serviceFee: 2.5,
          taxRate: 0.08,
          totalQuantity: 50,
          soldQuantity: 46,
          reservedQuantity: 0,
          minPerOrder: 1,
          maxPerOrder: 4,
          maxPerUser: null,
          isPresaleOnly: false,
          presaleCode: null,
          validDates: [],
          isActive: true,
          salesStartDate: null,
          salesEndDate: null,
        },
        {
          id: 102,
          eventId: 1,
          name: 'General Admission',
          description: 'Standard entry with full venue access.',
          tier: 'GENERAL_ADMISSION',
          price: 25.0,
          serviceFee: 3.0,
          taxRate: 0.08,
          totalQuantity: 300,
          soldQuantity: 65,
          reservedQuantity: 0,
          minPerOrder: 1,
          maxPerOrder: 6,
          maxPerUser: null,
          isPresaleOnly: false,
          presaleCode: null,
          validDates: [],
          isActive: true,
          salesStartDate: null,
          salesEndDate: null,
        },
        {
          id: 103,
          eventId: 1,
          name: 'VIP Pass',
          description: 'Priority entry, reserved lounge, complimentary drinks.',
          tier: 'VIP',
          price: 75.0,
          serviceFee: 5.0,
          taxRate: 0.08,
          totalQuantity: 50,
          soldQuantity: 50,
          reservedQuantity: 0,
          minPerOrder: 1,
          maxPerOrder: 2,
          maxPerUser: null,
          isPresaleOnly: false,
          presaleCode: null,
          validDates: [],
          isActive: true,
          salesStartDate: null,
          salesEndDate: null,
        },
      ],
    },
    2: {
      title: 'Sunset Rooftop Jazz & Wine',
      description:
        "Unwind on our exclusive rooftop terrace with smooth live jazz performances, curated wine pairings from Napa Valley's finest vineyards, and gourmet small plates.",
      shortDescription: 'Live jazz, fine wine & small plates on a stunning rooftop terrace.',
      eventType: 'RSVP_EVENT',
      venueName: 'The Rooftop at Grand',
      venueAddress: '750 Grand Ave, Los Angeles, CA 90017',
      latitude: 34.0537,
      longitude: -118.2540,
      startDate: '2026-03-15T18:00:00.000Z',
      endDate: '2026-03-15T22:30:00.000Z',
      maxAttendees: 80,
      currentAttendees: 52,
      enableWaitlist: false,
      isFreeEvent: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
      imageGallery: [
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
        'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600',
      ],
      minAge: 21,
      ageVerificationReq: true,
      tags: ['Jazz', 'Wine', 'Rooftop', 'Live Music'],
      socialProofCount: 22,
      trendingScore: 62.0,
      ticketTiers: [
        {
          id: 201,
          eventId: 2,
          name: 'General Admission',
          description: 'Rooftop access + 1 complimentary glass of wine.',
          tier: 'GENERAL_ADMISSION',
          price: 45.0,
          serviceFee: 4.0,
          taxRate: 0.08,
          totalQuantity: 60,
          soldQuantity: 38,
          reservedQuantity: 0,
          minPerOrder: 1,
          maxPerOrder: 4,
          maxPerUser: null,
          isPresaleOnly: false,
          presaleCode: null,
          validDates: [],
          isActive: true,
          salesStartDate: null,
          salesEndDate: null,
        },
        {
          id: 202,
          eventId: 2,
          name: 'Premium Table',
          description: 'Reserved table for 2, bottle service, priority seating.',
          tier: 'PREMIUM',
          price: 120.0,
          serviceFee: 8.0,
          taxRate: 0.08,
          totalQuantity: 20,
          soldQuantity: 14,
          reservedQuantity: 0,
          minPerOrder: 1,
          maxPerOrder: 2,
          maxPerUser: null,
          isPresaleOnly: false,
          presaleCode: null,
          validDates: [],
          isActive: true,
          salesStartDate: null,
          salesEndDate: null,
        },
      ],
    },
    3: {
      title: 'Taco & Beer Bar Crawl',
      description:
        "Hit 4 of downtown's best taco spots and craft beer bars in one epic crawl! Includes a taco tasting at each stop, 4 craft beer samples, a souvenir pint glass, and a guided tour.",
      shortDescription: '4-stop taco & craft beer crawl through downtown.',
      eventType: 'BAR_CRAWL',
      venueName: 'Starts at Taco Republic',
      venueAddress: '312 Main St, Los Angeles, CA 90012',
      latitude: 34.0505,
      longitude: -118.2453,
      startDate: '2026-04-05T14:00:00.000Z',
      endDate: '2026-04-05T19:00:00.000Z',
      maxAttendees: 40,
      currentAttendees: 12,
      enableWaitlist: false,
      isFreeEvent: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=1200',
      imageGallery: [
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
      ],
      tags: ['Bar Crawl', 'Tacos', 'Craft Beer', 'Food Tour'],
      socialProofCount: 8,
      trendingScore: 35.0,
      ticketTiers: [
        {
          id: 301,
          eventId: 3,
          name: 'General Admission',
          description: 'Full crawl access — tacos, beers, pint glass included.',
          tier: 'GENERAL_ADMISSION',
          price: 35.0,
          serviceFee: 3.0,
          taxRate: 0.08,
          totalQuantity: 40,
          soldQuantity: 12,
          reservedQuantity: 0,
          minPerOrder: 1,
          maxPerOrder: 6,
          maxPerUser: null,
          isPresaleOnly: false,
          presaleCode: null,
          validDates: [],
          isActive: true,
          salesStartDate: null,
          salesEndDate: null,
        },
      ],
    },
    4: {
      title: 'Community Yoga in the Park',
      description:
        'Start your weekend right with a free outdoor yoga session led by certified instructor Mia Chen. All skill levels welcome. Mats provided on a first-come, first-served basis.',
      shortDescription: 'Free community yoga — all levels welcome.',
      eventType: 'RSVP_EVENT',
      venueName: 'Echo Park Lake',
      venueAddress: '751 Echo Park Ave, Los Angeles, CA 90026',
      latitude: 34.0781,
      longitude: -118.2606,
      startDate: '2026-03-08T08:00:00.000Z',
      endDate: '2026-03-08T09:30:00.000Z',
      maxAttendees: 100,
      currentAttendees: 41,
      enableWaitlist: false,
      isFreeEvent: true,
      coverImageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200',
      imageGallery: [],
      tags: ['Yoga', 'Free', 'Community', 'Wellness'],
      socialProofCount: 41,
      trendingScore: 55.0,
      ticketTiers: [
        {
          id: 401,
          eventId: 4,
          name: 'Free RSVP',
          description: "Reserve your spot — it's completely free!",
          tier: 'GENERAL_ADMISSION',
          price: 0,
          serviceFee: 0,
          taxRate: 0,
          totalQuantity: 100,
          soldQuantity: 41,
          reservedQuantity: 0,
          minPerOrder: 1,
          maxPerOrder: 2,
          maxPerUser: null,
          isPresaleOnly: false,
          presaleCode: null,
          validDates: [],
          isActive: true,
          salesStartDate: null,
          salesEndDate: null,
        },
      ],
    },
  };

  const base = mockEvents[id] ?? mockEvents[1]!;
  return {
    id,
    status: 'PUBLISHED',
    organizerId: 1,
    merchantId: 1,
    cityId: 1,
    isVirtualEvent: false,
    virtualEventUrl: null,
    timezone: 'America/Los_Angeles',
    isMultiDay: false,
    waitlistCapacity: null,
    enablePresale: false,
    presaleStartDate: null,
    presaleEndDate: null,
    isPrivate: false,
    accessCode: null,
    requiresApproval: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    cancelledAt: null,
    organizer: { id: 1, name: 'Yohop Events', email: 'events@yohop.com' },
    merchant: {
      id: 1,
      businessName: 'Echoes Living Room',
      logoUrl: null,
      address: base.venueAddress ?? null,
      latitude: base.latitude ?? null,
      longitude: base.longitude ?? null,
    },
    city: { id: 1, name: 'Los Angeles', state: 'CA' },
    availableTickets: (base.ticketTiers ?? []).reduce(
      (s, t) => s + (t.totalQuantity - t.soldQuantity - t.reservedQuantity),
      0,
    ),
    isSoldOut: false,
    isUpcoming: true,
    isPast: false,
    // Spread the specific event overrides last
    ...base,
  } as EventDetail;
}

/** Get all mock events for browsing (used by EventsTab fallback) */
export function getMockEvents(): EventDetail[] {
  return [1, 2, 3, 4].map(createMockEvent);
}

// ─── Hooks ──────────────────────────────────────────────────────────

export function useEventDetail(eventId: string | number | undefined) {
  return useQuery<EventDetail>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      try {
        const res = await apiGet<{ event: EventDetail }>(`/events/events/${eventId}`);
        if (!res.success || !res.data) {
          throw new Error(res.error || 'Failed to fetch event');
        }
        // The backend may return the event at top level or nested
        return (res.data as any).event ?? res.data;
      } catch (error) {
        // If API fails, fall back to mock data for development
        console.warn('Event API call failed, using mock data:', error);
        // Ensure we pass a number to createMockEvent if possible, or default to 1
        const mockId = typeof eventId === 'number' ? eventId : 1;
        return createMockEvent(mockId);
      }
    },
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function usePurchaseTickets(eventId: string | number) {
  const queryClient = useQueryClient();

  return useMutation<PurchaseResponse, Error, { ticketTierId: number; quantity: number; paymentIntentId?: string }>({
    mutationFn: async (body) => {
      const res = await apiPost<PurchaseResponse, typeof body>(`/events/events/${eventId}/tickets/purchase`, body);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to purchase tickets');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    },
  });
}

export function useJoinWaitlist(eventId: string | number) {
  const queryClient = useQueryClient();

  return useMutation<WaitlistResponse, Error, { phoneNumber?: string; smsNotifications?: boolean }>({
    mutationFn: async (body) => {
      const res = await apiPost<WaitlistResponse, typeof body>(`/events/events/${eventId}/waitlist/join`, body);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to join waitlist');
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

export function useDiscoverEvents(params: {
  keyword?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  includeTicketmaster?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params.keyword) qs.set('keyword', params.keyword);
  if (params.city) qs.set('city', params.city);
  if (params.latitude) qs.set('latitude', String(params.latitude));
  if (params.longitude) qs.set('longitude', String(params.longitude));
  if (params.radius) qs.set('radius', String(params.radius));
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  qs.set('page', String(params.page ?? 0));
  qs.set('size', String(params.size ?? 20));
  qs.set('includeTicketmaster', String(params.includeTicketmaster ?? true));

  return useQuery({
    queryKey: ['discoverEvents', params],
    queryFn: async () => {
      const res = await apiGet<{
        events: any[];
        pagination: { page: number; size: number; total: number };
        sources: { local: number; ticketmaster: number };
      }>(`/events/discover?${qs.toString()}`);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to discover events');
      }
      return res.data;
    },
    staleTime: 3 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Browse published events from the backend.
 * Uses GET /api/events/events with optional filters.
 * Falls back to mock data if the API is unavailable.
 */
export function useBrowseEvents(params?: {
  eventType?: string;
  cityId?: number;
  search?: string;
  isFreeEvent?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery<{ events: EventDetail[]; totalCount: number; page: number; totalPages: number }>({
    queryKey: ['browseEvents', params],
    queryFn: async () => {
      try {
        const qs = new URLSearchParams();
        if (params?.eventType) qs.set('eventType', params.eventType);
        if (params?.cityId) qs.set('cityId', String(params.cityId));
        if (params?.search) qs.set('search', params.search);
        if (params?.isFreeEvent !== undefined) qs.set('isFreeEvent', String(params.isFreeEvent));
        qs.set('page', String(params?.page ?? 1));
        qs.set('limit', String(params?.limit ?? 20));
        qs.set('sortBy', params?.sortBy ?? 'startDate');
        qs.set('sortOrder', params?.sortOrder ?? 'asc');

        const res = await apiGet<{
          events: EventDetail[];
          totalCount: number;
          page: number;
          totalPages: number;
        }>(`/events/events?${qs.toString()}`);

        if (!res.success || !res.data) {
          throw new Error(res.error || 'Failed to browse events');
        }
        return res.data;
      } catch (error) {
        console.warn('Browse events API failed, using mock data:', error);
        const mocks = getMockEvents();
        return { events: mocks, totalCount: mocks.length, page: 1, totalPages: 1 };
      }
    },
    staleTime: 2 * 60 * 1000,
  });
}

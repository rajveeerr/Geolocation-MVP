import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { EventType, CreateTicketTierPayload } from '@/hooks/useMerchantEvents';

// ─── State ──────────────────────────────────────────────────────────

export interface EventCreationState {
  // Step 1: Basics
  title: string;
  description: string;
  shortDescription: string;
  eventType: EventType | null;
  tags: string[];

  // Step 2: Date & Location
  startDate: string;
  endDate: string;
  timezone: string;
  isMultiDay: boolean;
  isVirtualEvent: boolean;
  virtualEventUrl: string;
  venueName: string;
  venueAddress: string;
  latitude: number | null;
  longitude: number | null;
  cityId: number | null;

  // Step 3: Capacity & Settings
  maxAttendees: number | null;
  enableWaitlist: boolean;
  waitlistCapacity: number | null;
  isFreeEvent: boolean;
  isPrivate: boolean;
  requiresApproval: boolean;
  minAge: number | null;
  ageVerificationReq: boolean;

  // Step 4: Media
  coverImageUrl: string;
  imageGallery: string[];
  videoUrl: string;

  // Step 5: Ticket Tiers (inline, saved with the event)
  ticketTiers: CreateTicketTierPayload[];
}

const initialState: EventCreationState = {
  title: '',
  description: '',
  shortDescription: '',
  eventType: null,
  tags: [],

  startDate: '',
  endDate: '',
  timezone: 'America/New_York',
  isMultiDay: false,
  isVirtualEvent: false,
  virtualEventUrl: '',
  venueName: '',
  venueAddress: '',
  latitude: null,
  longitude: null,
  cityId: null,

  maxAttendees: null,
  enableWaitlist: false,
  waitlistCapacity: null,
  isFreeEvent: false,
  isPrivate: false,
  requiresApproval: false,
  minAge: null,
  ageVerificationReq: false,

  coverImageUrl: '',
  imageGallery: [],
  videoUrl: '',

  ticketTiers: [],
};

// ─── Actions ────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_FIELD'; field: keyof EventCreationState; value: unknown }
  | { type: 'ADD_TAG'; tag: string }
  | { type: 'REMOVE_TAG'; tag: string }
  | { type: 'ADD_TICKET_TIER'; tier: CreateTicketTierPayload }
  | { type: 'REMOVE_TICKET_TIER'; index: number }
  | { type: 'UPDATE_TICKET_TIER'; index: number; tier: CreateTicketTierPayload }
  | { type: 'ADD_GALLERY_IMAGE'; url: string }
  | { type: 'REMOVE_GALLERY_IMAGE'; index: number }
  | { type: 'RESET' };

// ─── Reducer ────────────────────────────────────────────────────────

function reducer(state: EventCreationState, action: Action): EventCreationState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };

    case 'ADD_TAG':
      if (state.tags.includes(action.tag)) return state;
      return { ...state, tags: [...state.tags, action.tag] };

    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter((t) => t !== action.tag) };

    case 'ADD_TICKET_TIER':
      return { ...state, ticketTiers: [...state.ticketTiers, action.tier] };

    case 'REMOVE_TICKET_TIER':
      return {
        ...state,
        ticketTiers: state.ticketTiers.filter((_, i) => i !== action.index),
      };

    case 'UPDATE_TICKET_TIER':
      return {
        ...state,
        ticketTiers: state.ticketTiers.map((t, i) =>
          i === action.index ? action.tier : t,
        ),
      };

    case 'ADD_GALLERY_IMAGE':
      return { ...state, imageGallery: [...state.imageGallery, action.url] };

    case 'REMOVE_GALLERY_IMAGE':
      return {
        ...state,
        imageGallery: state.imageGallery.filter((_, i) => i !== action.index),
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────

interface EventCreationContextValue {
  state: EventCreationState;
  dispatch: React.Dispatch<Action>;
}

const EventCreationContext = createContext<EventCreationContextValue | null>(null);

export const EventCreationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <EventCreationContext.Provider value={{ state, dispatch }}>
      {children}
    </EventCreationContext.Provider>
  );
};

export const useEventCreation = () => {
  const ctx = useContext(EventCreationContext);
  if (!ctx) throw new Error('useEventCreation must be used within EventCreationProvider');
  return ctx;
};

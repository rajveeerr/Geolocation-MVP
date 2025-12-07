/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

export interface TimeRange {
  id: number;
  start: string;
  end: string;
  day?: string; // e.g. 'All' or 'Mon', 'Tue'
}


export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: 'Bites' | 'Drinks';
  imageUrl: string;
}

export interface SelectedMenuItem extends MenuItem {
  isHidden: boolean;
}

export interface DealCreationState {
  dealType: 'STANDARD' | 'HAPPY_HOUR' | 'RECURRING' | 'REDEEM_NOW' | 'HIDDEN' | 'BOUNTY' | null;
  happyHourPeriod: 'Mornings' | 'Midday' | 'Late night';
  timeRanges: TimeRange[];
  activeStartDate: string;
  activeEndDate: string;
  periodType: 'Single day' | 'Recurring';
  recurringDays: string[];
  selectedMenuItems: SelectedMenuItem[];
  kickbackEnabled: boolean;
  title: string;
  description: string;
  category: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  redemptionInstructions: string;
  imageUrls: string[];
  primaryImageIndex: number | null;
  offerTerms: string;
  customOfferDisplay: string;
  isFeatured: boolean;
  priority: number;
  maxRedemptions: number | null;
  minOrderAmount: number | null;
  validDaysOfWeek: string[] | null;
  validHours: string | null;
  socialProofEnabled: boolean;
  allowSharing: boolean;
  storeIds: number[] | null;
  cityIds: number[] | null;
  tags: string[];
  notes: string;
  externalUrl: string;
  // Legacy fields used by existing steps — keep for compatibility
  startTime: string;
  endTime: string;
  standardOfferKind: 'percentage' | 'amount' | 'custom' | null;
  // Deal type specific fields
  bountyRewardAmount: number | null;
  minReferralsRequired: number | null;
  accessCode: string | null;
  // Menu collection fields
  useMenuCollection: boolean;
  menuCollectionId: number | null;
  // Daily Deal / Streak fields
  streakEnabled: boolean;
  streakMinVisits: number | null;
  streakRewardType: 'percentage' | 'amount' | null;
  streakRewardValue: number | null;
  recurringFrequency: 'week' | 'month' | 'year' | null;
  // Hidden deal visibility configuration
  hiddenDealVisibility: {
    accessCode: boolean; // always true
    qrCode: boolean;
    tapIns: boolean;
    socialSharing: boolean;
    tapInConfig?: {
      showInAllCheckIns: boolean;
      specificTimes?: string; // validHours format
      specificDays?: string[]; // validDaysOfWeek
      firstTimeOnly?: boolean;
      returningOnly?: boolean;
    };
    tapInMenuItems?: number[]; // selected item IDs to show in tap-ins
    tapInMenuCollectionId?: number | null;
  };
}

type Action =
  | { type: 'SET_FIELD'; field: keyof DealCreationState; value: any }
  | { type: 'UPDATE_FIELD'; field: keyof DealCreationState; value: any }
  | { type: 'ADD_TIME_RANGE' }
  | { type: 'UPDATE_TIME_RANGE'; payload: { id: number; field: 'start' | 'end' | 'day'; value: string } }
  | { type: 'REMOVE_TIME_RANGE'; payload: { id: number } }
  | { type: 'SET_SELECTED_ITEMS'; payload: SelectedMenuItem[] }
  | { type: 'TOGGLE_RECURRING_DAY'; payload: string }
  | { type: 'SET_DEAL_TYPE'; dealType: 'STANDARD' | 'HAPPY_HOUR' | 'RECURRING' }
  | { type: 'SET_STANDARD_OFFER_KIND'; kind: 'percentage' | 'amount' | 'custom' | null }
  | { type: 'SET_IMAGE_URLS'; payload: string[] }
  | { type: 'SET_MENU_COLLECTION'; collectionId: number | null };

const initialState: DealCreationState = {
  dealType: null,
  happyHourPeriod: 'Midday',
  timeRanges: [{ id: Date.now(), start: '17:00', end: '19:00', day: 'All' }],
  activeStartDate: '',
  activeEndDate: '',
  periodType: 'Recurring',
  recurringDays: [],
  selectedMenuItems: [],
  kickbackEnabled: false,
  title: '',
  description: '',
  category: 'FOOD_AND_BEVERAGE',
  discountPercentage: null,
  discountAmount: null,
  redemptionInstructions: 'Show this screen to redeem.',
  imageUrls: [],
  primaryImageIndex: null,
  offerTerms: '',
  customOfferDisplay: '',
  isFeatured: false,
  priority: 5,
  maxRedemptions: 0, // 0 means unlimited
  minOrderAmount: null,
  validDaysOfWeek: null,
  validHours: null,
  socialProofEnabled: true,
  allowSharing: true,
  storeIds: null,
  cityIds: null,
  tags: [],
  notes: '',
  externalUrl: '',
  // Provide defaults for legacy fields so consumers can read them safely
  startTime: '',
  endTime: '',
  standardOfferKind: null,
  // Deal type specific fields
  bountyRewardAmount: null,
  minReferralsRequired: null,
  accessCode: null,
  // Menu collection fields
  useMenuCollection: false,
  menuCollectionId: null,
  // Daily Deal / Streak fields
  streakEnabled: false,
  streakMinVisits: null,
  streakRewardType: null,
  streakRewardValue: null,
  recurringFrequency: null,
  // Hidden deal visibility configuration
  hiddenDealVisibility: {
    accessCode: true, // always true
    qrCode: false,
    tapIns: false,
    socialSharing: false,
    tapInConfig: {
      showInAllCheckIns: true,
    },
    tapInMenuItems: undefined,
    tapInMenuCollectionId: null,
  },
};

function reducer(state: DealCreationState, action: Action): DealCreationState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_DEAL_TYPE':
      return {
        ...state,
        dealType: action.dealType,
        recurringDays: action.dealType === 'RECURRING' ? state.recurringDays : [],
      };
    case 'SET_STANDARD_OFFER_KIND':
      return { ...state, standardOfferKind: action.kind };
    case 'ADD_TIME_RANGE':
      return { ...state, timeRanges: [...state.timeRanges, { id: Date.now(), start: '17:00', end: '19:00' }] };
    case 'UPDATE_TIME_RANGE':
      return { ...state, timeRanges: state.timeRanges.map(tr => (tr.id === action.payload.id ? { ...tr, [action.payload.field]: action.payload.value } : tr)) };
    case 'REMOVE_TIME_RANGE':
      return { ...state, timeRanges: state.timeRanges.filter(tr => tr.id !== action.payload.id) };
    case 'SET_SELECTED_ITEMS':
      return { ...state, selectedMenuItems: action.payload };
    case 'TOGGLE_RECURRING_DAY': {
      const day = action.payload;
      const newDays = state.recurringDays.includes(day) ? state.recurringDays.filter(d => d !== day) : [...state.recurringDays, day];
      return { ...state, recurringDays: newDays };
    }
    case 'SET_IMAGE_URLS': {
      const newImageUrls = action.payload;
      // If no images, set primaryImageIndex to null
      // If images exist and current primaryImageIndex is invalid, set to 0
      let newPrimaryImageIndex = state.primaryImageIndex;
      if (newImageUrls.length === 0) {
        newPrimaryImageIndex = null;
      } else if (state.primaryImageIndex === null || state.primaryImageIndex >= newImageUrls.length) {
        newPrimaryImageIndex = 0;
      }
      return { ...state, imageUrls: newImageUrls, primaryImageIndex: newPrimaryImageIndex };
    }
    case 'SET_MENU_COLLECTION': {
      return { 
        ...state, 
        menuCollectionId: action.collectionId,
        useMenuCollection: action.collectionId !== null,
        // Clear selected items when switching to collection mode
        selectedMenuItems: action.collectionId !== null ? [] : state.selectedMenuItems
      };
    }
    default:
      return state;
  }
}

const DealCreationContext = createContext<{ state: DealCreationState; dispatch: React.Dispatch<Action> } | undefined>(undefined);
export { DealCreationContext };

export const DealCreationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <DealCreationContext.Provider value={{ state, dispatch }}>{children}</DealCreationContext.Provider>;
};

export const useDealCreation = () => {
  const context = useContext(DealCreationContext);
  if (!context) throw new Error('useDealCreation must be used within a DealCreationProvider');
  return context;
};

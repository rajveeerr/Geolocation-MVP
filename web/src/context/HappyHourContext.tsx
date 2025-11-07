import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

// Define the specific types needed for the Happy Hour flow
export interface TimeRange {
  id: number;
  start: string;
  end: string;
  day?: string;
}
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: 'Bites' | 'Drinks' | string; // Allow string for API compatibility
  imageUrl: string;
  description?: string | null;
  isHappyHour?: boolean;
  happyHourPrice?: number | null;
}
export interface SelectedMenuItem extends MenuItem {
  isHidden: boolean;
  // Item-specific discount fields
  customPrice?: number | null;
  customDiscount?: number | null;
  discountAmount?: number | null;
  useGlobalDiscount?: boolean; // Default true, false if item has custom pricing
}

export interface HappyHourState {
  happyHourType: 'Mornings' | 'Midday' | 'Late night';
  timeRanges: TimeRange[];
  activeStartDate: string;
  activeEndDate: string;
  periodType: 'Single day' | 'Recurring';
  recurringDays: string[];
  selectedMenuItems: SelectedMenuItem[];
  kickbackEnabled: boolean;
  kickbackPercent: number | null; // <-- Make explicit and non-optional
  // --- Add basic deal info ---
  title: string;
  description: string;
  category: string;
  // --- Add discount fields ---
  discountPercentage: number | null;
  discountAmount: number | null;
  customOfferDisplay: string;
  // --- Missing fields from backend ---
  imageUrls: string[];
  primaryImageIndex: number | null;
  redemptionInstructions: string;
  offerTerms: string;
  validDaysOfWeek: string[] | null;
  validHours: string | null;
  storeIds: number[] | null;
  cityIds: number[] | null;
}

type Action =
  | { type: 'SET_FIELD'; field: keyof HappyHourState; value: any }
  | { type: 'ADD_TIME_RANGE' }
  | { type: 'UPDATE_TIME_RANGE'; payload: { id: number; field: 'start' | 'end' | 'day'; value: string } }
  | { type: 'REMOVE_TIME_RANGE'; payload: { id: number } }
  | { type: 'SET_SELECTED_ITEMS'; payload: SelectedMenuItem[] }
  | { type: 'TOGGLE_RECURRING_DAY'; payload: string }
  | { type: 'UPDATE_ITEM_DISCOUNT'; payload: { itemId: number; discount: { customPrice?: number | null; customDiscount?: number | null; discountAmount?: number | null; useGlobalDiscount?: boolean } } }
  | { type: 'RESET_ITEM_DISCOUNT'; payload: { itemId: number } };

const initialState: HappyHourState = {
  happyHourType: 'Midday',
  timeRanges: [{ id: Date.now(), start: '17:00', end: '19:00', day: 'All' }],
  activeStartDate: '',
  activeEndDate: '',
  periodType: 'Recurring',
  recurringDays: [],
  selectedMenuItems: [],
  kickbackEnabled: false,
  kickbackPercent: null,
  // --- Initialize basic info ---
  title: '',
  description: '',
  category: 'FOOD_AND_BEVERAGE',
  // --- Initialize discount fields ---
  discountPercentage: 20, // Default 20% discount for happy hour
  discountAmount: null,
  customOfferDisplay: '',
  // --- Initialize missing fields ---
  imageUrls: [],
  primaryImageIndex: null,
  redemptionInstructions: 'Show this screen to your server to redeem the happy hour offer.', // Default value, hidden from UI
  offerTerms: '', // Default empty, hidden from UI
  validDaysOfWeek: null,
  validHours: null,
  storeIds: null,
  cityIds: null,
};

function reducer(state: HappyHourState, action: Action): HappyHourState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_TIME_RANGE':
      return { ...state, timeRanges: [...state.timeRanges, { id: Date.now(), start: '17:00', end: '19:00' }] };
    case 'UPDATE_TIME_RANGE':
      return { ...state, timeRanges: state.timeRanges.map(tr => tr.id === action.payload.id ? { ...tr, [action.payload.field]: action.payload.value } : tr) };
    case 'REMOVE_TIME_RANGE':
      return { ...state, timeRanges: state.timeRanges.filter(tr => tr.id !== action.payload.id) };
    case 'SET_SELECTED_ITEMS':
      return { ...state, selectedMenuItems: action.payload };
    case 'TOGGLE_RECURRING_DAY': {
      const day = action.payload;
      const newDays = state.recurringDays.includes(day) ? state.recurringDays.filter(d => d !== day) : [...state.recurringDays, day];
      return { ...state, recurringDays: newDays, periodType: newDays.length > 0 ? 'Recurring' : 'Single day' };
    }
    case 'UPDATE_ITEM_DISCOUNT': {
      const { itemId, discount } = action.payload;
      const updatedItems = state.selectedMenuItems.map(item => {
        if (item.id === itemId) {
          // If item has custom pricing, set useGlobalDiscount to false
          const hasCustomPricing = discount.customPrice !== null && discount.customPrice !== undefined ||
                                   discount.customDiscount !== null && discount.customDiscount !== undefined ||
                                   discount.discountAmount !== null && discount.discountAmount !== undefined;
          return {
            ...item,
            ...discount,
            useGlobalDiscount: discount.useGlobalDiscount !== undefined 
              ? discount.useGlobalDiscount 
              : !hasCustomPricing
          };
        }
        return item;
      });
      return { ...state, selectedMenuItems: updatedItems };
    }
    case 'RESET_ITEM_DISCOUNT': {
      const { itemId } = action.payload;
      const updatedItems = state.selectedMenuItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            customPrice: null,
            customDiscount: null,
            discountAmount: null,
            useGlobalDiscount: true
          };
        }
        return item;
      });
      return { ...state, selectedMenuItems: updatedItems };
    }
    default:
      return state;
  }
}

const HappyHourContext = createContext<{ state: HappyHourState; dispatch: React.Dispatch<Action>; } | undefined>(undefined);
export { HappyHourContext };

export const HappyHourProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <HappyHourContext.Provider value={{ state, dispatch }}>{children}</HappyHourContext.Provider>;
};

export const useHappyHour = () => {
  const context = useContext(HappyHourContext);
  if (!context) throw new Error('useHappyHour must be used within a HappyHourProvider');
  return context;
};

export default HappyHourContext;

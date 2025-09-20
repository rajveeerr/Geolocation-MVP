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
  category: 'Bites' | 'Drinks';
  imageUrl: string;
}
export interface SelectedMenuItem extends MenuItem {
  isHidden: boolean;
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
  kickbackPercent?: number | null;
}

type Action =
  | { type: 'SET_FIELD'; field: keyof HappyHourState; value: any }
  | { type: 'ADD_TIME_RANGE' }
  | { type: 'UPDATE_TIME_RANGE'; payload: { id: number; field: 'start' | 'end' | 'day'; value: string } }
  | { type: 'REMOVE_TIME_RANGE'; payload: { id: number } }
  | { type: 'SET_SELECTED_ITEMS'; payload: SelectedMenuItem[] }
  | { type: 'TOGGLE_RECURRING_DAY'; payload: string };

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
      return { ...state, recurringDays: newDays };
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

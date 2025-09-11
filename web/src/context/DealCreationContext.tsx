// src/context/DealCreationContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

interface State {
  title: string;
  description: string;
  category: string;
  // New: align with backend deal types
  dealType: 'STANDARD' | 'HAPPY_HOUR' | 'RECURRING' | null;
  discountPercentage: number | null;
  discountAmount: number | null;
  // New: for recurring deals, which weekdays the deal repeats on (e.g. ['MONDAY','WEDNESDAY'])
  recurringDays: string[];
  // New: within STANDARD deals, whether the merchant picked percentage vs amount
  standardOfferKind: 'percentage' | 'amount' | null;
  startTime: string;
  endTime: string;
  redemptionInstructions: string;
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof State; value: string | number | null }
  | { type: 'SET_DEAL_TYPE'; dealType: 'STANDARD' | 'HAPPY_HOUR' | 'RECURRING' }
  | { type: 'SET_STANDARD_OFFER_KIND'; kind: 'percentage' | 'amount' | null };

const initialState: State = {
  title: '',
  description: '',
  category: 'FOOD_AND_BEVERAGE',
  // Default to STANDARD so created deals without explicit choice still work
  dealType: 'STANDARD',
  discountPercentage: null,
  discountAmount: null,
  recurringDays: [],
  standardOfferKind: null,
  startTime: '',
  endTime: '',
  redemptionInstructions:
    'Show this screen at the counter to redeem your deal.',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_DEAL_TYPE':
      return {
        ...state,
        dealType: action.dealType,
        // When switching to RECURRING, keep recurringDays; when switching away, clear them
        recurringDays: action.dealType === 'RECURRING' ? state.recurringDays : [],
        // Keep existing discount fields; the Offer step can still set them as needed
        discountPercentage: state.discountPercentage,
        discountAmount: state.discountAmount,
      };
    case 'SET_STANDARD_OFFER_KIND':
      return {
        ...state,
        standardOfferKind: action.kind,
        // ensure dealType is STANDARD when choosing a standard offer kind
        dealType: action.kind ? 'STANDARD' : state.dealType,
      };
    default:
      return state;
  }
}

const DealCreationContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const DealCreationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DealCreationContext.Provider value={{ state, dispatch }}>
      {children}
    </DealCreationContext.Provider>
  );
};

export function useDealCreation() {
  return useContext(DealCreationContext);
}

// src/context/DealCreationContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

interface State {
  title: string;
  description: string;
  category: string;
  dealType: 'percentage' | 'amount' | null;
  discountPercentage: number | null;
  discountAmount: number | null;
  startTime: string;
  endTime: string;
  redemptionInstructions: string;
}

type Action =
  | { type: 'UPDATE_FIELD'; field: keyof State; value: string | number | null }
  | { type: 'SET_DEAL_TYPE'; dealType: 'percentage' | 'amount' };

const initialState: State = {
  title: '',
  description: '',
  category: 'FOOD_AND_BEVERAGE',
  dealType: null,
  discountPercentage: null,
  discountAmount: null,
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
        // Reset the other value to ensure data integrity
        discountPercentage:
          action.dealType === 'amount' ? null : state.discountPercentage,
        discountAmount:
          action.dealType === 'percentage' ? null : state.discountAmount,
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

export const useDealCreation = () => useContext(DealCreationContext);

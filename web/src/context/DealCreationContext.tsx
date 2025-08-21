// src/context/DealCreationContext.tsx
import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

// Define the shape of our deal creation state
export interface DealCreationState {
  // Basic Info Step
  title: string;
  description: string;
  
  // Offer Details Step
  discountType: 'percentage' | 'fixed_amount';
  discountPercentage: number;
  discountAmount: number;
  originalPrice: number;
  
  // Timing Step
  startTime: string;
  endTime: string;
  availableDays: string[];
  
  // Advanced Settings Step
  maxRedemptions: number;
  minSpend: number;
  terms: string;
  
  // UI State
  currentStep: number;
  isLoading: boolean;
}

// Define the possible actions
export type DealCreationAction =
  | { type: 'UPDATE_FIELD'; field: keyof DealCreationState; value: any }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET_FORM' };

// Initial state
const initialState: DealCreationState = {
  // Basic Info
  title: '',
  description: '',
  
  // Offer Details
  discountType: 'percentage',
  discountPercentage: 0,
  discountAmount: 0,
  originalPrice: 0,
  
  // Timing
  startTime: '',
  endTime: '',
  availableDays: [],
  
  // Advanced Settings
  maxRedemptions: 0,
  minSpend: 0,
  terms: '',
  
  // UI State
  currentStep: 1,
  isLoading: false,
};

// Reducer function
function dealCreationReducer(state: DealCreationState, action: DealCreationAction): DealCreationState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: state.currentStep + 1,
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(1, state.currentStep - 1),
      };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}

// Context type
interface DealCreationContextType {
  state: DealCreationState;
  dispatch: React.Dispatch<DealCreationAction>;
}

// Create the context
const DealCreationContext = createContext<DealCreationContextType | undefined>(undefined);

// Provider component
interface DealCreationProviderProps {
  children: ReactNode;
}

export const DealCreationProvider: React.FC<DealCreationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dealCreationReducer, initialState);

  return (
    <DealCreationContext.Provider value={{ state, dispatch }}>
      {children}
    </DealCreationContext.Provider>
  );
};

// Custom hook to use the context
export const useDealCreation = () => {
  const context = useContext(DealCreationContext);
  if (context === undefined) {
    throw new Error('useDealCreation must be used within a DealCreationProvider');
  }
  return context;
};

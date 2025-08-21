// src/context/MerchantOnboardingContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

interface State {
  businessName: string;
  address: string;
  description: string;
  logoUrl: string;
}

type Action = { type: 'UPDATE_FIELD'; field: keyof State; value: string };

const initialState: State = {
  businessName: '', address: '', description: '', logoUrl: ''
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

const OnboardingContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <OnboardingContext.Provider value={{ state, dispatch }}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => useContext(OnboardingContext);
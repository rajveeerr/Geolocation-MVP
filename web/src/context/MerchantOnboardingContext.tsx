import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

interface State {
  step: number;
  businessName: string;
  businessCategory: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  description: string;
  logoUrl: string;
}

type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_BUSINESS_NAME'; payload: string }
  | {
      type: 'SET_ADDRESS_FIELD';
      payload: { field: keyof State['address']; value: string };
    }
  | { type: 'SET_BUSINESS_CATEGORY'; payload: string }
  | { type: 'SET_FULL_ADDRESS'; payload: Partial<State['address']> }
  | { type: 'SET_COORDINATES'; payload: { lat: number; lng: number } }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_LOGO_URL'; payload: string }
  | { type: 'HYDRATE_STATE'; payload: State };

const initialState: State = {
  step: 1,
  businessName: '',
  businessCategory: null,
  address: { street: '', city: '', state: '', zip: '', country: '' },
  coordinates: { lat: null, lng: null },
  description: '',
  logoUrl: '',
};

const ONBOARDING_STATE_KEY = 'merchantOnboardingState';

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_BUSINESS_NAME':
      return { ...state, businessName: action.payload };
    case 'SET_ADDRESS_FIELD':
      return {
        ...state,
        address: {
          ...state.address,
          [action.payload.field]: action.payload.value,
        },
      };
    case 'SET_FULL_ADDRESS':
      return { ...state, address: { ...state.address, ...action.payload } };
    case 'SET_BUSINESS_CATEGORY':
      return { ...state, businessCategory: action.payload };
    case 'SET_COORDINATES':
      return { ...state, coordinates: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_LOGO_URL':
      return { ...state, logoUrl: action.payload };
    case 'HYDRATE_STATE':
      return { ...action.payload };
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

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(ONBOARDING_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState) as State;
        dispatch({ type: 'HYDRATE_STATE', payload: parsed });
      }
    } catch (err) {

      console.warn('Failed to hydrate onboarding state from localStorage', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
    } catch (err) {

      console.warn('Failed to persist onboarding state to localStorage', err);
    }
  }, [state]);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);

// src/context/MerchantOnboardingContext.tsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

// --- Define the shape of our more detailed state ---
interface State {
  step: number;
  businessName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  description: string;
  logoUrl: string;
}

// --- Define more specific actions for clearer intent ---
type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_BUSINESS_NAME'; payload: string }
  | { type: 'SET_ADDRESS_FIELD'; payload: { field: keyof State['address']; value: string } }
  | { type: 'SET_COORDINATES'; payload: { lat: number; lng: number } }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_LOGO_URL'; payload: string }
  | { type: 'HYDRATE_STATE'; payload: State };

const initialState: State = {
  step: 1,
  businessName: '',
  address: { street: '', city: '', state: '', zip: '' },
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
      return { ...state, address: { ...state.address, [action.payload.field]: action.payload.value } };
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

  // --- Load state from localStorage on initial render ---
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(ONBOARDING_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState) as State;
        dispatch({ type: 'HYDRATE_STATE', payload: parsed });
      }
    } catch (err) {
      // If parse fails, ignore and start fresh
       
      console.warn('Failed to hydrate onboarding state from localStorage', err);
    }
  }, []);

  // --- Persist state to localStorage on any change ---
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
    } catch (err) {
      // ignore quota errors
       
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

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface OnboardingState {
  step: number;
  businessName: string;
  businessCategory: string | null;
  categoryId: number | null;
  businessType: 'NATIONAL' | 'LOCAL' | null;
  description: string;
  logoUrl: string;
  galleryUrls: string[];
  priceRange: string | null;
  phoneNumber: string;
  websiteUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  vibeTags: string[];
  amenities: string[];
  thingsToNote: string;
}

export type OnboardingAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_BUSINESS_NAME'; payload: string }
  | { type: 'SET_BUSINESS_CATEGORY'; payload: string | null }
  | { type: 'SET_CATEGORY_ID'; payload: number | null }
  | { type: 'SET_BUSINESS_TYPE'; payload: 'NATIONAL' | 'LOCAL' | null }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_LOGO_URL'; payload: string }
  | { type: 'SET_GALLERY_URLS'; payload: string[] }
  | { type: 'ADD_GALLERY_URL'; payload: string }
  | { type: 'REMOVE_GALLERY_URL'; payload: number }
  | { type: 'SET_PRICE_RANGE'; payload: string | null }
  | { type: 'SET_PHONE_NUMBER'; payload: string }
  | { type: 'SET_WEBSITE_URL'; payload: string }
  | { type: 'SET_INSTAGRAM_URL'; payload: string }
  | { type: 'SET_FACEBOOK_URL'; payload: string }
  | { type: 'SET_TWITTER_URL'; payload: string }
  | { type: 'SET_VIBE_TAGS'; payload: string[] }
  | { type: 'SET_AMENITIES'; payload: string[] }
  | { type: 'SET_THINGS_TO_NOTE'; payload: string }
  | { type: 'TOGGLE_VIBE_TAG'; payload: string }
  | { type: 'TOGGLE_AMENITY'; payload: string }
  | { type: 'HYDRATE_STATE'; payload: Partial<OnboardingState> };

export const TOTAL_STEPS = 13; // Welcome + chapter intros + data steps

const initialState: OnboardingState = {
  step: 0,
  businessName: '',
  businessCategory: null,
  categoryId: null,
  businessType: null,
  description: '',
  logoUrl: '',
  galleryUrls: [],
  priceRange: null,
  phoneNumber: '',
  websiteUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  twitterUrl: '',
  vibeTags: [],
  amenities: [],
  thingsToNote: '',
};

const ONBOARDING_STATE_KEY = 'merchantOnboardingState';

function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: Math.max(0, Math.min(action.payload, TOTAL_STEPS - 1)) };
    case 'SET_BUSINESS_NAME':
      return { ...state, businessName: action.payload };
    case 'SET_BUSINESS_CATEGORY':
      return { ...state, businessCategory: action.payload };
    case 'SET_CATEGORY_ID':
      return { ...state, categoryId: action.payload };
    case 'SET_BUSINESS_TYPE':
      return { ...state, businessType: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_LOGO_URL':
      return { ...state, logoUrl: action.payload };
    case 'SET_GALLERY_URLS':
      return { ...state, galleryUrls: action.payload };
    case 'ADD_GALLERY_URL':
      return { ...state, galleryUrls: [...state.galleryUrls, action.payload] };
    case 'REMOVE_GALLERY_URL':
      return { ...state, galleryUrls: state.galleryUrls.filter((_, i) => i !== action.payload) };
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload };
    case 'SET_PHONE_NUMBER':
      return { ...state, phoneNumber: action.payload };
    case 'SET_WEBSITE_URL':
      return { ...state, websiteUrl: action.payload };
    case 'SET_INSTAGRAM_URL':
      return { ...state, instagramUrl: action.payload };
    case 'SET_FACEBOOK_URL':
      return { ...state, facebookUrl: action.payload };
    case 'SET_TWITTER_URL':
      return { ...state, twitterUrl: action.payload };
    case 'SET_VIBE_TAGS':
      return { ...state, vibeTags: action.payload };
    case 'SET_AMENITIES':
      return { ...state, amenities: action.payload };
    case 'SET_THINGS_TO_NOTE':
      return { ...state, thingsToNote: action.payload };
    case 'TOGGLE_VIBE_TAG':
      return {
        ...state,
        vibeTags: state.vibeTags.includes(action.payload)
          ? state.vibeTags.filter((t) => t !== action.payload)
          : [...state.vibeTags, action.payload],
      };
    case 'TOGGLE_AMENITY':
      return {
        ...state,
        amenities: state.amenities.includes(action.payload)
          ? state.amenities.filter((a) => a !== action.payload)
          : [...state.amenities, action.payload],
      };
    case 'HYDRATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const OnboardingContext = createContext<{
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
}>({ state: initialState, dispatch: () => null });

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(ONBOARDING_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState) as Partial<OnboardingState>;
        dispatch({ type: 'HYDRATE_STATE', payload: parsed });
      }
    } catch {
      console.warn('Failed to hydrate onboarding state from localStorage');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
    } catch {
      console.warn('Failed to persist onboarding state to localStorage');
    }
  }, [state]);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);

export const getProgressPercent = (step: number) =>
  step <= 0 ? 0 : Math.round((step / (TOTAL_STEPS - 1)) * 100);

/** Chapter-based step number (1-3). Welcome=0 has no step; chapters 1-3 map to Step 1, 2, 3. */
export const getChapterStepNumber = (stepIndex: number): number | null =>
  stepIndex <= 0 ? null : stepIndex <= 4 ? 1 : stepIndex <= 9 ? 2 : 3;

/** Progress within each chapter (0–100). [chapter1, chapter2, chapter3]. */
export const getChapterProgress = (stepIndex: number): [number, number, number] => {
  const c1 = stepIndex < 1 ? 0 : stepIndex >= 5 ? 100 : Math.round(((stepIndex - 1) / 3) * 100);
  const c2 = stepIndex < 5 ? 0 : stepIndex >= 10 ? 100 : Math.round(((stepIndex - 5) / 4) * 100);
  const c3 = stepIndex < 10 ? 0 : stepIndex >= 13 ? 100 : Math.round(((stepIndex - 10) / 2) * 100);
  return [c1, c2, c3];
};

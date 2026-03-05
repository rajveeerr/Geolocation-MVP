import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { StoreWizardData } from '@/components/merchant/store-registration/storeRegistrationTypes';
import { getDefaultFirstStore } from '@/components/merchant/store-registration/storeRegistrationTypes';

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
  contactEmail: string;
  websiteUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  vibeTags: string[];
  amenities: string[];
  thingsToNote: string;
  isFoodTruck: boolean;
  /** First store (location) - used when store flow is part of onboarding */
  firstStore: StoreWizardData | null;
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
  | { type: 'SET_CONTACT_EMAIL'; payload: string }
  | { type: 'SET_IS_FOOD_TRUCK'; payload: boolean }
  | { type: 'HYDRATE_STATE'; payload: Partial<OnboardingState> }
  | { type: 'SET_FIRST_STORE'; payload: Partial<StoreWizardData> | null };

export const TOTAL_STEPS = 3; // Screen 0: Business Profile, Screen 1: Store Details, Screen 2: Review & Publish

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
  contactEmail: '',
  websiteUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  twitterUrl: '',
  vibeTags: [],
  amenities: [],
  thingsToNote: '',
  isFoodTruck: false,
  firstStore: null,
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
    case 'SET_CONTACT_EMAIL':
      return { ...state, contactEmail: action.payload };
    case 'SET_IS_FOOD_TRUCK':
      return { ...state, isFoodTruck: action.payload };
    case 'SET_FIRST_STORE':
      return {
        ...state,
        firstStore:
          action.payload === null
            ? null
            : { ...getDefaultFirstStore(), ...(state.firstStore ?? {}), ...action.payload },
      };
    case 'HYDRATE_STATE': {
      const hydrated = { ...action.payload };
      // Clamp step for localStorage migration from old 26-step flow
      if (hydrated.step !== undefined && hydrated.step > TOTAL_STEPS - 1) {
        hydrated.step = TOTAL_STEPS - 1;
      }
      return { ...state, ...hydrated };
    }
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
  Math.round(((step + 1) / TOTAL_STEPS) * 100);

export const getStepLabel = (step: number): string => {
  switch (step) {
    case 0: return 'Business Profile';
    case 1: return 'Store Details';
    case 2: return 'Review & Publish';
    default: return '';
  }
};

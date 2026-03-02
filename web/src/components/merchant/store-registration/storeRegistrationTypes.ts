/**
 * Shared types and utils for Store Registration Flow.
 * Used in both merchant onboarding and standalone "Add Store" wizard.
 */

export interface BusinessHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

export interface StoreWizardData {
  businessName: string;
  address: string;
  /** Street/building line (for confirm-address form) */
  addressStreet?: string;
  /** City from geocode (for confirm form + city matching) */
  addressCity?: string;
  /** State from geocode */
  addressState?: string;
  /** Postcode from geocode */
  addressPostcode?: string;
  phoneNumber: string;
  email?: string;
  storeType: string;
  cityId: number;
  latitude?: number;
  longitude?: number;
  verifiedAddress?: string;
  businessHours: BusinessHours;
  description?: string;
  features: string[];
  storeImages: File[];
  galleryUrls: string[];
  isFoodTruck: boolean;
  active: boolean;
}

export const defaultBusinessHours: BusinessHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
};

export function getDefaultFirstStore(): StoreWizardData {
  return {
    businessName: '',
    address: '',
    phoneNumber: '',
    email: '',
    storeType: 'restaurant',
    cityId: 0,
    latitude: undefined,
    longitude: undefined,
    verifiedAddress: '',
    businessHours: { ...defaultBusinessHours },
    description: '',
    features: [],
    storeImages: [],
    galleryUrls: [],
    isFoodTruck: false,
    active: true,
  };
}

/** Map monday–sunday to 0–6 (Sun=0 … Sat=6) for backend operatingHours */
export function businessHoursToOperatingHours(
  hours: BusinessHours
): Record<string, { open: string; close: string; closed: boolean }> {
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const result: Record<string, { open: string; close: string; closed: boolean }> = {};
  dayOrder.forEach((day, i) => {
    const h = hours[day];
    if (h) result[String(i)] = { open: h.open, close: h.close, closed: h.closed };
  });
  return result;
}

export const STORE_REGISTRATION_STEP_IDS = [
  'location-search',
  'location-confirm',
  'location-pin',
  'store-name',
  'store-type',
  'store-contact',
  'hours-weekday',
  'hours-weekend',
  'features',
  'extras',
  'photos',
  'review',
] as const;
export type StoreRegistrationStepId = (typeof STORE_REGISTRATION_STEP_IDS)[number];

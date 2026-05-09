/**
 * Catering types — mirrors the BE Prisma models.
 *
 * A CateringItem belongs to a merchant and represents one orderable thing
 * (a platter, a per-person package, a sandwich tray). It has its own pricing
 * (per-person OR fixed), serving rules, and zero-or-more option groups.
 *
 * Each option group ("Select size", "Add sides") has 1+ choices; a group with
 * `maxSelections === 1` is a radio, > 1 is a checkbox group.
 */

export type CateringPricingType = 'PER_PERSON' | 'FIXED';

export interface CateringItemOptionChoice {
  id: number;
  label: string;
  description: string | null;
  /** Added to the per-unit price when this choice is selected. */
  priceModifier: number;
  isDefault: boolean;
  isPopular: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CateringItemOption {
  id: number;
  cateringItemId: number;
  name: string;
  isRequired: boolean;
  /** 0 means optional. */
  minSelections: number;
  /** 1 = single-select (radio), >1 = multi-select up to N. */
  maxSelections: number;
  displayOrder: number;
  choices: CateringItemOptionChoice[];
  createdAt: string;
  updatedAt: string;
}

export interface CateringItem {
  id: number;
  merchantId: number;
  name: string;
  description: string | null;
  category: string;
  pricingType: CateringPricingType;
  pricePerPerson: number;
  fixedPrice: number | null;
  minPeople: number;
  maxPeople: number | null;
  servesCount: number | null;
  imageUrl: string | null;
  imageUrls: string[];
  tags: string[];
  packagingType: string | null;
  dietaryInfo: string[];
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  specialInstructions: boolean;
  options: CateringItemOption[];
  createdAt: string;
  updatedAt: string;
}

// ─── Write-side payloads ─────────────────────────────────────────────────────

export interface CateringChoiceInput {
  label: string;
  description?: string | null;
  priceModifier?: number;
  isDefault?: boolean;
  isPopular?: boolean;
  displayOrder?: number;
}

export interface CateringOptionInput {
  name: string;
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder?: number;
  choices?: CateringChoiceInput[];
}

export interface CateringItemPayload {
  name: string;
  description?: string | null;
  category: string;
  pricingType?: CateringPricingType;
  pricePerPerson?: number;
  fixedPrice?: number | null;
  minPeople?: number;
  maxPeople?: number | null;
  servesCount?: number | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  tags?: string[];
  packagingType?: string | null;
  dietaryInfo?: string[];
  isActive?: boolean;
  isPopular?: boolean;
  displayOrder?: number;
  specialInstructions?: boolean;
  /**
   * If present on PUT, replaces the entire option set on the server.
   * Omit to leave existing options untouched.
   */
  options?: CateringOptionInput[];
}

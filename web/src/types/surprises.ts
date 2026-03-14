export type SurpriseType = 'LOCATION_BASED' | 'TIME_BASED' | 'ENGAGEMENT_BASED' | 'RANDOM_DROP';

export interface NearbySurprise {
  id: number;
  hint: string;
  surpriseType: SurpriseType;
  merchantName: string;
  merchantLogoUrl: string | null;
  distanceMeters: number;
  isRevealed: boolean;
  isExpired: boolean;
  isRedeemed: boolean;
  revealAt?: string;
  revealRadiusMeters?: number;
  expiresAt?: string;
}

export interface SurpriseDeal {
  id: number;
  title: string;
  description: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  redemptionInstructions: string;
  startTime: string;
  endTime: string;
  merchant: {
    id: number;
    businessName: string;
    latitude: number;
    longitude: number;
    logoUrl?: string;
  };
  category: { name: string; icon: string; color?: string };
  dealType: { name: string };
}

export interface SurpriseRevealResponse {
  message: string;
  revealId: number;
  expiresAt: string;
  deal: SurpriseDeal;
  alreadyRevealed?: boolean;
}

export interface SurpriseDealDetail {
  deal: SurpriseDeal & {
    merchant: SurpriseDeal['merchant'] & { logoUrl: string | null };
  };
  reveal: {
    revealedAt: string;
    expiresAt: string;
    redeemed: boolean;
    redeemedAt: string | null;
  };
}

export interface RevealHistoryItem {
  id: number;
  revealedAt: string;
  expiresAt: string;
  redeemed: boolean;
  redeemedAt: string | null;
  deal: {
    id: number;
    title: string;
    surpriseHint: string;
    surpriseType: SurpriseType;
    discountPercentage: number | null;
    discountAmount: number | null;
    merchant: {
      businessName: string;
      logoUrl: string | null;
    };
  };
}

export interface MerchantSurpriseDeal {
  id: number;
  title: string;
  surpriseType: SurpriseType;
  surpriseHint: string;
  surpriseTotalSlots: number | null;
  surpriseSlotsUsed: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  revealsCount: number;
  category: { name: string; icon: string };
  dealType: { name: string };
}

export interface SurpriseAnalytics {
  deal: {
    id: number;
    title: string;
    surpriseType: SurpriseType;
    startTime: string;
    endTime: string;
  };
  analytics: {
    totalReveals: number;
    totalRedeemed: number;
    conversionRate: string;
    slotsTotal: number | null;
    slotsUsed: number;
    slotsRemaining: number | null;
  };
  recentReveals: Array<{
    revealedAt: string;
    redeemed: boolean;
    redeemedAt: string | null;
  }>;
}

export interface CreateSurpriseDealPayload {
  title: string;
  description: string;
  categoryId: number;
  dealTypeId: number;
  startTime: string;
  endTime: string;
  redemptionInstructions: string;
  surpriseType: SurpriseType;
  surpriseHint?: string;
  discountPercentage?: number;
  discountAmount?: number;
  revealRadiusMeters?: number;
  revealAt?: string;
  revealDurationMinutes?: number;
  surpriseTotalSlots?: number;
}

export interface AISurpriseSuggestion {
  title: string;
  description: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  redemptionInstructions: string;
  surpriseHint: string;
  suggestedDurationHours: number;
  suggestedRevealType: SurpriseType;
  suggestedRevealRadiusMeters: number | null;
  bestTimeSlot: string;
}

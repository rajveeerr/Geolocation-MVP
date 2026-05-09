export interface MerchantReferralProgram {
  id: number;
  merchantId: number;
  name: string;
  description: string | null;
  rewardForReferrer: string;
  rewardForReferred: string;
  isActive: boolean;
  maxRedemptionsPerUser: number | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralProgramPayload {
  name: string;
  description?: string | null;
  rewardForReferrer: string;
  rewardForReferred: string;
  isActive?: boolean;
  maxRedemptionsPerUser?: number | null;
  expiresAt?: string | null;
}

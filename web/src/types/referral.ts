export interface MerchantReferralProgram {
  id: number;
  merchantId: number;
  dealId?: number | null;
  name: string;
  description: string | null;
  rewardForReferrer: string;
  rewardForReferred: string;
  isActive: boolean;
  maxRedemptionsPerUser: number | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deal?: {
    id: number;
    title: string;
    description?: string | null;
    startTime: string;
    endTime: string;
    dealType?: { name?: string | null } | null;
  } | null;
}

export interface ReferralProgramPayload {
  dealId?: number | null;
  name: string;
  description?: string | null;
  rewardForReferrer: string;
  rewardForReferred: string;
  isActive?: boolean;
  maxRedemptionsPerUser?: number | null;
  expiresAt?: string | null;
}

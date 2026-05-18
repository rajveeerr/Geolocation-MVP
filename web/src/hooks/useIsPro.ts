// src/hooks/useIsPro.ts
import { useMerchantStatus, type MerchantTier } from './useMerchantStatus';

export interface MerchantTierInfo {
  tier: MerchantTier;
  isPro: boolean;
  isEnterprise: boolean;
  isLoading: boolean;
}

/**
 * Returns the current merchant's plan tier and a convenience `isPro` flag.
 * Falls back to FREE when the backend hasn't populated `tier` yet so the
 * UI can render the paywall affordances by default.
 */
export const useIsPro = (): MerchantTierInfo => {
  const { data, isLoading } = useMerchantStatus();
  const tier: MerchantTier = data?.data?.merchant?.tier ?? 'FREE';
  return {
    tier,
    isPro: tier === 'PRO' || tier === 'ENTERPRISE',
    isEnterprise: tier === 'ENTERPRISE',
    isLoading,
  };
};

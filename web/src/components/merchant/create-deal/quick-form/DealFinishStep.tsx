// src/components/merchant/create-deal/quick-form/DealFinishStep.tsx
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation, type DealCreationState } from '@/context/DealCreationContext';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';
import { apiPatch, apiPost } from '@/services/api';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import { QuickFormLayout } from './QuickFormLayout';
import { MoreOptionsSection } from './MoreOptionsSection';
import { HomepagePreviewCard } from './HomepagePreviewCard';
import { publishDealFromState } from './publishDeal';

interface FlowConfig {
  title: string;
  subtitle: string;
  wizardStep: { current: number; total: number };
  backRoute: string;
  hideMenu?: boolean;
}

const FLOW_CONFIG: Partial<Record<NonNullable<DealCreationState['dealType']>, FlowConfig>> = {
  STANDARD: {
    title: 'Review & publish',
    subtitle: 'Wrap up extras, double-check the preview, and publish your deal.',
    wizardStep: { current: 2, total: 2 },
    backRoute: '/merchant/deals/create/standard',
  },
  RECURRING: {
    title: 'Review & publish',
    subtitle: 'Wrap up extras, double-check the preview, and publish your daily deal.',
    wizardStep: { current: 2, total: 2 },
    backRoute: '/merchant/deals/create/daily-deal',
  },
  REDEEM_NOW: {
    title: 'Review & publish',
    subtitle: 'Wrap up extras, double-check the preview, and publish your Redeem Now deal.',
    wizardStep: { current: 2, total: 2 },
    backRoute: '/merchant/deals/create/redeem-now',
  },
  BOGO: {
    title: 'Review & publish',
    subtitle: 'Wrap up extras, double-check the preview, and publish your BOGO deal.',
    wizardStep: { current: 2, total: 2 },
    backRoute: '/merchant/deals/create/bogo',
  },
  BOUNTY: {
    title: 'Review & publish',
    subtitle: 'Wrap up extras, double-check the preview, and publish your bounty deal.',
    wizardStep: { current: 3, total: 3 },
    backRoute: '/merchant/deals/create/bounty/details',
    hideMenu: true,
  },
  HIDDEN: {
    title: 'Review & publish',
    subtitle: 'Wrap up extras, double-check the preview, and publish your hidden deal.',
    wizardStep: { current: 3, total: 3 },
    backRoute: '/merchant/deals/create/hidden/details',
  },
};

/**
 * Picks the first menu item from the merchant's menu that's the most likely
 * candidate for a free-item check-in reward.
 *   1. Item already attached to the deal.
 *   2. Any item from the full menu.
 * Returns `null` if the merchant has no menu items at all.
 */
const pickAnyMenuItem = (state: DealCreationState, fullMenu: MenuItem[]): number | null => {
  if ((state.selectedMenuItems ?? []).length > 0) return state.selectedMenuItems[0].id;
  if (fullMenu.length > 0) return fullMenu[0].id;
  return null;
};

/**
 * Attach the configured check-in reward via the existing PATCH endpoint.
 * Returns a result object so the UI can toast a friendly note when we had
 * to substitute (e.g., FREE_ITEM falling back to BONUS_POINTS when no menu).
 */
const attachCheckInReward = async (
  dealId: number,
  state: DealCreationState,
  fullMenu: MenuItem[],
): Promise<{ ok: true; note?: string } | { ok: false; reason: string }> => {
  if (!state.checkInRewardEnabled) return { ok: true };

  const endpoint = `/merchants/deals/${dealId}/check-in-reward`;
  const kind = state.checkInRewardKind;
  const value = state.checkInRewardValue;
  const maxWins = state.checkInRewardMaxClaims;
  const rewardExpiryHours = state.checkInRewardExpiryHours;

  if (kind === 'FREE_ITEM') {
    const menuItemId = pickAnyMenuItem(state, fullMenu);
    if (menuItemId == null) {
      // No menu items — fall back to bonus points so the reward still attaches.
      const response = await apiPatch(endpoint, {
        isEnabled: true,
        rewardType: 'BONUS_POINTS',
        rewardValue: Math.max(1, value),
        rewardExpiryHours,
        maxWins,
        menuItemId: null,
      });
      return response.success
        ? {
            ok: true,
            note: 'No menu items yet, so the check-in reward defaulted to bonus points. Switch it to a free item on the Check-in Games page once you add menu items.',
          }
        : { ok: false, reason: response.error ?? 'Unknown error' };
    }
    const response = await apiPatch(endpoint, {
      isEnabled: true,
      rewardType: 'FREE_ITEM',
      rewardValue: 0,
      rewardExpiryHours,
      maxWins,
      menuItemId,
    });
    return response.success ? { ok: true } : { ok: false, reason: response.error ?? 'Unknown error' };
  }

  const response = await apiPatch(endpoint, {
    isEnabled: true,
    rewardType: kind,
    rewardValue: value,
    rewardExpiryHours,
    maxWins,
    menuItemId: null,
  });
  return response.success ? { ok: true } : { ok: false, reason: response.error ?? 'Unknown error' };
};

/**
 * Attach the configured referral program. Uses the existing POST
 * /merchants/me/referral-programs endpoint with the new deal's id.
 */
const attachReferralProgram = async (
  dealId: number,
  state: DealCreationState,
): Promise<{ ok: true } | { ok: false; reason: string }> => {
  if (!state.referralRewardEnabled) return { ok: true };
  if (!state.referralRewardName?.trim()) {
    return { ok: false, reason: 'Referral program needs a name.' };
  }
  if (!state.referralRewardForReferrer?.trim() || !state.referralRewardForReferred?.trim()) {
    return { ok: false, reason: 'Referral program needs both referrer and referred rewards.' };
  }

  const response = await apiPost('/merchants/me/referral-programs', {
    dealId,
    name: state.referralRewardName.trim(),
    rewardForReferrer: state.referralRewardForReferrer.trim(),
    rewardForReferred: state.referralRewardForReferred.trim(),
    isActive: true,
    maxRedemptionsPerUser: state.referralMaxPerUser,
    expiresAt: state.referralExpiresAt,
  });
  return response.success ? { ok: true } : { ok: false, reason: response.error ?? 'Unknown error' };
};

export const DealFinishStep = () => {
  const { state } = useDealCreation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const { data: menuData } = useMerchantMenu();
  const fullMenu = menuData?.menuItems ?? [];

  const config = useMemo(
    () => FLOW_CONFIG[state.dealType ?? 'STANDARD'] ?? FLOW_CONFIG.STANDARD!,
    [state.dealType],
  );

  const submit = async (asDraft: boolean) => {
    if (isPublishing) return;
    setIsPublishing(true);

    const result = await publishDealFromState(state, { isDraft: asDraft });
    if (!result.ok) {
      setIsPublishing(false);
      toast({
        title: 'Could not publish deal',
        description: result.error ?? 'Unknown error',
        variant: 'destructive',
      });
      return;
    }

    // Best-effort: attach configured rewards after deal creation. Never
    // block the publish flow if these fail — the merchant can fix from the
    // respective management pages (Check-in Games / Referrals).
    const created = result.data as { deal?: { id?: number } } | undefined;
    const dealId = created?.deal?.id;
    if (dealId) {
      if (state.checkInRewardEnabled) {
        const r = await attachCheckInReward(dealId, state, fullMenu);
        if (!r.ok) {
          toast({
            title: 'Check-in reward not attached',
            description: r.reason,
            variant: 'destructive',
          });
        } else if (r.note) {
          toast({ title: 'Check-in reward saved with a note', description: r.note });
        }
      }
      if (state.referralRewardEnabled) {
        const r = await attachReferralProgram(dealId, state);
        if (!r.ok) {
          toast({
            title: 'Referral program not attached',
            description: r.reason,
            variant: 'destructive',
          });
        }
      }
    }

    setIsPublishing(false);
    toast({
      title: asDraft ? 'Saved as draft' : 'Deal published',
      description: asDraft
        ? 'Your draft is saved — finish it any time from your dashboard.'
        : 'Your new deal is now live for customers.',
    });
    setTimeout(() => navigate(PATHS.MERCHANT_DASHBOARD), 800);
  };

  return (
    <QuickFormLayout
      title={config.title}
      subtitle={config.subtitle}
      wizardStep={config.wizardStep}
      onBack={() => navigate(config.backRoute)}
      primary={{
        label: 'Publish deal',
        onClick: () => submit(false),
        isLoading: isPublishing,
      }}
      secondary={{ label: 'Save as draft', onClick: () => submit(true), disabled: isPublishing }}
    >
      <div className="space-y-3">
        <MoreOptionsSection hideMenu={config.hideMenu} />
        <HomepagePreviewCard />
      </div>
    </QuickFormLayout>
  );
};

export default DealFinishStep;

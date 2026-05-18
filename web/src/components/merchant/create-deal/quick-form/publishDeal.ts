// src/components/merchant/create-deal/quick-form/publishDeal.ts
import type { DealCreationState } from '@/context/DealCreationContext';
import { apiPost } from '@/services/api';
import { mapDealTypeToBackend, generateAccessCode } from '@/utils/dealTypeUtils';

export interface PublishOptions {
  isDraft?: boolean;
}

export interface PublishResult {
  ok: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Centralised payload assembly + publish flow used by the new quick-form
 * deal creation pages. Keeps validation lighter than the legacy DealReviewStep
 * because the long-form UI enforces required fields inline.
 */
export const publishDealFromState = async (
  state: DealCreationState,
  options: PublishOptions = {},
): Promise<PublishResult> => {
  if (!state.title || state.title.trim().length === 0) {
    return { ok: false, error: 'Deal title is required.' };
  }

  let activeDateRange: { startDate: string; endDate: string };
  try {
    activeDateRange = resolveActiveDateRange(state);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid date range.' };
  }

  if (state.dealType !== 'BOUNTY' && state.dealType !== 'HIDDEN') {
    const hasDiscount =
      (state.discountPercentage && state.discountPercentage > 0) ||
      (state.discountAmount && state.discountAmount > 0) ||
      (state.customOfferDisplay && state.customOfferDisplay.trim().length > 0);
    if (!hasDiscount) {
      return { ok: false, error: 'Please configure a discount or custom offer.' };
    }
  }

  let finalAccessCode = state.accessCode;
  if (state.dealType === 'HIDDEN' && (!finalAccessCode || finalAccessCode.trim().length === 0)) {
    finalAccessCode = generateAccessCode();
  }

  const recurringDays =
    state.dealType === 'RECURRING'
      ? (Array.isArray(state.recurringDays) ? state.recurringDays : []).map((d) =>
          String(d).trim().toUpperCase(),
        )
      : undefined;

  const payload = {
    title: state.title.trim(),
    description: state.description ?? '',
    discountPercentage: state.discountPercentage ?? null,
    discountAmount: state.discountAmount ?? null,
    dealType: mapDealTypeToBackend(state.dealType),
    category: state.category ?? 'FOOD_AND_BEVERAGE',
    recurringDays,
    activeDateRange,
    redemptionInstructions: state.redemptionInstructions,
    imageUrls: state.imageUrls ?? [],
    primaryImageIndex: state.primaryImageIndex ?? 0,
    offerTerms: state.offerTerms || null,
    customOfferDisplay: state.customOfferDisplay || null,
    kickbackEnabled: state.kickbackEnabled ?? false,
    isFeatured: state.isFeatured ?? false,
    priority: state.priority ?? 5,
    maxRedemptions: state.maxRedemptions ?? 0,
    minOrderAmount: state.minOrderAmount ?? null,
    validDaysOfWeek: state.validDaysOfWeek ?? null,
    validHours: state.validHours ?? null,
    socialProofEnabled: state.socialProofEnabled ?? true,
    allowSharing: state.allowSharing ?? true,
    storeIds: state.storeIds ?? null,
    cityIds: state.cityIds ?? null,
    tags: state.tags ?? [],
    notes: state.notes || null,
    externalUrl: state.externalUrl || null,
    // Bounty fields are sent whenever the merchant configured a bounty
    // (via Step 1 for Bounty deals, or via the Rewards section's Bounty tab
    // for any other deal type).
    bountyRewardAmount: (state.bountyRewardAmount ?? 0) > 0 ? state.bountyRewardAmount! : undefined,
    minReferralsRequired:
      (state.bountyRewardAmount ?? 0) > 0 ? state.minReferralsRequired ?? undefined : undefined,
    // Streak reward fields — backend may store on the deal if supported.
    streakEnabled: state.streakEnabled ?? false,
    streakMinVisits: state.streakEnabled ? state.streakMinVisits ?? undefined : undefined,
    streakRewardType: state.streakEnabled ? state.streakRewardType ?? undefined : undefined,
    streakRewardValue: state.streakEnabled ? state.streakRewardValue ?? undefined : undefined,
    streakMaxClaims: state.streakEnabled ? state.streakMaxClaims ?? undefined : undefined,
    streakExpiryHours: state.streakEnabled ? state.streakExpiryHours : undefined,
    accessCode: state.dealType === 'HIDDEN' ? finalAccessCode ?? undefined : undefined,
    bogoBuyQuantity: state.dealType === 'BOGO' ? state.bogoBuyQuantity ?? undefined : undefined,
    bogoGetQuantity: state.dealType === 'BOGO' ? state.bogoGetQuantity ?? undefined : undefined,
    bogoGetDiscountPercent:
      state.dealType === 'BOGO' ? state.bogoGetDiscountPercent ?? undefined : undefined,
    hiddenDealVisibility:
      state.dealType === 'HIDDEN' && state.hiddenDealVisibility
        ? state.hiddenDealVisibility
        : undefined,
    menuItems:
      !state.useMenuCollection && state.selectedMenuItems?.length > 0
        ? state.selectedMenuItems.map((item) => ({
            id: item.id,
            isHidden: item.isHidden || false,
          }))
        : undefined,
    menuCollectionId:
      state.useMenuCollection && state.menuCollectionId ? state.menuCollectionId : undefined,
    isDraft: options.isDraft ?? false,
  };

  try {
    const response = await apiPost('/deals', payload);
    if (response.success) return { ok: true, data: response.data };
    return { ok: false, error: response.error ?? 'Could not publish deal.' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not publish deal.' };
  }
};

function resolveActiveDateRange(state: DealCreationState): { startDate: string; endDate: string } {
  // RECURRING deals use the full calendar range (Day 1 → Last day) and
  // encode the per-day time-of-day in validHours. Single-day flows
  // (Standard, Redeem Now, Bounty, Hidden) prefer startTime/endTime which
  // include the exact time-of-day window.
  let start: Date;
  let end: Date;

  if (state.dealType === 'RECURRING') {
    if (state.activeStartDate) start = new Date(state.activeStartDate);
    else throw new Error('Deal start date is required.');
    if (state.activeEndDate) end = new Date(state.activeEndDate);
    else throw new Error('Deal end date is required.');
  } else {
    if (state.startTime) start = new Date(state.startTime);
    else if (state.activeStartDate) start = new Date(state.activeStartDate);
    else throw new Error('Deal start date is required.');
    if (state.endTime) end = new Date(state.endTime);
    else if (state.activeEndDate) end = new Date(state.activeEndDate);
    else throw new Error('Deal end date is required.');
  }

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid date range.');
  }

  // The backend rejects start dates that are in the past. If the merchant
  // picked "today" and the resolved window has already started, nudge the
  // start to ~1 minute from now so the deal is valid. We keep the original
  // end if it's still after that nudged start; otherwise extend by 1 hour.
  const now = Date.now();
  if (start.getTime() <= now) {
    start = new Date(now + 60 * 1000);
  }
  if (end <= start) {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

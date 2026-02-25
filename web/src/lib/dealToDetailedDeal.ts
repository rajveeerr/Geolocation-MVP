/**
 * Transform our Deal (landing format) into DetailedDeal (API format).
 * Used when the API returns 404 and we fall back to hardcoded landing deals.
 */
import type { Deal } from '@/data/deals';
import type { DetailedDeal } from '@/hooks/useDealDetail';

const now = new Date().toISOString();

export function dealToDetailedDeal(d: Deal): DetailedDeal {
  const images = (d.images?.length ? d.images : [d.image]).filter(Boolean);
  const endTime = d.endTime || d.expiresAt || now;
  const startTime = d.startTime || now;
  const endDate = new Date(endTime);
  const startDate = new Date(startTime);
  const isActive = endDate > new Date() && (!startDate || startDate <= new Date());
  const isUpcoming = startDate > new Date();
  const isExpired = endDate <= new Date();

  const total = isActive || isUpcoming
    ? Math.max(0, (endDate.getTime() - new Date().getTime()) / 1000)
    : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  const result: DetailedDeal & { bountyRewardAmount?: number | null; minReferralsRequired?: number | null } = {
    id: d.id,
    title: d.name,
    description: d.description || `Special offer at ${d.merchantName || 'this venue'}. ${d.dealValue || ''}`.trim(),
    category: {
      value: (d.category || 'DEAL').replace(/\s+/g, '_').toUpperCase(),
      label: d.category || 'Deal',
      description: d.offerTerms || '',
      icon: 'tag',
      color: '#E80203',
    },
    imageUrl: images[0] || null,
    images,
    offerDisplay: d.dealValue || `${d.discountPercentage ?? 0}% OFF`,
    discountPercentage: d.discountPercentage ?? null,
    discountAmount: d.discountAmount ?? null,
    offerTerms: d.offerTerms ?? null,
    dealType: d.dealType as string || 'Standard',
    bountyQRCode: null,
    startTime,
    endTime,
    recurringDays: d.recurringDays ?? [],
    status: {
      isActive,
      isExpired,
      isUpcoming,
      timeRemaining: {
        total,
        hours,
        minutes,
        formatted: `${hours}h ${minutes}m`,
      },
    },
    redemptionInstructions: 'Check in at the venue and show this deal to your server.',
    kickbackEnabled: (d.bountyRewardAmount ?? 0) > 0,
    menuItems: [],
    hasMenuItems: false,
    merchant: {
      id: d.merchantId ?? 0,
      businessName: d.merchantName || 'Venue',
      description: '',
      address: d.merchantAddress || d.location || '',
      latitude: null,
      longitude: null,
      logoUrl: d.merchantLogo ?? null,
      totalDeals: 1,
      totalStores: 1,
      stores: [],
    },
    socialProof: {
      totalSaves: 0,
      totalCheckIns: d.claimedBy?.totalCount ?? 0,
      recentSavers: (d.claimedBy?.visibleUsers ?? []).map((u, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        avatarUrl: u.avatarUrl ?? null,
        savedAt: now,
      })),
      recentCheckIns: (d.claimedBy?.visibleUsers ?? []).map((u, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        avatarUrl: u.avatarUrl ?? null,
        checkedInAt: now,
      })),
    },
    createdAt: now,
    updatedAt: now,
    context: {
      isRecurring: (d.recurringDays?.length ?? 0) > 0,
      isHappyHour: (d.dealType as string)?.toLowerCase().includes('happy') ?? false,
      hasMultipleImages: images.length > 1,
      hasMultipleStores: false,
      isPopular: (d.claimedBy?.totalCount ?? 0) >= 3,
    },
  };
  (result as any).bountyRewardAmount = d.bountyRewardAmount ?? null;
  (result as any).minReferralsRequired = d.minReferralsRequired ?? null;
  return result;
}

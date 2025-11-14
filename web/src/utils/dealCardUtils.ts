// web/src/utils/dealCardUtils.ts
import { Tag, Clock, Repeat, Zap, Lock, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type DealType = 'STANDARD' | 'HAPPY_HOUR' | 'RECURRING' | 'REDEEM_NOW' | 'HIDDEN' | 'BOUNTY';

export interface DealTypeBadgeConfig {
  label: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const getDealTypeBadgeConfig = (dealType: DealType | string): DealTypeBadgeConfig => {
  const normalizedType = dealType.toUpperCase().replace(/\s+/g, '_') as DealType;

  switch (normalizedType) {
    case 'STANDARD':
      return {
        label: 'Item Deal',
        icon: Tag,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
      };
    case 'HAPPY_HOUR':
      return {
        label: 'Happy Hour',
        icon: Clock,
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300',
      };
    case 'RECURRING':
      return {
        label: 'Daily Deal',
        icon: Repeat,
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-300',
      };
    case 'REDEEM_NOW':
      return {
        label: 'Redeem Now',
        icon: Zap,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
      };
    case 'HIDDEN':
      return {
        label: 'Hidden Deal',
        icon: Lock,
        bgColor: 'bg-neutral-800',
        textColor: 'text-white',
        borderColor: 'border-neutral-700',
      };
    case 'BOUNTY':
      return {
        label: 'Bounty Deal',
        icon: Trophy,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
      };
    default:
      return {
        label: 'Deal',
        icon: Tag,
        bgColor: 'bg-neutral-100',
        textColor: 'text-neutral-700',
        borderColor: 'border-neutral-300',
      };
  }
};

export const formatDealValue = (
  discountPercentage: number | null,
  discountAmount: number | null,
  dealType?: DealType | string
): string => {
  if (discountPercentage !== null && discountPercentage > 0) {
    return `${discountPercentage}% OFF`;
  }
  if (discountAmount !== null && discountAmount > 0) {
    return `$${discountAmount} OFF`;
  }
  if (dealType === 'BOUNTY') {
    return 'Bounty Deal';
  }
  if (dealType === 'HIDDEN') {
    return 'Hidden Deal';
  }
  return 'Special Offer';
};

export const calculateTimeRemaining = (endTime: string): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isExpired: boolean;
} => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'Expired',
      isExpired: true,
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}h ${minutes}m`,
    isExpired: false,
  };
};

export interface DealCardProps {
  id: string | number;
  title: string;
  image: string;
  images?: string[];
  merchantName: string;
  location: string;
  rating?: number;
  category: string | { label: string; name: string };
  dealType: DealType | string;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  endTime?: string;
  isSaved?: boolean;
  socialProof?: {
    totalSaves?: number;
    totalCheckIns?: number;
    recentUsers?: Array<{ avatarUrl?: string | null }>;
  };
  bountyRewardAmount?: number | null;
  minReferralsRequired?: number | null;
  recurringDays?: string[];
  isFlashSale?: boolean;
  maxRedemptions?: number | null;
  currentRedemptions?: number | null;
  accessCode?: string | null;
}

export const getDealCardProps = (deal: any): DealCardProps => {
  return {
    id: deal.id,
    title: deal.title || deal.name,
    image: deal.imageUrl || deal.image || '',
    images: deal.images || [],
    merchantName: deal.merchant?.businessName || deal.merchantName || '',
    location: deal.merchant?.address || deal.location || '',
    rating: deal.rating,
    category: deal.category || '',
    dealType: deal.dealType?.name || deal.dealType || 'STANDARD',
    discountPercentage: deal.discountPercentage,
    discountAmount: deal.discountAmount,
    endTime: deal.endTime || deal.expiresAt,
    isSaved: deal.userInteraction?.isSaved || false,
    socialProof: {
      totalSaves: deal.socialProof?.totalSaves || deal.claimedBy?.totalCount || 0,
      totalCheckIns: deal.socialProof?.totalCheckIns || 0,
      recentUsers: deal.socialProof?.recentSavers?.slice(0, 3) || deal.claimedBy?.visibleUsers || [],
    },
    bountyRewardAmount: deal.bountyRewardAmount,
    minReferralsRequired: deal.minReferralsRequired,
    recurringDays: deal.recurringDays,
    isFlashSale: deal.isFlashSale,
    maxRedemptions: deal.maxRedemptions,
    currentRedemptions: deal.currentRedemptions,
    accessCode: deal.accessCode,
  };
};


// Heist Feature Type Definitions
// Matches backend API response structures

export interface TokenBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastEarnedAt: string | null;
  lastSpentAt: string | null;
}

export interface HeistEligibilityCheck {
  featureEnabled: boolean;
  sufficientTokens: boolean;
  notOnCooldown: boolean;
  targetNotProtected: boolean;
  notSelfTargeting: boolean;
  targetHasSufficientPoints: boolean;
  withinDailyLimit: boolean;
  notAlreadyRobbed: boolean;
}

export interface HeistEligibilityResponse {
  eligible: boolean;
  checks: HeistEligibilityCheck;
  reason?: string;
  code?: string;
  details?: {
    cooldownEndsAt?: string;
    protectionEndsAt?: string;
    hoursRemaining?: number;
    tokensAvailable?: number;
    tokensNeeded?: number;
    targetPoints?: number;
    minimumRequired?: number;
  };
  pointsWouldSteal?: number;
}

export interface HeistExecuteRequest {
  victimId: number;
}

export interface HeistExecuteResponse {
  heistId: number;
  pointsStolen: number;
  attackerPoints: {
    before: number;
    after: number;
  };
  victimPoints: {
    before: number;
    after: number;
  };
}

export interface HeistErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: {
    cooldownEndsAt?: string;
    protectionEndsAt?: string;
    hoursRemaining?: number;
    tokensAvailable?: number;
    tokensNeeded?: number;
    targetPoints?: number;
    minimumRequired?: number;
  };
}

export type HeistStatus = 
  | 'SUCCESS'
  | 'FAILED_COOLDOWN'
  | 'FAILED_TARGET_PROTECTED'
  | 'FAILED_SHIELD'
  | 'FAILED_INSUFFICIENT_POINTS'
  | 'FAILED_INSUFFICIENT_TOKENS'
  | 'FAILED_INVALID_TARGET';

export type HeistRole = 'attacker' | 'victim' | 'both';

export interface HeistHistoryItem {
  id: number;
  type: 'attacker' | 'victim';
  otherUser: {
    id: number;
    name: string | null;
    avatarUrl?: string | null;
  };
  pointsStolen?: number;
  pointsLost?: number;
  status: HeistStatus;
  createdAt: string;
  yourPointsBefore?: number;
  yourPointsAfter?: number;
}

export interface HeistHistoryResponse {
  heists: HeistHistoryItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface HeistStats {
  asAttacker: {
    total: number;
    successful: number;
    failed: number;
    totalPointsStolen: number;
  };
  asVictim: {
    total: number;
    totalPointsLost: number;
  };
  netPoints: number;
}

export type HeistNotificationType = 
  | 'HEIST_SUCCESS'
  | 'HEIST_VICTIM'
  | 'TOKEN_EARNED'
  | 'SHIELD_ACTIVATED'
  | 'SHIELD_EXPIRED';

export interface HeistNotification {
  id: number;
  type: HeistNotificationType;
  title: string;
  message: string;
  metadata?: {
    attackerName?: string;
    attackerId?: number;
    victimName?: string;
    victimId?: number;
    pointsStolen?: number;
    pointsLost?: number;
    protectionUntil?: string;
    referredName?: string;
    referredId?: number;
    totalTokens?: number;
  };
  isRead: boolean;
  createdAt: string;
}

export interface HeistNotificationsResponse {
  notifications: HeistNotification[];
  count: number;
  unreadCount: number;
}

export interface MarkNotificationReadRequest {
  notificationId?: number;
  markAll?: boolean;
}

export interface MarkNotificationReadResponse {
  markedCount?: number;
  notificationId?: number;
}

// Heist Item Types
export interface HeistItem {
  id: number;
  name: string;
  type: 'SWORD' | 'HAMMER' | 'SHIELD';
  description: string;
  coinCost: number;
  effectType: string;
  effectValue: number;
  durationHours: number | null;
  maxUses: number | null;
  isActive: boolean;
  icon: string | null;
}

export interface HeistInventoryItem {
  id: number;
  itemId: number;
  name: string;
  type: 'SWORD' | 'HAMMER' | 'SHIELD';
  effectType: string;
  effectValue: number;
  usesRemaining: number | null;
  expiresAt: string | null;
}


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut, apiPost } from '@/services/api';

/**
 * Backend returns { success, data: payload } and ApiClient wraps it as
 * { success, data: { success, data: payload } }. This helper extracts
 * the actual payload reliably.
 */
function extractPayload<T>(raw: unknown): T {
    if (raw && typeof raw === 'object' && 'data' in raw) {
        return (raw as Record<string, unknown>).data as T;
    }
    return raw as T;
}

// ─── Types ──────────────────────────────────────────────────────────

export type NudgeType =
    | 'INACTIVITY'
    | 'NEARBY_DEAL'
    | 'STREAK_REMINDER'
    | 'HAPPY_HOUR_ALERT'
    | 'WEATHER_BASED';

export type NudgeFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'UNLIMITED';

export interface Nudge {
    id: number;
    type: NudgeType;
    title: string;
    message: string;
    triggerCondition: Record<string, unknown>;
    frequency: NudgeFrequency;
    cooldownHours: number;
    activeStartTime: string | null;
    activeEndTime: string | null;
    timeWindowStart: string | null;
    timeWindowEnd: string | null;
    active: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
    createdBy: number | null;
}

export interface UserNudge {
    id: number;
    userId: number;
    nudgeId: number;
    sentAt: string;
    deliveredVia: string;
    delivered: boolean;
    opened: boolean;
    openedAt: string | null;
    clicked: boolean;
    clickedAt: string | null;
    dismissed: boolean;
    contextData: Record<string, unknown> | null;
    nudge: Nudge;
}

export interface NudgePreferences {
    id: number;
    userId: number;
    enabled: boolean;
    inactivityEnabled: boolean;
    nearbyDealEnabled: boolean;
    streakReminderEnabled: boolean;
    happyHourAlertEnabled: boolean;
    weatherBasedEnabled: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateNudgePreferencesPayload {
    enabled?: boolean;
    inactivityEnabled?: boolean;
    nearbyDealEnabled?: boolean;
    streakReminderEnabled?: boolean;
    happyHourAlertEnabled?: boolean;
    weatherBasedEnabled?: boolean;
    quietHoursStart?: string | null;
    quietHoursEnd?: string | null;
}

// ─── Display Helpers ────────────────────────────────────────────────

export const NUDGE_TYPE_LABELS: Record<NudgeType, { label: string; emoji: string; color: string }> = {
    INACTIVITY: { label: 'Inactivity', emoji: '💤', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    NEARBY_DEAL: { label: 'Nearby Deal', emoji: '📍', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    STREAK_REMINDER: { label: 'Streak Reminder', emoji: '🔥', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    HAPPY_HOUR_ALERT: { label: 'Happy Hour', emoji: '🍸', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    WEATHER_BASED: { label: 'Weather', emoji: '☀️', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
};

// ─── Consumer Hooks ─────────────────────────────────────────────────

/**
 * Fetch the authenticated user's nudge history.
 * GET /api/nudges/history
 */
export function useNudgeHistory(limit = 50) {
    return useQuery<UserNudge[]>({
        queryKey: ['nudgeHistory', limit],
        queryFn: async () => {
            const res = await apiGet<UserNudge[]>(`/nudges/history?limit=${limit}`);
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to fetch nudge history');
            }
            const arr = extractPayload<UserNudge[]>(res.data);
            return Array.isArray(arr) ? arr : [];
        },
        staleTime: 60 * 1000, // 1 min
    });
}

/**
 * Fetch the authenticated user's nudge preferences.
 * GET /api/nudges/preferences
 */
export function useNudgePreferences() {
    return useQuery<NudgePreferences>({
        queryKey: ['nudgePreferences'],
        queryFn: async () => {
            const res = await apiGet<NudgePreferences>('/nudges/preferences');
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to fetch nudge preferences');
            }
            return extractPayload<NudgePreferences>(res.data);
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Update the authenticated user's nudge preferences.
 * PUT /api/nudges/preferences
 */
export function useUpdateNudgePreferences() {
    const queryClient = useQueryClient();

    return useMutation<NudgePreferences, Error, UpdateNudgePreferencesPayload>({
        mutationFn: async (payload) => {
            const res = await apiPut<NudgePreferences, UpdateNudgePreferencesPayload>(
                '/nudges/preferences',
                payload,
            );
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to update nudge preferences');
            }
            return extractPayload<NudgePreferences>(res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nudgePreferences'] });
        },
    });
}

/**
 * Track nudge engagement (opened, clicked, dismissed).
 * POST /api/nudges/:id/engage
 */
export function useEngageNudge() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { userNudgeId: number; action: 'opened' | 'clicked' | 'dismissed' }>({
        mutationFn: async ({ userNudgeId, action }) => {
            const res = await apiPost<{ message: string }, { action: string }>(
                `/nudges/${userNudgeId}/engage`,
                { action },
            );
            if (!res.success) {
                throw new Error(res.error || 'Failed to track engagement');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nudgeHistory'] });
        },
    });
}

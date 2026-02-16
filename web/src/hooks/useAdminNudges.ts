import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import type { Nudge, NudgeType, NudgeFrequency, UserNudge } from './useNudges';

// ─── Types ──────────────────────────────────────────────────────────

export interface NudgeAnalytics {
    total: number;
    delivered: number;
    opened: number;
    clicked: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
}

export interface NudgeWithDeliveries extends Nudge {
    userNudges: UserNudge[];
}

export interface CreateNudgePayload {
    type: NudgeType;
    title: string;
    message: string;
    triggerCondition: Record<string, unknown>;
    frequency?: NudgeFrequency;
    cooldownHours?: number;
    activeStartTime?: string | null;
    activeEndTime?: string | null;
    timeWindowStart?: string | null;
    timeWindowEnd?: string | null;
    active?: boolean;
    priority?: number;
}

export type UpdateNudgePayload = Partial<CreateNudgePayload>;

// ─── Admin Hooks ────────────────────────────────────────────────────

/**
 * List all nudge templates.
 * GET /api/admin/nudges
 */
export function useAdminNudges() {
    return useQuery<Nudge[]>({
        queryKey: ['adminNudges'],
        queryFn: async () => {
            const res = await apiGet<Nudge[]>('/admin/nudges');
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to fetch nudges');
            }
            return res.data;
        },
        staleTime: 60 * 1000,
    });
}

/**
 * Get a single nudge template with recent deliveries.
 * GET /api/admin/nudges/:id
 */
export function useAdminNudge(id: number | undefined) {
    return useQuery<NudgeWithDeliveries>({
        queryKey: ['adminNudge', id],
        queryFn: async () => {
            const res = await apiGet<NudgeWithDeliveries>(`/admin/nudges/${id}`);
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to fetch nudge');
            }
            return res.data;
        },
        enabled: !!id,
        staleTime: 30 * 1000,
    });
}

/**
 * Create a new nudge template.
 * POST /api/admin/nudges
 */
export function useCreateNudge() {
    const queryClient = useQueryClient();

    return useMutation<Nudge, Error, CreateNudgePayload>({
        mutationFn: async (payload) => {
            const res = await apiPost<Nudge, CreateNudgePayload>('/admin/nudges', payload);
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to create nudge');
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminNudges'] });
        },
    });
}

/**
 * Update an existing nudge template.
 * PUT /api/admin/nudges/:id
 */
export function useUpdateNudge(id: number) {
    const queryClient = useQueryClient();

    return useMutation<Nudge, Error, UpdateNudgePayload>({
        mutationFn: async (payload) => {
            const res = await apiPut<Nudge, UpdateNudgePayload>(`/admin/nudges/${id}`, payload);
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to update nudge');
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminNudges'] });
            queryClient.invalidateQueries({ queryKey: ['adminNudge', id] });
        },
    });
}

/**
 * Delete a nudge template.
 * DELETE /api/admin/nudges/:id
 */
export function useDeleteNudge() {
    const queryClient = useQueryClient();

    return useMutation<{ message: string }, Error, number>({
        mutationFn: async (id) => {
            const res = await apiDelete<{ message: string }>(`/admin/nudges/${id}`);
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to delete nudge');
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminNudges'] });
        },
    });
}

/**
 * Test-send a nudge to a specific user.
 * POST /api/admin/nudges/:id/test/:userId
 */
export function useTestNudge() {
    return useMutation<{ message: string }, Error, { nudgeId: number; userId: number; contextData?: Record<string, unknown> }>({
        mutationFn: async ({ nudgeId, userId, contextData }) => {
            const res = await apiPost<{ message: string }, { contextData?: Record<string, unknown> }>(
                `/admin/nudges/${nudgeId}/test/${userId}`,
                { contextData },
            );
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to send test nudge');
            }
            return res.data;
        },
    });
}

/**
 * Get overall nudge analytics.
 * GET /api/admin/nudges/analytics/overview
 */
export function useNudgeAnalyticsOverview() {
    return useQuery<NudgeAnalytics>({
        queryKey: ['nudgeAnalyticsOverview'],
        queryFn: async () => {
            const res = await apiGet<NudgeAnalytics>('/admin/nudges/analytics/overview');
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to fetch analytics');
            }
            return res.data;
        },
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Get analytics for a specific nudge.
 * GET /api/admin/nudges/:id/analytics
 */
export function useNudgeAnalytics(id: number | undefined) {
    return useQuery<NudgeAnalytics>({
        queryKey: ['nudgeAnalytics', id],
        queryFn: async () => {
            const res = await apiGet<NudgeAnalytics>(`/admin/nudges/${id}/analytics`);
            if (!res.success || !res.data) {
                throw new Error(res.error || 'Failed to fetch nudge analytics');
            }
            return res.data;
        },
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useEngageNudge, NUDGE_TYPE_LABELS, type UserNudge, type NudgeType } from '@/hooks/useNudges';
import { useAuth } from '@/context/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { cn } from '@/lib/utils';
import { useSocket, type SocketNudge } from '@/hooks/useSocket';

/**
 * NudgeToast — mounts globally in the app layout.
 *
 * Uses WebSocket for instant delivery, with a one-time HTTP fetch
 * on mount to pick up any nudges missed while offline.
 */

const AUTO_DISMISS_MS = 8_000; // 8 seconds

const FALLBACK_META = { label: 'Notification', emoji: '', color: 'text-neutral-600 bg-neutral-50 border-neutral-200' };

function getMeta(type: NudgeType) {
    return NUDGE_TYPE_LABELS[type] ?? FALLBACK_META;
}

export function NudgeToast() {
    const { user } = useAuth();
    const isAuthenticated = !!user;
    const queryClient = useQueryClient();

    // ── WebSocket connection ────────────────────────────────
    const { onNudge } = useSocket();

    // ── One-time fetch for missed nudges while offline ──────
    const { data: nudges } = useQuery<UserNudge[]>({
        queryKey: ['nudgeHistory', 10],
        queryFn: async () => {
            const res = await apiGet<UserNudge[]>('/nudges/history?limit=10');
            if (!res.success || !res.data) return [];
            const inner = res.data as any;
            const arr = Array.isArray(inner) ? inner : Array.isArray(inner?.data) ? inner.data : [];
            return arr;
        },
        enabled: isAuthenticated,
        staleTime: 60 * 1000,
        retry: false,
        throwOnError: false,
    });

    const engageMutation = useEngageNudge();
    const [visibleNudges, setVisibleNudges] = useState<UserNudge[]>([]);
    const seenIdsRef = useRef<Set<number>>(new Set());

    // ── Listen for real-time nudges via WebSocket ───────────
    useEffect(() => {
        if (!isAuthenticated) return;

        const unsub = onNudge((socketNudge: SocketNudge) => {
            // Avoid duplicates
            if (seenIdsRef.current.has(socketNudge.id)) return;
            seenIdsRef.current.add(socketNudge.id);

            // Convert socket payload to UserNudge shape for display
            const fakeUserNudge: UserNudge = {
                id: socketNudge.id,
                nudgeId: 0,
                userId: 0,
                sentAt: socketNudge.timestamp,
                deliveredVia: 'websocket',
                delivered: true,
                opened: false,
                openedAt: null,
                clicked: false,
                clickedAt: null,
                dismissed: false,
                contextData: null,
                nudge: {
                    id: 0,
                    type: socketNudge.type as NudgeType,
                    title: socketNudge.title,
                    message: socketNudge.message,
                    active: true,
                    frequency: 'ONCE',
                    triggerCondition: {},
                    cooldownHours: 0,
                    activeStartTime: null,
                    activeEndTime: null,
                    timeWindowStart: null,
                    timeWindowEnd: null,
                    priority: 0,
                    createdAt: socketNudge.timestamp,
                    updatedAt: socketNudge.timestamp,
                    createdBy: null,
                },
            };

            setVisibleNudges((prev) => [...prev, fakeUserNudge].slice(-3));

            // Refresh the nudge history cache so the Notifications page is up-to-date
            queryClient.invalidateQueries({ queryKey: ['nudgeHistory'] });
        });

        return unsub;
    }, [isAuthenticated, onNudge, queryClient]);

    // ── Show missed nudges from the initial HTTP fetch ──────
    useEffect(() => {
        if (!nudges) return;

        const newNudges = nudges.filter(
            (n) => n.nudge && !n.opened && !n.dismissed && !seenIdsRef.current.has(n.id),
        );

        if (newNudges.length > 0) {
            newNudges.forEach((n) => seenIdsRef.current.add(n.id));
            setVisibleNudges((prev) => [...prev, ...newNudges].slice(-3));
        }
    }, [nudges]);

    // ── Dismiss / engage ────────────────────────────────────
    const dismiss = useCallback(
        (userNudge: UserNudge, action: 'opened' | 'clicked' | 'dismissed') => {
            setVisibleNudges((prev) => prev.filter((n) => n.id !== userNudge.id));

            // Track engagement via REST (reliable, validates ownership on backend)
            engageMutation.mutate({ userNudgeId: userNudge.id, action });
        },
        [engageMutation],
    );

    // ── Auto-dismiss after 8s ───────────────────────────────
    useEffect(() => {
        if (visibleNudges.length === 0) return;

        const timer = setTimeout(() => {
            const oldest = visibleNudges[0];
            if (oldest) {
                dismiss(oldest, 'opened');
            }
        }, AUTO_DISMISS_MS);

        return () => clearTimeout(timer);
    }, [visibleNudges, dismiss]);

    if (!isAuthenticated) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {visibleNudges.map((userNudge) => {
                    if (!userNudge.nudge) return null;
                    const meta = getMeta(userNudge.nudge.type);
                    return (
                        <motion.div
                            key={userNudge.id}
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl"
                        >
                            {/* Color accent bar */}
                            <div className={cn('h-1', meta.color.split(' ')[1])} />

                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={cn('mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-lg', meta.color)}>
                                            <Bell className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-neutral-900 truncate">
                                                {userNudge.nudge.title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">
                                                {userNudge.nudge.message}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dismiss(userNudge, 'dismissed')}
                                        className="flex-shrink-0 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                                    >
                                        <X className="h-4 w-3" />
                                    </button>
                                </div>

                                {/* CTA row */}
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                                        <Bell className="h-3 w-3" />
                                        {meta.label}
                                    </span>
                                    <button
                                        onClick={() => dismiss(userNudge, 'clicked')}
                                        className="flex items-center gap-1 rounded-md bg-brand-primary-50 px-3 py-1 text-xs font-semibold text-brand-primary-600 hover:bg-brand-primary-100"
                                    >
                                        Check it out <ExternalLink className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

export default NudgeToast;

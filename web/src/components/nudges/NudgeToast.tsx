import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useNudgeHistory, useEngageNudge, NUDGE_TYPE_LABELS, type UserNudge } from '@/hooks/useNudges';
import { cn } from '@/lib/utils';

/**
 * NudgeToast — mounts globally in the app layout.
 *
 * Polls /api/nudges/history every 60 s and shows new, unopened nudges
 * as animated toast notifications. When the WebSocket client is set up
 * in the future, this component can subscribe to real-time `nudge` events
 * instead of polling.
 */

const POLL_INTERVAL = 60_000; // 60 seconds
const AUTO_DISMISS_MS = 8_000; // 8 seconds

export function NudgeToast() {
    const { data: nudges, refetch } = useNudgeHistory(10);
    const engageMutation = useEngageNudge();
    const [visibleNudges, setVisibleNudges] = useState<UserNudge[]>([]);
    const seenIdsRef = useRef<Set<number>>(new Set());

    // Poll for new nudges
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [refetch]);

    // Detect new, unopened nudges and show them
    useEffect(() => {
        if (!nudges) return;

        const newNudges = nudges.filter(
            (n) => !n.opened && !n.dismissed && !seenIdsRef.current.has(n.id),
        );

        if (newNudges.length > 0) {
            newNudges.forEach((n) => seenIdsRef.current.add(n.id));
            setVisibleNudges((prev) => [...prev, ...newNudges].slice(-3)); // max 3 toasts
        }
    }, [nudges]);

    const dismiss = useCallback(
        (userNudge: UserNudge, action: 'opened' | 'clicked' | 'dismissed') => {
            setVisibleNudges((prev) => prev.filter((n) => n.id !== userNudge.id));
            engageMutation.mutate({ userNudgeId: userNudge.id, action });
        },
        [engageMutation],
    );

    // Auto-dismiss after 8s
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

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {visibleNudges.map((userNudge) => {
                    const meta = NUDGE_TYPE_LABELS[userNudge.nudge.type];
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
                                            {meta.emoji}
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
                                        <X className="h-4 w-4" />
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

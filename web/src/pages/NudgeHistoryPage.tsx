import { motion } from 'framer-motion';
import { Bell, ArrowLeft, CheckCircle, Eye, MousePointerClick, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNudgeHistory, NUDGE_TYPE_LABELS } from '@/hooks/useNudges';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

export function NudgeHistoryPage() {
    const { data: nudges, isLoading } = useNudgeHistory(100);

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to={PATHS.SETTINGS}
                    className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Settings
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                    <Bell className="h-6 w-6 text-brand-primary-500" />
                    Notification History
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                    All nudge notifications you've received.
                </p>
            </div>

            {/* Loading skeleton */}
            {isLoading && (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-neutral-200" />
                                <div className="flex-1">
                                    <div className="mb-1 h-4 w-40 rounded bg-neutral-200" />
                                    <div className="h-3 w-64 rounded bg-neutral-200" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && (!nudges || nudges.length === 0) && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-20">
                    <Bell className="mb-4 h-14 w-14 text-neutral-300" />
                    <h3 className="mb-1 text-lg font-semibold text-neutral-600">No notifications yet</h3>
                    <p className="text-sm text-neutral-400">
                        When we send you nudges, they'll appear here.
                    </p>
                </div>
            )}

            {/* Nudge list */}
            {nudges && nudges.length > 0 && (
                <div className="space-y-2">
                    {nudges.map((userNudge, idx) => {
                        const meta = NUDGE_TYPE_LABELS[userNudge.nudge.type];
                        const date = new Date(userNudge.sentAt);

                        return (
                            <motion.div
                                key={userNudge.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className={cn(
                                    'rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
                                    userNudge.opened ? 'border-neutral-100' : 'border-brand-primary-200 bg-brand-primary-50/30',
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg',
                                            meta.color,
                                        )}
                                    >
                                        {meta.emoji}
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-neutral-900 truncate">
                                                {userNudge.nudge.title}
                                            </p>
                                            <time className="flex-shrink-0 ml-2 text-xs text-neutral-400">
                                                {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                {' · '}
                                                {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </time>
                                        </div>
                                        <p className="mt-0.5 text-xs text-neutral-500">{userNudge.nudge.message}</p>

                                        {/* Status badges */}
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium border', meta.color)}>
                                                {meta.label}
                                            </span>

                                            {userNudge.delivered && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                                    <CheckCircle className="h-2.5 w-2.5" /> Delivered
                                                </span>
                                            )}
                                            {userNudge.opened && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                                    <Eye className="h-2.5 w-2.5" /> Opened
                                                </span>
                                            )}
                                            {userNudge.clicked && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                                                    <MousePointerClick className="h-2.5 w-2.5" /> Clicked
                                                </span>
                                            )}
                                            {userNudge.dismissed && (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                                                    <XCircle className="h-2.5 w-2.5" /> Dismissed
                                                </span>
                                            )}
                                            <span className="text-[10px] text-neutral-400">
                                                via {userNudge.deliveredVia}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default NudgeHistoryPage;

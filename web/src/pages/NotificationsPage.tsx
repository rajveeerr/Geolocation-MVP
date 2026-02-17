import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    ArrowLeft,
    CheckCircle2,
    Eye,
    MousePointerClick,
    XCircle,
    Clock,
    Filter,
} from 'lucide-react';
import { useNudgeHistory, useEngageNudge, NUDGE_TYPE_LABELS, type UserNudge, type NudgeType } from '@/hooks/useNudges';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────

const FALLBACK_META = { label: 'Notification', color: 'text-neutral-600 bg-neutral-50 border-neutral-200' };

function getMeta(type: NudgeType) {
    const m = NUDGE_TYPE_LABELS[type];
    return m ?? FALLBACK_META;
}

function timeAgo(dateStr?: string | null): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'opened', label: 'Read' },
] as const;

// ─── Notification Card ──────────────────────────────────────────

function NotificationCard({ userNudge }: { userNudge: UserNudge }) {
    const engageMutation = useEngageNudge();
    const nudge = userNudge.nudge;
    if (!nudge) return null;

    const meta = getMeta(nudge.type);
    const isRead = userNudge.opened || userNudge.clicked;

    const handleMarkRead = () => {
        if (!isRead) {
            engageMutation.mutate({ userNudgeId: userNudge.id, action: 'opened' });
        }
    };

    const statusIcon = userNudge.clicked
        ? <MousePointerClick className="w-3.5 h-3.5 text-blue-500" />
        : userNudge.opened
            ? <Eye className="w-3.5 h-3.5 text-green-500" />
            : userNudge.dismissed
                ? <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                : <Clock className="w-3.5 h-3.5 text-amber-500" />;

    const statusLabel = userNudge.clicked
        ? 'Clicked'
        : userNudge.opened
            ? 'Opened'
            : userNudge.dismissed
                ? 'Dismissed'
                : 'New';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'rounded-2xl border bg-white p-4 sm:p-5 transition-shadow hover:shadow-md cursor-pointer',
                isRead ? 'border-neutral-200' : 'border-[#B91C1C]/30 bg-red-50/30',
            )}
            onClick={handleMarkRead}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0', meta.color)}>
                    <Bell className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', meta.color)}>
                            {meta.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            {statusIcon}
                            {statusLabel}
                        </span>
                        <span className="text-[10px] text-neutral-400 ml-auto">
                            {timeAgo(userNudge.sentAt)}
                        </span>
                    </div>

                    <p className={cn('text-sm font-semibold line-clamp-1', isRead ? 'text-[#1a1a2e]' : 'text-[#1a1a2e]')}>
                        {nudge.title}
                    </p>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                        {nudge.message}
                    </p>

                    {!isRead && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRead();
                            }}
                            className="mt-2 flex items-center gap-1 text-xs font-medium text-[#B91C1C] hover:text-[#9B2020] transition-colors"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark as read
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Page ───────────────────────────────────────────────────────

export function NotificationsPage() {
    const [activeFilter, setActiveFilter] = useState<(typeof FILTER_TABS)[number]['key']>('all');
    const { data: nudges, isLoading } = useNudgeHistory(100);

    const allNudges = nudges ?? [];

    const filteredNudges = allNudges.filter((n) => {
        if (activeFilter === 'unread') return !n.opened && !n.clicked && !n.dismissed;
        if (activeFilter === 'opened') return n.opened || n.clicked;
        return true;
    });

    const unreadCount = allNudges.filter((n) => !n.opened && !n.clicked && !n.dismissed).length;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 pt-24 pb-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link
                        to={PATHS.HOME}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#1a1a2e]" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#1a1a2e] tracking-tight">
                            Notifi<span className="text-[#B91C1C]">cations</span>
                        </h1>
                        <p className="text-sm text-neutral-500">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 mb-6">
                    <Filter className="w-4 h-4 text-neutral-400" />
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveFilter(tab.key)}
                            className={cn(
                                'px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors',
                                activeFilter === tab.key
                                    ? 'bg-[#B91C1C] text-white'
                                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-[#1a1a2e]',
                            )}
                        >
                            {tab.label}
                            {tab.key === 'unread' && unreadCount > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{unreadCount}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 animate-pulse">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-20 rounded bg-neutral-100" />
                                        <div className="h-4 w-48 rounded bg-neutral-100" />
                                        <div className="h-3 w-64 rounded bg-neutral-100" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNudges.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="h-16 w-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-neutral-300" />
                        </div>
                        <p className="font-heading text-lg font-bold text-[#1a1a2e]">
                            {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                        <p className="text-sm text-neutral-400 mt-1 max-w-sm mx-auto">
                            {activeFilter === 'unread'
                                ? "You're all caught up!"
                                : 'Notifications about deals, streaks, and more will appear here'}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className="space-y-3">
                            {filteredNudges.map((n) => (
                                <NotificationCard key={n.id} userNudge={n} />
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

export default NotificationsPage;

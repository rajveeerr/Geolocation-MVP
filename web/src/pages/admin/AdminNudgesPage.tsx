import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Plus,
    Trash2,
    Edit3,
    Send,
    Eye,
    MousePointerClick,
    Zap,
    X,
    Check,
    Clock,
    Activity,
    ChevronDown,
} from 'lucide-react';
import { AdminProtectedRoute } from '@/routing/AdminProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
    useAdminNudges,
    useAdminNudge,
    useCreateNudge,
    useUpdateNudge,
    useDeleteNudge,
    useTestNudge,
    useNudgeAnalyticsOverview,
    useNudgeAnalytics,
    type CreateNudgePayload,
    type UpdateNudgePayload,
} from '@/hooks/useAdminNudges';
import {
    NUDGE_TYPE_LABELS,
    type NudgeType,
    type NudgeFrequency,
    type Nudge,
} from '@/hooks/useNudges';

// ─── Constants ──────────────────────────────────────────────────────

const NUDGE_TYPES: { value: NudgeType; label: string }[] = [
    { value: 'INACTIVITY', label: 'Inactivity' },
    { value: 'NEARBY_DEAL', label: 'Nearby Deal' },
    { value: 'STREAK_REMINDER', label: 'Streak Reminder' },
    { value: 'HAPPY_HOUR_ALERT', label: 'Happy Hour Alert' },
    { value: 'WEATHER_BASED', label: 'Weather Based' },
];

const FREQUENCIES: { value: NudgeFrequency; label: string }[] = [
    { value: 'ONCE', label: 'Once' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'UNLIMITED', label: 'Unlimited' },
];

// Helper for trigger condition fields by type
const TRIGGER_FIELDS: Record<NudgeType, { key: string; label: string; type: string; placeholder: string }[]> = {
    INACTIVITY: [{ key: 'daysInactive', label: 'Days Inactive', type: 'number', placeholder: '3' }],
    NEARBY_DEAL: [{ key: 'radiusMeters', label: 'Radius (meters)', type: 'number', placeholder: '500' }],
    STREAK_REMINDER: [{ key: 'minStreak', label: 'Minimum Streak', type: 'number', placeholder: '3' }],
    HAPPY_HOUR_ALERT: [{ key: 'minutesBefore', label: 'Minutes Before', type: 'number', placeholder: '30' }],
    WEATHER_BASED: [{ key: 'weatherCondition', label: 'Weather Condition', type: 'text', placeholder: 'RAINY' }],
};

// ─── Analytics Cards ────────────────────────────────────────────────

function AnalyticsOverviewCards() {
    const { data: analytics, isLoading } = useNudgeAnalyticsOverview();

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4">
                        <div className="mb-2 h-4 w-20 rounded bg-neutral-200" />
                        <div className="h-8 w-12 rounded bg-neutral-200" />
                    </div>
                ))}
            </div>
        );
    }

    if (!analytics) return null;

    const cards = [
        { label: 'Total Sent', value: analytics.total, icon: Send, color: 'text-blue-600 bg-blue-50' },
        { label: 'Delivery Rate', value: `${analytics.deliveryRate.toFixed(1)}%`, icon: Zap, color: 'text-green-600 bg-green-50' },
        { label: 'Open Rate', value: `${analytics.openRate.toFixed(1)}%`, icon: Eye, color: 'text-purple-600 bg-purple-50' },
        { label: 'Click Rate', value: `${analytics.clickRate.toFixed(1)}%`, icon: MousePointerClick, color: 'text-amber-600 bg-amber-50' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, color }) => (
                <div
                    key={label}
                    className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-neutral-500">{label}</p>
                        <div className={cn('rounded-lg p-1.5', color)}>
                            <Icon className="h-3.5 w-3.5" />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Per-Nudge Analytics Inline ─────────────────────────────────────

function NudgeAnalyticsInline({ nudgeId }: { nudgeId: number }) {
    const { data: analytics, isLoading } = useNudgeAnalytics(nudgeId);

    if (isLoading) {
        return <div className="mt-3 h-8 animate-pulse rounded bg-neutral-100" />;
    }

    if (!analytics || analytics.total === 0) {
        return (
            <p className="mt-3 text-xs text-neutral-400 italic">No analytics data yet</p>
        );
    }

    return (
        <div className="mt-3 flex gap-3 flex-wrap">
            {[
                { label: 'Sent', value: analytics.total },
                { label: 'Delivered', value: `${analytics.deliveryRate.toFixed(0)}%` },
                { label: 'Opened', value: `${analytics.openRate.toFixed(0)}%` },
                { label: 'Clicked', value: `${analytics.clickRate.toFixed(0)}%` },
            ].map(({ label, value }) => (
                <span key={label} className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                    <span className="font-semibold">{value}</span> {label}
                </span>
            ))}
        </div>
    );
}

// ─── Recent Deliveries ──────────────────────────────────────────────

function RecentDeliveries({ nudgeId }: { nudgeId: number }) {
    const { data: nudge } = useAdminNudge(nudgeId);

    if (!nudge?.userNudges || nudge.userNudges.length === 0) {
        return <p className="text-xs text-neutral-400 italic">No deliveries yet</p>;
    }

    return (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {nudge.userNudges.map((un) => (
                <div key={un.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs">
                    <span className="text-neutral-600">User #{un.userId}</span>
                    <div className="flex items-center gap-2">
                        {un.delivered && <span className="text-green-600">✓ Delivered</span>}
                        {un.opened && <span className="text-blue-600">👁 Opened</span>}
                        {un.clicked && <span className="text-purple-600">🖱 Clicked</span>}
                        {un.dismissed && <span className="text-neutral-400">✕ Dismissed</span>}
                        <span className="text-neutral-400">{new Date(un.sentAt).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Create/Edit Form ───────────────────────────────────────────────

interface NudgeFormProps {
    initial?: Nudge;
    onClose: () => void;
}

function NudgeForm({ initial, onClose }: NudgeFormProps) {
    const { toast } = useToast();
    const createNudge = useCreateNudge();
    const updateNudge = initial ? useUpdateNudge(initial.id) : null;

    const [form, setForm] = useState({
        type: (initial?.type ?? 'INACTIVITY') as NudgeType,
        title: initial?.title ?? '',
        message: initial?.message ?? '',
        frequency: (initial?.frequency ?? 'WEEKLY') as NudgeFrequency,
        cooldownHours: initial?.cooldownHours ?? 24,
        activeStartTime: initial?.activeStartTime ?? '',
        activeEndTime: initial?.activeEndTime ?? '',
        timeWindowStart: initial?.timeWindowStart ?? '',
        timeWindowEnd: initial?.timeWindowEnd ?? '',
        active: initial?.active ?? true,
        priority: initial?.priority ?? 0,
        triggerCondition: initial?.triggerCondition ?? ({} as Record<string, unknown>),
    });

    const triggerFields = TRIGGER_FIELDS[form.type] ?? [];

    const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const setTrigger = (key: string, value: string | number) =>
        setForm((f) => ({
            ...f,
            triggerCondition: { ...f.triggerCondition, [key]: value },
        }));

    const handleSubmit = async () => {
        if (!form.title || !form.message) {
            toast({ title: 'Missing fields', description: 'Title and message are required.', variant: 'destructive' });
            return;
        }

        const payload: CreateNudgePayload | UpdateNudgePayload = {
            type: form.type,
            title: form.title,
            message: form.message,
            triggerCondition: form.triggerCondition,
            frequency: form.frequency,
            cooldownHours: form.cooldownHours,
            activeStartTime: form.activeStartTime || null,
            activeEndTime: form.activeEndTime || null,
            timeWindowStart: form.timeWindowStart || null,
            timeWindowEnd: form.timeWindowEnd || null,
            active: form.active,
            priority: form.priority,
        };

        try {
            if (initial && updateNudge) {
                await updateNudge.mutateAsync(payload);
                toast({ title: 'Nudge updated' });
            } else {
                await createNudge.mutateAsync(payload as CreateNudgePayload);
                toast({ title: 'Nudge created' });
            }
            onClose();
        } catch (err: unknown) {
            toast({
                title: 'Error',
                description: err instanceof Error ? err.message : 'Failed to save nudge',
                variant: 'destructive',
            });
        }
    };

    const isPending = createNudge.isPending || (updateNudge?.isPending ?? false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border-2 border-brand-primary-200 bg-white p-6 shadow-lg"
        >
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900">
                    {initial ? 'Edit Nudge' : 'Create Nudge'}
                </h3>
                <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-5">
                {/* Type */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                        Nudge Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                        {NUDGE_TYPES.map(({ value, label }) => {
                            return (
                                <button
                                    key={value}
                                    onClick={() => {
                                        setField('type', value);
                                        setField('triggerCondition', {});
                                    }}
                                    className={cn(
                                        'rounded-lg border-2 p-2.5 text-xs font-medium transition-all',
                                        form.type === value
                                            ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                                            : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
                                    )}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Title + Message */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.title}
                            onChange={(e) => setField('title', e.target.value)}
                            placeholder="e.g., We miss you! 🎉"
                            maxLength={100}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                        />
                        <p className="mt-0.5 text-xs text-neutral-400">{form.title.length}/100</p>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">
                            Priority
                        </label>
                        <input
                            type="number"
                            value={form.priority}
                            onChange={(e) => setField('priority', Number(e.target.value))}
                            min={0}
                            max={100}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-semibold text-neutral-700">
                        Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={form.message}
                        onChange={(e) => setField('message', e.target.value)}
                        placeholder="The notification content users will see..."
                        rows={3}
                        maxLength={500}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                    />
                    <p className="mt-0.5 text-xs text-neutral-400">{form.message.length}/500</p>
                </div>

                {/* Trigger Condition */}
                {triggerFields.length > 0 && (
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                            Trigger Condition
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {triggerFields.map(({ key, label, type, placeholder }) => (
                                <div key={key}>
                                    <label className="mb-0.5 block text-xs text-neutral-500">{label}</label>
                                    <input
                                        type={type}
                                        value={(form.triggerCondition[key] as string | number) ?? ''}
                                        onChange={(e) =>
                                            setTrigger(key, type === 'number' ? Number(e.target.value) : e.target.value)
                                        }
                                        placeholder={placeholder}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Frequency + Cooldown */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">Frequency</label>
                        <select
                            value={form.frequency}
                            onChange={(e) => setField('frequency', e.target.value as NudgeFrequency)}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none"
                        >
                            {FREQUENCIES.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">Cooldown (hours)</label>
                        <input
                            type="number"
                            value={form.cooldownHours}
                            onChange={(e) => setField('cooldownHours', Number(e.target.value))}
                            min={0}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                        />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={(e) => setField('active', e.target.checked)}
                                className="h-4 w-4 rounded border-neutral-300 text-brand-primary-500"
                            />
                            <span className="text-sm font-medium text-neutral-700">Active</span>
                        </label>
                    </div>
                </div>

                {/* Active Date Range */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">
                            Active Start Date
                        </label>
                        <input
                            type="datetime-local"
                            value={form.activeStartTime}
                            onChange={(e) => setField('activeStartTime', e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                        />
                        <p className="mt-0.5 text-xs text-neutral-400">Leave empty for immediately active</p>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">
                            Active End Date
                        </label>
                        <input
                            type="datetime-local"
                            value={form.activeEndTime}
                            onChange={(e) => setField('activeEndTime', e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                        />
                        <p className="mt-0.5 text-xs text-neutral-400">Leave empty for no expiration</p>
                    </div>
                </div>

                {/* Time Windows */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">
                            <Clock className="mr-1 inline h-3.5 w-3.5" />
                            Time Window Start
                        </label>
                        <input
                            type="time"
                            value={form.timeWindowStart}
                            onChange={(e) => setField('timeWindowStart', e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-neutral-700">
                            <Clock className="mr-1 inline h-3.5 w-3.5" />
                            Time Window End
                        </label>
                        <input
                            type="time"
                            value={form.timeWindowEnd}
                            onChange={(e) => setField('timeWindowEnd', e.target.value)}
                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !form.title || !form.message}
                        className="flex items-center gap-1.5 rounded-lg bg-brand-primary-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-primary-600 disabled:opacity-50"
                    >
                        {isPending ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4" />
                                {initial ? 'Update' : 'Create'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Test Send Dialog ───────────────────────────────────────────────

function TestSendDialog({
    nudgeId,
    nudgeTitle,
    onClose,
}: {
    nudgeId: number;
    nudgeTitle: string;
    onClose: () => void;
}) {
    const [userId, setUserId] = useState('');
    const { toast } = useToast();
    const testNudge = useTestNudge();

    const handleSend = async () => {
        if (!userId) return;
        try {
            await testNudge.mutateAsync({ nudgeId, userId: Number(userId) });
            toast({ title: 'Test nudge sent!', description: `Sent "${nudgeTitle}" to User #${userId}` });
            onClose();
        } catch (err: unknown) {
            toast({
                title: 'Failed',
                description: err instanceof Error ? err.message : 'Could not send test nudge',
                variant: 'destructive',
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
            <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="mb-1 text-lg font-bold text-neutral-900">Test Send</h3>
                <p className="mb-4 text-sm text-neutral-500">Send "{nudgeTitle}" to a specific user</p>
                <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter User ID..."
                    className="mb-4 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100">
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!userId || testNudge.isPending}
                        className="flex items-center gap-1.5 rounded-lg bg-brand-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-600 disabled:opacity-50"
                    >
                        {testNudge.isPending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                        Send
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Nudge Row Card ─────────────────────────────────────────────────

function NudgeCard({
    nudge,
    onEdit,
    onTestSend,
}: {
    nudge: Nudge;
    onEdit: () => void;
    onTestSend: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const deleteNudge = useDeleteNudge();
    const { toast } = useToast();
    const meta = NUDGE_TYPE_LABELS[nudge.type];

    const handleDelete = async () => {
        if (!confirm(`Delete "${nudge.title}"?`)) return;
        try {
            await deleteNudge.mutateAsync(nudge.id);
            toast({ title: 'Nudge deleted' });
        } catch {
            toast({ title: 'Failed to delete', variant: 'destructive' });
        }
    };

    return (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between p-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', meta.color)}>
                            {meta.label}
                        </span>
                        <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            nudge.active ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500',
                        )}>
                            {nudge.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                            {FREQUENCIES.find((f) => f.value === nudge.frequency)?.label ?? nudge.frequency}
                        </span>
                        <span className="text-xs text-neutral-400">P{nudge.priority}</span>
                    </div>

                    <h4 className="mt-2 text-base font-bold text-neutral-900 truncate">{nudge.title}</h4>
                    <p className="mt-0.5 text-sm text-neutral-500 line-clamp-2">{nudge.message}</p>

                    {nudge.timeWindowStart && nudge.timeWindowEnd && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                            <Clock className="h-3 w-3" />
                            {nudge.timeWindowStart} – {nudge.timeWindowEnd}
                        </p>
                    )}

                    <NudgeAnalyticsInline nudgeId={nudge.id} />
                </div>

                <div className="ml-3 flex items-center gap-1">
                    <button
                        onClick={onTestSend}
                        title="Test send"
                        className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        title="Edit"
                        className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        title="Delete"
                        className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        title="Toggle deliveries"
                        className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100"
                    >
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-neutral-100 px-4 py-3 overflow-hidden"
                    >
                        <h5 className="mb-2 text-xs font-semibold text-neutral-600">Recent Deliveries</h5>
                        <RecentDeliveries nudgeId={nudge.id} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────

function AdminNudgesContent() {
    const { data: nudges, isLoading } = useAdminNudges();
    const [filterType, setFilterType] = useState<NudgeType | ''>('');
    const [showForm, setShowForm] = useState(false);
    const [editingNudge, setEditingNudge] = useState<Nudge | null>(null);
    const [testSendNudge, setTestSendNudge] = useState<Nudge | null>(null);

    const filteredNudges = nudges?.filter((n) => !filterType || n.type === filterType) ?? [];

    const handleEdit = (nudge: Nudge) => {
        setEditingNudge(nudge);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingNudge(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Bell className="h-6 w-6 text-brand-primary-500" />
                        Nudge Management
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Create and manage notification templates that engage users automatically.
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingNudge(null);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-brand-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-primary-600"
                    >
                        <Plus className="h-4 w-4" />
                        Create Nudge
                    </button>
                )}
            </div>

            {/* Analytics Overview */}
            <AnalyticsOverviewCards />

            {/* Create/Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <NudgeForm
                        initial={editingNudge ?? undefined}
                        onClose={handleCloseForm}
                    />
                )}
            </AnimatePresence>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <Activity className="h-4 w-4 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-600">Filter:</span>
                <button
                    onClick={() => setFilterType('')}
                    className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        !filterType
                            ? 'bg-brand-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                    )}
                >
                    All ({nudges?.length ?? 0})
                </button>
                {NUDGE_TYPES.map(({ value, label }) => {
                    const count = nudges?.filter((n) => n.type === value).length ?? 0;
                    return (
                        <button
                            key={value}
                            onClick={() => setFilterType(value)}
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                filterType === value
                                    ? 'bg-brand-primary-500 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                            )}
                        >
                            {label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Nudge List */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-6">
                            <div className="mb-2 h-4 w-24 rounded bg-neutral-200" />
                            <div className="mb-1 h-5 w-48 rounded bg-neutral-200" />
                            <div className="h-4 w-72 rounded bg-neutral-200" />
                        </div>
                    ))}
                </div>
            ) : filteredNudges.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-16">
                    <Bell className="mb-4 h-12 w-12 text-neutral-300" />
                    <h3 className="mb-1 text-lg font-semibold text-neutral-600">No nudges found</h3>
                    <p className="text-sm text-neutral-400">
                        {filterType ? 'Try a different filter.' : 'Create your first nudge template to get started.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNudges.map((nudge) => (
                        <NudgeCard
                            key={nudge.id}
                            nudge={nudge}
                            onEdit={() => handleEdit(nudge)}
                            onTestSend={() => setTestSendNudge(nudge)}
                        />
                    ))}
                </div>
            )}

            {/* Test Send Dialog */}
            <AnimatePresence>
                {testSendNudge && (
                    <TestSendDialog
                        nudgeId={testSendNudge.id}
                        nudgeTitle={testSendNudge.title}
                        onClose={() => setTestSendNudge(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Exported Page ──────────────────────────────────────────────────

export const AdminNudgesPage = () => (
    <AdminProtectedRoute>
        <AdminNudgesContent />
    </AdminProtectedRoute>
);

export default AdminNudgesPage;

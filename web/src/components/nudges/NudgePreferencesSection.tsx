import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Clock, Save, Loader2 } from 'lucide-react';
import { useNudgePreferences, useUpdateNudgePreferences, NUDGE_TYPE_LABELS, type NudgeType } from '@/hooks/useNudges';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * NudgePreferencesSection — a standalone card/section that can be
 * embedded in the Settings page or rendered at /settings/nudges.
 */

interface TypeToggle {
    key: string;
    type: NudgeType;
    label: string;
    description: string;
    fieldKey: keyof {
        inactivityEnabled: boolean;
        nearbyDealEnabled: boolean;
        streakReminderEnabled: boolean;
        happyHourAlertEnabled: boolean;
        weatherBasedEnabled: boolean;
    };
}

const TYPE_TOGGLES: TypeToggle[] = [
    {
        key: 'inactivity',
        type: 'INACTIVITY',
        label: 'Inactivity Reminders',
        description: "Get reminded when you haven't visited in a while",
        fieldKey: 'inactivityEnabled',
    },
    {
        key: 'nearbyDeal',
        type: 'NEARBY_DEAL',
        label: 'Nearby Deal Alerts',
        description: 'Notifications when great deals are close by',
        fieldKey: 'nearbyDealEnabled',
    },
    {
        key: 'streak',
        type: 'STREAK_REMINDER',
        label: 'Streak Reminders',
        description: 'Keep your check-in streak alive',
        fieldKey: 'streakReminderEnabled',
    },
    {
        key: 'happyHour',
        type: 'HAPPY_HOUR_ALERT',
        label: 'Happy Hour Alerts',
        description: 'Know when your saved venues have happy hours starting',
        fieldKey: 'happyHourAlertEnabled',
    },
    {
        key: 'weather',
        type: 'WEATHER_BASED',
        label: 'Weather-based Suggestions',
        description: 'Special recommendations based on the weather',
        fieldKey: 'weatherBasedEnabled',
    },
];

function Toggle({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (val: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                checked ? 'bg-brand-primary-500' : 'bg-neutral-300',
                disabled && 'opacity-50 cursor-not-allowed',
            )}
        >
            <span
                className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
                    checked ? 'translate-x-5' : 'translate-x-0',
                )}
            />
        </button>
    );
}

export function NudgePreferencesSection() {
    const { data: prefs, isLoading } = useNudgePreferences();
    const updatePrefs = useUpdateNudgePreferences();
    const { toast } = useToast();

    const [form, setForm] = useState({
        enabled: true,
        inactivityEnabled: true,
        nearbyDealEnabled: true,
        streakReminderEnabled: true,
        happyHourAlertEnabled: true,
        weatherBasedEnabled: true,
        quietHoursStart: '',
        quietHoursEnd: '',
    });

    const [isDirty, setIsDirty] = useState(false);

    // Sync from API
    useEffect(() => {
        if (prefs) {
            setForm({
                enabled: prefs.enabled,
                inactivityEnabled: prefs.inactivityEnabled,
                nearbyDealEnabled: prefs.nearbyDealEnabled,
                streakReminderEnabled: prefs.streakReminderEnabled,
                happyHourAlertEnabled: prefs.happyHourAlertEnabled,
                weatherBasedEnabled: prefs.weatherBasedEnabled,
                quietHoursStart: prefs.quietHoursStart ?? '',
                quietHoursEnd: prefs.quietHoursEnd ?? '',
            });
            setIsDirty(false);
        }
    }, [prefs]);

    const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        try {
            await updatePrefs.mutateAsync({
                enabled: form.enabled,
                inactivityEnabled: form.inactivityEnabled,
                nearbyDealEnabled: form.nearbyDealEnabled,
                streakReminderEnabled: form.streakReminderEnabled,
                happyHourAlertEnabled: form.happyHourAlertEnabled,
                weatherBasedEnabled: form.weatherBasedEnabled,
                quietHoursStart: form.quietHoursStart || null,
                quietHoursEnd: form.quietHoursEnd || null,
            });
            setIsDirty(false);
            toast({ title: 'Preferences saved ✓' });
        } catch {
            toast({ title: 'Failed to save', variant: 'destructive' });
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="mb-4 h-6 w-48 rounded bg-neutral-200" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-12 rounded-xl bg-neutral-100" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-50">
                        <Bell className="h-5 w-5 text-brand-primary-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-neutral-900">Nudge Notifications</h3>
                        <p className="text-xs text-neutral-500">Control when and how we reach you</p>
                    </div>
                </div>
                <Toggle checked={form.enabled} onChange={(val) => setField('enabled', val)} />
            </div>

            {/* Body */}
            <div className={cn('p-6 space-y-4', !form.enabled && 'opacity-50 pointer-events-none')}>
                {/* Per-type toggles */}
                {TYPE_TOGGLES.map(({ key, type, label, description, fieldKey }) => {
                    const meta = NUDGE_TYPE_LABELS[type];
                    return (
                        <div
                            key={key}
                            className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-lg">{meta.emoji}</span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-neutral-800 truncate">{label}</p>
                                    <p className="text-xs text-neutral-400 truncate">{description}</p>
                                </div>
                            </div>
                            <Toggle
                                checked={form[fieldKey]}
                                onChange={(val) => setField(fieldKey, val)}
                                disabled={!form.enabled}
                            />
                        </div>
                    );
                })}

                {/* Quiet Hours */}
                <div className="rounded-xl border border-neutral-100 px-4 py-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-neutral-500" />
                        <p className="text-sm font-semibold text-neutral-800">Quiet Hours</p>
                        <span className="text-xs text-neutral-400">(no notifications during this window)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">From</label>
                            <input
                                type="time"
                                value={form.quietHoursStart}
                                onChange={(e) => setField('quietHoursStart', e.target.value)}
                                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">Until</label>
                            <input
                                type="time"
                                value={form.quietHoursEnd}
                                onChange={(e) => setField('quietHoursEnd', e.target.value)}
                                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
                            />
                        </div>
                    </div>
                    {form.quietHoursStart && form.quietHoursEnd && (
                        <div className="mt-2 flex items-center gap-1">
                            <BellOff className="h-3 w-3 text-neutral-400" />
                            <p className="text-xs text-neutral-400">
                                Silent from {form.quietHoursStart} to {form.quietHoursEnd}
                            </p>
                        </div>
                    )}
                </div>

                {/* Save */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || updatePrefs.isPending}
                        className={cn(
                            'flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-medium transition-all',
                            isDirty
                                ? 'bg-brand-primary-500 text-white hover:bg-brand-primary-600 shadow-sm'
                                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed',
                        )}
                    >
                        {updatePrefs.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Preferences
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default NudgePreferencesSection;

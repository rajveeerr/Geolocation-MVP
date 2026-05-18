// src/components/merchant/create-deal/quick-form/TimeWindowEditor.tsx
import { useMemo } from 'react';
import { Sun, Sunrise, Sunset, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TwelveHourTimeField } from '@/components/common/TwelveHourTimeField';

export interface TimeWindowValue {
  /** 24-hour "HH:mm". */
  start: string;
  /** 24-hour "HH:mm". */
  end: string;
}

interface TimeWindowEditorProps {
  value: TimeWindowValue;
  onChange: (next: TimeWindowValue) => void;
  /** Override the wrapper label (default: "Time window"). */
  label?: string;
  /** Hide the morning/midday/evening presets row. */
  hidePresets?: boolean;
  className?: string;
}

const PRESETS: Array<{ key: string; label: string; icon: typeof Sun; start: string; end: string }> = [
  { key: 'morning', label: 'Morning', icon: Sunrise, start: '08:00', end: '11:00' },
  { key: 'midday', label: 'Mid day', icon: Sun, start: '12:00', end: '16:00' },
  { key: 'evening', label: 'Evening', icon: Sunset, start: '17:00', end: '21:00' },
];

const formatDuration = (start: string, end: string): string | null => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return null;
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const diff = endMin - startMin;
  if (diff <= 0) return null;
  if (diff < 60) return `${diff} min`;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins === 0 ? `${hrs} hr` : `${hrs} hr ${mins} min`;
};

/**
 * Edit a deal's daily time window. Optional quick-presets (Morning / Mid day /
 * Evening) autofill the start/end inputs — the inputs themselves are always
 * editable so merchants can fine-tune the window (e.g., 12:30 PM – 2:45 PM).
 */
export const TimeWindowEditor = ({
  value,
  onChange,
  label = 'Time window',
  hidePresets = false,
  className,
}: TimeWindowEditorProps) => {
  const duration = useMemo(() => formatDuration(value.start, value.end), [value.start, value.end]);
  const activePreset = PRESETS.find((p) => p.start === value.start && p.end === value.end);
  const isInvalid = duration === null && value.start && value.end;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          {label}
        </span>
        <span
          className={cn(
            'text-[11px] font-medium',
            duration ? 'text-emerald-600' : 'text-neutral-400',
          )}
        >
          {duration ? `· Runs for ${duration}` : '· Pick a start & end time'}
        </span>
      </div>

      {hidePresets ? null : (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const isActive = activePreset?.key === preset.key;
            const Icon = preset.icon;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => onChange({ start: preset.start, end: preset.end })}
                aria-pressed={isActive}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                  isActive
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-[0_4px_12px_rgba(15,23,42,0.16)]'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                )}
              >
                <Icon className="h-3 w-3" />
                {preset.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-[260px] sm:w-auto">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Start time
          </label>
          <TwelveHourTimeField
            value={value.start}
            onChange={(next) => onChange({ start: next, end: value.end })}
            className="space-y-0"
          />
        </div>
        <div className="hidden items-center pb-3 text-neutral-400 sm:flex">
          <Clock className="h-4 w-4" />
        </div>
        <div className="w-full max-w-[260px] sm:w-auto">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            End time
          </label>
          <TwelveHourTimeField
            value={value.end}
            onChange={(next) => onChange({ start: value.start, end: next })}
            className="space-y-0"
          />
        </div>
      </div>

      {isInvalid ? (
        <p className="mt-2 text-[12px] text-rose-600">End time must be after start time.</p>
      ) : null}
    </div>
  );
};

export default TimeWindowEditor;

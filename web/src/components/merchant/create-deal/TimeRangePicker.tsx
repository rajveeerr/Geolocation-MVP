import { DealCreationContext } from '@/context/DealCreationContext';
import { HappyHourContext } from '@/context/HappyHourContext';
import { useContext, useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TwelveHourTimeField } from '@/components/common/TwelveHourTimeField';

type TimeRangePreset = 'everyday' | 'mon-fri' | 'weekends' | 'days';

export const TimeRangePicker = () => {
  // Prefer the DealCreationContext; fall back to HappyHourContext if present
  const dealCtx = useContext(DealCreationContext as any);
  const hhCtx = useContext(HappyHourContext as any);
  const [preset, setPreset] = useState<TimeRangePreset | null>(null);

  const context = dealCtx ?? hhCtx;
  if (!context) {
    throw new Error('TimeRangePicker must be used within a DealCreationProvider or HappyHourProvider');
  }

  type TR = { id: number; start: string; end: string; day?: string }[];
  const { state, dispatch } = context as { state: { timeRanges: TR; selectedMenuItems?: any[] }; dispatch: any };

  const days = [
    { value: 'Mon', label: 'Monday', short: 'Mon' },
    { value: 'Tue', label: 'Tuesday', short: 'Tue' },
    { value: 'Wed', label: 'Wednesday', short: 'Wed' },
    { value: 'Thu', label: 'Thursday', short: 'Thu' },
    { value: 'Fri', label: 'Friday', short: 'Fri' },
    { value: 'Sat', label: 'Saturday', short: 'Sat' },
    { value: 'Sun', label: 'Sunday', short: 'Sun' },
  ];

  const applyPreset = (selectedPreset: TimeRangePreset, startTime: string = '17:00', endTime: string = '19:00') => {
    setPreset(selectedPreset);
    let newRanges: TR = [];

    switch (selectedPreset) {
      case 'everyday':
        // Single range for all days
        newRanges = [{ id: Date.now(), start: startTime, end: endTime, day: 'All' }];
        break;
      case 'mon-fri':
        // One range for Mon-Fri
        newRanges = [{ id: Date.now(), start: startTime, end: endTime, day: 'Mon-Fri' }];
        break;
      case 'weekends':
        // One range for weekends
        newRanges = [{ id: Date.now(), start: startTime, end: endTime, day: 'Weekends' }];
        break;
      case 'days':
        // Start with empty, user will add custom days
        newRanges = [];
        break;
    }

    dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: newRanges });
  };

  const addCustomDayRange = () => {
    const newRange = { id: Date.now(), start: '17:00', end: '19:00', day: 'Mon' };
    dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: [...state.timeRanges, newRange] });
  };

  const toggleRangeExpansion = (id: number) => {
    const newExpanded = new Set(expandedRanges);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRanges(newExpanded);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight time ranges (e.g., 22:00 to 02:00)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours
    }
    
    const duration = endMinutes - startMinutes;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const validateTimeRange = (start: string, end: string) => {
    if (!start || !end) return { isValid: false, message: 'Please set both start and end times' };
    
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight time ranges
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const duration = endMinutes - startMinutes;
    
    if (duration <= 0) {
      return { isValid: false, message: 'End time must be after start time' };
    }
    
    if (duration < 30) {
      return { isValid: false, message: 'Minimum duration is 30 minutes' };
    }
    
    if (duration > 8 * 60) {
      return { isValid: false, message: 'Maximum duration is 8 hours' };
    }
    
    return { isValid: true, message: '' };
  };

  const getDayLabel = (day: string | undefined) => {
    if (!day) return 'All Days';
    if (day === 'All') return 'Everyday';
    if (day === 'Mon-Fri') return 'Monday - Friday';
    if (day === 'Weekends') return 'Saturday - Sunday';
    const dayInfo = days.find(d => d.value === day);
    return dayInfo?.label || day;
  };

  // Detect current preset based on time ranges
  const detectPreset = (): TimeRangePreset | null => {
    if (state.timeRanges.length === 0) return null;
    if (state.timeRanges.length === 1) {
      const range = state.timeRanges[0];
      if (range.day === 'All') return 'everyday';
      if (range.day === 'Mon-Fri') return 'mon-fri';
      if (range.day === 'Weekends') return 'weekends';
    }
    // If multiple ranges or custom days, it's "days"
    if (state.timeRanges.length > 0) {
      const hasCustomDays = state.timeRanges.some(r => r.day && r.day !== 'All' && r.day !== 'Mon-Fri' && r.day !== 'Weekends');
      if (hasCustomDays) return 'days';
    }
    return null;
  };

  const currentPreset = preset || detectPreset();

  const PRESETS: { value: TimeRangePreset; label: string }[] = [
    { value: 'everyday', label: 'Everyday' },
    { value: 'mon-fri', label: 'Mon-Fri' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'days', label: 'Custom days' },
  ];

  const single = currentPreset !== 'days' ? state.timeRanges[0] : null;
  const singleValidation = single ? validateTimeRange(single.start, single.end) : null;

  return (
    <div className="space-y-3">
      {/* Preset pills + duration hint + start/end time, all inline. Wraps
          on narrow screens but stays compact on wide ones. */}
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(({ value, label }) => {
            const selected = currentPreset === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => applyPreset(value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition',
                  selected
                    ? 'border-foreground bg-foreground text-background shadow-[0_4px_12px_rgba(15,23,42,0.16)]'
                    : 'border-border bg-card text-foreground hover:border-border hover:bg-muted',
                )}
              >
                <Calendar className="h-3 w-3" />
                {label}
              </button>
            );
          })}
        </div>

        {currentPreset && currentPreset !== 'days' && single ? (
          <>
            <div className="flex items-end gap-2">
              <TwelveHourTimeField
                value={single.start || '17:00'}
                onChange={(value) => {
                  const updated = [...state.timeRanges];
                  if (updated[0]) updated[0] = { ...updated[0], start: value };
                  dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: updated });
                }}
                className="space-y-0"
              />
              <span className="pb-1.5 text-muted-foreground">→</span>
              <TwelveHourTimeField
                value={single.end || '19:00'}
                onChange={(value) => {
                  const updated = [...state.timeRanges];
                  if (updated[0]) updated[0] = { ...updated[0], end: value };
                  dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: updated });
                }}
                className="space-y-0"
              />
            </div>
            {singleValidation ? (
              <span
                className={cn(
                  'pb-2 text-[11px] font-semibold',
                  singleValidation.isValid ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {singleValidation.isValid
                  ? `· ${getDuration(single.start, single.end)}`
                  : `· ${singleValidation.message}`}
              </span>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Custom-days list */}
      {currentPreset === 'days' ? (
        <div className="space-y-2">
          {state.timeRanges.map((range) => {
            const validation = validateTimeRange(range.start, range.end);
            return (
              <motion.div
                key={range.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2',
                  validation.isValid ? 'border-border' : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/30',
                )}
              >
                <select
                  value={range.day ?? 'Mon'}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_TIME_RANGE',
                      payload: { id: range.id, field: 'day', value: e.target.value },
                    })
                  }
                  className="h-9 rounded-lg border border-border bg-card px-2 text-[13px] outline-none focus:border-brand-primary-400"
                >
                  {days.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.short}
                    </option>
                  ))}
                </select>
                <TwelveHourTimeField
                  value={range.start}
                  onChange={(value) =>
                    dispatch({
                      type: 'UPDATE_TIME_RANGE',
                      payload: { id: range.id, field: 'start', value },
                    })
                  }
                  className="space-y-0"
                />
                <span className="text-muted-foreground">→</span>
                <TwelveHourTimeField
                  value={range.end}
                  onChange={(value) =>
                    dispatch({
                      type: 'UPDATE_TIME_RANGE',
                      payload: { id: range.id, field: 'end', value },
                    })
                  }
                  className="space-y-0"
                />
                <span
                  className={cn(
                    'ml-1 text-[11px] font-medium',
                    validation.isValid ? 'text-emerald-600' : 'text-rose-600',
                  )}
                >
                  {validation.isValid
                    ? getDuration(range.start, range.end)
                    : validation.message}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newRanges = state.timeRanges.filter((r) => r.id !== range.id);
                    dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: newRanges });
                  }}
                  className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rose-50 dark:bg-rose-950/30 hover:text-rose-600"
                  aria-label="Remove time range"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
          <button
            type="button"
            onClick={addCustomDayRange}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-3 text-[12px] font-semibold text-muted-foreground transition hover:border-border hover:bg-muted"
          >
            <Plus className="h-3 w-3" />
            Add day & time
          </button>
        </div>
      ) : null}
    </div>
  );
};

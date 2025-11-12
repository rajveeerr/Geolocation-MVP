import { DealCreationContext } from '@/context/DealCreationContext';
import { HappyHourContext } from '@/context/HappyHourContext';
import { useContext, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Plus, X, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type TimeRangePreset = 'everyday' | 'mon-fri' | 'weekends' | 'days';

export const TimeRangePicker = () => {
  // Prefer the DealCreationContext; fall back to HappyHourContext if present
  const dealCtx = useContext(DealCreationContext as any);
  const hhCtx = useContext(HappyHourContext as any);
  const [expandedRanges, setExpandedRanges] = useState<Set<number>>(new Set());
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

  return (
    <div className="space-y-4">
      {/* Preset Selection */}
      <div>
        <Label className="text-sm font-medium text-neutral-700 mb-3 block">Select Schedule Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'everyday' as TimeRangePreset, label: 'Everyday', icon: Calendar },
            { value: 'mon-fri' as TimeRangePreset, label: 'Mon-Fri', icon: Calendar },
            { value: 'weekends' as TimeRangePreset, label: 'Weekends', icon: Calendar },
            { value: 'days' as TimeRangePreset, label: 'Days', icon: Calendar },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => applyPreset(value)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                currentPreset === value
                  ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-brand-primary-300'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range Configuration */}
      {currentPreset && (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Time Ranges</h3>
          <span className="text-sm text-neutral-500">({state.timeRanges.length} range{state.timeRanges.length !== 1 ? 's' : ''})</span>
        </div>
        {state.timeRanges.length === 0 && (
          <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            ⚠️ Add at least one time range
          </span>
        )}
      </div>
      
          {/* For preset options (everyday, mon-fri, weekends), show single time input */}
          {currentPreset !== 'days' && state.timeRanges.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Day</label>
                  <div className="rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                    {getDayLabel(state.timeRanges[0]?.day)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">Start Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={state.timeRanges[0]?.start || '17:00'}
                      onChange={(e) => {
                        const updatedRanges = [...state.timeRanges];
                        if (updatedRanges[0]) {
                          updatedRanges[0] = { ...updatedRanges[0], start: e.target.value };
                        }
                        dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: updatedRanges });
                      }}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-primary-500 focus:ring-1 focus:ring-brand-primary-500"
                    />
                    <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 mb-2 block">End Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={state.timeRanges[0]?.end || '19:00'}
                      onChange={(e) => {
                        const updatedRanges = [...state.timeRanges];
                        if (updatedRanges[0]) {
                          updatedRanges[0] = { ...updatedRanges[0], end: e.target.value };
                        }
                        dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: updatedRanges });
                      }}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-primary-500 focus:ring-1 focus:ring-brand-primary-500"
                    />
                    <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              {state.timeRanges[0] && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">
                      {formatTime(state.timeRanges[0].start)} - {formatTime(state.timeRanges[0].end)}
                    </span>
                    <span className="text-neutral-500">
                      Duration: {getDuration(state.timeRanges[0].start, state.timeRanges[0].end)}
                    </span>
                  </div>
                </div>
              )}
        </div>
      )}

          {/* For "Days" preset, show multiple day/time selectors */}
          {currentPreset === 'days' && (
    <div className="space-y-3">
              {state.timeRanges.map((range) => {
          const isExpanded = expandedRanges.has(range.id);
          const validation = validateTimeRange(range.start, range.end);
          const duration = getDuration(range.start, range.end);
          
          return (
            <motion.div
              key={range.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'rounded-xl border p-4 shadow-sm transition-all hover:shadow-md',
                validation.isValid 
                  ? 'border-neutral-200 bg-white' 
                  : 'border-red-200 bg-red-50'
                    )}
            >
              {/* Compact View */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-700">
                            {getDayLabel(range.day)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                          <Clock className={cn('h-4 w-4', validation.isValid ? 'text-neutral-500' : 'text-red-500')} />
                          <span className={cn('text-sm', validation.isValid ? 'text-neutral-600' : 'text-red-600')}>
                      {formatTime(range.start)} - {formatTime(range.end)}
                    </span>
                          <span className={cn('text-xs', validation.isValid ? 'text-neutral-500' : 'text-red-500')}>
                      ({duration})
                    </span>
                    {!validation.isValid && (
                      <span className="text-xs text-red-500 font-medium">
                        ⚠️ {validation.message}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRangeExpansion(range.id)}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                    <Button
                          onClick={() => {
                            const newRanges = state.timeRanges.filter(r => r.id !== range.id);
                            dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: newRanges });
                          }}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
              <X className="h-4 w-4" />
            </Button>
        </div>
              </div>

              {/* Expanded View */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-4 border-t border-neutral-100 pt-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* Day Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Day</label>
                        <select
                                value={range.day ?? 'Mon'}
                          onChange={(e) => dispatch({ type: 'UPDATE_TIME_RANGE', payload: { id: range.id, field: 'day', value: e.target.value }})}
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-primary-500 focus:ring-1 focus:ring-brand-primary-500"
                        >
                          {days.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Time */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Start Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={range.start}
                            onChange={(e) => dispatch({ type: 'UPDATE_TIME_RANGE', payload: { id: range.id, field: 'start', value: e.target.value }})}
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-primary-500 focus:ring-1 focus:ring-brand-primary-500"
                          />
                                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* End Time */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">End Time</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={range.end}
                            onChange={(e) => dispatch({ type: 'UPDATE_TIME_RANGE', payload: { id: range.id, field: 'end', value: e.target.value }})}
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand-primary-500 focus:ring-1 focus:ring-brand-primary-500"
                          />
                                <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

      <Button
                onClick={addCustomDayRange}
        variant="secondary"
        className="w-full rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-3 text-neutral-600 hover:border-brand-primary-300 hover:bg-brand-primary-25 hover:text-brand-primary-700"
      >
        <Plus className="mr-2 h-4 w-4" />
                Add Day & Time
      </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

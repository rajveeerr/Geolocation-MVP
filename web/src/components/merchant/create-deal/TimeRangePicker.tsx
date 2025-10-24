import { DealCreationContext } from '@/context/DealCreationContext';
import { HappyHourContext } from '@/context/HappyHourContext';
import { useContext, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Plus, X, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TimeRangePicker = () => {
  // Prefer the DealCreationContext; fall back to HappyHourContext if present
  const dealCtx = useContext(DealCreationContext as any);
  const hhCtx = useContext(HappyHourContext as any);
  const [expandedRanges, setExpandedRanges] = useState<Set<number>>(new Set());

  const context = dealCtx ?? hhCtx;
  if (!context) {
    throw new Error('TimeRangePicker must be used within a DealCreationProvider or HappyHourProvider');
  }

  type TR = { id: number; start: string; end: string; day?: string }[];
  const { state, dispatch } = context as { state: { timeRanges: TR; selectedMenuItems?: any[] }; dispatch: any };

  const days = [
    { value: 'All', label: 'All Days', short: 'All' },
    { value: 'Mon', label: 'Monday', short: 'Mon' },
    { value: 'Tue', label: 'Tuesday', short: 'Tue' },
    { value: 'Wed', label: 'Wednesday', short: 'Wed' },
    { value: 'Thu', label: 'Thursday', short: 'Thu' },
    { value: 'Fri', label: 'Friday', short: 'Fri' },
    { value: 'Sat', label: 'Saturday', short: 'Sat' },
    { value: 'Sun', label: 'Sunday', short: 'Sun' },
  ];

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

  return (
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
      
      {state.timeRanges.length > 0 && (
        <div className="text-sm text-neutral-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          💡 <strong>Tip:</strong> Click the chevron to expand and edit time ranges. You can set different times for different days of the week.
        </div>
      )}

    <div className="space-y-3">
        {state.timeRanges.map((range, index) => {
          const isExpanded = expandedRanges.has(range.id);
          const dayInfo = days.find(d => d.value === (range.day ?? 'All'));
          const validation = validateTimeRange(range.start, range.end);
          const duration = getDuration(range.start, range.end);
          
          return (
            <motion.div
              key={range.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                validation.isValid 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {/* Compact View */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-700">
                      {dayInfo?.label || 'All Days'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${validation.isValid ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ${validation.isValid ? 'text-neutral-600' : 'text-red-600'}`}>
                      {formatTime(range.start)} - {formatTime(range.end)}
                    </span>
                    <span className={`text-xs ${validation.isValid ? 'text-green-600' : 'text-red-500'}`}>
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
          {index > 0 && (
                    <Button
                      onClick={() => dispatch({ type: 'REMOVE_TIME_RANGE', payload: { id: range.id }})}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
              <X className="h-4 w-4" />
            </Button>
          )}
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
                          value={range.day ?? 'All'}
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
                          <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
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
                          <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <Button
        onClick={() => dispatch({ type: 'ADD_TIME_RANGE' })}
        variant="secondary"
        className="w-full rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-3 text-neutral-600 hover:border-brand-primary-300 hover:bg-brand-primary-25 hover:text-brand-primary-700"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Time Range
      </Button>
    </div>
  );
};

// Add this CSS to global.css or a relevant style file:
// .input-class { @apply h-11 w-full rounded-lg border border-neutral-300 bg-white px-3; }

// web/src/components/merchant/create-deal/DealBountyScheduleStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DealBountyScheduleStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  // Format datetime for input (YYYY-MM-DDTHH:mm)
  const formatDateTimeForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Ensure deal type is BOUNTY and set default times
  useEffect(() => {
    if (state.dealType !== 'BOUNTY') {
      dispatch({ type: 'UPDATE_FIELD', field: 'dealType', value: 'BOUNTY' });
    }
    // Set default start time if not set (today at 00:00)
    if (!state.startTime) {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: formatDateTimeForInput(startDate.toISOString()) });
      // Also set activeStartDate for compatibility
      dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: startDate.toISOString().split('T')[0] });
    }
    // Set default end time if not set (30 days from today at 23:59)
    if (!state.endTime) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      endDate.setHours(23, 59, 59, 999);
      dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: formatDateTimeForInput(endDate.toISOString()) });
      // Also set activeEndDate for compatibility
      dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: endDate.toISOString().split('T')[0] });
    }
  }, [state.dealType, state.startTime, state.endTime, dispatch]);

  // Validation
  const hasStartTime = !!state.startTime;
  const hasEndTime = !!state.endTime;
  
  let isDateRangeValid = false;
  let dateValidationMessage = '';
  
  if (hasStartTime && hasEndTime) {
    try {
      const startDate = new Date(state.startTime);
      const endDate = new Date(state.endTime);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        dateValidationMessage = 'Invalid date/time format';
      } else {
        const now = new Date();
        
        if (startDate < now) {
          dateValidationMessage = 'Start time cannot be in the past';
        } else if (endDate <= startDate) {
          dateValidationMessage = 'End time must be after start time';
        } else {
          const oneYearFromNow = new Date(now);
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
          
          if (endDate > oneYearFromNow) {
            dateValidationMessage = 'End time cannot be more than one year in the future';
          } else {
            isDateRangeValid = true;
            dateValidationMessage = 'Date and time range looks good!';
          }
        }
      }
    } catch (e) {
      dateValidationMessage = 'Invalid date/time';
    }
  } else if (!hasStartTime && !hasEndTime) {
    dateValidationMessage = 'Please set both start and end times';
  } else if (!hasStartTime) {
    dateValidationMessage = 'Please set a start time';
  } else if (!hasEndTime) {
    dateValidationMessage = 'Please set an end time';
  }

  const canProceed = hasStartTime && hasEndTime && isDateRangeValid;

  // Calculate duration
  const getDurationText = () => {
    if (!hasStartTime || !hasEndTime || !isDateRangeValid) return '';
    
    try {
      const start = new Date(state.startTime);
      const end = new Date(state.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      
      if (diffDays === 1) return '1 day';
      if (diffDays < 7) return `${diffDays} days`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
      return `${Math.ceil(diffDays / 30)} months`;
    } catch {
      return '';
    }
  };

  const durationText = getDurationText();
  
  // Update activeStartDate and activeEndDate when startTime/endTime change
  useEffect(() => {
    if (state.startTime) {
      const startDate = new Date(state.startTime);
      if (!isNaN(startDate.getTime())) {
        dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: startDate.toISOString().split('T')[0] });
      }
    }
    if (state.endTime) {
      const endDate = new Date(state.endTime);
      if (!isNaN(endDate.getTime())) {
        dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: endDate.toISOString().split('T')[0] });
      }
    }
  }, [state.startTime, state.endTime, dispatch]);

  // Quick date options with times
  const quickOptions = [
    {
      id: '7days',
      label: '7 Days',
      getStartTime: () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return formatDateTimeForInput(date.toISOString());
      },
      getEndTime: () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        date.setHours(23, 59, 59, 999);
        return formatDateTimeForInput(date.toISOString());
      },
    },
    {
      id: '30days',
      label: '30 Days',
      getStartTime: () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return formatDateTimeForInput(date.toISOString());
      },
      getEndTime: () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        date.setHours(23, 59, 59, 999);
        return formatDateTimeForInput(date.toISOString());
      },
    },
    {
      id: '90days',
      label: '90 Days',
      getStartTime: () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return formatDateTimeForInput(date.toISOString());
      },
      getEndTime: () => {
        const date = new Date();
        date.setDate(date.getDate() + 90);
        date.setHours(23, 59, 59, 999);
        return formatDateTimeForInput(date.toISOString());
      },
    },
  ];

  return (
    <OnboardingStepLayout
      title="Set deal schedule"
      subtitle="When will your bounty deal be active?"
      onNext={() => navigate('/merchant/deals/create/bounty/images')}
      onBack={() => navigate('/merchant/deals/create/bounty/menu')}
      isNextDisabled={!canProceed}
      progress={50}
    >
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Quick Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-primary-600" />
            <Label className="text-lg font-semibold text-neutral-900">
              Quick Options
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            Select a preset duration or set custom dates
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {quickOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => {
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'startTime',
                    value: option.getStartTime(),
                  });
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'endTime',
                    value: option.getEndTime(),
                  });
                }}
                className="rounded-lg border-2 border-neutral-200 bg-white p-4 hover:border-brand-primary-500 hover:bg-brand-primary-50 transition-all text-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-semibold text-neutral-900">{option.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Date & Time Range Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-primary-600" />
            <Label className="text-lg font-semibold text-neutral-900">
              Date & Time Range
            </Label>
            <span className="text-red-500">*</span>
          </div>
          <p className="text-sm text-neutral-600">
            Set when your bounty deal will start and end. Include specific times for precise control.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date & Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium text-neutral-700">
                Start Date & Time
              </Label>
              <div className="relative">
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formatDateTimeForInput(state.startTime)}
                  onChange={(e) => {
                    const value = e.target.value;
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'startTime',
                      value: value,
                    });
                    // Also update activeStartDate for compatibility
                    if (value) {
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'activeStartDate',
                          value: date.toISOString().split('T')[0],
                        });
                      }
                    }
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`h-12 text-base transition-all ${
                    hasStartTime && !isDateRangeValid && dateValidationMessage.includes('Start')
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : hasStartTime && isDateRangeValid
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : 'focus:ring-brand-primary-500/20'
                  }`}
                />
                {hasStartTime && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {isDateRangeValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {/* End Date & Time */}
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium text-neutral-700">
                End Date & Time
              </Label>
              <div className="relative">
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formatDateTimeForInput(state.endTime)}
                  onChange={(e) => {
                    const value = e.target.value;
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'endTime',
                      value: value,
                    });
                    // Also update activeEndDate for compatibility
                    if (value) {
                      const date = new Date(value);
                      if (!isNaN(date.getTime())) {
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'activeEndDate',
                          value: date.toISOString().split('T')[0],
                        });
                      }
                    }
                  }}
                  min={state.startTime || new Date().toISOString().slice(0, 16)}
                  className={`h-12 text-base transition-all ${
                    hasEndTime && !isDateRangeValid && dateValidationMessage.includes('End')
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : hasEndTime && isDateRangeValid
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : 'focus:ring-brand-primary-500/20'
                  }`}
                />
                {hasEndTime && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {isDateRangeValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time Validation Feedback */}
          <AnimatePresence>
            {(hasStartTime || hasEndTime) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 text-sm ${
                  isDateRangeValid
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDateRangeValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{dateValidationMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Time Preview */}
          {isDateRangeValid && state.startTime && state.endTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-neutral-600" />
                <span className="text-sm font-medium text-neutral-700">Schedule Preview</span>
              </div>
              <div className="space-y-1 text-sm text-neutral-600">
                <div>
                  <span className="font-medium">Starts:</span>{' '}
                  {new Date(state.startTime).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                <div>
                  <span className="font-medium">Ends:</span>{' '}
                  {new Date(state.endTime).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Duration Preview */}
          {isDateRangeValid && durationText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-brand-primary-200 bg-brand-primary-50 p-4"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-primary-600" />
                <div>
                  <div className="font-semibold text-brand-primary-900">Deal Duration</div>
                  <div className="text-sm text-brand-primary-700">
                    This bounty deal will be active for {durationText}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">Bounty Deal Duration</h4>
              <p className="text-sm text-amber-700 mt-1">
                Bounty deals work best with longer durations (30-90 days) to give customers time to bring friends. 
                You can always end the deal early if needed.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};


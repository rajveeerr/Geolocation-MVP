// web/src/components/merchant/create-deal/DealScheduleStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { Calendar, Clock, Zap, CalendarDays, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DealScheduleStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showQuickOptions, setShowQuickOptions] = useState(false);

  // The days of the week for the recurring selection
  const weekdays = [
    { key: 'MONDAY', label: 'Monday', short: 'Mon' },
    { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
    { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
    { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
    { key: 'FRIDAY', label: 'Friday', short: 'Fri' },
    { key: 'SATURDAY', label: 'Saturday', short: 'Sat' },
    { key: 'SUNDAY', label: 'Sunday', short: 'Sun' },
  ];

  // Quick date options for better UX
  const quickOptions = [
    {
      id: 'today',
      label: 'Start Today',
      description: 'Deal starts immediately',
      getStartDate: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
      getEndDate: () => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // 7 days from today
        endDate.setHours(23, 59, 59, 999);
        return endDate;
      },
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: 'tomorrow',
      label: 'Start Tomorrow',
      description: 'Deal starts tomorrow',
      getStartDate: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      },
      getEndDate: () => {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 8); // 8 days from today (7 days from tomorrow)
        endDate.setHours(23, 59, 59, 999);
        return endDate;
      },
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: 'weekend',
      label: 'This Weekend',
      description: 'Friday to Sunday',
      getStartDate: () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
        
        let daysUntilFriday;
        if (currentDay <= 5) {
          // If it's Sunday (0) through Friday (5), find this Friday
          daysUntilFriday = 5 - currentDay;
        } else {
          // If it's Saturday (6), find next Friday
          daysUntilFriday = 6; // 6 days from Saturday to next Friday
        }
        
        const friday = new Date(today);
        friday.setDate(today.getDate() + daysUntilFriday);
        friday.setHours(0, 0, 0, 0);
        return friday;
      },
      getEndDate: () => {
        const today = new Date();
        const currentDay = today.getDay();
        
        let daysUntilSunday;
        if (currentDay <= 6) {
          // If it's Sunday (0) through Saturday (6), find this Sunday
          daysUntilSunday = 7 - currentDay;
        } else {
          // This should never happen, but just in case
          daysUntilSunday = 7;
        }
        
        const sunday = new Date(today);
        sunday.setDate(today.getDate() + daysUntilSunday);
        sunday.setHours(23, 59, 59, 999);
        return sunday;
      },
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      id: 'next-week',
      label: 'Next Week',
      description: 'Full week starting Monday',
      getStartDate: () => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        let daysUntilMonday;
        if (currentDay === 0) {
          // If it's Sunday, next Monday is tomorrow (1 day)
          daysUntilMonday = 1;
        } else {
          // If it's Monday (1) through Saturday (6), find next Monday
          daysUntilMonday = 8 - currentDay; // 8 - currentDay gives us next Monday
        }
        
        const monday = new Date(today);
        monday.setDate(today.getDate() + daysUntilMonday);
        monday.setHours(0, 0, 0, 0);
        return monday;
      },
      getEndDate: () => {
        const today = new Date();
        const currentDay = today.getDay();
        
        let daysUntilSunday;
        if (currentDay === 0) {
          // If it's Sunday, next Sunday is 7 days away
          daysUntilSunday = 7;
        } else {
          // If it's Monday (1) through Saturday (6), find next Sunday
          daysUntilSunday = 8 - currentDay; // 8 - currentDay gives us next Sunday
        }
        
        const sunday = new Date(today);
        sunday.setDate(today.getDate() + daysUntilSunday);
        sunday.setHours(23, 59, 59, 999);
        return sunday;
      },
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleQuickOption = (option: typeof quickOptions[0]) => {
    const startDate = option.getStartDate();
    const endDate = option.getEndDate();
    
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'startTime',
      value: formatDateTime(startDate),
    });
    
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'endTime',
      value: formatDateTime(endDate),
    });
    
    setShowQuickOptions(false);
  };

  const getDurationText = () => {
    if (!state.startTime || !state.endTime) return '';
    
    const start = new Date(state.startTime);
    const end = new Date(state.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const isDateValid = () => {
    if (!state.startTime || !state.endTime) return false;
    const start = new Date(state.startTime);
    const end = new Date(state.endTime);
    return start < end && start > new Date();
  };

  return (
    <OnboardingStepLayout
      title="When will your deal be available?"
      onNext={() => navigate('/merchant/deals/create/instructions')}
      onBack={() => navigate('/merchant/deals/create/images')}
      isNextDisabled={!isDateValid()}
      progress={65}
    >
      <div className="space-y-8">
        {/* Quick Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Quick Setup</h3>
              <p className="text-sm text-neutral-500">Choose a preset or set custom dates</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickOptions(!showQuickOptions)}
              className="text-brand-primary-600 hover:text-brand-primary-700"
            >
              {showQuickOptions ? 'Hide' : 'Show'} Options
              <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${showQuickOptions ? 'rotate-90' : ''}`} />
            </Button>
          </div>

          <AnimatePresence>
            {showQuickOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {quickOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleQuickOption(option)}
                    className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 text-left transition-all hover:border-brand-primary-300 hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-100 text-brand-primary-600 group-hover:bg-brand-primary-200">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900">{option.label}</h4>
                        <p className="text-sm text-neutral-500">{option.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Date Selection */}
      <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Custom Schedule</h3>
          </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Start Date */}
                <div className="space-y-3">
                  <Label htmlFor="startTime" className="text-base font-semibold text-neutral-900">
                    Deal Start
          </Label>
                  <p className="text-sm text-neutral-500">
                    When customers can start claiming this deal
          </p>
                  <div className="space-y-2">
                    <div className="relative">
          <Input
            id="startTime"
            type="datetime-local"
            value={state.startTime}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'startTime',
                value: e.target.value,
              })
            }
                        className="h-12 text-base transition-all focus:ring-2 focus:ring-brand-primary-500/20"
                        min={formatDateTime(new Date())}
                      />
                      <Calendar className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    </div>
                    {/* Quick start time buttons */}
                    <div className="flex gap-2">
                      {[
                        { label: 'Now', hours: 0, minutes: 0 },
                        { label: '9 AM', hours: 9, minutes: 0 },
                        { label: '12 PM', hours: 12, minutes: 0 },
                        { label: '6 PM', hours: 18, minutes: 0 }
                      ].map((time) => (
                        <button
                          key={time.label}
                          onClick={() => {
                            const now = new Date();
                            const startDate = state.startTime ? new Date(state.startTime) : now;
                            startDate.setHours(time.hours, time.minutes, 0, 0);
                            dispatch({
                              type: 'UPDATE_FIELD',
                              field: 'startTime',
                              value: formatDateTime(startDate),
                            });
                          }}
                          className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 hover:bg-brand-primary-100 hover:text-brand-primary-700 transition-colors"
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  </div>
        </div>

                {/* End Date */}
                <div className="space-y-3">
                  <Label htmlFor="endTime" className="text-base font-semibold text-neutral-900">
                    Deal End
          </Label>
                  <p className="text-sm text-neutral-500">
                    When the deal will no longer be visible
          </p>
                  <div className="space-y-2">
                    <div className="relative">
          <Input
            id="endTime"
            type="datetime-local"
            value={state.endTime}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'endTime',
                value: e.target.value,
              })
            }
                        className="h-12 text-base transition-all focus:ring-2 focus:ring-brand-primary-500/20"
                        min={state.startTime || formatDateTime(new Date())}
                      />
                      <Calendar className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    </div>
                    {/* Quick duration buttons */}
                    <div className="flex gap-2">
                      {[
                        { label: '1 Day', days: 1 },
                        { label: '3 Days', days: 3 },
                        { label: '1 Week', days: 7 },
                        { label: '2 Weeks', days: 14 }
                      ].map((duration) => (
                        <button
                          key={duration.label}
                          onClick={() => {
                            if (state.startTime) {
                              const startDate = new Date(state.startTime);
                              const endDate = new Date(startDate);
                              endDate.setDate(startDate.getDate() + duration.days);
                              endDate.setHours(23, 59, 59, 999);
                              dispatch({
                                type: 'UPDATE_FIELD',
                                field: 'endTime',
                                value: formatDateTime(endDate),
                              });
                            }
                          }}
                          disabled={!state.startTime}
                          className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 hover:bg-brand-primary-100 hover:text-brand-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {duration.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

          {/* Duration Display */}
          {state.startTime && state.endTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-brand-primary-600" />
                <span className="text-sm font-medium text-neutral-700">
                  Deal Duration: <span className="text-brand-primary-600">{getDurationText()}</span>
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recurring Days for RECURRING deals */}
        {state.dealType === 'RECURRING' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-primary-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Recurring Days</h3>
            </div>
            <p className="text-sm text-neutral-500">
              Select the weekdays this deal should repeat on
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
              {weekdays.map((day) => (
                <motion.label
                  key={day.key}
                  className="group relative cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <input
                    type="checkbox"
                    checked={state.recurringDays.includes(day.key)}
                    onChange={(e) => {
                      const updatedDays = e.target.checked
                        ? [...state.recurringDays, day.key]
                        : state.recurringDays.filter((d) => d !== day.key);
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'recurringDays',
                        value: updatedDays as any,
                      });
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      state.recurringDays.includes(day.key)
                        ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-brand-primary-300 hover:bg-brand-primary-25'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">{day.short}</span>
                    <span className="text-xs">{day.label}</span>
                  </div>
                </motion.label>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </OnboardingStepLayout>
  );
};

// web/src/components/merchant/create-deal/DealDailyDealWeekdayStep.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { CalendarDays, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const weekdays = [
  { key: 'MONDAY', label: 'Monday', short: 'Mon' },
  { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { key: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { key: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { key: 'SUNDAY', label: 'Sunday', short: 'Sun' },
];

export const DealDailyDealWeekdayStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  // Auto-set deal type to RECURRING when component mounts
  useEffect(() => {
    if (state.dealType !== 'RECURRING') {
      dispatch({ type: 'UPDATE_FIELD', field: 'dealType', value: 'RECURRING' });
    }
  }, [state.dealType, dispatch]);

  const handleToggleDay = (dayKey: string) => {
    const updatedDays = state.recurringDays.includes(dayKey)
      ? state.recurringDays.filter((d) => d !== dayKey)
      : [...state.recurringDays, dayKey];
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'recurringDays',
      value: updatedDays,
    });
  };

  const canProceed = state.recurringDays.length > 0;

  return (
    <OnboardingStepLayout
      title="Select Days for Your Daily Deal"
      subtitle="Choose which days of the week this deal will appear"
      onNext={() => navigate('/merchant/deals/create/daily-deal/config')}
      onBack={() => navigate('/merchant/deals/create')}
      isNextDisabled={!canProceed}
      progress={20}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Hero Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-brand-primary-200 bg-gradient-to-br from-brand-primary-50 to-white p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white shadow-md">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Daily Deal Setup</h3>
              <p className="text-sm text-neutral-600">Select one or more days to create a recurring deal</p>
            </div>
          </div>
        </motion.div>

        {/* Weekday Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-brand-primary-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Select Weekdays</h3>
          </div>
          <p className="text-sm text-neutral-600">
            You can select multiple days. This will create one deal that appears on all selected days.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {weekdays.map((day, index) => {
              const isSelected = state.recurringDays.includes(day.key);
              return (
                <motion.button
                  key={day.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleToggleDay(day.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'group relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-3 transition-all duration-200 min-h-[90px]',
                    isSelected
                      ? 'border-brand-primary-500 bg-brand-primary-50 shadow-md ring-2 ring-brand-primary-200'
                      : 'border-neutral-200 bg-white hover:border-brand-primary-300 hover:bg-neutral-50'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-500 text-white shadow-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </motion.div>
                  )}
                  <span
                    className={cn(
                      'text-base font-bold uppercase tracking-wide',
                      isSelected ? 'text-brand-primary-700' : 'text-neutral-700'
                    )}
                  >
                    {day.short}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Selection Summary */}
          {state.recurringDays.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg border border-brand-primary-200 bg-brand-primary-50 p-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-brand-primary-600" />
                <span className="text-sm font-medium text-brand-primary-900">
                  {state.recurringDays.length} day{state.recurringDays.length !== 1 ? 's' : ''} selected:{' '}
                  {state.recurringDays
                    .map((dayKey) => weekdays.find((d) => d.key === dayKey)?.label)
                    .join(', ')}
                </span>
              </div>
            </motion.div>
          )}

          {/* Validation Message */}
          {state.recurringDays.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-sm text-amber-800">
                Please select at least one day to continue.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};


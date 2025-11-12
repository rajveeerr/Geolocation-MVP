// web/src/components/merchant/create-deal/DealDailyDealConfigStep.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Tag, 
  Calendar, 
  CalendarDays, 
  Flame, 
  Trophy, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Utensils,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MenuCollectionSelector } from './MenuCollectionSelector';
import { AmountSlider } from '@/components/ui/AmountSlider';

const weekdays = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' },
];

export const DealDailyDealConfigStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showStreakSection, setShowStreakSection] = useState(false);
  const [showBountySection, setShowBountySection] = useState(false);

  // Auto-generate title suggestion based on selected weekdays
  useEffect(() => {
    if (!state.title && state.recurringDays.length > 0) {
      const dayLabels = state.recurringDays
        .map((dayKey) => weekdays.find((d) => d.key === dayKey)?.label)
        .filter(Boolean);
      
      if (dayLabels.length === 1) {
        dispatch({ type: 'UPDATE_FIELD', field: 'title', value: `${dayLabels[0]} Special` });
      } else if (dayLabels.length > 1) {
        dispatch({ type: 'UPDATE_FIELD', field: 'title', value: `${dayLabels[0]} & ${dayLabels[1]} Deal` });
      }
    }
  }, [state.recurringDays, state.title, dispatch]);

  // Calculate number of occurrences based on frequency and date range
  const calculateOccurrences = () => {
    if (!state.activeStartDate || !state.activeEndDate || !state.recurringFrequency) return null;
    
    const start = new Date(state.activeStartDate);
    const end = new Date(state.activeEndDate);
    const selectedDays = state.recurringDays;
    
    if (!selectedDays.length) return null;
    
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      if (selectedDays.includes(dayName)) {
        count++;
      }
      
      // Move to next period based on frequency
      if (state.recurringFrequency === 'week') {
        current.setDate(current.getDate() + 7);
      } else if (state.recurringFrequency === 'month') {
        current.setMonth(current.getMonth() + 1);
      } else if (state.recurringFrequency === 'year') {
        current.setFullYear(current.getFullYear() + 1);
      }
    }
    
    return count;
  };

  const occurrences = calculateOccurrences();

  // Validation
  const isTitleValid = state.title.length >= 3 && state.title.length <= 100;
  const hasMenuItems = state.selectedMenuItems.length > 0 || state.menuCollectionId !== null;
  const isFrequencySet = state.recurringFrequency !== null;
  const hasDateRange = state.activeStartDate && state.activeEndDate;
  const isStreakValid = !state.streakEnabled || (
    state.streakMinVisits !== null && state.streakMinVisits >= 2 &&
    state.streakRewardType !== null &&
    state.streakRewardValue !== null && state.streakRewardValue > 0
  );
  const isBountyValid = !state.bountyRewardAmount || (
    state.bountyRewardAmount > 0 && 
    state.minReferralsRequired !== null && state.minReferralsRequired >= 1
  );

  const canProceed = isTitleValid && hasMenuItems && isFrequencySet && hasDateRange && isStreakValid && isBountyValid;

  return (
    <OnboardingStepLayout
      title="Configure Your Daily Deal"
      subtitle="Set up the details for your recurring deal"
      onNext={() => navigate('/merchant/deals/create/daily-deal/review')}
      onBack={() => navigate('/merchant/deals/create/daily-deal/weekdays')}
      isNextDisabled={!canProceed}
      progress={50}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Deal Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="title" className="text-lg font-semibold text-neutral-900">
              Deal Name <span className="text-red-500">*</span>
            </Label>
          </div>
          <Input
            id="title"
            value={state.title}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'title',
                value: e.target.value,
              })
            }
            placeholder="e.g., Monday Special, Weekend Deal"
            className={`h-12 text-base ${
              state.title && !isTitleValid
                ? 'border-red-300 focus:border-red-500'
                : state.title && isTitleValid
                ? 'border-green-300 focus:border-green-500'
                : ''
            }`}
          />
          {state.title && (
            <p className={cn('text-sm', isTitleValid ? 'text-green-600' : 'text-red-600')}>
              {isTitleValid ? '✓ Great name!' : 'Title must be 3-100 characters'}
            </p>
          )}
        </motion.div>

        {/* Menu Items - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-brand-primary-600" />
            <Label className="text-lg font-semibold text-neutral-900">
              Menu Items <span className="text-red-500">*</span>
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            Select items or use a collection for this deal
          </p>
          
          <div className="space-y-4">
            <MenuCollectionSelector
              onCollectionSelect={(collectionId, items) => {
                if (collectionId && items) {
                  dispatch({ 
                    type: 'SET_FIELD', 
                    field: 'selectedMenuItems', 
                    value: items 
                  });
                } else {
                  dispatch({ 
                    type: 'SET_FIELD', 
                    field: 'selectedMenuItems', 
                    value: [] 
                  });
                }
              }}
            />
            
            {!state.useMenuCollection && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  Switch to "Select Items" mode to manually choose menu items, or select a collection above.
                </p>
              </div>
            )}
          </div>

          {hasMenuItems && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  {state.menuCollectionId 
                    ? 'Collection selected' 
                    : `${state.selectedMenuItems.length} item${state.selectedMenuItems.length !== 1 ? 's' : ''} selected`}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Frequency & Dates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-primary-600" />
            <Label className="text-lg font-semibold text-neutral-900">
              Frequency & Date Range <span className="text-red-500">*</span>
            </Label>
          </div>

          {/* Frequency Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-neutral-700">How often should this deal repeat?</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['week', 'month', 'year'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'recurringFrequency', value: freq })}
                  className={cn(
                    'rounded-lg border-2 p-4 text-center transition-all',
                    state.recurringFrequency === freq
                      ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-900'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-primary-300'
                  )}
                >
                  <div className="font-semibold capitalize">Every {freq}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activeStartDate" className="text-sm font-medium text-neutral-700">
                Start Date
              </Label>
              <Input
                id="activeStartDate"
                type="date"
                value={state.activeStartDate || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'activeStartDate',
                    value: e.target.value,
                  })
                }
                min={new Date().toISOString().split('T')[0]}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activeEndDate" className="text-sm font-medium text-neutral-700">
                End Date
              </Label>
              <Input
                id="activeEndDate"
                type="date"
                value={state.activeEndDate || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'activeEndDate',
                    value: e.target.value,
                  })
                }
                min={state.activeStartDate || new Date().toISOString().split('T')[0]}
                className="h-12"
              />
            </div>
          </div>

          {/* Occurrences Preview */}
          {occurrences !== null && (
            <div className="rounded-lg border border-brand-primary-200 bg-brand-primary-50 p-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-brand-primary-600" />
                <span className="text-sm text-brand-primary-800">
                  This deal will appear approximately <strong>{occurrences} times</strong> on selected days
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Streak Settings - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
        >
          <button
            onClick={() => setShowStreakSection(!showStreakSection)}
            className="w-full flex items-center justify-between p-6 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Flame className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <Label className="text-lg font-semibold text-neutral-900">Streak Rewards</Label>
                  <Switch
                    checked={state.streakEnabled}
                    onCheckedChange={(checked) => {
                      dispatch({ type: 'UPDATE_FIELD', field: 'streakEnabled', value: checked });
                      if (checked) {
                        setShowStreakSection(true);
                        if (!state.streakMinVisits) {
                          dispatch({ type: 'UPDATE_FIELD', field: 'streakMinVisits', value: 3 });
                        }
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <p className="text-sm text-neutral-600">Reward customers for consecutive visits</p>
              </div>
            </div>
            {showStreakSection ? (
              <ChevronUp className="h-5 w-5 text-neutral-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-500" />
            )}
          </button>

          <AnimatePresence>
            {showStreakSection && state.streakEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-neutral-200 p-6 space-y-4"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700">
                      Minimum Consecutive Visits
                    </Label>
                    <Input
                      type="number"
                      min="2"
                      value={state.streakMinVisits ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? null : parseInt(value);
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'streakMinVisits',
                          value: numValue && numValue >= 2 ? numValue : null,
                        });
                      }}
                      placeholder="e.g., 3"
                      className="h-12"
                    />
                    <p className="text-xs text-neutral-500">
                      Customers must visit this many times in a row to earn the reward
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700">Reward Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['percentage', 'amount'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            dispatch({ type: 'UPDATE_FIELD', field: 'streakRewardType', value: type });
                            dispatch({ type: 'UPDATE_FIELD', field: 'streakRewardValue', value: null });
                          }}
                          className={cn(
                            'rounded-lg border-2 p-3 text-center transition-all',
                            state.streakRewardType === type
                              ? 'border-brand-primary-500 bg-brand-primary-50'
                              : 'border-neutral-200 bg-white hover:border-brand-primary-300'
                          )}
                        >
                          <div className="font-medium capitalize">{type === 'percentage' ? 'Discount %' : 'Fixed $'}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {state.streakRewardType && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-700">
                        Reward Value
                      </Label>
                      {state.streakRewardType === 'percentage' ? (
                        <AmountSlider
                          value={state.streakRewardValue}
                          onChange={(value) =>
                            dispatch({
                              type: 'UPDATE_FIELD',
                              field: 'streakRewardValue',
                              value: value,
                            })
                          }
                          min={1}
                          max={100}
                          step={1}
                          suffix="%"
                          showEditButton={true}
                        />
                      ) : (
                        <AmountSlider
                          value={state.streakRewardValue}
                          onChange={(value) =>
                            dispatch({
                              type: 'UPDATE_FIELD',
                              field: 'streakRewardValue',
                              value: value,
                            })
                          }
                          min={0.5}
                          max={100}
                          step={0.5}
                          prefix="$"
                          showEditButton={true}
                        />
                      )}
                    </div>
                  )}

                  {state.streakMinVisits && state.streakRewardType && state.streakRewardValue && (
                    <div className="rounded-lg border border-brand-primary-200 bg-brand-primary-50 p-3">
                      <p className="text-sm text-brand-primary-800">
                        Reward customers who visit <strong>{state.streakMinVisits} {state.recurringDays.length === 1 ? weekdays.find(d => d.key === state.recurringDays[0])?.label.toLowerCase() : 'times'} in a row</strong> with{' '}
                        {state.streakRewardType === 'percentage' 
                          ? `${state.streakRewardValue}% off`
                          : `$${state.streakRewardValue} off`}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bounty Section - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
        >
          <button
            onClick={() => setShowBountySection(!showBountySection)}
            className="w-full flex items-center justify-between p-6 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <Label className="text-lg font-semibold text-neutral-900">Bounty Rewards (Optional)</Label>
                <p className="text-sm text-neutral-600">Reward customers for bringing friends</p>
              </div>
            </div>
            {showBountySection ? (
              <ChevronUp className="h-5 w-5 text-neutral-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-500" />
            )}
          </button>

          <AnimatePresence>
            {showBountySection && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-neutral-200 p-6 space-y-4"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700">
                      Bounty Reward Amount (per friend)
                    </Label>
                    <AmountSlider
                      value={state.bountyRewardAmount}
                      onChange={(value) =>
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'bountyRewardAmount',
                          value: value,
                        })
                      }
                      min={1}
                      max={100}
                      step={0.5}
                      prefix="$"
                      showEditButton={true}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-700">
                      Minimum Friends Required
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={state.minReferralsRequired ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? null : parseInt(value);
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'minReferralsRequired',
                          value: numValue && numValue >= 1 ? numValue : null,
                        });
                      }}
                      placeholder="e.g., 2"
                      className="h-12"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};


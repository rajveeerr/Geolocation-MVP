// web/src/components/merchant/create-deal/DealDailyDealConfigStep.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation, type SelectedMenuItem } from '@/context/DealCreationContext';
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
  Search,
  Filter,
  Eye,
  EyeOff,
  DollarSign,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MenuCollectionSelector } from './MenuCollectionSelector';
import { AmountSlider } from '@/components/ui/AmountSlider';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

const weekdays = [
  { key: 'MONDAY', label: 'Monday', short: 'MON' },
  { key: 'TUESDAY', label: 'Tuesday', short: 'TUE' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'WED' },
  { key: 'THURSDAY', label: 'Thursday', short: 'THU' },
  { key: 'FRIDAY', label: 'Friday', short: 'FRI' },
  { key: 'SATURDAY', label: 'Saturday', short: 'SAT' },
  { key: 'SUNDAY', label: 'Sunday', short: 'SUN' },
];

export const DealDailyDealConfigStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showStreakSection, setShowStreakSection] = useState(false);
  const [showBountySection, setShowBountySection] = useState(false);
  const [useCollection, setUseCollection] = useState(state.useMenuCollection || state.menuCollectionId !== null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pendingCollectionItems, setPendingCollectionItems] = useState<any[] | null>(null);
  const { data: menuData, isLoading: isLoadingMenu } = useMerchantMenu();
  
  // Ensure dealType is RECURRING and recurringDays is an array
  useEffect(() => {
    if (state.dealType !== 'RECURRING') {
      dispatch({ type: 'UPDATE_FIELD', field: 'dealType', value: 'RECURRING' });
    }
    if (!Array.isArray(state.recurringDays)) {
      dispatch({ type: 'UPDATE_FIELD', field: 'recurringDays', value: [] });
    }
  }, [state.dealType, state.recurringDays, dispatch]);
  
  const menuItems = menuData?.menuItems || [];
  const selectedMenuItems = state.selectedMenuItems || [];
  
  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  const handleToggleMenuItem = (item: MenuItem) => {
    const isSelected = selectedMenuItems.some(selected => selected.id === item.id);
    
    if (isSelected) {
      // Remove from selection
      const updated = selectedMenuItems.filter(selected => selected.id !== item.id);
      dispatch({ type: 'SET_FIELD', field: 'selectedMenuItems', value: updated });
      // Clear collection if using individual items
      if (!useCollection) {
        dispatch({ type: 'SET_MENU_COLLECTION', collectionId: null });
      }
    } else {
      // Add to selection
      const newItem = {
        ...item,
        isHidden: false,
      } as SelectedMenuItem;
      dispatch({ 
        type: 'SET_FIELD', 
        field: 'selectedMenuItems', 
        value: [...selectedMenuItems, newItem] 
      });
      // Clear collection if using individual items
      if (!useCollection) {
        dispatch({ type: 'SET_MENU_COLLECTION', collectionId: null });
      }
    }
  };
  
  const handleToggleVisibility = (item: MenuItem) => {
    const updated = selectedMenuItems.map(selected => 
      selected.id === item.id 
        ? { ...selected, isHidden: !selected.isHidden }
        : selected
    );
    dispatch({ type: 'SET_FIELD', field: 'selectedMenuItems', value: updated });
  };
  
  const isMenuItemSelected = (item: MenuItem) => {
    return selectedMenuItems.some(selected => selected.id === item.id);
  };
  
  // Handle mode switch
  const handleModeSwitch = (useCollectionMode: boolean) => {
    setUseCollection(useCollectionMode);
    dispatch({ type: 'SET_FIELD', field: 'useMenuCollection', value: useCollectionMode });
    if (useCollectionMode) {
      // Clear individual selections when switching to collection mode
      // Keep selectedMenuItems as they might be from a collection
    } else {
      // Clear collection when switching to individual mode
      dispatch({ type: 'SET_MENU_COLLECTION', collectionId: null });
    }
  };

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
    
    if (!selectedDays || selectedDays.length === 0) return null;
    
    // Ensure dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    if (end < start) return null;
    
    let count = 0;
    const current = new Date(start);
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    
    if (state.recurringFrequency === 'week') {
      // For weekly, check every day in the range
      while (current <= end) {
        const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayName = dayNames[dayOfWeek];
        
        if (selectedDays.includes(dayName)) {
          count++;
        }
        
        // Move to next day
        current.setDate(current.getDate() + 1);
      }
    } else if (state.recurringFrequency === 'month') {
      // For monthly, check the same day of month each month
      const startDayOfWeek = start.getDay();
      const startDayName = dayNames[startDayOfWeek];
      
      // Only count if the start day is in selected days
      if (selectedDays.includes(startDayName)) {
        let checkDate = new Date(start);
        while (checkDate <= end) {
          // Check if this date falls on one of the selected weekdays
          const checkDayOfWeek = checkDate.getDay();
          const checkDayName = dayNames[checkDayOfWeek];
          
          if (selectedDays.includes(checkDayName)) {
            count++;
          }
          
          // Move to same day next month
          checkDate.setMonth(checkDate.getMonth() + 1);
        }
      }
    } else if (state.recurringFrequency === 'year') {
      // For yearly, check the same date each year
      const startDayOfWeek = start.getDay();
      const startDayName = dayNames[startDayOfWeek];
      
      // Only count if the start day is in selected days
      if (selectedDays.includes(startDayName)) {
        let checkDate = new Date(start);
        while (checkDate <= end) {
          // Check if this date falls on one of the selected weekdays
          const checkDayOfWeek = checkDate.getDay();
          const checkDayName = dayNames[checkDayOfWeek];
          
          if (selectedDays.includes(checkDayName)) {
            count++;
          }
          
          // Move to same date next year
          checkDate.setFullYear(checkDate.getFullYear() + 1);
        }
      }
    }
    
    return count;
  };

  const occurrences = calculateOccurrences();

  // Validation - Robust with null checks
  const hasRecurringDays = state.recurringDays && Array.isArray(state.recurringDays) && state.recurringDays.length > 0;
  const isTitleValid = state.title && state.title.trim().length >= 3 && state.title.trim().length <= 100;
  const hasMenuItems = (state.selectedMenuItems && Array.isArray(state.selectedMenuItems) && state.selectedMenuItems.length > 0) || (state.menuCollectionId !== null && state.menuCollectionId !== undefined);
  const isFrequencySet = state.recurringFrequency !== null && state.recurringFrequency !== undefined;
  const hasDateRange = !!(state.activeStartDate && state.activeEndDate);
  
  // Validate date range (end must be after start)
  let isDateRangeValid = false;
  if (hasDateRange) {
    try {
      const startDate = new Date(state.activeStartDate);
      const endDate = new Date(state.activeEndDate);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        isDateRangeValid = endDate > startDate;
      }
    } catch (e) {
      isDateRangeValid = false;
    }
  }
  
  const customOfferText = state.customOfferDisplay ? state.customOfferDisplay.trim() : '';
  const hasOffer = (state.discountPercentage !== null && state.discountPercentage !== undefined && state.discountPercentage > 0) || 
                   (state.discountAmount !== null && state.discountAmount !== undefined && state.discountAmount > 0) || 
                   customOfferText.length > 0;
  const isStreakValid = !state.streakEnabled || (
    state.streakMinVisits !== null && state.streakMinVisits !== undefined && state.streakMinVisits >= 2 &&
    state.streakRewardType !== null && state.streakRewardType !== undefined &&
    state.streakRewardValue !== null && state.streakRewardValue !== undefined && state.streakRewardValue > 0
  );
  const isBountyValid = !state.bountyRewardAmount || (
    state.bountyRewardAmount > 0 && 
    state.minReferralsRequired !== null && state.minReferralsRequired !== undefined && state.minReferralsRequired >= 1
  );

  const canProceed = hasRecurringDays && isTitleValid && hasMenuItems && isFrequencySet && hasDateRange && isDateRangeValid && hasOffer && isStreakValid && isBountyValid;
  
  // Debug validation (only in development)
  useEffect(() => {
    if (!canProceed && process.env.NODE_ENV === 'development') {
      console.log('Daily Deal Validation Debug:', {
        hasRecurringDays,
        isTitleValid,
        hasMenuItems,
        isFrequencySet,
        hasDateRange,
        isDateRangeValid,
        hasOffer,
        isStreakValid,
        isBountyValid,
        recurringDays: state.recurringDays,
        recurringDaysLength: state.recurringDays?.length || 0,
        title: state.title,
        titleLength: state.title?.length || 0,
        menuItemsCount: state.selectedMenuItems?.length || 0,
        menuCollectionId: state.menuCollectionId,
        frequency: state.recurringFrequency,
        startDate: state.activeStartDate,
        endDate: state.activeEndDate,
        discountPercentage: state.discountPercentage,
        discountAmount: state.discountAmount,
        customOffer: state.customOfferDisplay,
        streakEnabled: state.streakEnabled,
        bountyAmount: state.bountyRewardAmount,
      });
    }
  }, [canProceed, hasRecurringDays, isTitleValid, hasMenuItems, isFrequencySet, hasDateRange, isDateRangeValid, hasOffer, isStreakValid, isBountyValid, state]);
  
  // Get validation errors for hints
  const validationErrors: string[] = [];
  if (!hasRecurringDays) {
    validationErrors.push('Select at least one weekday (go back to weekday selection step)');
  }
  if (!isTitleValid) {
    if (!state.title || state.title.trim().length === 0) {
      validationErrors.push('Deal name is required');
    } else if (state.title.trim().length < 3) {
      validationErrors.push(`Deal name must be at least 3 characters (currently ${state.title.trim().length})`);
    } else if (state.title.trim().length > 100) {
      validationErrors.push(`Deal name must be 100 characters or less (currently ${state.title.trim().length})`);
    } else {
      validationErrors.push('Deal name must be 3-100 characters');
    }
  }
  if (!hasMenuItems) validationErrors.push('Select at least one menu item or collection');
  if (!isFrequencySet) validationErrors.push('Select a frequency (week/month/year)');
  if (!hasDateRange) {
    if (!state.activeStartDate && !state.activeEndDate) {
      validationErrors.push('Set both start and end dates');
    } else if (!state.activeStartDate) {
      validationErrors.push('Set a start date');
    } else if (!state.activeEndDate) {
      validationErrors.push('Set an end date');
    }
  } else if (!isDateRangeValid) {
    validationErrors.push('End date must be after start date');
  }
  if (!hasOffer) {
    if (!state.discountPercentage && !state.discountAmount && !customOfferText) {
      validationErrors.push('Set a discount percentage, amount, or custom offer');
    } else if (state.discountPercentage !== null && state.discountPercentage <= 0) {
      validationErrors.push('Discount percentage must be greater than 0');
    } else if (state.discountAmount !== null && state.discountAmount <= 0) {
      validationErrors.push('Discount amount must be greater than 0');
    }
  }
  if (!isStreakValid && state.streakEnabled) {
    if (!state.streakMinVisits || state.streakMinVisits < 2) {
      validationErrors.push('Streak: Set minimum consecutive visits (at least 2)');
    } else if (!state.streakRewardType) {
      validationErrors.push('Streak: Select a reward type (percentage or amount)');
    } else if (!state.streakRewardValue || state.streakRewardValue <= 0) {
      validationErrors.push('Streak: Set a reward value greater than 0');
    }
  }
  if (!isBountyValid && state.bountyRewardAmount && state.bountyRewardAmount > 0) {
    if (!state.minReferralsRequired || state.minReferralsRequired < 1) {
      validationErrors.push('Bounty: Set minimum friends required (at least 1)');
    }
  }
  
  // Sync useCollection state with actual state
  useEffect(() => {
    if (state.menuCollectionId !== null && !useCollection) {
      setUseCollection(true);
    }
  }, [state.menuCollectionId, useCollection]);
  
  // Sync items after collection is set (reducer clears them, so we restore them)
  useEffect(() => {
    if (state.menuCollectionId !== null && pendingCollectionItems && pendingCollectionItems.length > 0) {
      // Collection is set, now restore the items
      dispatch({ 
        type: 'SET_FIELD', 
        field: 'selectedMenuItems', 
        value: pendingCollectionItems 
      });
      setPendingCollectionItems(null);
    }
  }, [state.menuCollectionId, pendingCollectionItems, dispatch]);

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
        {/* Deal Name & Description */}
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

          {/* Description */}
          <div className="space-y-2 mt-4">
            <Label htmlFor="description" className="text-sm font-medium text-neutral-700">
              Description (Optional)
            </Label>
            <textarea
              id="description"
              value={state.description || ''}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FIELD',
                  field: 'description',
                  value: e.target.value,
                })
              }
              placeholder="Describe your daily deal offer..."
              rows={3}
              className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-200 focus:outline-none resize-none"
            />
            <p className="text-xs text-neutral-500">
              Add details about your deal to help customers understand the offer
            </p>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-brand-primary-600" />
              <Label className="text-lg font-semibold text-neutral-900">
                Menu Items <span className="text-red-500">*</span>
              </Label>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            Select items individually or use a collection for this deal
          </p>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-1">
            <button
              onClick={() => handleModeSwitch(false)}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-semibold transition-colors',
                !useCollection
                  ? 'bg-white text-brand-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Individual Items
            </button>
            <button
              onClick={() => handleModeSwitch(true)}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-semibold transition-colors',
                useCollection
                  ? 'bg-white text-brand-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Collection
            </button>
          </div>
          
          {/* Collection Selection Mode */}
          {useCollection && (
            <div className="space-y-4">
              <MenuCollectionSelector
                onCollectionSelect={(collectionId, items) => {
                  if (collectionId && items) {
                    // Store items temporarily, then set collection (reducer will clear items, but we'll restore them via useEffect)
                    setPendingCollectionItems(items);
                    dispatch({ type: 'SET_MENU_COLLECTION', collectionId });
                  } else {
                    setPendingCollectionItems(null);
                    dispatch({ type: 'SET_MENU_COLLECTION', collectionId: null });
                    dispatch({ 
                      type: 'SET_FIELD', 
                      field: 'selectedMenuItems', 
                      value: [] 
                    });
                  }
                }}
              />
              
              {!state.menuCollectionId && state.selectedMenuItems.length === 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    Select a collection above to add all its items to this deal.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Individual Item Selection Mode */}
          {!useCollection && (
            <div className="space-y-4">
              {/* Search and Category Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto">
                  <Filter className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        'whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors',
                        selectedCategory === category
                          ? 'bg-brand-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      )}
                    >
                      {category === 'all' ? 'All Items' : category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Selection Summary */}
              {selectedMenuItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-brand-primary-200 bg-brand-primary-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-brand-primary-800">
                        {selectedMenuItems.length} item{selectedMenuItems.length !== 1 ? 's' : ''} selected
                      </h4>
                      <p className="text-sm text-brand-primary-600">
                        {selectedMenuItems.filter(item => !item.isHidden).length} visible, {selectedMenuItems.filter(item => item.isHidden).length} hidden
                      </p>
                    </div>
                  </div>
                  
                  {/* Selected Items List */}
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {selectedMenuItems.map((selectedItem) => (
                      <div
                        key={selectedItem.id}
                        className="flex items-center justify-between rounded-lg border border-brand-primary-200 bg-white p-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {selectedItem.imageUrl ? (
                            <img
                              src={selectedItem.imageUrl}
                              alt={selectedItem.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                              <Utensils className="h-5 w-5 text-neutral-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-neutral-900 truncate">{selectedItem.name}</div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-neutral-700">
                                ${selectedItem.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const item = menuItems.find(m => m.id === selectedItem.id);
                            if (item) handleToggleVisibility(item);
                          }}
                          className={cn(
                            'p-1.5 rounded-md transition-colors',
                            selectedItem.isHidden
                              ? 'text-neutral-400 hover:text-neutral-600'
                              : 'text-green-600 hover:text-green-700'
                          )}
                          title={selectedItem.isHidden ? 'Show in deal' : 'Hide from deal'}
                        >
                          {selectedItem.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Menu Items Grid */}
              {isLoadingMenu ? (
                <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
                  <p className="text-sm text-neutral-600">Loading menu items...</p>
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="rounded-lg border border-neutral-200 bg-white py-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                  <h3 className="mb-2 text-lg font-semibold text-neutral-800">
                    No items found
                  </h3>
                  <p className="text-neutral-600">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredMenuItems.map((item) => {
                    const isSelected = isMenuItemSelected(item);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'relative rounded-lg border-2 p-4 transition-all cursor-pointer',
                          isSelected 
                            ? 'border-brand-primary-500 bg-brand-primary-50' 
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        )}
                        onClick={() => handleToggleMenuItem(item)}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-500 text-white">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                        
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {item.imageUrl || (item.images && item.images.length > 0) ? (
                              <img
                                src={item.imageUrl || item.images[0]?.url}
                                alt={item.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-brand-primary-100 flex items-center justify-center">
                                <Utensils className="h-6 w-6 text-brand-primary-600" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 truncate">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-neutral-600 line-clamp-2 mt-1">{item.description}</p>
                            )}
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                                {item.category}
                              </span>
                              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                <DollarSign className="h-3 w-3" />
                                {item.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              {menuItems.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-white py-12 text-center">
                  <Utensils className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                  <h3 className="mb-2 text-xl font-semibold text-neutral-800">
                    No menu items yet
                  </h3>
                  <p className="mb-6 text-neutral-600">
                    Add menu items first to create deals with them.
                  </p>
                  <Link to={PATHS.MERCHANT_MENU_CREATE}>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-600">
                      <Plus className="h-4 w-4" />
                      Add Menu Items
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-primary-600" />
              <Label className="text-lg font-semibold text-neutral-900">
                Frequency & Date Range <span className="text-red-500">*</span>
              </Label>
            </div>
            {hasRecurringDays && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600">Selected days:</span>
                <div className="flex gap-1">
                  {state.recurringDays.map((day) => {
                    const dayInfo = weekdays.find(d => d.key === day);
                    return (
                      <span
                        key={day}
                        className="rounded-full bg-brand-primary-100 px-2 py-1 text-xs font-semibold text-brand-primary-700"
                      >
                        {dayInfo?.short || day}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {!hasRecurringDays && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  No weekdays selected. Please go back to select at least one day.
                </span>
              </div>
            </div>
          )}

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
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="activeStartDate"
                type="date"
                value={state.activeStartDate || ''}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'activeStartDate',
                      value: dateValue,
                    });
                    // Also set startTime for compatibility
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                      date.setHours(0, 0, 0, 0);
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'startTime',
                        value: date.toISOString(),
                      });
                    }
                  } else {
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'activeStartDate',
                      value: '',
                    });
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className={cn(
                  "h-12",
                  state.activeStartDate && !isDateRangeValid && state.activeEndDate
                    ? "border-red-300 focus:border-red-500"
                    : state.activeStartDate
                    ? "border-green-300 focus:border-green-500"
                    : ""
                )}
                required
              />
              {state.activeStartDate && (
                <p className="text-xs text-neutral-500">
                  {new Date(state.activeStartDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="activeEndDate" className="text-sm font-medium text-neutral-700">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="activeEndDate"
                type="date"
                value={state.activeEndDate || ''}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'activeEndDate',
                      value: dateValue,
                    });
                    // Also set endTime for compatibility
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                      date.setHours(23, 59, 59, 999);
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'endTime',
                        value: date.toISOString(),
                      });
                    }
                  } else {
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'activeEndDate',
                      value: '',
                    });
                  }
                }}
                min={state.activeStartDate || new Date().toISOString().split('T')[0]}
                className={cn(
                  "h-12",
                  state.activeEndDate && !isDateRangeValid && state.activeStartDate
                    ? "border-red-300 focus:border-red-500"
                    : state.activeEndDate
                    ? "border-green-300 focus:border-green-500"
                    : ""
                )}
                required
              />
              {state.activeEndDate && (
                <p className="text-xs text-neutral-500">
                  {new Date(state.activeEndDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          
          {/* Date Range Validation Message */}
          {hasDateRange && !isDateRangeValid && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  End date must be after start date. Please adjust your dates.
                </span>
              </div>
            </div>
          )}

          {/* Occurrences Preview */}
          {occurrences !== null && (
            <div className={cn(
              "rounded-lg border p-3",
              occurrences === 0
                ? "border-red-200 bg-red-50"
                : "border-brand-primary-200 bg-brand-primary-50"
            )}>
              <div className="flex items-center gap-2">
                <CalendarDays className={cn(
                  "h-4 w-4",
                  occurrences === 0 ? "text-red-600" : "text-brand-primary-600"
                )} />
                <span className={cn(
                  "text-sm",
                  occurrences === 0 ? "text-red-800" : "text-brand-primary-800"
                )}>
                  This deal will appear <strong className={occurrences === 0 ? "text-red-700" : ""}>{occurrences} time{occurrences !== 1 ? 's' : ''}</strong> on selected days
                  {occurrences === 0 && state.recurringDays.length > 0 && (
                    <span className="block mt-1 text-xs text-red-700">
                      ⚠️ No occurrences found. Check that your date range includes the selected weekdays.
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
          
          {/* Show when dates/frequency are set but no weekdays selected */}
          {state.activeStartDate && state.activeEndDate && state.recurringFrequency && (!state.recurringDays || state.recurringDays.length === 0) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Select at least one weekday to see occurrence count
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Offer/Discount Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand-primary-600" />
            <Label className="text-lg font-semibold text-neutral-900">
              Deal Offer <span className="text-red-500">*</span>
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            Set the discount or offer for this daily deal
          </p>

          <div className="space-y-4">
            {/* Offer Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-neutral-700">Offer Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    dispatch({ type: 'UPDATE_FIELD', field: 'discountAmount', value: null });
                    dispatch({ type: 'UPDATE_FIELD', field: 'standardOfferKind', value: 'percentage' });
                    // Set default percentage if not already set
                    if (state.discountPercentage === null) {
                      dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: 10 });
                    }
                  }}
                  className={cn(
                    'rounded-lg border-2 p-4 text-center transition-all',
                    (state.discountPercentage !== null || state.standardOfferKind === 'percentage')
                      ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-900'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-primary-300'
                  )}
                >
                  <div className="font-semibold">Percentage Off</div>
                  <div className="text-xs text-neutral-500 mt-1">e.g., 20% off</div>
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: null });
                    dispatch({ type: 'UPDATE_FIELD', field: 'standardOfferKind', value: 'amount' });
                    // Set default amount if not already set
                    if (state.discountAmount === null) {
                      dispatch({ type: 'UPDATE_FIELD', field: 'discountAmount', value: 5 });
                    }
                  }}
                  className={cn(
                    'rounded-lg border-2 p-4 text-center transition-all',
                    (state.discountAmount !== null || state.standardOfferKind === 'amount')
                      ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-900'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-primary-300'
                  )}
                >
                  <div className="font-semibold">Fixed Amount Off</div>
                  <div className="text-xs text-neutral-500 mt-1">e.g., $5 off</div>
                </button>
              </div>
            </div>

            {/* Percentage Slider */}
            {(state.discountPercentage !== null || state.standardOfferKind === 'percentage') && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Discount Percentage</Label>
                <AmountSlider
                  value={state.discountPercentage}
                  onChange={(value) =>
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'discountPercentage',
                      value: value,
                    })
                  }
                  min={1}
                  max={100}
                  step={1}
                  suffix="%"
                  showEditButton={true}
                />
              </div>
            )}

            {/* Amount Slider */}
            {(state.discountAmount !== null || state.standardOfferKind === 'amount') && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-700">Discount Amount</Label>
                <AmountSlider
                  value={state.discountAmount}
                  onChange={(value) =>
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'discountAmount',
                      value: value,
                    })
                  }
                  min={0.5}
                  max={100}
                  step={0.5}
                  prefix="$"
                  showEditButton={true}
                />
              </div>
            )}

            {/* Custom Offer Display (Optional) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-700">
                Custom Offer Text (Optional)
              </Label>
              <Input
                value={state.customOfferDisplay || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'customOfferDisplay',
                    value: e.target.value,
                  })
                }
                placeholder="e.g., Buy 2 Get 1 Free"
                className="h-12"
              />
              <p className="text-xs text-neutral-500">
                Use this if you want to display a custom offer instead of percentage/amount
              </p>
            </div>

            {/* Validation */}
            {!state.discountPercentage && !state.discountAmount && !state.customOfferDisplay && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  Please set a discount percentage, amount, or custom offer
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Streak Settings - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
        >
          <div
            onClick={() => setShowStreakSection(!showStreakSection)}
            className="w-full flex items-center justify-between p-6 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Flame className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <Label className="text-lg font-semibold text-neutral-900">Streak Rewards</Label>
                  <div onClick={(e) => e.stopPropagation()}>
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
                    />
                  </div>
                </div>
                <p className="text-sm text-neutral-600">Reward customers for consecutive visits</p>
              </div>
            </div>
            {showStreakSection ? (
              <ChevronUp className="h-5 w-5 text-neutral-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-500" />
            )}
          </div>

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

        {/* Redemption Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="redemptionInstructions" className="text-lg font-semibold text-neutral-900">
              Redemption Instructions
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            Tell customers how to redeem this deal
          </p>
          <textarea
            id="redemptionInstructions"
            value={state.redemptionInstructions || ''}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'redemptionInstructions',
                value: e.target.value,
              })
            }
            placeholder="e.g., Show this deal to your server at checkout"
            rows={3}
            className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-sm focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-200 focus:outline-none resize-none"
          />
          <p className="text-xs text-neutral-500">
            Clear instructions help customers know exactly how to use your deal
          </p>
        </motion.div>

        {/* Bounty Section - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
        >
          <div
            onClick={() => setShowBountySection(!showBountySection)}
            className="w-full flex items-center justify-between p-6 hover:bg-neutral-50 transition-colors cursor-pointer"
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
          </div>

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
        {/* Validation Hints - Show when next button is disabled */}
        {!canProceed && validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-2">Complete these fields to continue:</h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </OnboardingStepLayout>
  );
};


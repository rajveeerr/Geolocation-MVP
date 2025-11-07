import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHappyHour } from '@/context/HappyHourContext'; // <-- Use the new hook
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useDealCreation } from '@/context/DealCreationContext';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { FormSection } from '@/components/merchant/create-deal/FormSection';
import { DayOfWeekSelector } from '@/components/merchant/create-deal/DayOfWeekSelector';
import { TimeRangePicker } from '@/components/merchant/create-deal/TimeRangePicker';
import { AnimatePresence, motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';
import clsx from 'clsx';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { cn } from '@/lib/utils';
import { mapDealTypeToBackend } from '@/utils/dealTypeUtils';
import { HappyHourItemDiscountEditor } from '@/components/merchant/create-deal/HappyHourItemDiscountEditor';
import { Pencil, Clock, MapPin, Store, Building2 } from 'lucide-react';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import { useMerchantCities } from '@/hooks/useMerchantCities';
import { DealImageUpload } from '@/components/merchant/create-deal/DealImageUpload';

const HappyHourEditorContent = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useHappyHour();
  const { state: dealCreationState } = useDealCreation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [showAdvancedScheduling, setShowAdvancedScheduling] = useState(false);
  const [showLocationTargeting, setShowLocationTargeting] = useState(false);
  
  // Check merchant status before allowing deal creation
  const { data: merchantData, isLoading: isLoadingMerchant } = useMerchantStatus();
  
  // Fetch stores and cities for location targeting
  const { data: stores = [] } = useMerchantStores();
  const { data: cities = [] } = useMerchantCities();

  // Preset information based on deal type
  useEffect(() => {
    if (dealCreationState.dealType) {
      switch (dealCreationState.dealType) {
        case 'REDEEM_NOW':
          dispatch({ type: 'SET_FIELD', field: 'title', value: 'Redeem Now Deal' });
          dispatch({ type: 'SET_FIELD', field: 'description', value: 'Immediate redemption - no waiting required!' });
          dispatch({ type: 'SET_FIELD', field: 'happyHourType', value: 'Midday' });
          dispatch({ type: 'SET_FIELD', field: 'discountPercentage', value: 25 });
          dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: [{ id: Date.now(), start: '12:00', end: '23:59', day: 'All' }] });
          break;
        case 'HIDDEN':
          dispatch({ type: 'SET_FIELD', field: 'title', value: 'Hidden Deal' });
          dispatch({ type: 'SET_FIELD', field: 'description', value: 'Exclusive access deal - only for special customers' });
          dispatch({ type: 'SET_FIELD', field: 'happyHourType', value: 'Late night' });
          dispatch({ type: 'SET_FIELD', field: 'discountPercentage', value: 30 });
          dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: [{ id: Date.now(), start: '22:00', end: '02:00', day: 'All' }] });
          break;
        case 'BOUNTY':
          dispatch({ type: 'SET_FIELD', field: 'title', value: 'Bounty Deal' });
          dispatch({ type: 'SET_FIELD', field: 'description', value: 'Complete tasks to earn rewards and discounts' });
          dispatch({ type: 'SET_FIELD', field: 'happyHourType', value: 'Mornings' });
          dispatch({ type: 'SET_FIELD', field: 'discountPercentage', value: 15 });
          dispatch({ type: 'SET_FIELD', field: 'timeRanges', value: [{ id: Date.now(), start: '06:00', end: '12:00', day: 'All' }] });
          break;
        default:
          // Default happy hour settings
          break;
      }
    }
  }, [dealCreationState.dealType, dispatch]);

  // Auto-update time ranges when happy hour type changes
  useEffect(() => {
    if (state.happyHourType && state.timeRanges.length > 0) {
      const getSuggestedTimes = (type: string) => {
        switch (type) {
          case 'Mornings':
            return { start: '06:00', end: '12:00' };
          case 'Midday':
            return { start: '12:00', end: '18:00' };
          case 'Late night':
            return { start: '22:00', end: '02:00' };
          default:
            return { start: '17:00', end: '19:00' };
        }
      };

      const suggestedTimes = getSuggestedTimes(state.happyHourType);
      
      // Only update if the current time range seems to be a default/placeholder
      const currentRange = state.timeRanges[0];
      if (currentRange && (
        currentRange.start === '17:00' || 
        currentRange.start === '12:00' || 
        currentRange.start === '22:00' ||
        currentRange.start === '06:00'
      )) {
        dispatch({ 
          type: 'UPDATE_TIME_RANGE', 
          payload: { 
            id: currentRange.id, 
            field: 'start', 
            value: suggestedTimes.start 
          }
        });
        dispatch({ 
          type: 'UPDATE_TIME_RANGE', 
          payload: { 
            id: currentRange.id, 
            field: 'end', 
            value: suggestedTimes.end 
          }
        });
      }
    }
  }, [state.happyHourType, dispatch]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Check merchant status first
      if (isLoadingMerchant) {
        toast({
          title: 'Loading...',
          description: 'Please wait while we verify your merchant status.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      if (!merchantData?.data?.merchant) {
        toast({
          title: 'Merchant Profile Required',
          description: 'You need to complete the merchant onboarding process before creating deals.',
          variant: 'destructive',
        });
        navigate(PATHS.MERCHANT_ONBOARDING);
        setIsSubmitting(false);
        return;
      }

      if (merchantData.data.merchant.status !== 'APPROVED') {
        toast({
          title: 'Merchant Not Approved',
          description: `Your merchant profile is ${merchantData.data.merchant.status.toLowerCase()}. Please wait for admin approval before creating deals.`,
          variant: 'destructive',
        });
        navigate(PATHS.MERCHANT_DASHBOARD);
        setIsSubmitting(false);
        return;
      }

      // Comprehensive validation
      if (!state.title || state.title.trim().length === 0) {
        toast({ 
          title: 'Error', 
          description: 'Happy hour title is required.', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      if (state.title.trim().length > 100) {
        toast({ 
          title: 'Error', 
          description: 'Title must be 100 characters or less.', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      if (!state.timeRanges || state.timeRanges.length === 0) {
        toast({ title: 'Error', description: 'Please add at least one time range.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      // Validate time ranges
      for (const timeRange of state.timeRanges) {
        if (!timeRange.start || !timeRange.end) {
          toast({ 
            title: 'Error', 
            description: 'All time ranges must have start and end times.', 
            variant: 'destructive' 
          });
          setIsSubmitting(false);
          return;
        }

        const startTime = new Date(`2000-01-01T${timeRange.start}:00`);
        const endTime = new Date(`2000-01-01T${timeRange.end}:00`);
        
        if (startTime >= endTime) {
          toast({ 
            title: 'Error', 
            description: 'End time must be after start time for all time ranges.', 
            variant: 'destructive' 
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Validate dates
      if (!state.activeStartDate || !state.activeEndDate) {
        toast({ 
          title: 'Error', 
          description: 'Please set start and end dates for your happy hour.', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      const startDate = new Date(state.activeStartDate);
      const endDate = new Date(state.activeEndDate);
      const now = new Date();

      if (startDate <= now) {
        toast({ 
          title: 'Error', 
          description: 'Start date must be in the future.', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      if (endDate <= startDate) {
        toast({ 
          title: 'Error', 
          description: 'End date must be after start date.', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      // Validate that at least one time range is set
      if (!state.timeRanges || state.timeRanges.length === 0) {
        toast({ 
          title: 'Error', 
          description: 'Please set at least one time range for your happy hour.', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      // Temporarily disable menu item validation to test basic deal creation
      // if (!state.selectedMenuItems || state.selectedMenuItems.length === 0) {
      //   toast({ 
      //     title: 'Error', 
      //     description: 'Please select at least one menu item for your happy hour.', 
      //     variant: 'destructive' 
      //   });
      //   setIsSubmitting(false);
      //   return;
      // }

      // Validate that at least one discount field is provided
      if (!state.discountPercentage && !state.discountAmount && !state.customOfferDisplay) {
        toast({ 
          title: 'Error', 
          description: 'Please provide at least one discount option (percentage, amount, or custom offer text).', 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      // Determine deal type for backend - use mapping utility
      const backendDealType = dealCreationState.dealType 
        ? mapDealTypeToBackend(dealCreationState.dealType)
        : 'Happy Hour';

      const payload: any = {
        title: state.title || `${state.happyHourType} Happy Hour`,
        description: state.description || `Special offers available during our ${state.happyHourType} happy hour.`,
        category: state.category || 'FOOD_AND_BEVERAGE',
        dealType: backendDealType,
        // Backend expects activeDateRange with startDate and endDate
        activeDateRange: {
          startDate: state.activeStartDate 
            ? `${state.activeStartDate}T00:00:00.000Z`
            : new Date().toISOString(),
          endDate: state.activeEndDate 
            ? `${state.activeEndDate}T23:59:59.999Z`
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // Convert recurring days to comma-separated string as backend expects
        recurringDays:
          state.periodType === 'Recurring' && state.recurringDays.length > 0 ? state.recurringDays.join(',') : undefined,

        // Ensure redemption instructions are always included (backend requires this)
        redemptionInstructions: state.redemptionInstructions || 'Show this screen to your server to redeem the happy hour offer.',

        kickbackEnabled: state.kickbackEnabled,
        // Include menu items with all discount fields
        menuItems: state.selectedMenuItems?.length > 0 
          ? state.selectedMenuItems.map((item) => ({
              id: item.id,
              isHidden: item.isHidden || false,
              customPrice: item.customPrice !== null && item.customPrice !== undefined ? item.customPrice : undefined,
              customDiscount: item.customDiscount !== null && item.customDiscount !== undefined ? item.customDiscount : undefined,
              discountAmount: item.discountAmount !== null && item.discountAmount !== undefined ? item.discountAmount : undefined,
            }))
          : undefined,
        // Add required discount fields
        discountPercentage: state.discountPercentage,
        discountAmount: state.discountAmount,
        customOfferDisplay: state.customOfferDisplay || null,
        // Add missing fields
        imageUrls: state.imageUrls || [],
        primaryImageIndex: state.primaryImageIndex || null,
        offerTerms: state.offerTerms || null,
        validDaysOfWeek: state.validDaysOfWeek || null,
        validHours: state.validHours || null,
        storeIds: state.storeIds || null,
        cityIds: state.cityIds || null,
      };

      console.log('Submitting Payload to /api/deals:', JSON.stringify(payload, null, 2));

      const response = await apiPost('/deals', payload);

      if (response.success) {
        toast({ title: 'Happy Hour Published!', description: 'Your new happy hour deal is now live.' });
        navigate(PATHS.MERCHANT_DASHBOARD);
      } else {
        console.error('API Error Response:', response);
        throw new Error(response.error || 'Failed to publish happy hour deal.');
      }

    } catch (err) {
      toast({ title: 'Submission Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 pt-8 py-36">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/merchant/deals/create')} variant="ghost" size="sm" className="rounded-full">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Happy Hour Deal</h1>
            <p className="text-sm text-neutral-500">Create a limited-time happy hour to drive visits.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* --- NEW: Add Title and Description fields --- */}
              <FormSection title="Deal Details">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Happy Hour Title</Label>
                    <Input id="title" value={state.title} onChange={e => dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })} placeholder={`${state.happyHourType} Happy Hour`} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea id="description" value={state.description} onChange={e => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })} placeholder="Let customers know what's special about this happy hour." />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Happy Hour Offer" subtitle="Set the discount or special offer for your happy hour">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount-percentage">Discount Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="discount-percentage" 
                          type="number" 
                          min="1" 
                          max="100" 
                          value={state.discountPercentage || ''} 
                          onChange={e => dispatch({ type: 'SET_FIELD', field: 'discountPercentage', value: e.target.value ? parseInt(e.target.value) : null })} 
                          placeholder="20" 
                        />
                        <span className="text-sm text-neutral-500">%</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">Percentage off regular prices</p>
                    </div>
                    <div>
                      <Label htmlFor="discount-amount">Fixed Discount Amount (optional)</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">$</span>
                        <Input 
                          id="discount-amount" 
                          type="number" 
                          min="0" 
                          step="0.01"
                          value={state.discountAmount || ''} 
                          onChange={e => dispatch({ type: 'SET_FIELD', field: 'discountAmount', value: e.target.value ? parseFloat(e.target.value) : null })} 
                          placeholder="5.00" 
                        />
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">Fixed dollar amount off</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="custom-offer">Custom Offer Text (optional)</Label>
                    <Input 
                      id="custom-offer" 
                      value={state.customOfferDisplay} 
                      onChange={e => dispatch({ type: 'SET_FIELD', field: 'customOfferDisplay', value: e.target.value })} 
                      placeholder="e.g., Buy 2 Get 1 Free, Half Price Appetizers" 
                    />
                    <p className="text-xs text-neutral-500 mt-1">Custom text to display instead of percentage/amount</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> You can use either a percentage discount, fixed amount, or custom offer text. 
                      If you provide multiple options, the custom offer text will take priority.
                    </p>
                  </div>
                </div>
              </FormSection>
              <FormSection title="Happy Hour Type" subtitle="Select which type of happy hour">
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { 
                        type: 'Mornings', 
                        icon: '🌅', 
                        description: 'Early morning deals (6 AM - 12 PM)',
                        suggestedTimes: '06:00 - 12:00'
                      },
                      { 
                        type: 'Midday', 
                        icon: '☀️', 
                        description: 'Lunch and afternoon deals (12 PM - 6 PM)',
                        suggestedTimes: '12:00 - 18:00'
                      },
                      { 
                        type: 'Late night', 
                        icon: '🌙', 
                        description: 'Evening and night deals (10 PM - 2 AM)',
                        suggestedTimes: '22:00 - 02:00'
                      }
                    ].map((option) => (
                      <button
                        key={option.type}
                        onClick={() => dispatch({ type: 'SET_FIELD', field: 'happyHourType', value: option.type })}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          state.happyHourType === option.type 
                            ? 'border-brand-primary-500 bg-brand-primary-50 shadow-md' 
                            : 'border-neutral-200 bg-white hover:border-brand-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{option.icon}</span>
                          <span className={`font-semibold ${
                            state.happyHourType === option.type ? 'text-brand-primary-700' : 'text-neutral-800'
                          }`}>
                            {option.type}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          state.happyHourType === option.type ? 'text-brand-primary-600' : 'text-neutral-500'
                        }`}>
                          {option.description}
                        </p>
                        <p className={`text-xs mt-1 ${
                          state.happyHourType === option.type ? 'text-brand-primary-500' : 'text-neutral-400'
                        }`}>
                          Suggested: {option.suggestedTimes}
                        </p>
                        {state.happyHourType === option.type && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-brand-primary-500 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4"><TimeRangePicker /></div>
              </FormSection>

              <FormSection title="Set Active Date" subtitle="Set date range for the deal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hh-start-date">Start Date</Label>
                    <Input id="hh-start-date" type="date" value={state.activeStartDate} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'activeStartDate', value: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="hh-end-date">End Date</Label>
                    <Input id="hh-end-date" type="date" value={state.activeEndDate} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'activeEndDate', value: e.target.value })} />
                  </div>
                </div>
              </FormSection>

              {/* Advanced Scheduling */}
              <FormSection 
                title="Advanced Scheduling (Optional)" 
                subtitle="Set specific days and hours when deal is valid"
              >
                <button
                  onClick={() => setShowAdvancedScheduling(!showAdvancedScheduling)}
                  className="w-full flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-brand-primary-600" />
                    <span className="font-medium text-neutral-900">Advanced Scheduling</span>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {showAdvancedScheduling ? 'Hide' : 'Show'}
                  </span>
                </button>

                <AnimatePresence>
                  {showAdvancedScheduling && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-4"
                    >
                      {/* Valid Days of Week */}
                      <div>
                        <Label className="text-sm font-medium text-neutral-700 mb-2 block">Valid Days of Week</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                          {[
                            { key: 'MONDAY', label: 'Mon' },
                            { key: 'TUESDAY', label: 'Tue' },
                            { key: 'WEDNESDAY', label: 'Wed' },
                            { key: 'THURSDAY', label: 'Thu' },
                            { key: 'FRIDAY', label: 'Fri' },
                            { key: 'SATURDAY', label: 'Sat' },
                            { key: 'SUNDAY', label: 'Sun' },
                          ].map((day) => {
                            const isSelected = state.validDaysOfWeek?.includes(day.key) ?? false;
                            return (
                              <button
                                key={day.key}
                                type="button"
                                onClick={() => {
                                  const currentDays = state.validDaysOfWeek || [];
                                  const newDays = isSelected
                                    ? currentDays.filter(d => d !== day.key)
                                    : [...currentDays, day.key];
                                  dispatch({
                                    type: 'SET_FIELD',
                                    field: 'validDaysOfWeek',
                                    value: newDays.length > 0 ? newDays : null,
                                  });
                                }}
                                className={cn(
                                  'rounded-lg border-2 p-2 text-sm transition-all',
                                  isSelected
                                    ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-brand-primary-300'
                                )}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">
                          Leave empty to use the date range above. If set, deal is only valid on selected days.
                        </p>
                      </div>

                      {/* Valid Hours */}
                      <div>
                        <Label htmlFor="valid-hours" className="text-sm font-medium text-neutral-700">
                          Valid Hours (e.g., "09:00-17:00")
                        </Label>
                        <Input
                          id="valid-hours"
                          type="text"
                          value={state.validHours || ''}
                          onChange={(e) => {
                            const value = e.target.value.trim();
                            dispatch({
                              type: 'SET_FIELD',
                              field: 'validHours',
                              value: value || null,
                            });
                          }}
                          placeholder="e.g., 09:00-17:00 or leave empty"
                          className="mt-1"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Format: HH:MM-HH:MM (24-hour format). Leave empty to use the full date range.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormSection>

              {/* Location Targeting */}
              <FormSection 
                title="Location Targeting (Optional)" 
                subtitle="Choose which stores and cities this deal applies to"
              >
                <button
                  onClick={() => setShowLocationTargeting(!showLocationTargeting)}
                  className="w-full flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand-primary-600" />
                    <span className="font-medium text-neutral-900">Location Targeting</span>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {showLocationTargeting ? 'Hide' : 'Show'}
                  </span>
                </button>

                <AnimatePresence>
                  {showLocationTargeting && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-4"
                    >
                      {/* Stores */}
                      <div>
                        <Label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          Select Stores
                        </Label>
                        {stores.length === 0 ? (
                          <p className="text-sm text-neutral-500">No stores found. Add stores in store management.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                            {stores.map((store) => {
                              const isSelected = state.storeIds?.includes(store.id) ?? false;
                              return (
                                <button
                                  key={store.id}
                                  type="button"
                                  onClick={() => {
                                    const currentStoreIds = state.storeIds || [];
                                    const newStoreIds = isSelected
                                      ? currentStoreIds.filter(id => id !== store.id)
                                      : [...currentStoreIds, store.id];
                                    dispatch({
                                      type: 'SET_FIELD',
                                      field: 'storeIds',
                                      value: newStoreIds.length > 0 ? newStoreIds : null,
                                    });
                                  }}
                                  className={cn(
                                    'rounded-lg border-2 p-3 text-left transition-all',
                                    isSelected
                                      ? 'border-brand-primary-500 bg-brand-primary-50'
                                      : 'border-neutral-200 bg-white hover:border-brand-primary-300'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-900">
                                      {store.address || `Store #${store.id}`}
                                    </span>
                                    {isSelected && (
                                      <span className="text-xs text-brand-primary-600 font-medium">Selected</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-xs text-neutral-500 mt-2">
                          Leave empty to apply to all stores. If set, deal is only available at selected stores.
                        </p>
                      </div>

                      {/* Cities */}
                      <div>
                        <Label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Select Cities
                        </Label>
                        {cities.length === 0 ? (
                          <p className="text-sm text-neutral-500">No cities found.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                            {cities.map((city) => {
                              const isSelected = state.cityIds?.includes(city.id) ?? false;
                              return (
                                <button
                                  key={city.id}
                                  type="button"
                                  onClick={() => {
                                    const currentCityIds = state.cityIds || [];
                                    const newCityIds = isSelected
                                      ? currentCityIds.filter(id => id !== city.id)
                                      : [...currentCityIds, city.id];
                                    dispatch({
                                      type: 'SET_FIELD',
                                      field: 'cityIds',
                                      value: newCityIds.length > 0 ? newCityIds : null,
                                    });
                                  }}
                                  className={cn(
                                    'rounded-lg border-2 p-3 text-left transition-all',
                                    isSelected
                                      ? 'border-brand-primary-500 bg-brand-primary-50'
                                      : 'border-neutral-200 bg-white hover:border-brand-primary-300'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-neutral-900">
                                      {city.name}, {city.state}
                                    </span>
                                    {isSelected && (
                                      <span className="text-xs text-brand-primary-600 font-medium">Selected</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-xs text-neutral-500 mt-2">
                          Leave empty to apply to all cities. If set, deal is only available in selected cities.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FormSection>

              <FormSection title="Deal Items" subtitle="Select menu items included in this happy hour">
             <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-2 mb-4">
                {['Single day', 'Recurring'].map((type) => (
                  <button key={type} onClick={() => dispatch({ type: 'SET_FIELD', field: 'periodType', value: type as any })} className={clsx("flex-1 rounded-md py-2 text-sm font-semibold", state.periodType === type ? "bg-black text-white shadow" : "text-neutral-600")}>
                    {type}
                  </button>
                ))}
             </div>
             {state.periodType === 'Recurring' && (
                <DayOfWeekSelector 
                  selectedDays={state.recurringDays}
                  onDayToggle={(day: string) => dispatch({ type: 'TOGGLE_RECURRING_DAY', payload: day })}
                />
             )}
            <div className="mt-4">
              <Button onClick={() => navigate('/merchant/deals/create/happy-hour/add-menu')} variant="secondary" className="w-full rounded-lg border-dashed border-2 py-3">
                  <Plus className="mr-2 h-4 w-4" /> Add items from menu ({state.selectedMenuItems.length})
              </Button>
            </div>
            
            {/* Display selected items with discount info */}
            {state.selectedMenuItems.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-neutral-900">Selected Items ({state.selectedMenuItems.length})</h4>
                {state.selectedMenuItems.map((item) => {
                  // Calculate final price
                  let finalPrice = item.price;
                  let discountInfo = '';
                  
                  if (item.customPrice !== null && item.customPrice !== undefined) {
                    finalPrice = item.customPrice;
                    discountInfo = `Fixed: $${finalPrice.toFixed(2)}`;
                  } else if (item.customDiscount !== null && item.customDiscount !== undefined) {
                    finalPrice = item.price * (1 - item.customDiscount / 100);
                    discountInfo = `${item.customDiscount}% off (item-specific)`;
                  } else if (item.discountAmount !== null && item.discountAmount !== undefined) {
                    finalPrice = Math.max(0, item.price - item.discountAmount);
                    discountInfo = `$${item.discountAmount.toFixed(2)} off (item-specific)`;
                  } else if (state.discountPercentage !== null) {
                    finalPrice = item.price * (1 - state.discountPercentage / 100);
                    discountInfo = `${state.discountPercentage}% off (global)`;
                  } else if (state.discountAmount !== null) {
                    finalPrice = Math.max(0, item.price - state.discountAmount);
                    discountInfo = `$${state.discountAmount.toFixed(2)} off (global)`;
                  }
                  
                  const hasDiscount = finalPrice < item.price;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 border border-neutral-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">{item.name}</span>
                          {item.isHidden && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                              Hidden
                            </span>
                          )}
                          {(item.customPrice !== null || item.customDiscount !== null || item.discountAmount !== null) && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                              Custom Price
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          {hasDiscount && (
                            <span className="text-neutral-400 line-through">${item.price.toFixed(2)}</span>
                          )}
                          <span className={cn(
                            "font-semibold",
                            hasDiscount ? "text-green-600" : "text-neutral-700"
                          )}>
                            ${finalPrice.toFixed(2)}
                          </span>
                          {discountInfo && (
                            <span className="text-xs text-neutral-500">({discountInfo})</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItemId(item.id)}
                        className="ml-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </FormSection>

              <FormSection title="Deal Images" subtitle="Add images to showcase your Happy Hour deal">
                <DealImageUpload
                  images={state.imageUrls || []}
                  onImagesChange={(images) => {
                    dispatch({ type: 'SET_FIELD', field: 'imageUrls', value: images });
                    // Set primary image index if not set and images exist
                    if (state.primaryImageIndex === null && images.length > 0) {
                      dispatch({ type: 'SET_FIELD', field: 'primaryImageIndex', value: 0 });
                    }
                  }}
                  maxImages={5}
                />
                {state.imageUrls && state.imageUrls.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-neutral-700 mb-2 block">
                      Primary Image (shown first)
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {state.imageUrls.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => dispatch({ type: 'SET_FIELD', field: 'primaryImageIndex', value: index })}
                          className={cn(
                            'relative rounded-lg border-2 overflow-hidden aspect-square',
                            state.primaryImageIndex === index
                              ? 'border-brand-primary-500 ring-2 ring-brand-primary-200'
                              : 'border-neutral-200 hover:border-brand-primary-300'
                          )}
                        >
                          <img src={url} alt={`Deal image ${index + 1}`} className="w-full h-full object-cover" />
                          {state.primaryImageIndex === index && (
                            <div className="absolute top-1 right-1 bg-brand-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      Click an image to set it as the primary image (shown first in listings).
                    </p>
                  </div>
                )}
              </FormSection>

              <FormSection title="Redemption Instructions" subtitle="Tell customers how to claim this deal">
                <Textarea
                  value={state.redemptionInstructions}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'redemptionInstructions', value: e.target.value })}
                  placeholder="Show this screen to your server to redeem the happy hour offer."
                  className="min-h-[100px]"
                  rows={4}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Clear instructions help customers know exactly how to redeem your deal.
                </p>
              </FormSection>

              <FormSection title="Terms & Conditions" subtitle="Any restrictions or special terms (optional)">
                <Textarea
                  value={state.offerTerms}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'offerTerms', value: e.target.value })}
                  placeholder="e.g., Valid for dine-in only, Cannot be combined with other offers, Excludes alcohol..."
                  className="min-h-[80px]"
                  rows={3}
                />
          </FormSection>

              <FormSection title="Kickback" subtitle="Reward users who bring friends">
                <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hh-kickback-switch" className="font-semibold text-neutral-800">Enable kickback</Label>
                      <p className="text-sm text-neutral-500 mt-1">Offer a percentage of sales back to customers who referred the paying guests.</p>
                    </div>
                    <Switch id="hh-kickback-switch" checked={state.kickbackEnabled} onCheckedChange={(checked: boolean) => dispatch({ type: 'SET_FIELD', field: 'kickbackEnabled', value: checked })} />
                  </div>

                  <AnimatePresence>
                    {state.kickbackEnabled && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-neutral-200 pt-4 mt-4">
                          <Label htmlFor="kickback-percent" className="block font-medium text-neutral-700">Kickback Percentage</Label>
                          <div className="mt-2 flex items-center gap-2 max-w-xs">
                            <Input
                              id="kickback-percent"
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              aria-label="Kickback percentage"
                              placeholder="5"
                              value={state.kickbackPercent ?? ''}
                              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'kickbackPercent', value: e.target.value === '' ? null : Math.max(0, Math.min(100, parseInt(e.target.value))) })}
                              className="flex-1"
                            />
                            <span className="text-sm text-neutral-500">%</span>
                          </div>
                          <p className="mt-2 text-xs text-neutral-500">We recommend keeping kickbacks small (e.g., 3–10%) to maintain margin.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FormSection>
            </div>
          </div>

          {/* Item Discount Editor Modal */}
          <AnimatePresence>
            {editingItemId !== null && (() => {
              const item = state.selectedMenuItems.find(i => i.id === editingItemId);
              if (!item) return null;
              return (
                <HappyHourItemDiscountEditor
                  item={item}
                  globalDiscountPercentage={state.discountPercentage}
                  globalDiscountAmount={state.discountAmount}
                  onClose={() => setEditingItemId(null)}
                />
              );
            })()}
          </AnimatePresence>

          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-lg bg-white p-4 border border-neutral-100">
                <h3 className="font-semibold">Summary</h3>
                <p className="text-sm text-neutral-500 mt-2">Happy Hour: <span className="font-medium">{state.happyHourType}</span></p>
                <p className="text-sm text-neutral-500">Time ranges: <span className="font-medium">{state.timeRanges.length}</span></p>
                <p className="text-sm text-neutral-500">Items: <span className="font-medium">{state.selectedMenuItems.length}</span></p>
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-sm font-medium text-neutral-700">Offer Details:</p>
                  {state.customOfferDisplay ? (
                    <p className="text-sm text-neutral-600 mt-1">"{state.customOfferDisplay}"</p>
                  ) : state.discountPercentage ? (
                    <p className="text-sm text-neutral-600 mt-1">{state.discountPercentage}% off</p>
                  ) : state.discountAmount ? (
                    <p className="text-sm text-neutral-600 mt-1">${state.discountAmount} off</p>
                  ) : (
                    <p className="text-sm text-red-500 mt-1">No offer set</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="fixed left-0 right-0 bottom-6 px-4">
          <div className="max-w-7xl mx-auto">
            <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full rounded-lg">
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Happy Hour Deal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HappyHourEditorPage = () => {
  return (
    <MerchantProtectedRoute fallbackMessage="Only merchants can create Happy Hour deals. Please sign up as a merchant to access this feature.">
      <HappyHourEditorContent />
    </MerchantProtectedRoute>
  );
};

export default HappyHourEditorPage;

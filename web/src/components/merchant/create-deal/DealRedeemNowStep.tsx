// web/src/components/merchant/create-deal/DealRedeemNowStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, DollarSign, Percent, Clock, CheckCircle, AlertCircle, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { validateDealTypeData } from '@/utils/dealTypeUtils';

export const DealRedeemNowStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(true);

  const validation = validateDealTypeData(state.dealType, state);

  // Validation for Redeem Now specific fields
  const isMinOrderAmountValid = state.minOrderAmount !== null && state.minOrderAmount > 0;
  
  // Redeem Now deals are fixed at 50% off
  const FIXED_DISCOUNT = 50;
  
  // Auto-set discount to 50% on mount and whenever it changes
  useEffect(() => {
    if (state.discountPercentage !== FIXED_DISCOUNT) {
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'discountPercentage',
        value: FIXED_DISCOUNT,
      });
    }
  }, [state.discountPercentage, dispatch]);

  const canProceed = isMinOrderAmountValid;

  // Calculate deal preview
  const getDealPreview = () => {
    if (!isMinOrderAmountValid) return null;
    
    const minSpend = state.minOrderAmount!;
    const discount = FIXED_DISCOUNT;
    const exampleOrder = minSpend;
    const savings = (exampleOrder * discount) / 100;
    const finalPrice = exampleOrder - savings;
    
    return {
      minSpend,
      discount,
      exampleOrder,
      savings,
      finalPrice,
    };
  };

  const dealPreview = getDealPreview();

  return (
    <OnboardingStepLayout
      title="Create your Redeem Now deal"
      subtitle="Set up a spend-based discount that customers can redeem instantly"
      onNext={() => {
        // Set default values for Redeem Now deals
        if (!state.title) {
          dispatch({ type: 'UPDATE_FIELD', field: 'title', value: 'Redeem Now Deal' });
        }
        if (!state.description) {
          dispatch({ type: 'UPDATE_FIELD', field: 'description', value: 'Spend and save instantly!' });
        }
        if (!state.category) {
          dispatch({ type: 'UPDATE_FIELD', field: 'category', value: 'FOOD_AND_BEVERAGE' });
        }
        if (!state.redemptionInstructions) {
          dispatch({ type: 'UPDATE_FIELD', field: 'redemptionInstructions', value: 'Show this deal to redeem your discount.' });
        }
        // Set default 24-hour duration (start now, end in 24 hours)
        const now = new Date();
        const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (!state.startTime) {
          dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: now.toISOString() });
        }
        if (!state.endTime) {
          dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: endTime.toISOString() });
        }
        // Skip to menu selection
        navigate('/merchant/deals/create/menu');
      }}
      onBack={() => navigate('/merchant/deals/create/type')}
      isNextDisabled={!canProceed}
      progress={20}
    >
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Hero Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-brand-primary-200 bg-gradient-to-br from-brand-primary-50 to-white p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white shadow-md">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Spend & Save</h3>
              <p className="text-sm text-neutral-600">Customers spend a minimum amount to unlock your discount</p>
            </div>
          </div>
        </motion.div>

        {/* Minimum Order Amount - Required */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="minOrderAmount" className="text-lg font-semibold text-neutral-900">
              Minimum Spend Amount <span className="text-red-500">*</span>
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            How much must customers spend to qualify for 50% off?
          </p>
          
          {/* Regular Input Field */}
          <div className="relative">
            <Input
              id="minOrderAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={state.minOrderAmount ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === '' ? null : parseFloat(value);
                dispatch({
                  type: 'UPDATE_FIELD',
                  field: 'minOrderAmount',
                  value: numValue && numValue > 0 ? numValue : null,
                });
              }}
              placeholder="e.g., 25.00"
              className={`h-12 text-lg transition-all ${
                state.minOrderAmount !== null && !isMinOrderAmountValid
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : state.minOrderAmount !== null && isMinOrderAmountValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                  : 'focus:ring-brand-primary-500/20'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
            {state.minOrderAmount !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-12 top-1/2 -translate-y-1/2"
              >
                {isMinOrderAmountValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {state.minOrderAmount !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 text-sm ${
                  isMinOrderAmountValid
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isMinOrderAmountValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>
                    {isMinOrderAmountValid
                      ? 'Perfect! Minimum spend amount set.'
                      : 'Minimum spend amount must be greater than $0'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick presets for minimum spend */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">Quick presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[15, 25, 50, 75, 100].map((amount) => (
                <motion.button
                  key={String(amount)}
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'minOrderAmount',
                      value: amount,
                    })
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    state.minOrderAmount === amount
                      ? 'bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 text-white shadow-md shadow-brand-primary-500/25'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-brand-primary-50 hover:text-brand-primary-700 hover:border hover:border-brand-primary-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ${amount.toFixed(2)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Discount Percentage - Fixed at 50% */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-primary-600" />
            <Label className="text-lg font-semibold text-neutral-900">
              Discount Percentage
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            Redeem Now deals offer a fixed 50% discount when customers meet the minimum spend.
          </p>
          
          {/* Fixed 50% Display */}
          <div className="rounded-xl border-2 border-brand-primary-200 bg-gradient-to-br from-brand-primary-50 to-white p-6 shadow-sm">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 bg-clip-text text-transparent mb-2">
                50%
              </div>
              <p className="text-sm text-neutral-600">Fixed discount for all Redeem Now deals</p>
            </div>
          </div>
        </motion.div>

        {/* Max Redemptions - Optional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="maxRedemptions" className="text-lg font-semibold text-neutral-900">
              Maximum Redemptions (Optional)
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            Limit how many times this deal can be redeemed. Leave empty or set to 0 for unlimited.
          </p>
          
          <Input
            id="maxRedemptions"
            type="number"
            min="0"
            value={state.maxRedemptions !== null ? state.maxRedemptions : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                dispatch({
                  type: 'UPDATE_FIELD',
                  field: 'maxRedemptions',
                  value: null,
                });
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue >= 0) {
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'maxRedemptions',
                    value: numValue,
                  });
                }
              }
            }}
            placeholder="0 for unlimited, or enter a number"
            className="h-12 text-base"
          />
          <p className="text-xs text-neutral-500">
            💡 Tip: Set to 0 or leave empty for unlimited redemptions, or enter a specific number (e.g., 100)
          </p>
        </motion.div>

        {/* 24-Hour Duration Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">24-Hour Duration Limit</h4>
              <p className="text-sm text-amber-700 mt-1">
                Redeem Now deals must be 24 hours or less. Make sure to set a short duration when scheduling your deal.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Deal Preview */}
        {dealPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border-2 border-brand-primary-200 bg-gradient-to-br from-white to-brand-primary-50 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Deal Preview</h3>
                  <p className="text-sm text-neutral-600">How your deal will appear to customers</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-brand-primary-600 hover:text-brand-primary-700"
              >
                {showPreview ? 'Hide' : 'Show'}
              </button>
            </div>
            
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Hero Message */}
                  <div className="rounded-lg border-2 border-brand-primary-300 bg-white p-5 text-center shadow-sm">
                    <div className="text-3xl font-bold bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 bg-clip-text text-transparent mb-2">
                      Spend ${dealPreview.minSpend.toFixed(2)}
                    </div>
                    <div className="text-xl font-semibold text-neutral-700 mb-1">
                      Get 50% OFF
                    </div>
                    <p className="text-sm text-neutral-500">
                      Redeem instantly when you meet the minimum spend
                    </p>
                  </div>

                  {/* Example Calculation */}
                  <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Example order:</span>
                        <span className="font-semibold text-neutral-900">
                          ${dealPreview.exampleOrder.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Discount (50%):</span>
                        <span className="font-semibold text-green-600">
                          -${dealPreview.savings.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-neutral-200 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-700">
                            Final price:
                          </span>
                          <span className="text-lg font-bold text-brand-primary-600">
                            ${dealPreview.finalPrice.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Customer saves ${dealPreview.savings.toFixed(2)} on this order
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-brand-primary-50 p-3">
                    <p className="text-sm text-brand-primary-700">
                      💡 <strong>Customer message:</strong> "Spend ${dealPreview.minSpend.toFixed(2)} and get 50% off your entire order!"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </OnboardingStepLayout>
  );
};


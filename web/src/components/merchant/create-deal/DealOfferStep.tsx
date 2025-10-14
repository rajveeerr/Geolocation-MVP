// src/components/merchant/create-deal/DealOfferStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, Minus, Sparkles, DollarSign, Calculator, TrendingUp, Target, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Small card component to give a premium feel
const OfferCard = ({
  icon,
  title,
  subtitle,
  selected,
  onClick,
  ariaPressed,
}: any) => (
  <button
    onClick={onClick}
    aria-pressed={ariaPressed}
    className={cn(
      'flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-shadow',
      selected
        ? 'bg-gradient-to-b from-white to-brand-primary-50 shadow-[0_6px_18px_rgba(59,130,246,0.12)] ring-2 ring-brand-primary-300'
        : 'border-neutral-200 bg-white hover:shadow-sm',
    )}
  >
    <div
      className={cn(
        'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg',
        selected
          ? 'bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white'
          : 'bg-neutral-100 text-brand-primary-600',
      )}
    >
      {icon}
    </div>
    <div>
      <p className="font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
    </div>
  </button>
);


export const DealOfferStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(false);

  // Real-time validation
  const percentageValidation = {
    isValid: state.discountPercentage !== null && state.discountPercentage > 0 && state.discountPercentage <= 100,
    message: state.discountPercentage === null ? 'Enter a percentage' :
             state.discountPercentage <= 0 ? 'Percentage must be greater than 0' :
             state.discountPercentage > 100 ? 'Percentage cannot exceed 100%' :
             'Perfect!'
  };

  const amountValidation = {
    isValid: state.discountAmount !== null && state.discountAmount > 0,
    message: state.discountAmount === null ? 'Enter an amount' :
             state.discountAmount <= 0 ? 'Amount must be greater than 0' :
             'Great!'
  };

  // Smart validation - ensure at least one discount field is provided (backend requirement)
  const hasValidDiscount = 
    (state.discountPercentage && state.discountPercentage > 0) ||
    (state.discountAmount && state.discountAmount > 0) ||
    (state.customOfferDisplay && state.customOfferDisplay.trim().length > 0);

  const isNextDisabledSimple = !state.dealType || !hasValidDiscount;

  // Calculate potential savings for preview - show based on what user has entered
  const getSavingsPreview = () => {
    if (state.discountPercentage && state.discountPercentage > 0) {
      return `Save ${state.discountPercentage}% on your purchase`;
    }
    if (state.discountAmount && state.discountAmount > 0) {
      return `Save $${Number(state.discountAmount).toFixed(2)} on your purchase`;
    }
    if (state.customOfferDisplay && state.customOfferDisplay.trim().length > 0) {
      return state.customOfferDisplay;
    }
    return 'Configure your offer to see preview';
  };

  // Get the display text for the preview
  const getPreviewDisplayText = () => {
    if (state.discountPercentage && state.discountPercentage > 0) {
      return `${state.discountPercentage}% OFF`;
    }
    if (state.discountAmount && state.discountAmount > 0) {
      return `$${Number(state.discountAmount).toFixed(2)} OFF`;
    }
    if (state.customOfferDisplay && state.customOfferDisplay.trim().length > 0) {
      return state.customOfferDisplay;
    }
    return 'Your Deal';
  };

  return (
    <OnboardingStepLayout
      title="Make it irresistible"
      subtitle="Choose how customers will save with your deal"
      onNext={() => navigate('/merchant/deals/create/images')}
      onBack={() => navigate('/merchant/deals/create/menu')}
      isNextDisabled={isNextDisabledSimple}
      progress={45}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <OfferCard
            icon={<Percent className="h-6 w-6" />}
            title="Percentage Off"
            subtitle="A clear percent discount shown on the deal card"
            selected={state.standardOfferKind === 'percentage'}
            ariaPressed={state.standardOfferKind === 'percentage'}
            onClick={() =>
              dispatch({ type: 'SET_STANDARD_OFFER_KIND', kind: 'percentage' })
            }
          />
          <OfferCard
            icon={<Minus className="h-6 w-6" />}
            title="Fixed Amount Off"
            subtitle="A dollar amount taken off — great for simple messaging"
            selected={state.standardOfferKind === 'amount'}
            ariaPressed={state.standardOfferKind === 'amount'}
            onClick={() =>
              dispatch({ type: 'SET_STANDARD_OFFER_KIND', kind: 'amount' })
            }
          />
          <OfferCard
            icon={<Sparkles className="h-6 w-6" />}
            title="Custom Offer"
            subtitle="Create your own offer text like 'Buy 2 Get 1 Free'"
            selected={state.standardOfferKind === 'custom'}
            ariaPressed={state.standardOfferKind === 'custom'}
            onClick={() =>
              dispatch({ type: 'SET_STANDARD_OFFER_KIND', kind: 'custom' })
            }
          />
        </div>

        {/* Enhanced Input Sections with Validation */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {(state.standardOfferKind === 'percentage' ||
            state.discountPercentage !== null) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-brand-primary-600" />
                <Label htmlFor="percentage" className="text-lg font-semibold text-neutral-900">
                Discount Percentage
              </Label>
              </div>
              <p className="text-sm text-neutral-600">
                Choose a percentage that's attractive but sustainable for your business.
              </p>

              <div className="space-y-4">
                <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  min={1}
                  max={100}
                  value={state.discountPercentage ?? ''}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    const newValue = Number.isFinite(v)
                      ? Math.max(1, Math.min(100, v))
                      : null;
                    
                    // Update the percentage value
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'discountPercentage',
                      value: newValue,
                    });
                    
                    // Auto-set the offer kind if not already set
                    if (newValue && state.standardOfferKind !== 'percentage') {
                      dispatch({
                        type: 'SET_STANDARD_OFFER_KIND',
                        kind: 'percentage'
                      });
                    }
                  }}
                    className={`h-12 max-w-xs text-lg transition-all ${
                      state.discountPercentage !== null && !percentageValidation.isValid 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : state.discountPercentage !== null && percentageValidation.isValid
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                        : 'focus:ring-brand-primary-500/20'
                    }`}
                  placeholder="e.g., 25"
                  aria-label="Discount percentage"
                />
                  {state.discountPercentage !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {percentageValidation.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Validation feedback */}
                <AnimatePresence>
                  {state.discountPercentage !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`rounded-lg p-3 text-sm ${
                        percentageValidation.isValid 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {percentageValidation.isValid ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>{percentageValidation.message}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick presets */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">Quick presets:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 50].map((p) => (
                      <motion.button
                      key={p}
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'discountPercentage',
                          value: p,
                        })
                      }
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          state.discountPercentage === p
                            ? 'bg-brand-primary-500 text-white shadow-md'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-brand-primary-100 hover:text-brand-primary-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      {p}%
                      </motion.button>
                  ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {(state.standardOfferKind === 'amount' ||
            state.discountAmount !== null) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-brand-primary-600" />
                <Label htmlFor="amount" className="text-lg font-semibold text-neutral-900">
                Discount Amount
              </Label>
              </div>
              <p className="text-sm text-neutral-600">
                Set a fixed dollar amount off. Great for simple, clear messaging.
              </p>

              <div className="space-y-4">
                <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={state.discountAmount ?? ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    const newValue = Number.isFinite(v)
                      ? Math.max(0.01, Number(v.toFixed(2)))
                      : null;
                    
                    // Update the amount value
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'discountAmount',
                      value: newValue,
                    });
                    
                    // Auto-set the offer kind if not already set
                    if (newValue && state.standardOfferKind !== 'amount') {
                      dispatch({
                        type: 'SET_STANDARD_OFFER_KIND',
                        kind: 'amount'
                      });
                    }
                  }}
                    className={`h-12 max-w-xs text-lg transition-all ${
                      state.discountAmount !== null && !amountValidation.isValid 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : state.discountAmount !== null && amountValidation.isValid
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                        : 'focus:ring-brand-primary-500/20'
                    }`}
                  placeholder="e.g., 5.00"
                  aria-label="Discount amount"
                />
                  {state.discountAmount !== null && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {amountValidation.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Validation feedback */}
                <AnimatePresence>
                  {state.discountAmount !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`rounded-lg p-3 text-sm ${
                        amountValidation.isValid 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {amountValidation.isValid ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>{amountValidation.message}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick presets */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">Quick presets:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[2.5, 5, 10, 15].map((a) => (
                      <motion.button
                      key={String(a)}
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'discountAmount',
                          value: a,
                        })
                      }
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          state.discountAmount === a
                            ? 'bg-brand-primary-500 text-white shadow-md'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-brand-primary-100 hover:text-brand-primary-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      ${Number(a).toFixed(2)}
                      </motion.button>
                  ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Custom Offer Display Section */}
          {(state.standardOfferKind === 'custom' ||
            state.customOfferDisplay !== null) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Custom Offer Text</h3>
                  <p className="text-sm text-neutral-600">Create your own offer message</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="customOfferDisplay" className="text-sm font-medium text-neutral-700">
                  Offer Display Text
                </Label>
                <Input
                  id="customOfferDisplay"
                  type="text"
                  placeholder="e.g., Buy 2 Get 1 Free, Happy Hour Special, Free Dessert"
                  maxLength={50}
                  value={state.customOfferDisplay ?? ''}
                  onChange={(e) => {
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'customOfferDisplay',
                      value: e.target.value,
                    });
                  }}
                  className={`h-12 text-lg transition-all ${
                    state.customOfferDisplay !== null && state.customOfferDisplay.trim().length === 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : state.customOfferDisplay !== null && state.customOfferDisplay.trim().length > 0
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : 'focus:ring-brand-primary-500/20'
                  }`}
                />
                {state.customOfferDisplay !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    {state.customOfferDisplay.trim().length > 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Perfect custom offer!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Please enter your custom offer text</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Quick Custom Offer Suggestions */}
              <AnimatePresence>
                {state.customOfferDisplay !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm font-medium text-neutral-700">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Buy 2 Get 1 Free', 'Happy Hour Special', 'Free Dessert', '50% Off Drinks', 'Kids Eat Free', 'Early Bird Special'].map((suggestion) => (
                        <motion.button
                          key={suggestion}
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_FIELD',
                              field: 'customOfferDisplay',
                              value: suggestion,
                            })
                          }
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            state.customOfferDisplay === suggestion
                              ? 'bg-purple-500 text-white shadow-md'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-purple-100 hover:text-purple-700'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Enhanced Live Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-neutral-200 bg-gradient-to-r from-white to-neutral-50 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Deal Preview</h3>
              <p className="text-sm text-neutral-600">How your offer will appear to customers</p>
            </div>
          </div>
          
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900">{state.title || 'Your Deal Title'}</h4>
                <p className="text-sm text-neutral-600">{getSavingsPreview()}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-brand-primary-600">
                  {getPreviewDisplayText()}
                </div>
                <div className="text-xs text-neutral-500">
                  {state.dealType === 'HAPPY_HOUR' ? 'Happy Hour' :
                   state.dealType === 'RECURRING' ? 'Recurring' :
                   'Standard Deal'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pro Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        >
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-brand-primary-600" />
              <span className="font-medium text-neutral-900">Pricing Strategy Tips</span>
            </div>
            <motion.div
              animate={{ rotate: showTips ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
          
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Target className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Sweet Spot Percentages</div>
                    <div className="text-sm text-neutral-600">20-30% off typically drives the most engagement without hurting margins</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Test and Learn</div>
                    <div className="text-sm text-neutral-600">Start with smaller discounts and increase based on customer response</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-amber-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Fixed Amount Benefits</div>
                    <div className="text-sm text-neutral-600">Dollar amounts work great for lower-priced items and create clear value perception</div>
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

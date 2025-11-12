// src/components/merchant/create-deal/DealOfferStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, Minus, Sparkles, DollarSign, Calculator, TrendingUp, Target, Lightbulb, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AmountSlider } from '@/components/ui/AmountSlider';

// Premium square card component with consistent brand styling
const OfferCard = ({
  icon,
  title,
  subtitle,
  selected,
  onClick,
  ariaPressed,
}: any) => (
  <motion.button
    onClick={onClick}
    aria-pressed={ariaPressed}
    whileHover={{ scale: selected ? 1 : 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      'flex w-full aspect-square flex-col items-center justify-center gap-4 rounded-2xl border-2 p-6 text-center transition-all duration-300 relative overflow-hidden',
      selected
        ? 'border-brand-primary-500 bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 text-white shadow-xl shadow-brand-primary-500/25'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-primary-300 hover:shadow-lg hover:bg-neutral-50',
    )}
  >
    {selected && (
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    )}
    <div
      className={cn(
        'flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300 relative z-10',
        selected
          ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg'
          : 'bg-gradient-to-br from-neutral-100 to-neutral-50 text-brand-primary-600',
      )}
    >
      {icon}
    </div>
    <div className="relative z-10">
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
  </motion.button>
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

  // Redeem Now discount validation: must be preset (15,30,45,50,75) or 1-100%
  const isValidRedeemNowDiscount = () => {
    if (state.dealType !== 'REDEEM_NOW') return true; // Not a Redeem Now deal
    
    if (!state.discountPercentage) return false; // Discount is required for Redeem Now
    
    const validPresets = [15, 30, 45, 50, 75];
    const discount = state.discountPercentage;
    
    // Check if it's a preset or valid custom (1-100%)
    return validPresets.includes(discount) || (discount >= 1 && discount <= 100);
  };

  const isNextDisabledSimple = !state.dealType || !hasValidDiscount || !isValidRedeemNowDiscount();

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

  // For REDEEM_NOW deals, discount is already configured in the redeem-now step
  // Show a simplified view with what's already set
  if (state.dealType === 'REDEEM_NOW') {
    return (
      <OnboardingStepLayout
        title="Offer Configuration"
        subtitle="Your Redeem Now deal discount is already configured"
        onNext={() => navigate('/merchant/deals/create/images')}
        onBack={() => navigate('/merchant/deals/create/menu')}
        isNextDisabled={false}
        progress={45}
      >
        <div className="space-y-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-brand-primary-200 bg-gradient-to-br from-brand-primary-50 to-white p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Redeem Now Deal Configured</h3>
                <p className="text-sm text-neutral-600">Your discount settings were set in the Redeem Now step</p>
              </div>
            </div>
            
            {state.minOrderAmount && state.discountPercentage && (
              <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-2">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 bg-clip-text text-transparent mb-1">
                    Spend ${state.minOrderAmount.toFixed(2)}
                  </div>
                  <div className="text-lg font-semibold text-neutral-700">
                    Get {state.discountPercentage}% OFF
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-neutral-500 mt-4 text-center">
              You can continue to the next step to add images to your deal.
            </p>
          </motion.div>
        </div>
      </OnboardingStepLayout>
    );
  }

  return (
    <OnboardingStepLayout
      title="Make it irresistible"
      subtitle="Choose how customers will save with your deal"
      onNext={() => navigate('/merchant/deals/create/images')}
      onBack={() => navigate('/merchant/deals/create/menu')}
      isNextDisabled={isNextDisabledSimple}
      progress={45}
    >
      <div className="space-y-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
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
        <div className="space-y-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
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
                {/* Premium Percentage Slider */}
                <div className="rounded-xl border-2 border-neutral-200 bg-white p-6 shadow-sm">
                  <AmountSlider
                    value={state.discountPercentage}
                    onChange={(value) => {
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'discountPercentage',
                        value: value,
                      });
                      
                      // Auto-set the offer kind if not already set
                      if (state.standardOfferKind !== 'percentage') {
                        dispatch({
                          type: 'SET_STANDARD_OFFER_KIND',
                          kind: 'percentage'
                        });
                      }
                    }}
                    min={1}
                    max={100}
                    step={1}
                    suffix="%"
                    showEditButton={true}
                  />
                </div>

                {/* Validation feedback */}
                <AnimatePresence>
                  {state.discountPercentage !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        'rounded-xl p-3 text-sm border-2',
                        percentageValidation.isValid 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      )}
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

          {/* Quick presets - Redeem Now has specific presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">
                {state.dealType === 'REDEEM_NOW' ? 'Redeem Now presets (or enter custom 1-100%):' : 'Quick presets:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
            {(state.dealType === 'REDEEM_NOW' ? [15, 30, 45, 50, 75] : [10, 20, 30, 50]).map((p) => (
                      <motion.button
                      key={p}
                      onClick={() =>
                        dispatch({
                          type: 'UPDATE_FIELD',
                          field: 'discountPercentage',
                          value: p,
                        })
                      }
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-medium transition-all',
                          state.discountPercentage === p
                            ? 'bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 text-white shadow-md shadow-brand-primary-500/25'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-brand-primary-50 hover:text-brand-primary-700 hover:border hover:border-brand-primary-200'
                        )}
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
                {/* Premium Amount Slider */}
                <div className="rounded-xl border-2 border-neutral-200 bg-white p-6 shadow-sm">
                  <AmountSlider
                    value={state.discountAmount}
                    onChange={(value) => {
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'discountAmount',
                        value: value,
                      });
                      
                      // Auto-set the offer kind if not already set
                      if (state.standardOfferKind !== 'amount') {
                        dispatch({
                          type: 'SET_STANDARD_OFFER_KIND',
                          kind: 'amount'
                        });
                      }
                    }}
                    min={0.5}
                    max={100}
                    step={0.5}
                    prefix="$"
                    showEditButton={true}
                  />
                </div>

                {/* Validation feedback */}
                <AnimatePresence>
                  {state.discountAmount !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        'rounded-xl p-3 text-sm border-2',
                        amountValidation.isValid 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      )}
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
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-medium transition-all',
                          state.discountAmount === a
                            ? 'bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 text-white shadow-md shadow-brand-primary-500/25'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-brand-primary-50 hover:text-brand-primary-700 hover:border hover:border-brand-primary-200'
                        )}
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
          </div>

          {/* Custom Offer Display Section - Full Width */}
          {state.standardOfferKind === 'custom' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-2xl border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-6 sm:p-8 shadow-lg"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 text-white shadow-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">Custom Offer Text</h3>
                    <p className="text-sm text-neutral-600">Create your own offer message</p>
                  </div>
                </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customOfferDisplay" className="text-sm font-semibold text-neutral-900 mb-2 block">
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
                    className={cn(
                      'h-14 w-full text-base transition-all rounded-xl border-2',
                      state.customOfferDisplay !== null && state.customOfferDisplay.trim().length === 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                        : state.customOfferDisplay !== null && state.customOfferDisplay.trim().length > 0
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                        : 'border-neutral-200 focus:border-brand-primary-500 focus:ring-brand-primary-500/20'
                    )}
                  />
                </div>
                
                {state.customOfferDisplay !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'flex items-center gap-2 text-sm rounded-lg p-3 border-2',
                      state.customOfferDisplay.trim().length > 0
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    )}
                  >
                    {state.customOfferDisplay.trim().length > 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Perfect custom offer!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <span>Please enter your custom offer text</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Quick Custom Offer Suggestions - Full Width Grid */}
              <div className="space-y-4 w-full">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-brand-primary-600" />
                  <p className="text-sm font-semibold text-neutral-900">Quick suggestions:</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
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
                      className={cn(
                        'w-full rounded-xl px-5 py-3.5 text-sm font-semibold transition-all border-2',
                        state.customOfferDisplay === suggestion
                          ? 'bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 text-white border-brand-primary-500 shadow-lg shadow-brand-primary-500/25'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-brand-primary-50 hover:text-brand-primary-700 hover:border-brand-primary-300 hover:shadow-md'
                      )}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
              </div>
            </motion.div>
          )}
        </div>

          {/* Redeem Now Warning */}
          {state.dealType === 'REDEEM_NOW' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5 max-w-3xl mx-auto shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900">Redeem Now Deal</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Redeem Now deals must be 24 hours or less. Make sure to set a short duration when scheduling your deal.
                  </p>
                  <p className="text-sm text-amber-700 mt-2">
                    <strong>Discount:</strong> Choose from presets (15%, 30%, 45%, 50%, 75%) or enter a custom percentage (1-100%).
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Redeem Now Discount Validation Error */}
          {state.dealType === 'REDEEM_NOW' && state.discountPercentage !== null && !isValidRedeemNowDiscount() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-red-200 bg-red-50 p-5 max-w-3xl mx-auto shadow-sm"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Invalid Discount</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Redeem Now deals must use preset discounts (15%, 30%, 45%, 50%, 75%) or a custom percentage between 1-100%.
                    Current value: {state.discountPercentage}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        {/* Enhanced Live Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-lg max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 text-white shadow-md">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Deal Preview</h3>
              <p className="text-sm text-neutral-600">How your offer will appear to customers</p>
            </div>
          </div>
          
          <div className="rounded-xl border-2 border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-brand-primary-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900">{state.title || 'Your Deal Title'}</h4>
                <p className="text-sm text-neutral-600">{getSavingsPreview()}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 bg-clip-text text-transparent">
                  {getPreviewDisplayText()}
                </div>
                <div className="text-xs text-neutral-500">
                  {state.dealType === 'HAPPY_HOUR' ? 'Happy Hour' :
                   state.dealType === 'RECURRING' ? 'Daily Deal' :
                   'Item Deal'}
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
          className="rounded-xl border-2 border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-6 max-w-3xl mx-auto shadow-sm"
        >
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex w-full items-center justify-between hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-400 to-brand-primary-600 text-white shadow-md">
                <Lightbulb className="h-4 w-4" />
              </div>
              <span className="font-semibold text-neutral-900">Pricing Strategy Tips</span>
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

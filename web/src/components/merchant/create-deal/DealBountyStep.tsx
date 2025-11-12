// web/src/components/merchant/create-deal/DealBountyStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Users, DollarSign, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { validateDealTypeData } from '@/utils/dealTypeUtils';
import { AmountSlider } from '@/components/ui/AmountSlider';

export const DealBountyStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(true);

  const validation = validateDealTypeData(state.dealType, state);

  const isBountyRewardValid = state.bountyRewardAmount !== null && state.bountyRewardAmount > 0;
  const isMinReferralsValid = state.minReferralsRequired !== null && state.minReferralsRequired >= 1;

  const canProceed = isBountyRewardValid && isMinReferralsValid;

  // Calculate potential earnings preview
  const getEarningsPreview = () => {
    if (!isBountyRewardValid || !isMinReferralsValid) return null;
    
    const minEarnings = state.bountyRewardAmount! * state.minReferralsRequired!;
    const maxEarnings = state.bountyRewardAmount! * (state.minReferralsRequired! + 2); // Show +2 friends example
    
    return {
      min: minEarnings,
      max: maxEarnings,
      perPerson: state.bountyRewardAmount!,
      minFriends: state.minReferralsRequired!,
    };
  };

  const earningsPreview = getEarningsPreview();

  return (
    <OnboardingStepLayout
      title="Set up your bounty rewards"
      subtitle="Reward customers for bringing friends to your business"
      onNext={() => {
        // Auto-enable kickback for bounty deals
        dispatch({ type: 'UPDATE_FIELD', field: 'kickbackEnabled', value: true });
        navigate('/merchant/deals/create/basics');
      }}
      onBack={() => navigate('/merchant/deals/create/type')}
      isNextDisabled={!canProceed}
      progress={20}
    >
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Bounty Reward Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="bountyRewardAmount" className="text-lg font-semibold text-neutral-900">
              Reward Amount Per Friend
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            How much cash back will customers earn for each friend they bring?
          </p>
          
          {/* Premium Amount Slider */}
          <div className="rounded-xl border-2 border-neutral-200 bg-white p-6 shadow-sm">
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

          <AnimatePresence>
            {state.bountyRewardAmount !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 text-sm ${
                  isBountyRewardValid
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isBountyRewardValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>
                    {isBountyRewardValid
                      ? 'Great! This reward amount looks good.'
                      : 'Reward amount must be greater than $0'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">Quick presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[2.5, 5, 10, 15, 20].map((amount) => (
                <motion.button
                  key={String(amount)}
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'bountyRewardAmount',
                      value: amount,
                    })
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    state.bountyRewardAmount === amount
                      ? 'bg-brand-primary-500 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-brand-primary-100 hover:text-brand-primary-700'
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

        {/* Minimum Referrals Required */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="minReferralsRequired" className="text-lg font-semibold text-neutral-900">
              Minimum Friends Required
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            How many friends must customers bring to qualify for the bounty reward?
          </p>
          
          <div className="relative">
            <Input
              id="minReferralsRequired"
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
              className={`h-12 text-lg transition-all ${
                state.minReferralsRequired !== null && !isMinReferralsValid
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : state.minReferralsRequired !== null && isMinReferralsValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                  : 'focus:ring-brand-primary-500/20'
              }`}
            />
            {state.minReferralsRequired !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {isMinReferralsValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          <AnimatePresence>
            {state.minReferralsRequired !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 text-sm ${
                  isMinReferralsValid
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isMinReferralsValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>
                    {isMinReferralsValid
                      ? 'Perfect! Minimum referrals set.'
                      : 'Minimum referrals must be at least 1'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">Quick presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((count) => (
                <motion.button
                  key={count}
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_FIELD',
                      field: 'minReferralsRequired',
                      value: count,
                    })
                  }
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    state.minReferralsRequired === count
                      ? 'bg-brand-primary-500 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-brand-primary-100 hover:text-brand-primary-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {count} {count === 1 ? 'Friend' : 'Friends'}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Kickback Enabled Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">Kickback Enabled</h4>
              <p className="text-sm text-amber-700 mt-1">
                Kickback rewards are automatically enabled for bounty deals. Customers will earn cash back for each friend they bring.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Earnings Preview */}
        {earningsPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-neutral-200 bg-gradient-to-r from-white to-neutral-50 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Bounty Preview</h3>
                  <p className="text-sm text-neutral-600">How your bounty will work</p>
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
                  className="space-y-3"
                >
                  <div className="rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Reward per friend:</span>
                        <span className="font-semibold text-neutral-900">
                          ${earningsPreview.perPerson.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600">Minimum friends:</span>
                        <span className="font-semibold text-neutral-900">
                          {earningsPreview.minFriends}
                        </span>
                      </div>
                      <div className="border-t border-neutral-200 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-700">
                            Minimum earnings:
                          </span>
                          <span className="text-lg font-bold text-brand-primary-600">
                            ${earningsPreview.min.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Example: With {earningsPreview.minFriends + 2} friends = ${earningsPreview.max.toFixed(2)} earned
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-brand-primary-50 p-3">
                    <p className="text-sm text-brand-primary-700">
                      💡 <strong>Example message:</strong> "Bring {earningsPreview.minFriends} friend{earningsPreview.minFriends > 1 ? 's' : ''} and earn ${earningsPreview.perPerson.toFixed(2)} per person!"
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


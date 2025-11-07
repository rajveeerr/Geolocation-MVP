// web/src/components/merchant/create-deal/DealAdvancedStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Tag, 
  Star, 
  Users, 
  Share2, 
  Gift, 
  Clock,
  Lightbulb,
  Trophy,
  AlertCircle
} from 'lucide-react';

export const DealAdvancedStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    dispatch({ type: 'UPDATE_FIELD', field: 'tags', value: tags });
  };

  return (
    <OnboardingStepLayout
      title="Advanced Settings"
      subtitle="Customize your deal with additional features (optional)"
      onNext={() => navigate('/merchant/deals/create/review')}
      onBack={() => navigate('/merchant/deals/create/instructions')}
      isNextDisabled={false} // All fields are optional
      progress={85}
    >
      <div className="space-y-8">
        {/* Basic Advanced Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Offer Terms */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-brand-primary-600" />
              <Label htmlFor="offerTerms" className="text-lg font-semibold text-neutral-900">
                Terms & Conditions
              </Label>
            </div>
            <p className="text-sm text-neutral-600">
              Any specific terms, restrictions, or conditions for this deal.
            </p>
            <Textarea
              id="offerTerms"
              value={state.offerTerms}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FIELD',
                  field: 'offerTerms',
                  value: e.target.value,
                })
              }
              placeholder="e.g., Valid for dine-in only, Cannot be combined with other offers, Excludes alcohol..."
              className="min-h-[100px] text-base"
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-brand-primary-600" />
              <Label htmlFor="tags" className="text-lg font-semibold text-neutral-900">
                Tags
              </Label>
            </div>
            <p className="text-sm text-neutral-600">
              Add tags to help customers find your deal (comma-separated).
            </p>
            <Input
              id="tags"
              value={state.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="e.g., happy hour, family friendly, outdoor seating"
              className="h-12 text-base"
            />
            {state.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {state.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-brand-primary-100 px-3 py-1 text-sm text-brand-primary-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Minimum Order Amount */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary-600" />
              <Label htmlFor="minOrderAmount" className="text-lg font-semibold text-neutral-900">
                Minimum Order Amount
              </Label>
            </div>
            <p className="text-sm text-neutral-600">
              Set a minimum order amount for customers to qualify for this deal.
            </p>
            <div className="relative">
              <Input
                id="minOrderAmount"
                type="number"
                step="0.01"
                min="0"
                value={state.minOrderAmount || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'minOrderAmount',
                    value: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="e.g., 25.00"
                className="h-12 text-base"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
            </div>
          </div>

          {/* Max Redemptions - Only for Redeem Now deals */}
          {state.dealType === 'REDEEM_NOW' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-primary-600" />
                <Label htmlFor="maxRedemptions" className="text-lg font-semibold text-neutral-900">
                  Maximum Redemptions
                </Label>
              </div>
              <p className="text-sm text-neutral-600">
                Limit how many times this Redeem Now deal can be redeemed. Enter 0 for unlimited redemptions.
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
                💡 Tip: Set to 0 for unlimited redemptions, or enter a specific number to limit usage (e.g., 100)
              </p>
            </div>
          )}
        </motion.div>

        {/* Toggle for Advanced Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        >
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand-primary-600" />
              <span className="font-medium text-neutral-900">Advanced Features</span>
            </div>
            <motion.div
              animate={{ rotate: showAdvanced ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </button>
          
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-6"
              >
                {/* Feature Toggles */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-amber-500" />
                      <div>
                        <div className="font-medium text-neutral-900">Featured Deal</div>
                        <div className="text-sm text-neutral-600">Highlight this deal prominently</div>
                      </div>
                    </div>
                    <Switch
                      checked={state.isFeatured}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'UPDATE_FIELD', field: 'isFeatured', value: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium text-neutral-900">Kickback Enabled</div>
                        <div className="text-sm text-neutral-600">Enable customer rewards</div>
                      </div>
                    </div>
                    <Switch
                      checked={state.kickbackEnabled}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'UPDATE_FIELD', field: 'kickbackEnabled', value: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium text-neutral-900">Social Proof</div>
                        <div className="text-sm text-neutral-600">Show customer activity</div>
                      </div>
                    </div>
                    <Switch
                      checked={state.socialProofEnabled}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'UPDATE_FIELD', field: 'socialProofEnabled', value: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Share2 className="h-5 w-5 text-purple-500" />
                      <div>
                        <div className="font-medium text-neutral-900">Allow Sharing</div>
                        <div className="text-sm text-neutral-600">Let customers share this deal</div>
                      </div>
                    </div>
                    <Switch
                      checked={state.allowSharing}
                      onCheckedChange={(checked) =>
                        dispatch({ type: 'UPDATE_FIELD', field: 'allowSharing', value: checked })
                      }
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-brand-primary-600" />
                    <Label htmlFor="priority" className="text-lg font-semibold text-neutral-900">
                      Priority Level
                    </Label>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Higher priority deals appear first in search results (1-10, default: 5).
                  </p>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={state.priority}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'priority',
                        value: parseInt(e.target.value) || 5,
                      })
                    }
                    className="h-12 text-base max-w-32"
                  />
                </div>

                {/* External URL */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-brand-primary-600" />
                    <Label htmlFor="externalUrl" className="text-lg font-semibold text-neutral-900">
                      External URL
                    </Label>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Link to your website, menu, or booking page (optional).
                  </p>
                  <Input
                    id="externalUrl"
                    type="url"
                    value={state.externalUrl}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'externalUrl',
                        value: e.target.value,
                      })
                    }
                    placeholder="https://your-website.com"
                    className="h-12 text-base"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-brand-primary-600" />
                    <Label htmlFor="notes" className="text-lg font-semibold text-neutral-900">
                      Internal Notes
                    </Label>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Private notes for your team (not visible to customers).
                  </p>
                  <Textarea
                    id="notes"
                    value={state.notes}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'notes',
                        value: e.target.value,
                      })
                    }
                    placeholder="Internal notes about this deal..."
                    className="min-h-[80px] text-base"
                    rows={3}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Optional Bounty for Hidden Deals */}
        {state.dealType === 'HIDDEN' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-6 rounded-xl border border-purple-200 bg-purple-50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Optional: Bounty Rewards</h3>
                <p className="text-sm text-neutral-600">
                  Add bounty rewards to your hidden deal. Customers who bring friends will earn cash back.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Bounty Reward Amount */}
              <div className="space-y-3">
                <Label htmlFor="hiddenBountyReward" className="text-sm font-medium text-neutral-700">
                  Reward Amount Per Friend
                </Label>
                <div className="relative">
                  <Input
                    id="hiddenBountyReward"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={state.bountyRewardAmount ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? null : parseFloat(value);
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'bountyRewardAmount',
                        value: numValue && numValue > 0 ? numValue : null,
                      });
                    }}
                    placeholder="e.g., 5.00"
                    className="h-12 text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                </div>
                <p className="text-xs text-neutral-500">
                  How much cash back customers earn per friend they bring
                </p>
              </div>

              {/* Min Referrals Required */}
              <div className="space-y-3">
                <Label htmlFor="hiddenMinReferrals" className="text-sm font-medium text-neutral-700">
                  Minimum Friends Required
                </Label>
                <Input
                  id="hiddenMinReferrals"
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
                  className="h-12 text-base"
                />
                <p className="text-xs text-neutral-500">
                  Minimum number of friends customer must bring
                </p>
              </div>
            </div>

            {/* Bounty Preview */}
            {state.bountyRewardAmount && state.bountyRewardAmount > 0 && state.minReferralsRequired && state.minReferralsRequired >= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 rounded-lg border border-purple-200 bg-white p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-semibold text-neutral-900">Bounty Preview</span>
                </div>
                <p className="text-sm text-neutral-600">
                  Customers will earn <span className="font-semibold text-purple-600">
                    ${(state.bountyRewardAmount * state.minReferralsRequired).toFixed(2)}
                  </span> minimum by bringing {state.minReferralsRequired} friend{state.minReferralsRequired > 1 ? 's' : ''}.
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  💡 A QR code will be generated for verification when you publish this deal.
                </p>
              </motion.div>
            )}

            {/* Info about kickback */}
            {(state.bountyRewardAmount && state.bountyRewardAmount > 0 && state.minReferralsRequired && state.minReferralsRequired >= 1) && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Kickback rewards will be automatically enabled when you add bounty rewards to a hidden deal.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-neutral-900">Advanced Settings Tips</h4>
              <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                <li>• Featured deals get premium placement in search results</li>
                <li>• Social proof shows recent customer activity to build trust</li>
                <li>• Tags help customers discover your deal through search</li>
                <li>• Minimum order amounts can increase average transaction value</li>
                <li>• All advanced settings are optional and can be changed later</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};

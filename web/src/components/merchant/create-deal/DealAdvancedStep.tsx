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
  Lightbulb
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
      progress={90}
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

          {/* Max Redemptions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-primary-600" />
              <Label htmlFor="maxRedemptions" className="text-lg font-semibold text-neutral-900">
                Maximum Redemptions
              </Label>
            </div>
            <p className="text-sm text-neutral-600">
              Limit how many times this deal can be redeemed. Enter 0 for unlimited redemptions.
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
              💡 Tip: Set to 0 for unlimited redemptions, or enter a specific number to limit usage
            </p>
          </div>
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

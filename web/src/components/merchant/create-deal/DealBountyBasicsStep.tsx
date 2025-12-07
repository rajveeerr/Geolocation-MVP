// web/src/components/merchant/create-deal/DealBountyBasicsStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelector } from '@/components/common/CategorySelector';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Sparkles,
  Trophy,
  Users,
  DollarSign
} from 'lucide-react';

export const DealBountyBasicsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(false);

  // Ensure deal type is BOUNTY and set defaults
  useEffect(() => {
    if (state.dealType !== 'BOUNTY') {
      dispatch({ type: 'UPDATE_FIELD', field: 'dealType', value: 'BOUNTY' });
    }
    // Set default category if not set
    if (!state.category) {
      dispatch({ type: 'UPDATE_FIELD', field: 'category', value: 'FOOD_AND_BEVERAGE' });
    }
    // Auto-enable kickback for bounty deals
    if (!state.kickbackEnabled) {
      dispatch({ type: 'UPDATE_FIELD', field: 'kickbackEnabled', value: true });
    }
  }, [state.dealType, state.category, state.kickbackEnabled, dispatch]);

  // Real-time validation
  const titleValidation = {
    isValid: state.title.length >= 3 && state.title.length <= 100,
    message: state.title.length < 3 ? 'Title must be at least 3 characters' : 
             state.title.length > 100 ? 'Title must be 100 characters or less' : 
             'Great title!'
  };

  const descriptionValidation = {
    isValid: state.description.length === 0 || (state.description.length >= 10 && state.description.length <= 1000),
    message: state.description.length > 0 && state.description.length < 10 ? 'Description must be at least 10 characters' :
             state.description.length > 1000 ? 'Description must be 1000 characters or less' :
             state.description.length === 0 ? 'Optional but recommended' :
             'Perfect description!'
  };

  const isFormValid = titleValidation.isValid && descriptionValidation.isValid && state.category;

  // Bounty-specific title suggestions
  const getBountyTitleSuggestions = () => {
    return [
      'Bring Friends, Earn Cash Back',
      'Referral Rewards Program',
      'Invite Friends & Get Rewarded',
      'Earn Money for Every Friend',
      'Bounty Rewards Deal',
      'Friend Referral Bonus',
      'Social Rewards Program',
      'Invite & Earn Deal'
    ];
  };

  return (
    <OnboardingStepLayout
      title="Describe your bounty deal"
      subtitle="Create an attractive offer that encourages customers to bring friends"
      onNext={() => navigate('/merchant/deals/create/bounty/menu')}
      onBack={() => navigate('/merchant/deals/create/bounty')}
      isNextDisabled={!isFormValid}
      progress={33}
    >
      <div className="space-y-8">
        {/* Bounty Context Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-brand-primary-200 bg-gradient-to-r from-brand-primary-50 to-white p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-500 text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 mb-1">Bounty Deal Setup</h3>
              <p className="text-sm text-neutral-600">
                Customers earn ${state.bountyRewardAmount?.toFixed(2) || '0.00'} per friend they bring. 
                Minimum {state.minReferralsRequired || 0} friend{state.minReferralsRequired !== 1 ? 's' : ''} required.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Deal Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="title" className="text-lg font-semibold text-neutral-900">
              Deal Title
            </Label>
            <span className="text-red-500">*</span>
          </div>
          <p className="text-sm text-neutral-600">
            Make it catchy and clear. Mention the reward to attract customers.
          </p>
          
          <div className="relative">
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
              placeholder="e.g., Bring Friends, Earn $5 Each"
              className={`h-12 text-base transition-all ${
                state.title && !titleValidation.isValid 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : state.title && titleValidation.isValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                  : 'focus:ring-brand-primary-500/20'
              }`}
            />
            {state.title && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {titleValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          {/* Title validation feedback */}
          <AnimatePresence>
            {state.title && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 text-sm ${
                  titleValidation.isValid 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {titleValidation.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{titleValidation.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bounty-specific title suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-neutral-700">Suggested titles:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getBountyTitleSuggestions().map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: suggestion })}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600 hover:bg-brand-primary-100 hover:text-brand-primary-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="category" className="text-lg font-semibold text-neutral-900">
              Category
            </Label>
            <span className="text-red-500">*</span>
          </div>
          <p className="text-sm text-neutral-600">
            Choose the category that best represents your business.
          </p>
          
          <CategorySelector
            value={state.category}
            onChange={(value) => dispatch({ type: 'UPDATE_FIELD', field: 'category', value })}
            placeholder="Select a category"
            label=""
            required
            searchable
          />
        </motion.div>

        {/* Description Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="description" className="text-lg font-semibold text-neutral-900">
              Description
            </Label>
            <span className="text-xs text-neutral-500">(Optional)</span>
          </div>
          <p className="text-sm text-neutral-600">
            Explain how the bounty program works. Include details about rewards and requirements.
          </p>
          
          <div className="relative">
            <Textarea
              id="description"
              value={state.description}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FIELD',
                  field: 'description',
                  value: e.target.value,
                })
              }
              placeholder="e.g., Bring friends and earn cash back! For every friend you bring, you'll earn $5. Minimum 2 friends required to qualify. Share this deal with your network and start earning today!"
              className={`min-h-[120px] text-base transition-all resize-none ${
                state.description && !descriptionValidation.isValid 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : state.description && descriptionValidation.isValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                  : 'focus:ring-brand-primary-500/20'
              }`}
            />
            {state.description && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-3"
              >
                {descriptionValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          {/* Character count */}
          <div className="flex justify-between items-center text-sm">
            <span className={`${descriptionValidation.isValid ? 'text-green-600' : state.description.length > 1000 ? 'text-red-600' : 'text-neutral-500'}`}>
              {state.description.length}/1000 characters
            </span>
            {state.description && (
              <span className="text-neutral-500">
                {descriptionValidation.isValid ? 'Perfect!' : 'Keep going...'}
              </span>
            )}
          </div>

          {/* Description validation feedback */}
          <AnimatePresence>
            {state.description && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 text-sm ${
                  descriptionValidation.isValid 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {descriptionValidation.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{descriptionValidation.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bounty Tips Section */}
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
              <Sparkles className="h-5 w-5 text-brand-primary-600" />
              <span className="font-medium text-neutral-900">Tips for Bounty Deals</span>
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
                  <DollarSign className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Highlight the Reward</div>
                    <div className="text-sm text-neutral-600">Mention the exact amount customers earn per friend in your title or description</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Explain the Requirements</div>
                    <div className="text-sm text-neutral-600">Clearly state how many friends are needed to qualify for the bounty</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="h-4 w-4 text-amber-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Create Urgency</div>
                    <div className="text-sm text-neutral-600">Use time-limited language to encourage quick action</div>
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


// web/src/components/merchant/create-deal/DealBasicsStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import { useAiDealGenerator, type DealGeneratorSuggestion } from '@/hooks/useAi';
import { useToast } from '@/hooks/use-toast';

export const DealBasicsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(false);
  const [aiIntent, setAiIntent] = useState('');
  const [showAiBar, setShowAiBar] = useState(false);
  const aiDealMutation = useAiDealGenerator();
  const { toast } = useToast();

  // Real-time validation
  const titleValidation = {
    isValid: state.title.length >= 3 && state.title.length <= 100,
    message: state.title.length < 3 ? 'Title must be at least 3 characters' :
      state.title.length > 100 ? 'Title must be 100 characters or less' :
        'Great title!'
  };

  const descriptionValidation = {
    isValid: state.description.length >= 10 && state.description.length <= 1000,
    message: state.description.length < 10 ? 'Description must be at least 10 characters' :
      state.description.length > 1000 ? 'Description must be 1000 characters or less' :
        'Perfect description!'
  };

  const isFormValid = titleValidation.isValid && descriptionValidation.isValid && state.category;

  // Title suggestions based on category (simplified for backend categories)
  const getTitleSuggestions = () => {
    const suggestions = {
      'FOOD_AND_BEVERAGE': ['2-for-1 Tacos', 'Happy Hour Special', 'Weekend Brunch Deal', 'Buy One Get One Free'],
      'RETAIL': ['50% Off Sale', 'Buy 2 Get 1 Free', 'Clearance Event', 'New Arrival Discount'],
      'ENTERTAINMENT': ['Movie Night Special', 'Game Day Deal', 'Concert Package', 'Family Fun Package'],
      'HEALTH_AND_FITNESS': ['New Member Special', 'Personal Training Package', 'Spa Day Deal', 'Fitness Challenge'],
      'BEAUTY_AND_SPA': ['Beauty Treatment Package', 'Hair & Makeup Deal', 'Spa Day Special', 'Manicure & Pedicure'],
      'AUTOMOTIVE': ['Oil Change Special', 'Car Wash Package', 'Maintenance Deal', 'Tire Service'],
      'TRAVEL': ['Weekend Getaway', 'Hotel Package Deal', 'Travel Bundle', 'Vacation Special'],
      'EDUCATION': ['Course Discount', 'Training Package', 'Learning Bundle', 'Skill Development'],
      'TECHNOLOGY': ['Tech Service Deal', 'Device Repair Special', 'Software Package', 'IT Support'],
      'HOME_AND_GARDEN': ['Home Improvement Deal', 'Garden Service Package', 'Furniture Sale', 'Maintenance Special'],
      'OTHER': ['Special Offer', 'Limited Time Deal', 'Exclusive Package', 'Custom Service']
    };
    return suggestions[state.category as keyof typeof suggestions] || [];
  };

  const applyAiDealSuggestion = (suggestion: DealGeneratorSuggestion) => {
    dispatch({ type: 'UPDATE_FIELD', field: 'title', value: suggestion.title });
    dispatch({ type: 'UPDATE_FIELD', field: 'description', value: suggestion.description });

    if (suggestion.discountPercentage != null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: suggestion.discountPercentage });
      dispatch({ type: 'UPDATE_FIELD', field: 'standardOfferKind', value: 'percentage' });
    } else if (suggestion.discountAmount != null) {
      dispatch({ type: 'UPDATE_FIELD', field: 'discountAmount', value: suggestion.discountAmount });
      dispatch({ type: 'UPDATE_FIELD', field: 'standardOfferKind', value: 'amount' });
    }

    if (suggestion.redemptionInstructions) {
      dispatch({ type: 'UPDATE_FIELD', field: 'redemptionInstructions', value: suggestion.redemptionInstructions });
    }
  };

  const handleGenerateWithAi = async () => {
    const intent = aiIntent.trim();
    if (!intent) {
      toast({
        title: 'Add what you want to offer',
        description: 'For example: “Happy hour, half price cocktails, 5–8pm on weekdays”.',
        variant: 'warn',
      });
      return;
    }

    try {
      const result = await aiDealMutation.mutateAsync({ intent: intent.slice(0, 500) });
      applyAiDealSuggestion(result.suggestion);
      toast({
        title: 'Draft deal created',
        description: 'We pre-filled your basics. Review and tweak before publishing.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while talking to AI.';
      toast({
        title: 'Could not generate deal',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const fieldShell =
    'rounded-[1.75rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,242,0.92))] p-5 shadow-[0_18px_50px_rgba(82,58,40,0.08)] sm:p-6';
  const validationTone = (isValid: boolean) =>
    isValid
      ? 'border-emerald-200 bg-emerald-50/90 text-emerald-700'
      : 'border-rose-200 bg-rose-50/90 text-rose-700';

  return (
    <OnboardingStepLayout
      title="Describe your deal"
      subtitle="Create an attractive offer that customers will love"
      onNext={() => {
        // For hidden deals, go to hidden menu route
        if (state.dealType === 'HIDDEN') {
          navigate('/merchant/deals/create/hidden/menu');
        } else {
          navigate('/merchant/deals/create/menu');
        }
      }}
      onBack={() => {
        // For hidden deals, go back to visibility step
        if (state.dealType === 'HIDDEN') {
          navigate('/merchant/deals/create/hidden/visibility');
        } else {
          navigate('/merchant/deals/create');
        }
      }}
      isNextDisabled={!isFormValid}
      progress={25}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]"
        >
          <div className="rounded-[1.9rem] border border-[#f0ddd0] bg-[linear-gradient(135deg,#fff8f2_0%,#fff1e5_52%,#fde7df_100%)] p-6 shadow-[0_22px_60px_rgba(82,58,40,0.10)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#bf6545]">
              <Sparkles className="h-3.5 w-3.5" />
              Deal Identity
            </div>
            <h2 className="mt-4 font-serif text-[1.9rem] font-semibold tracking-tight text-[#203247]">
              Build a deal that feels polished before anyone sees the price.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#607084]">
              Start with the headline, category, and story. This is the part customers notice first, so the form now leads with clarity instead of a plain input stack.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.5rem] border border-white/80 bg-white/82 p-4 shadow-[0_14px_38px_rgba(82,58,40,0.06)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#95a1af]">This Step</div>
              <div className="mt-2 text-base font-semibold text-[#203247]">Offer basics</div>
              <div className="mt-1 text-sm leading-6 text-[#6f7d8f]">Name it well, classify it cleanly, and explain why it matters.</div>
            </div>
            <div className="rounded-[1.5rem] border border-white/80 bg-[#203247] p-4 shadow-[0_14px_38px_rgba(32,50,71,0.20)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Momentum</div>
              <div className="mt-2 text-base font-semibold text-white">Strong titles convert better</div>
              <div className="mt-1 text-sm leading-6 text-white/72">Use a clear offer and concrete value so customers instantly know what they get.</div>
            </div>
          </div>
        </motion.div>

        {/* Deal Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={fieldShell}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff0e8] text-[#ff7a59]">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#97a2b1]">
                Headline
              </div>
              <Label htmlFor="title" className="mt-1 block text-xl font-semibold text-[#203247]">
                Deal Title
              </Label>
            </div>
          </div>
          <p className="text-sm leading-7 text-[#607084]">
            Make it catchy and clear. A great title increases engagement by 40%.
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
              placeholder="e.g., 2-for-1 Tacos, Happy Hour Special"
              className={`h-14 rounded-[1.2rem] border bg-white/90 px-4 text-base text-[#203247] shadow-none placeholder:text-[#9aa5b3] transition-all focus-visible:ring-2 ${state.title && !titleValidation.isValid
                ? 'border-rose-300 focus-visible:border-rose-500 focus-visible:ring-rose-500/20'
                : state.title && titleValidation.isValid
                  ? 'border-emerald-300 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20'
                  : 'border-[#eaded2] focus-visible:border-[#ff8a66] focus-visible:ring-[#ff8a66]/20'
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
                className={`rounded-[1.1rem] border p-3 text-sm ${validationTone(titleValidation.isValid)}`}
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

          {/* Title suggestions */}
          {state.category && getTitleSuggestions().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-[#5b6a7d]">Suggested titles:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getTitleSuggestions().map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: suggestion })}
                    className="rounded-full border border-[#efd8ca] bg-white/90 px-3.5 py-1.5 text-sm text-[#5c6b7c] transition-colors hover:border-[#ffb08a] hover:bg-[#fff1e8] hover:text-[#bf6545]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={fieldShell}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef5fb] text-[#305f89]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#97a2b1]">
                Classification
              </div>
              <Label htmlFor="category" className="mt-1 block text-xl font-semibold text-[#203247]">
                Category
              </Label>
            </div>
          </div>
          <p className="text-sm leading-7 text-[#607084]">
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
          className={fieldShell}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff3dd] text-[#cb8a1a]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#97a2b1]">
                Story
              </div>
              <Label htmlFor="description" className="mt-1 block text-xl font-semibold text-[#203247]">
                Description
              </Label>
            </div>
          </div>
          <p className="text-sm leading-7 text-[#607084]">
            Provide details about what's included. Be specific to attract the right customers.
          </p>

          {/* Description + inline AI bar */}
          <div className="overflow-hidden rounded-[1.35rem] border border-[#eaded2] bg-white/92 transition-colors focus-within:border-[#ff8a66] focus-within:ring-2 focus-within:ring-[#ff8a66]/15">
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
              placeholder="Describe what customers get, any restrictions, and what makes this deal special..."
              className="min-h-[140px] resize-none rounded-none border-0 bg-transparent px-4 py-4 text-base text-[#203247] shadow-none placeholder:text-[#9aa5b3] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {/* Inline AI bar */}
            <div className="border-t border-[#f0e5da] bg-[linear-gradient(180deg,#fffaf6_0%,#fff4ec_100%)]">
              {!showAiBar ? (
                <button
                  type="button"
                  onClick={() => setShowAiBar(true)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-xs text-[#6b7a8c] transition-colors hover:bg-[#fff1e8]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#ff7a59]" />
                  <span>Describe your idea and let AI draft it...</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#ff7a59]" />
                  <input
                    value={aiIntent}
                    onChange={(e) => setAiIntent(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateWithAi(); } }}
                    placeholder="e.g. Happy hour, half price cocktails, 5pm to 8pm on weekdays"
                    className="min-w-0 flex-1 bg-transparent text-sm text-[#203247] outline-none placeholder:text-[#97a3b4]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setShowAiBar(false); setAiIntent(''); }}
                    className="shrink-0 text-sm font-medium text-[#7a8798] hover:text-[#203247]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={aiDealMutation.isPending}
                    className="shrink-0 rounded-full bg-[#203247] px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#17263a] disabled:opacity-60"
                  >
                    {aiDealMutation.isPending ? (
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-500 border-t-transparent" />
                        Thinking...
                      </span>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          {state.description && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-1 flex justify-end"
            >
              {descriptionValidation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </motion.div>
          )}

          {/* Character count */}
          <div className="flex justify-between items-center text-sm">
            <span className={`${descriptionValidation.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
              {state.description.length}/1000 characters
            </span>
            {state.description && (
              <span className="text-[#7a8798]">
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
                className={`rounded-[1.1rem] border p-3 text-sm ${validationTone(descriptionValidation.isValid)}`}
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

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[1.75rem] border border-[#eaded2] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(244,248,252,0.86))] p-5 shadow-[0_16px_40px_rgba(82,58,40,0.06)]"
        >
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ff7a59]" />
              <span className="font-medium text-[#203247]">Pro Tips for Better Deals</span>
            </div>
            <motion.div
              animate={{ rotate: showTips ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="h-5 w-5 text-[#7a8798]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <TrendingUp className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium text-[#203247]">Use Numbers</div>
                    <div className="text-sm text-[#607084]">"50% Off" or "2-for-1" are more compelling than "Big Discount"</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <div className="font-medium text-[#203247]">Be Specific</div>
                    <div className="text-sm text-[#607084]">Include what's included, any restrictions, and expiration details</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-4 w-4 text-amber-500 mt-1" />
                  <div>
                    <div className="font-medium text-[#203247]">Create Urgency</div>
                    <div className="text-sm text-[#607084]">Use words like "Limited Time" or "This Week Only"</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div >
    </OnboardingStepLayout >
  );
};

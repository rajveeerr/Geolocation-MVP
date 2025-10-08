// web/src/components/merchant/create-deal/DealBasicsStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
export const DealBasicsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(false);

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

  // Category options with icons and descriptions
  const categories = [
    { value: 'FOOD_AND_BEVERAGE', label: 'Food & Beverage', icon: '🍽️', description: 'Restaurants, cafes, bars' },
    { value: 'RETAIL', label: 'Retail', icon: '🛍️', description: 'Stores, shopping centers' },
    { value: 'ENTERTAINMENT', label: 'Entertainment', icon: '🎬', description: 'Movies, games, events' },
    { value: 'HEALTH_AND_FITNESS', label: 'Health & Fitness', icon: '💪', description: 'Gyms, spas, wellness' },
    { value: 'BEAUTY_AND_SPA', label: 'Beauty & Spa', icon: '💅', description: 'Salons, beauty treatments' },
    { value: 'AUTOMOTIVE', label: 'Automotive', icon: '🚗', description: 'Car services, repairs' },
    { value: 'TRAVEL', label: 'Travel', icon: '✈️', description: 'Hotels, travel agencies' },
    { value: 'EDUCATION', label: 'Education', icon: '📚', description: 'Schools, training centers' },
    { value: 'TECHNOLOGY', label: 'Technology', icon: '💻', description: 'Tech services, electronics' },
    { value: 'HOME_AND_GARDEN', label: 'Home & Garden', icon: '🏠', description: 'Furniture, home improvement' },
    { value: 'OTHER', label: 'Other', icon: '📦', description: 'Miscellaneous services' }
  ];

  // Title suggestions based on category
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

  return (
    <OnboardingStepLayout
      title="Describe your deal"
      subtitle="Create an attractive offer that customers will love"
      onNext={() => navigate('/merchant/deals/create/menu')}
      onBack={() => navigate('/merchant/deals/create')}
      isNextDisabled={!isFormValid}
      progress={25}
    >
      <div className="space-y-8">
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
          </div>
          <p className="text-sm text-neutral-600">
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

          {/* Title suggestions */}
          {state.category && getTitleSuggestions().length > 0 && (
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
                {getTitleSuggestions().map((suggestion, index) => (
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
          )}
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
          </div>
          <p className="text-sm text-neutral-600">
            Choose the category that best represents your business.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.value}
                onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'category', value: category.value })}
                className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                  state.category === category.value
                    ? 'border-brand-primary-500 bg-brand-primary-50'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">{category.label}</div>
                  <div className="text-sm text-neutral-500">{category.description}</div>
                </div>
                {state.category === category.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-500 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </motion.div>
                )}
              </motion.button>
            ))}
        </div>
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
          </div>
          <p className="text-sm text-neutral-600">
            Provide details about what's included. Be specific to attract the right customers.
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
              placeholder="Describe what customers get, any restrictions, and what makes this deal special..."
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
            <span className={`${descriptionValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
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

        {/* Tips Section */}
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
              <span className="font-medium text-neutral-900">Pro Tips for Better Deals</span>
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
                  <TrendingUp className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Use Numbers</div>
                    <div className="text-sm text-neutral-600">"50% Off" or "2-for-1" are more compelling than "Big Discount"</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Be Specific</div>
                    <div className="text-sm text-neutral-600">Include what's included, any restrictions, and expiration details</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-4 w-4 text-amber-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Create Urgency</div>
                    <div className="text-sm text-neutral-600">Use words like "Limited Time" or "This Week Only"</div>
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

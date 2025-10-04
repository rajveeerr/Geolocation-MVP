// src/components/merchant/create-deal/DealInstructionsStep.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Users,
  Clock,
  Smartphone,
  MessageSquare
} from 'lucide-react';

export const DealInstructionsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(false);

  // Real-time validation
  const instructionsValidation = {
    isValid: state.redemptionInstructions.length >= 10 && state.redemptionInstructions.length <= 500,
    message: state.redemptionInstructions.length < 10 ? 'Instructions must be at least 10 characters' :
             state.redemptionInstructions.length > 500 ? 'Instructions must be 500 characters or less' :
             'Perfect instructions!'
  };

  // Quick instruction templates
  const instructionTemplates = [
    {
      title: 'Simple Show & Save',
      text: 'Show this screen to your server or cashier to redeem your discount.',
      icon: <Smartphone className="h-4 w-4" />
    },
    {
      title: 'Mention the Deal',
      text: 'Tell your server you have a deal and show them this screen for your discount.',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      title: 'Present at Checkout',
      text: 'Present this screen when paying to receive your discount.',
      icon: <Clock className="h-4 w-4" />
    },
    {
      title: 'Show to Staff',
      text: 'Show this deal to any staff member to redeem your offer.',
      icon: <Users className="h-4 w-4" />
    }
  ];

  return (
    <OnboardingStepLayout
      title="Redemption Instructions"
      subtitle="Tell customers exactly how to claim their deal"
      onNext={() => navigate('/merchant/deals/create/advanced')}
      onBack={() => navigate('/merchant/deals/create/schedule')}
      isNextDisabled={!instructionsValidation.isValid}
      progress={70}
    >
      <div className="space-y-8">
        {/* Instructions Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="instructions" className="text-lg font-semibold text-neutral-900">
              Redemption Instructions
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            Clear instructions help customers redeem their deal smoothly and reduce confusion.
          </p>
          
          <div className="relative">
            <Textarea
              id="instructions"
              value={state.redemptionInstructions}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FIELD',
                  field: 'redemptionInstructions',
                  value: e.target.value,
                })
              }
              placeholder="e.g., Show this screen to your server or cashier to redeem your discount."
              className={`min-h-[120px] text-base transition-all resize-none ${
                state.redemptionInstructions && !instructionsValidation.isValid 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : state.redemptionInstructions && instructionsValidation.isValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                  : 'focus:ring-brand-primary-500/20'
              }`}
              rows={4}
            />
            {state.redemptionInstructions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-3"
              >
                {instructionsValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          {/* Character count */}
          <div className="flex justify-between items-center text-sm">
            <span className={`${instructionsValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {state.redemptionInstructions.length}/500 characters
            </span>
            {state.redemptionInstructions && (
              <span className="text-neutral-500">
                {instructionsValidation.isValid ? 'Perfect!' : 'Keep going...'}
              </span>
            )}
          </div>

          {/* Validation feedback */}
          <AnimatePresence>
            {state.redemptionInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg p-3 text-sm ${
                  instructionsValidation.isValid 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {instructionsValidation.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{instructionsValidation.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-semibold text-neutral-900">Quick Templates</span>
          </div>
          <p className="text-sm text-neutral-600">
            Choose a template or use as inspiration for your own instructions.
          </p>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {instructionTemplates.map((template, index) => (
              <motion.button
                key={index}
                onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'redemptionInstructions', value: template.text })}
                className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-left transition-all hover:border-brand-primary-300 hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-100 text-brand-primary-600">
                  {template.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">{template.title}</h4>
                  <p className="mt-1 text-sm text-neutral-600">{template.text}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        >
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-brand-primary-600" />
              <span className="font-medium text-neutral-900">Writing Great Instructions</span>
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
                  <Smartphone className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Be Specific</div>
                    <div className="text-sm text-neutral-600">Tell customers exactly who to show the deal to (server, cashier, manager)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Timing Matters</div>
                    <div className="text-sm text-neutral-600">Mention when to show the deal (before ordering, at checkout, etc.)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-amber-500 mt-1" />
                  <div>
                    <div className="font-medium text-neutral-900">Keep It Simple</div>
                    <div className="text-sm text-neutral-600">Use clear, simple language that anyone can understand</div>
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

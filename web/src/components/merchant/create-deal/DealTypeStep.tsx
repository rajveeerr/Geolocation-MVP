// web/src/components/merchant/create-deal/DealTypeStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Tag, Clock, Repeat, Calendar, Gift, Eye, EyeOff, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { motion } from 'framer-motion';

const DealTypeButton = ({
  icon,
  title,
  isSelected,
  onClick,
  delay = 0,
}: any) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      'group relative flex flex-col items-center justify-center rounded-xl border-2 p-4 text-center transition-all duration-300 min-h-[100px]',
      isSelected
        ? 'border-primary bg-primary text-white shadow-lg'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary/30 hover:shadow-md',
    )}
  >
    <motion.div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 mb-2',
        isSelected
          ? 'bg-white/20 text-white'
          : 'bg-neutral-100 text-neutral-600 group-hover:bg-primary/10 group-hover:text-primary',
      )}
      whileHover={{ rotate: 5 }}
    >
      {icon}
    </motion.div>
    
    <h3 className="text-base font-bold">{title}</h3>
  </motion.button>
);

export const DealTypeStep = ({ onNext }: { onNext: () => void }) => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  return (
    <OnboardingStepLayout
      title="What kind of deal are you creating?"
      subtitle="Choose the type that best fits your business goals"
      onNext={onNext}
      onBack={() => navigate(PATHS.MERCHANT_DASHBOARD)}
      isNextDisabled={!state.dealType}
      progress={15}
    >
      <div className="space-y-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-neutral-600 text-lg">
            Select the deal type that matches your marketing strategy
          </p>
        </motion.div>

        {/* Deal type buttons - 2 rows of 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {/* First row - Basic deal types */}
          <DealTypeButton
            icon={<Tag className="h-5 w-5" />}
            title="Standard Deal"
            isSelected={state.dealType === 'STANDARD'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'STANDARD' })
            }
            delay={0.1}
          />
          
          <DealTypeButton
            icon={<Clock className="h-5 w-5" />}
            title="Happy Hour"
            isSelected={state.dealType === 'HAPPY_HOUR'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'HAPPY_HOUR' })
            }
            delay={0.2}
          />
          
          <DealTypeButton
            icon={<Repeat className="h-5 w-5" />}
            title="Daily Deal"
            isSelected={state.dealType === 'RECURRING'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'RECURRING' })
            }
            delay={0.3}
          />

          {/* Second row - Redeem now and hidden deals */}
          <DealTypeButton
            icon={<Zap className="h-5 w-5" />}
            title="Redeem Now"
            isSelected={state.dealType === 'REDEEM_NOW'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'REDEEM_NOW' })
            }
            delay={0.4}
          />
          
          <DealTypeButton
            icon={<EyeOff className="h-5 w-5" />}
            title="Hidden Deal"
            isSelected={state.dealType === 'HIDDEN'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'HIDDEN' })
            }
            delay={0.5}
          />
          
          <DealTypeButton
            icon={<Trophy className="h-5 w-5" />}
            title="Bounty Deal"
            isSelected={state.dealType === 'BOUNTY'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'BOUNTY' })
            }
            delay={0.6}
          />
        </div>

        {/* Deal type descriptions */}
        {state.dealType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <h4 className="font-semibold text-neutral-900 mb-3">
                {state.dealType === 'STANDARD' && 'Standard Deal'}
                {state.dealType === 'HAPPY_HOUR' && 'Happy Hour'}
                {state.dealType === 'RECURRING' && 'Daily Deal'}
                {state.dealType === 'REDEEM_NOW' && 'Redeem Now Deal'}
                {state.dealType === 'HIDDEN' && 'Hidden Deal'}
                {state.dealType === 'BOUNTY' && 'Bounty Deal'}
              </h4>
              <p className="text-neutral-600 leading-relaxed">
                {state.dealType === 'STANDARD' && 'Perfect for promotions, sales, and special offers that run for a specific time period.'}
                {state.dealType === 'HAPPY_HOUR' && 'Create urgency with time-limited offers during specific hours to boost traffic.'}
                {state.dealType === 'RECURRING' && 'Set up daily repeating offers to build customer habits and consistent foot traffic.'}
                {state.dealType === 'REDEEM_NOW' && 'Immediate redemption deals that customers can claim and use right away without waiting.'}
                {state.dealType === 'HIDDEN' && 'Exclusive deals that are only visible to customers who have special access or codes.'}
                {state.dealType === 'BOUNTY' && 'Reward-based deals where customers earn points or rewards for completing specific actions.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Help section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 max-w-3xl mx-auto"
        >
          <div className="flex items-start gap-4">
            <Calendar className="h-6 w-6 text-neutral-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Need help choosing?</h4>
              <p className="text-neutral-600 leading-relaxed">
                <strong>Standard</strong> for one-time promotions, <strong>Happy Hour</strong> for daily specials, 
                or <strong>Daily Deal</strong> for repeating deals like "Taco Tuesday" or "Wine Wednesday".
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};

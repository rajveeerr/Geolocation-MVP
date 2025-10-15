// web/src/components/merchant/create-deal/DealTypeStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Tag, Clock, Repeat, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { motion } from 'framer-motion';

const DealTypeButton = ({
  icon,
  title,
  description,
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
      'group relative flex flex-col items-center justify-center rounded-xl border-2 p-6 text-center transition-all duration-300 min-h-[120px]',
      isSelected
        ? 'border-black bg-black text-white shadow-lg'
        : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:shadow-md',
    )}
  >
    <motion.div
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 mb-3',
        isSelected
          ? 'bg-white/20 text-white'
          : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200',
      )}
      whileHover={{ rotate: 5 }}
    >
      {icon}
    </motion.div>
    
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm opacity-80 leading-relaxed">{description}</p>
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
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-neutral-600 text-lg">
            Select the deal type that matches your marketing strategy
          </p>
        </motion.div>

        {/* Three side-by-side deal type buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DealTypeButton
            icon={<Tag className="h-6 w-6" />}
            title="Standard Deal"
            description="Perfect for promotions, sales, and special offers that run for a specific time period."
            isSelected={state.dealType === 'STANDARD'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'STANDARD' })
            }
            delay={0.1}
          />
          
          <DealTypeButton
            icon={<Clock className="h-6 w-6" />}
            title="Happy Hour"
            description="Create urgency with time-limited offers during specific hours to boost traffic."
            isSelected={state.dealType === 'HAPPY_HOUR'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'HAPPY_HOUR' })
            }
            delay={0.2}
          />
          
          <DealTypeButton
            icon={<Repeat className="h-6 w-6" />}
            title="Recurring Deal"
            description="Set up weekly repeating offers to build customer habits and consistent foot traffic."
            isSelected={state.dealType === 'RECURRING'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'RECURRING' })
            }
            delay={0.3}
          />
        </div>

        {/* Help section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-6"
        >
          <div className="flex items-start gap-4">
            <Calendar className="h-6 w-6 text-neutral-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Need help choosing?</h4>
              <p className="text-neutral-600 leading-relaxed">
                <strong>Standard</strong> for one-time promotions, <strong>Happy Hour</strong> for daily specials, 
                or <strong>Recurring</strong> for weekly deals like "Taco Tuesday" or "Wine Wednesday".
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};

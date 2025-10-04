// web/src/components/merchant/create-deal/DealTypeStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Tag, Clock, Repeat, Sparkles, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { motion } from 'framer-motion';

const DealTypeCard = ({
  icon,
  title,
  description,
  features,
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
      'group relative flex w-full items-center gap-4 rounded-xl border-2 p-6 text-left transition-all duration-300',
      isSelected
        ? 'border-brand-primary-500 bg-gradient-to-r from-brand-primary-50 to-brand-primary-25 shadow-lg ring-2 ring-brand-primary-200'
        : 'border-neutral-200 bg-white hover:border-brand-primary-300 hover:shadow-md',
    )}
  >
    {/* Selection indicator */}
    {isSelected && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-500 text-white"
      >
        <Sparkles className="h-3 w-3" />
      </motion.div>
    )}
    
    <motion.div
      className={cn(
        'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300',
        isSelected
          ? 'bg-brand-primary-500 text-white shadow-lg'
          : 'bg-gradient-to-br from-neutral-100 to-neutral-200 text-brand-primary-600 group-hover:from-brand-primary-100 group-hover:to-brand-primary-200',
      )}
      whileHover={{ rotate: 5 }}
    >
      {icon}
    </motion.div>
    
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-brand-primary-600"
          >
            <Zap className="h-4 w-4" />
            <span className="text-xs font-medium">Recommended</span>
          </motion.div>
        )}
      </div>
      <p className="mt-1 text-sm text-neutral-600">{description}</p>
      {features && (
        <div className="mt-2 flex flex-wrap gap-1">
          {features.map((feature: string, index: number) => (
            <span
              key={index}
              className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600"
            >
              {feature}
            </span>
          ))}
        </div>
      )}
    </div>
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
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-neutral-600">
            Select the deal type that matches your marketing strategy
          </p>
        </motion.div>

        <div className="space-y-4">
          <DealTypeCard
            icon={<Tag className="h-7 w-7" />}
            title="Standard Deal"
            description="Perfect for promotions, sales, and special offers that run for a specific time period."
            features={['Flexible duration', 'Easy setup', 'High visibility']}
            isSelected={state.dealType === 'STANDARD'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'STANDARD' })
            }
            delay={0.1}
          />
          
          <DealTypeCard
            icon={<Clock className="h-7 w-7" />}
            title="Happy Hour"
            description="Create urgency with time-limited offers during specific hours to boost traffic."
            features={['Time-sensitive', 'Urgency-driven', 'Peak hours']}
            isSelected={state.dealType === 'HAPPY_HOUR'}
            onClick={() =>
              dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'HAPPY_HOUR' })
            }
            delay={0.2}
          />
          
          <DealTypeCard
            icon={<Repeat className="h-7 w-7" />}
            title="Recurring Deal"
            description="Set up weekly repeating offers to build customer habits and consistent foot traffic."
            features={['Weekly repeats', 'Customer habits', 'Consistent traffic']}
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
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        >
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-brand-primary-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-neutral-900">Need help choosing?</h4>
              <p className="text-sm text-neutral-600 mt-1">
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

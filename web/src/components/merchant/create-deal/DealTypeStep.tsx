// web/src/components/merchant/create-deal/DealTypeStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Tag, Clock, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';

const DealTypeCard = ({ icon, title, description, isSelected, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      'rounded-lg border-2 p-6 text-left transition-all w-full flex items-center gap-4',
      isSelected
        ? 'border-brand-primary-500 bg-brand-primary-50 shadow-md'
        : 'border-neutral-200 bg-white hover:border-neutral-300'
    )}
  >
    <div className={cn("flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center", isSelected ? "bg-brand-primary-500 text-white" : "bg-neutral-100 text-brand-primary-600")}>
      {icon}
    </div>
    <div>
      <p className="font-bold text-neutral-800">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  </button>
);

export const DealTypeStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  return (
    <OnboardingStepLayout
      title="What kind of deal are you creating?"
      onNext={() => navigate('/merchant/deals/create/basics')}
      onBack={() => navigate(PATHS.MERCHANT_DASHBOARD)}
      isNextDisabled={!state.dealType}
      progress={15}
    >
      <div className="space-y-4">
        <DealTypeCard
          icon={<Tag className="h-6 w-6" />}
          title="Standard Deal"
          description="A classic offer valid for a specific period."
          isSelected={state.dealType === 'STANDARD'}
          onClick={() => dispatch({ type: 'SET_DEAL_TYPE', dealType: 'STANDARD' })}
        />
        <DealTypeCard
          icon={<Clock className="h-6 w-6" />}
          title="Happy Hour"
          description="A time-sensitive deal to create urgency."
          isSelected={state.dealType === 'HAPPY_HOUR'}
          onClick={() => dispatch({ type: 'SET_DEAL_TYPE', dealType: 'HAPPY_HOUR' })}
        />
        <DealTypeCard
          icon={<Repeat className="h-6 w-6" />}
          title="Recurring Deal"
          description="Repeats on the same day(s) every week."
          isSelected={state.dealType === 'RECURRING'}
          onClick={() => dispatch({ type: 'SET_DEAL_TYPE', dealType: 'RECURRING' })}
        />
      </div>
    </OnboardingStepLayout>
  );
};

// web/src/components/merchant/create-deal/DealBasicsStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tag, Clock, Repeat } from 'lucide-react'; // Import icons for the cards
import { cn } from '@/lib/utils';

// --- NEW: A reusable component for the selection cards ---
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
    <div className={cn("flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center", isSelected ? "bg-gradient-to-b from-brand-primary-400 to-brand-primary-600 text-white" : "bg-neutral-100 text-brand-primary-600")}>
      {icon}
    </div>
    <div>
      <p className="font-bold text-neutral-800">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  </button>
);

export const DealBasicsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  return (
    <OnboardingStepLayout
      title="First, what kind of deal is it?"
      onNext={() => navigate('/merchant/deals/create/offer')}
      onBack={() => navigate(-1)} // Or to merchant dashboard
      isNextDisabled={!state.title || !state.dealType}
      progress={20}
    >
      <div className="space-y-8">
        {/* --- NEW: Deal Type Selection --- */}
        <div>
          <Label className="text-lg font-semibold">Deal Type</Label>
          <p className="mb-3 text-neutral-500">Choose the behavior of your deal.</p>
          <div className="space-y-3">
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
        </div>

        {/* --- Title and Description Inputs (No Changes) --- */}
        <div>
          <Label htmlFor="title" className="text-lg font-semibold">Deal Title</Label>
          <p className="mb-2 text-neutral-500">Make it catchy, like "2-for-1 Tacos".</p>
          <Input id="title" value={state.title} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value })} className="h-14 text-lg" />
        </div>
        <div>
          <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
          <p className="mb-2 text-neutral-500">Provide more details about what's included.</p>
          <Textarea id="description" value={state.description} onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value })} className="min-h-[120px] text-base" />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

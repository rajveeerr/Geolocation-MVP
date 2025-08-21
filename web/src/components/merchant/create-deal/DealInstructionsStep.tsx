// src/components/merchant/create-deal/DealInstructionsStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const DealInstructionsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  return (
    <OnboardingStepLayout
      title="How do customers redeem the deal?"
      onNext={() => navigate('/merchant/deals/create/review')}
      onBack={() => navigate(-1)}
      isNextDisabled={!state.redemptionInstructions}
      progress={80}
    >
      <div>
        <Label htmlFor="instructions" className="text-lg font-semibold">Redemption Instructions</Label>
        <p className="text-neutral-500 mb-2">
          Keep it simple. e.g., "Show this screen to the cashier."
        </p>
        <Textarea
          id="instructions"
          value={state.redemptionInstructions}
          onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'redemptionInstructions', value: e.target.value })}
          className="text-base min-h-[120px]"
          rows={4}
        />
      </div>
    </OnboardingStepLayout>
  );
};

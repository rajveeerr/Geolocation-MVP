// src/components/merchant/create-deal/DealInfoStep.tsx
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';

export const DealInfoStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  const handleNext = () => {
    // In the future, this will navigate to the next step
    // navigate('/merchant/deals/create/offer');
    console.log('Next step not implemented yet');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isNextDisabled = !state.title || !state.description;

  return (
    <OnboardingStepLayout
      title="First, let's describe your deal"
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={isNextDisabled}
      progress={20}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-lg font-semibold">
            Deal Title
          </Label>
          <p className="text-neutral-500 mb-2">
            Make it catchy and clear, like "2-for-1 Happy Hour" or "50% Off Lunch".
          </p>
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
            className="h-14 text-lg"
            placeholder="Enter your deal title..."
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="text-lg font-semibold">
            Description
          </Label>
          <p className="text-neutral-500 mb-2">
            Provide more details about the offer. What's included? Any special conditions?
          </p>
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
            className="text-base min-h-[120px]"
            placeholder="Describe your deal in detail..."
          />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

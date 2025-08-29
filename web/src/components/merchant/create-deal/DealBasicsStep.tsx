// src/components/merchant/create-deal/DealBasicsStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const DealBasicsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  return (
    <OnboardingStepLayout
      title="First, let's describe your deal"
      onNext={() => navigate('/merchant/deals/create/offer')}
      onBack={() => navigate(-1)}
      isNextDisabled={!state.title || !state.description}
      progress={20}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-lg font-semibold">
            Deal Title
          </Label>
          <p className="mb-2 text-neutral-500">
            Make it catchy and clear, like "2-for-1 Happy Hour".
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
          <p className="mb-2 text-neutral-500">
            Provide more details about what's included.
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
            className="min-h-[120px] text-base"
            rows={4}
            placeholder="Describe your deal in detail..."
          />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

// src/components/merchant/create-deal/DealBasicsStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
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
          <Label htmlFor="category" className="text-lg font-semibold">
            Category
          </Label>
          <p className="mb-2 text-neutral-500">Select the category that best fits your deal.</p>
          <div className="relative">
            <select
              id="category"
              value={state.category}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'category', value: e.target.value })
              }
              className="h-14 w-full rounded-md border border-input bg-transparent px-3 pr-10 text-base appearance-none"
            >
              <option value="FOOD_AND_BEVERAGE">Food &amp; Beverage</option>
              <option value="RETAIL">Retail</option>
              <option value="ENTERTAINMENT">Entertainment</option>
              <option value="SERVICES">Services</option>
              <option value="OTHER">Other</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </span>
          </div>
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

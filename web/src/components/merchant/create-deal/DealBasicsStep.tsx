// web/src/components/merchant/create-deal/DealBasicsStep.tsx
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
      title="Describe your deal"
      onNext={() => navigate('/merchant/deals/create/offer')}
      onBack={() => navigate('/merchant/deals/create')}
      isNextDisabled={!state.title || !state.description}
      progress={30}
    >
      <div className="space-y-8">
        <div>
          <Label htmlFor="title" className="text-lg font-semibold">
            Deal Title
          </Label>
          <p className="mb-2 text-neutral-500">
            Make it catchy and clear, like "2-for-1 Tacos".
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
          />
        </div>
        <div>
          <Label htmlFor="category" className="text-lg font-semibold">
            Category
          </Label>
          <p className="mb-2 text-neutral-500">
            Select the category that best fits your deal.
          </p>
          <select
            id="category"
            value={state.category}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'category',
                value: e.target.value,
              })
            }
            className="h-14 w-full rounded-md border border-input bg-transparent px-3 text-base"
          >
            <option value="FOOD_AND_BEVERAGE">Food & Beverage</option>
            <option value="RETAIL">Retail</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            {/* ... other categories */}
          </select>
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
          />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

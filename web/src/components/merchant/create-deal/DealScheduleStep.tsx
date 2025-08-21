// src/components/merchant/create-deal/DealScheduleStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const DealScheduleStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  return (
    <OnboardingStepLayout
      title="When will your deal be available?"
      onNext={() => navigate('/merchant/deals/create/instructions')}
      onBack={() => navigate(-1)}
      isNextDisabled={!state.startTime || !state.endTime}
      progress={60}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="startTime" className="text-lg font-semibold">Start Time</Label>
          <p className="text-neutral-500 mb-2">When customers can start claiming this deal.</p>
          <Input 
            id="startTime"
            type="datetime-local"
            value={state.startTime}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: e.target.value })}
            className="h-14 text-lg"
          />
        </div>
        <div>
          <Label htmlFor="endTime" className="text-lg font-semibold">End Time</Label>
          <p className="text-neutral-500 mb-2">The deal will no longer be visible after this time.</p>
          <Input 
            id="endTime"
            type="datetime-local"
            value={state.endTime}
            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: e.target.value })}
            className="h-14 text-lg"
          />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

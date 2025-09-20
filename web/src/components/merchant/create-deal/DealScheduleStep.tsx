// web/src/components/merchant/create-deal/DealScheduleStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const DealScheduleStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  // The days of the week for the recurring selection
  const weekdays = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  return (
    <OnboardingStepLayout
      title="When will your deal be available?"
      onNext={() => navigate('/merchant/deals/create/instructions')}
      onBack={() => navigate('/merchant/deals/create/offer')}
      isNextDisabled={!state.startTime || !state.endTime}
      progress={60}
    >
      <div className="space-y-6">
        {/* Start Time and End Time Inputs (No Changes Here) */}
        <div>
          <Label htmlFor="startTime" className="text-lg font-semibold">
            Start Time
          </Label>
          <p className="mb-2 text-neutral-500">
            When customers can start claiming this deal.
          </p>
          <Input
            id="startTime"
            type="datetime-local"
            value={state.startTime}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'startTime',
                value: e.target.value,
              })
            }
            className="h-14 text-lg"
          />
        </div>
        <div>
          <Label htmlFor="endTime" className="text-lg font-semibold">
            End Time
          </Label>
          <p className="mb-2 text-neutral-500">
            The deal will no longer be visible after this time.
          </p>
          <Input
            id="endTime"
            type="datetime-local"
            value={state.endTime}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_FIELD',
                field: 'endTime',
                value: e.target.value,
              })
            }
            className="h-14 text-lg"
          />
        </div>

        {/* --- THIS IS THE CHANGE --- */}
        {/* Conditionally render the recurring days selector only if the deal type is 'RECURRING' */}
        {state.dealType === 'RECURRING' && (
          <div className="animate-fade-in mt-4 rounded-lg border bg-white p-4">
            <Label className="text-lg font-semibold">Recurring Days</Label>
            <p className="mb-3 text-neutral-500">
              Select the weekdays this deal should repeat on.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {weekdays.map((day) => (
                <label
                  key={day}
                  className="inline-flex cursor-pointer items-center space-x-3 rounded-md p-2 hover:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    checked={state.recurringDays.includes(day)}
                    onChange={(e) => {
                      const updatedDays = e.target.checked
                        ? [...state.recurringDays, day]
                        : state.recurringDays.filter((d) => d !== day);
                      dispatch({
                        type: 'UPDATE_FIELD',
                        field: 'recurringDays',
                        value: updatedDays as any,
                      });
                    }}
                    className="h-5 w-5 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
                  />
                  <span className="font-medium text-neutral-700">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </OnboardingStepLayout>
  );
};

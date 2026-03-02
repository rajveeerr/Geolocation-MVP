import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';

export const BusinessInfoStep = () => {
  const { state, dispatch } = useOnboarding();
  const step = 2;

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={() => dispatch({ type: 'SET_STEP', payload: step - 1 })}
      onNext={() => dispatch({ type: 'SET_STEP', payload: step + 1 })}
      nextLabel="Next"
      nextDisabled={!state.businessName.trim()}
      nextDisabledReason="Please enter your business name to continue."
    >
      <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
            What&apos;s your business name?
          </h1>
          <p className="mt-2 text-neutral-600">
            The name customers see when they discover your deals. Short works best.
          </p>

          <div className="mt-10">
            <Label htmlFor="businessName" className="sr-only">
              Business Name
            </Label>
            <Input
              id="businessName"
              value={state.businessName}
              onChange={(e) =>
                dispatch({ type: 'SET_BUSINESS_NAME', payload: e.target.value.slice(0, 80) })
              }
              placeholder="e.g. Joe's Coffee, Maria's Taco Truck"
              className="h-16 w-full rounded-xl border-neutral-300 text-xl"
              maxLength={80}
              autoFocus
            />
            <span className="mt-2 block text-sm text-neutral-500">
              {state.businessName.length}/80
            </span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

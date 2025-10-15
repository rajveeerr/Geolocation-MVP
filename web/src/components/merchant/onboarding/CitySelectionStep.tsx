import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { useWhitelistedCities } from '@/hooks/useWhitelistedCities';
import type { City } from '@/hooks/useWhitelistedCities';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CityCard = ({ city, isSelected, onClick }: { city: City; isSelected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full text-left p-4 border-2 rounded-lg transition-all flex justify-between items-center',
      isSelected ? 'border-brand-primary-500 bg-brand-primary-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
    )}
  >
    <div>
      <p className="font-bold text-neutral-800">{city.name}</p>
      <p className="text-sm text-neutral-500">{city.state}</p>
    </div>
    {isSelected && <CheckCircle className="h-6 w-6 text-brand-primary-500" />}
  </button>
);

export const CitySelectionStep = () => {
  const { state, dispatch } = useOnboarding();
  const { data: citiesData, isLoading } = useWhitelistedCities();
  
  // Ensure we have an array
  const cities = Array.isArray(citiesData?.cities) ? citiesData.cities : [];

  return (
    <OnboardingStepLayout
      title="Where is your business located?"
      onNext={() => dispatch({ type: 'SET_STEP', payload: state.step + 1 })}
      onBack={() => {
        /* Navigate home or to previous non-onboarding page */
      }}
      isNextDisabled={!state.cityId}
      progress={10}
    >
      {isLoading && (
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      <div className="space-y-3">
        {cities?.map((city) => (
          <CityCard
            key={city.id}
            city={city}
            isSelected={state.cityId === city.id}
            onClick={() => dispatch({ type: 'SET_CITY_ID', payload: city.id })}
          />
        ))}
      </div>

      {!isLoading && (!cities || cities.length === 0) && (
        <p className="text-center text-neutral-500">No active cities found. Please check back later.</p>
      )}
    </OnboardingStepLayout>
  );
};

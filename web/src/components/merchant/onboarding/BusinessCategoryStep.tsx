import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { Home, Coffee, ShoppingBag, Beer } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Restaurant', icon: <Beer /> },
  { name: 'Cafe', icon: <Coffee /> },
  { name: 'Retail', icon: <ShoppingBag /> },
  { name: 'Other', icon: <Home /> },
];

const CategoryCard = ({ icon, name, isSelected, onClick }: any) => (
    <button onClick={onClick} className={cn("p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 transition-all", isSelected ? "border-brand-primary-600 bg-brand-primary-50" : "border-neutral-200 hover:border-neutral-400")}>
        {icon}
        <span className="font-semibold">{name}</span>
    </button>
);

export const BusinessCategoryStep = () => {
  const { state, dispatch } = useOnboarding();
  const handleNext = () => dispatch({ type: 'SET_STEP', payload: state.step + 1 });
  
  return (
    <OnboardingStepLayout
      title="Which of these best describes your place?"
      onNext={handleNext}
      onBack={() => dispatch({ type: 'SET_STEP', payload: state.step - 1 })}
  isNextDisabled={!state.businessCategory}
  progress={40}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map(cat => (
          <CategoryCard 
            key={cat.name}
            icon={cat.icon}
            name={cat.name}
            isSelected={state.businessCategory === cat.name}
            onClick={() => dispatch({ type: 'SET_BUSINESS_CATEGORY', payload: cat.name })}
          />
        ))}
      </div>
    </OnboardingStepLayout>
  );
};

// src/components/merchant/create-deal/DealOfferStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DealOfferStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  const isNextDisabled = !state.dealType || 
    (state.dealType === 'percentage' && !state.discountPercentage) ||
    (state.dealType === 'amount' && !state.discountAmount);

  return (
    <OnboardingStepLayout
      title="What kind of offer is it?"
      onNext={() => navigate('/merchant/deals/create/schedule')}
      onBack={() => navigate(-1)}
      isNextDisabled={isNextDisabled}
      progress={40}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => dispatch({ type: 'SET_DEAL_TYPE', dealType: 'percentage' })}
            className={cn(
              "p-6 rounded-lg border-2 text-left transition-all",
              state.dealType === 'percentage' 
                ? 'border-brand-primary-500 bg-brand-primary-50' 
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            )}
          >
            <Percent className="w-6 h-6 mb-2 text-brand-primary-600" />
            <p className="font-bold">Percentage Off</p>
            <p className="text-sm text-neutral-500 mt-1">e.g., 25% off total bill</p>
          </button>
          <button 
            onClick={() => dispatch({ type: 'SET_DEAL_TYPE', dealType: 'amount' })}
            className={cn(
              "p-6 rounded-lg border-2 text-left transition-all",
              state.dealType === 'amount' 
                ? 'border-brand-primary-500 bg-brand-primary-50' 
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            )}
          >
            <Minus className="w-6 h-6 mb-2 text-brand-primary-600" />
            <p className="font-bold">Fixed Amount Off</p>
            <p className="text-sm text-neutral-500 mt-1">e.g., $5 off any order</p>
          </button>
        </div>

        {state.dealType === 'percentage' && (
          <div>
            <Label htmlFor="percentage" className="text-lg font-semibold">Discount Percentage (%)</Label>
            <Input 
              id="percentage"
              type="number"
              value={state.discountPercentage || ''}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: parseInt(e.target.value) || null })}
              className="h-14 text-lg mt-2"
              placeholder="e.g., 50"
            />
          </div>
        )}

        {state.dealType === 'amount' && (
          <div>
            <Label htmlFor="amount" className="text-lg font-semibold">Discount Amount ($)</Label>
            <Input 
              id="amount"
              type="number"
              step="0.01"
              value={state.discountAmount || ''}
              onChange={(e) => dispatch({ type: 'UPDATE_FIELD', field: 'discountAmount', value: parseFloat(e.target.value) || null })}
              className="h-14 text-lg mt-2"
              placeholder="e.g., 5.00"
            />
          </div>
        )}
      </div>
    </OnboardingStepLayout>
  );
};

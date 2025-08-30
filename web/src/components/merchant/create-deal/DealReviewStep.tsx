// src/components/merchant/create-deal/DealReviewStep.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';

const ReviewItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <div className="flex justify-between border-b border-neutral-200 py-3">
    <p className="text-neutral-600">{label}</p>
    <p className="font-semibold text-neutral-800">{value || 'Not set'}</p>
  </div>
);

export const DealReviewStep = () => {
  const { state } = useDealCreation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return; // Prevent double-clicks

    try {
      setIsPublishing(true);
      console.log('Starting deal publication...', state);

      // Validate required fields
      if (!state.startTime || !state.endTime) {
        toast({
          title: 'Error',
          description: 'Start time and end time are required.',
          variant: 'destructive',
        });
        return;
      }

      // 1. Prepare payload for the API
      const payload = {
        title: state.title,
        description: state.description,
        discountPercentage:
          state.dealType === 'percentage' ? state.discountPercentage : null,
        discountAmount:
          state.dealType === 'amount' ? state.discountAmount : null,
        startTime: new Date(state.startTime).toISOString(),
        endTime: new Date(state.endTime).toISOString(),
        redemptionInstructions: state.redemptionInstructions,
      };

      console.log('API Payload:', payload);

      // 2. Make the API call
      const response = await apiPost('/deals', payload);

      console.log('API Response:', response);

      // 3. Handle the response
      if (response.success) {
        toast({
          title: 'Deal Published!',
          description: 'Your new deal is now live for customers to see.',
        });
        navigate(PATHS.MERCHANT_DASHBOARD);
      } else {
        toast({
          title: 'Error Publishing Deal',
          description: response.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in handlePublish:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish deal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <OnboardingStepLayout
      title="Ready to publish?"
      onNext={handlePublish}
      onBack={() => navigate(-1)}
      progress={100}
      isNextDisabled={isPublishing}
    >
      <div className="space-y-4">
        <p className="text-neutral-600">
          Review the details of your deal below. Once you publish, it will be
          visible to all CitySpark users.
        </p>
        <div className="rounded-lg border bg-white p-4">
          <ReviewItem label="Title" value={state.title} />
          <ReviewItem
            label="Offer"
            value={
              state.dealType === 'percentage'
                ? `${state.discountPercentage}% off`
                : `$${state.discountAmount} off`
            }
          />
          <ReviewItem
            label="Starts"
            value={new Date(state.startTime).toLocaleString()}
          />
          <ReviewItem
            label="Ends"
            value={new Date(state.endTime).toLocaleString()}
          />
        </div>
      </div>
    </OnboardingStepLayout>
  );
};

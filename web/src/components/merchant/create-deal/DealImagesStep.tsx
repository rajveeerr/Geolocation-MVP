// web/src/components/merchant/create-deal/DealImagesStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { DealImageUpload } from './DealImageUpload';

export const DealImagesStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  const handleImagesChange = (images: string[]) => {
    dispatch({
      type: 'SET_IMAGE_URLS',
      payload: images,
    });
  };

  return (
    <OnboardingStepLayout
      title="Add Images"
      subtitle="Showcase your deal with attractive images"
      onNext={() => {
        // Check if we're in bounty flow
        if (state.dealType === 'BOUNTY') {
          navigate('/merchant/deals/create/bounty/review');
        } else {
          navigate('/merchant/deals/create/schedule');
        }
      }}
      onBack={() => {
        // Check if we're in bounty flow
        if (state.dealType === 'BOUNTY') {
          navigate('/merchant/deals/create/bounty/schedule');
        } else {
          navigate('/merchant/deals/create/offer');
        }
      }}
      isNextDisabled={false} // Images are optional
      progress={state.dealType === 'BOUNTY' ? 67 : 55}
    >
      <DealImageUpload
        images={state.imageUrls || []}
        onImagesChange={handleImagesChange}
        maxImages={5}
      />
    </OnboardingStepLayout>
  );
};

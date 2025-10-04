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
      onNext={() => navigate('/merchant/deals/create/schedule')}
      onBack={() => navigate('/merchant/deals/create/offer')}
      isNextDisabled={false} // Images are optional
      progress={50}
    >
      <DealImageUpload
        images={state.imageUrls || []}
        onImagesChange={handleImagesChange}
        maxImages={5}
      />
    </OnboardingStepLayout>
  );
};

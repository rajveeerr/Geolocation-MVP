// src/pages/merchant/CreateDealPage.tsx
import { Routes, Route } from 'react-router-dom';
import { DealCreationProvider } from '@/context/DealCreationContext';
import { DealBasicsStep } from '@/components/merchant/create-deal/DealBasicsStep';
import { DealOfferStep } from '@/components/merchant/create-deal/DealOfferStep';
import { DealScheduleStep } from '@/components/merchant/create-deal/DealScheduleStep';
import { DealInstructionsStep } from '@/components/merchant/create-deal/DealInstructionsStep';
import { DealReviewStep } from '@/components/merchant/create-deal/DealReviewStep';

export const CreateDealPage = () => {
  return (
    <DealCreationProvider>
      <Routes>
        <Route index element={<DealBasicsStep />} />
        <Route path="offer" element={<DealOfferStep />} />
        <Route path="schedule" element={<DealScheduleStep />} />
        <Route path="instructions" element={<DealInstructionsStep />} />
        <Route path="review" element={<DealReviewStep />} />
      </Routes>
    </DealCreationProvider>
  );
};

// src/pages/merchant/CreateDealPage.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { DealCreationProvider } from '@/context/DealCreationContext';
import { DealInfoStep } from '@/components/merchant/create-deal';

export const DealCreatePage = () => {
  return (
    <DealCreationProvider>
      <Routes>
        {/* Default redirect to the first step */}
        <Route index element={<Navigate to="info" replace />} />
        
        {/* Step 1: Basic deal information */}
        <Route path="info" element={<DealInfoStep />} />
        
        {/* Future steps will be added here */}
        {/* <Route path="offer" element={<DealOfferStep />} /> */}
        {/* <Route path="timing" element={<DealTimingStep />} /> */}
        {/* <Route path="review" element={<DealReviewStep />} /> */}
      </Routes>
    </DealCreationProvider>
  );
};

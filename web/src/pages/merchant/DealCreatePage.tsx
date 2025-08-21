// src/pages/merchant/CreateDealPage.tsx
import { Routes, Route } from 'react-router-dom';
import { DealCreationProvider } from '@/context/DealCreationContext';
import { DealBasicsStep, DealOfferStep } from '@/components/merchant/create-deal';
// We will create the other steps next

export const CreateDealPage = () => {
  return (
    <DealCreationProvider>
      <Routes>
        <Route index element={<DealBasicsStep />} />
        <Route path="offer" element={<DealOfferStep />} />
        {/* Routes for schedule, instructions, and review will be added here */}
      </Routes>
    </DealCreationProvider>
  );
};

import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  DealCreationProvider,
  useDealCreation,
} from '@/context/DealCreationContext';
import { HappyHourProvider } from '@/context/HappyHourContext';

// Import all necessary step and page components
import { DealTypeStep } from '@/components/merchant/create-deal/DealTypeStep';
import { DealBasicsStep } from '@/components/merchant/create-deal/DealBasicsStep';
import { DealOfferStep } from '@/components/merchant/create-deal/DealOfferStep';
import { DealScheduleStep } from '@/components/merchant/create-deal/DealScheduleStep';
import { DealInstructionsStep } from '@/components/merchant/create-deal/DealInstructionsStep';
import { DealReviewStep } from '@/components/merchant/create-deal/DealReviewStep';
import { HappyHourEditorPage } from './HappyHourEditorPage';
import { AddMenuItemPage } from './AddMenuItemPage';

// This is the component for the first step. It contains the navigation logic.
const DealTypeSelector = () => {
  const navigate = useNavigate();
  const { state } = useDealCreation();

  const handleNext = () => {
    // Based on the state, navigate to the correct subsequent route
    if (state.dealType === 'HAPPY_HOUR') {
      navigate('/merchant/deals/create/happy-hour/edit');
    } else {
      // For both 'STANDARD' and 'RECURRING', start the simple flow
      navigate('/merchant/deals/create/standard/basics');
    }
  };

  return <DealTypeStep onNext={handleNext} />;
};

// This is the simple, multi-step flow for Standard and Recurring deals
const StandardDealFlow = () => (
  <DealCreationProvider>
    <Routes>
      {/* This flow now has its own nested routes */}
      <Route path="basics" element={<DealBasicsStep />} />
      <Route path="offer" element={<DealOfferStep />} />
      <Route path="schedule" element={<DealScheduleStep />} />
      <Route path="instructions" element={<DealInstructionsStep />} />
      <Route path="review" element={<DealReviewStep />} />
    </Routes>
  </DealCreationProvider>
);

// This is the new, advanced flow for Happy Hour deals
const HappyHourDealFlow = () => (
  <HappyHourProvider>
    <Routes>
      <Route path="edit" element={<HappyHourEditorPage />} />
      <Route path="add-menu" element={<AddMenuItemPage />} />
    </Routes>
  </HappyHourProvider>
);

// The main export is now the top-level router for the entire creation process
export const CreateDealPage = () => {
  return (
    <Routes>
      {/* The initial route always shows the type selector, wrapped in the basic context */}
      <Route
        index
        element={
          <DealCreationProvider>
            <DealTypeSelector />
          </DealCreationProvider>
        }
      />
      
      {/* Route group for the standard/recurring flow */}
      <Route path="standard/*" element={<StandardDealFlow />} />

      {/* Route group for the happy hour flow */}
      <Route path="happy-hour/*" element={<HappyHourDealFlow />} />
    </Routes>
  );
};

export default CreateDealPage;

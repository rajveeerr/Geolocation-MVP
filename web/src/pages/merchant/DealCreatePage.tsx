import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  DealCreationProvider,
  useDealCreation,
} from '@/context/DealCreationContext';
import { HappyHourProvider } from '@/context/HappyHourContext';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';

// Import all necessary step and page components
import { DealTypeStep } from '@/components/merchant/create-deal/DealTypeStep';
import { DealBasicsStep } from '@/components/merchant/create-deal/DealBasicsStep';
import { DealMenuStep } from '@/components/merchant/create-deal/DealMenuStep';
import { DealOfferStep } from '@/components/merchant/create-deal/DealOfferStep';
import { DealImagesStep } from '@/components/merchant/create-deal/DealImagesStep';
import { DealScheduleStep } from '@/components/merchant/create-deal/DealScheduleStep';
import { DealInstructionsStep } from '@/components/merchant/create-deal/DealInstructionsStep';
import { DealAdvancedStep } from '@/components/merchant/create-deal/DealAdvancedStep';
import { DealReviewStep } from '@/components/merchant/create-deal/DealReviewStep';
import { HappyHourEditorPage } from './HappyHourEditorPage';
import { AddMenuItemPage } from './AddMenuItemPage';

// --- THIS COMPONENT IS THE FIX ---
// It wraps the initial step and handles the navigation logic
// after a user makes their first choice.
const InitialStepHandler = () => {
    const navigate = useNavigate();
    const { state } = useDealCreation();

    const handleNext = () => {
        // Based on the deal type chosen, navigate to the correct flow's first step
        if (state.dealType === 'HAPPY_HOUR') {
            navigate('/merchant/deals/create/happy-hour/edit');
        } else {
            // For both 'STANDARD' and 'RECURRING', start the simple multi-step flow
            navigate('/merchant/deals/create/basics');
        }
    };
    
    return <DealTypeStep onNext={handleNext} />;
};

export const CreateDealPage = () => {
  return (
    <MerchantProtectedRoute fallbackMessage="Only merchants can create deals. Please sign up as a merchant to access this feature.">
      <DealCreationProvider> {/* Wrap the entire page in the main context */}
        <Routes>
          {/* The initial route always shows the type selector */}
          <Route index element={<InitialStepHandler />} />
          
          {/* --- MODIFIED: Explicit routes for the Standard/Recurring flow --- */}
          <Route path="basics" element={<DealBasicsStep />} />
          <Route path="menu" element={<DealMenuStep />} />
          <Route path="offer" element={<DealOfferStep />} />
          <Route path="images" element={<DealImagesStep />} />
          <Route path="schedule" element={<DealScheduleStep />} />
          <Route path="instructions" element={<DealInstructionsStep />} />
          <Route path="advanced" element={<DealAdvancedStep />} />
          <Route path="review" element={<DealReviewStep />} />

          {/* --- Route group for the happy hour flow --- */}
          {/* This requires its own provider for its more complex state */}
          <Route
            path="happy-hour/*"
            element={
              <HappyHourProvider>
                <Routes>
                  <Route path="edit" element={<HappyHourEditorPage />} />
                  <Route path="add-menu" element={<AddMenuItemPage />} />
                </Routes>
              </HappyHourProvider>
            }
          />
        </Routes>
      </DealCreationProvider>
    </MerchantProtectedRoute>
  );
};

export default CreateDealPage;

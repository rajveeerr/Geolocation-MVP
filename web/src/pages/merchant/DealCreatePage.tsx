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
import { DealBountyStep } from '@/components/merchant/create-deal/DealBountyStep';
import { DealBountyBasicsStep } from '@/components/merchant/create-deal/DealBountyBasicsStep';
import { DealBountyScheduleStep } from '@/components/merchant/create-deal/DealBountyScheduleStep';
import { DealHiddenStep } from '@/components/merchant/create-deal/DealHiddenStep';
import { DealRedeemNowStep } from '@/components/merchant/create-deal/DealRedeemNowStep';
import { DealLocationStep } from '@/components/merchant/create-deal/DealLocationStep';
import { DealDailyDealWeekdayStep } from '@/components/merchant/create-deal/DealDailyDealWeekdayStep';
import { DealDailyDealConfigStep } from '@/components/merchant/create-deal/DealDailyDealConfigStep';
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
        } else if (state.dealType === 'BOUNTY') {
            // Bounty deals go to bounty step first
            navigate('/merchant/deals/create/bounty');
        } else if (state.dealType === 'HIDDEN') {
            // Hidden deals go to hidden step first
            navigate('/merchant/deals/create/hidden');
        } else if (state.dealType === 'REDEEM_NOW') {
            // Redeem Now goes to dedicated redeem-now step
            navigate('/merchant/deals/create/redeem-now');
        } else if (state.dealType === 'RECURRING') {
            // Daily Deal goes directly to weekday selection
            navigate('/merchant/deals/create/daily-deal/weekdays');
        } else {
            // For 'STANDARD', start the simple multi-step flow
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
          <Route path="location" element={<DealLocationStep />} />
          <Route path="instructions" element={<DealInstructionsStep />} />
          <Route path="advanced" element={<DealAdvancedStep />} />
          <Route path="review" element={<DealReviewStep />} />
          
          {/* Deal type specific routes */}
          <Route path="bounty" element={<DealBountyStep />} />
          <Route path="bounty/basics" element={<DealBountyBasicsStep />} />
          <Route path="bounty/menu" element={<DealMenuStep />} />
          <Route path="bounty/schedule" element={<DealBountyScheduleStep />} />
          <Route path="bounty/images" element={<DealImagesStep />} />
          <Route path="bounty/review" element={<DealReviewStep />} />
          <Route path="hidden" element={<DealHiddenStep />} />
          <Route path="redeem-now" element={<DealRedeemNowStep />} />
          
          {/* Daily Deal routes */}
          <Route path="daily-deal/weekdays" element={<DealDailyDealWeekdayStep />} />
          <Route path="daily-deal/config" element={<DealDailyDealConfigStep />} />
          <Route path="daily-deal/review" element={<DealReviewStep />} />

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

import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  DealCreationProvider,
  useDealCreation,
} from '@/context/DealCreationContext';
import { HappyHourProvider } from '@/context/HappyHourContext';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { PATHS } from '@/routing/paths';

// Entry-point: keep the existing rich deal type picker as step 1.
import { DealTypeStep } from '@/components/merchant/create-deal/DealTypeStep';

// New 2- and 3-step "quick form" deal creation flows.
import { StandardDealQuickForm } from '@/components/merchant/create-deal/quick-form/StandardDealQuickForm';
import { RecurringDealQuickForm } from '@/components/merchant/create-deal/quick-form/RecurringDealQuickForm';
import { RedeemNowDealQuickForm } from '@/components/merchant/create-deal/quick-form/RedeemNowDealQuickForm';
import { BountyConfigStep } from '@/components/merchant/create-deal/quick-form/BountyConfigStep';
import { BountyDetailsStep } from '@/components/merchant/create-deal/quick-form/BountyDetailsStep';
import { HiddenConfigStep } from '@/components/merchant/create-deal/quick-form/HiddenConfigStep';
import { HiddenDetailsStep } from '@/components/merchant/create-deal/quick-form/HiddenDetailsStep';
import { BogoDealQuickForm } from '@/components/merchant/create-deal/quick-form/BogoDealQuickForm';
import { DealFinishStep } from '@/components/merchant/create-deal/quick-form/DealFinishStep';

// Happy Hour keeps its dedicated single-page editor (untouched).
import { HappyHourEditorPage } from './HappyHourEditorPage';
import { AddMenuItemPage } from './AddMenuItemPage';

const InitialStepHandler = () => {
  const navigate = useNavigate();
  const { state } = useDealCreation();

  const handleNext = () => {
    switch (state.dealType) {
      case 'HAPPY_HOUR':
        navigate('/merchant/deals/create/happy-hour/edit');
        return;
      case 'BOUNTY':
        navigate('/merchant/deals/create/bounty');
        return;
      case 'HIDDEN':
        navigate('/merchant/deals/create/hidden');
        return;
      case 'REDEEM_NOW':
        navigate('/merchant/deals/create/redeem-now');
        return;
      case 'RECURRING':
        navigate('/merchant/deals/create/daily-deal');
        return;
      case 'BOGO':
        navigate('/merchant/deals/create/bogo');
        return;
      default:
        navigate('/merchant/deals/create/standard');
    }
  };

  return <DealTypeStep onNext={handleNext} />;
};

export const CreateDealPage = () => {
  return (
    <MerchantProtectedRoute fallbackMessage="Only merchants can create deals. Please sign up as a merchant to access this feature.">
      <DealCreationProvider>
        <Routes>
          <Route index element={<InitialStepHandler />} />

          {/* New quick-form flows (Core fields → DealFinishStep with More options + Preview + Publish). */}
          <Route path="standard" element={<StandardDealQuickForm />} />
          <Route path="standard/review" element={<DealFinishStep />} />

          <Route path="daily-deal" element={<RecurringDealQuickForm />} />
          <Route path="daily-deal/review" element={<DealFinishStep />} />

          <Route path="redeem-now" element={<RedeemNowDealQuickForm />} />
          <Route path="redeem-now/review" element={<DealFinishStep />} />

          <Route path="bogo" element={<BogoDealQuickForm />} />
          <Route path="bogo/review" element={<DealFinishStep />} />

          <Route path="bounty" element={<BountyConfigStep />} />
          <Route path="bounty/details" element={<BountyDetailsStep />} />
          <Route path="bounty/review" element={<DealFinishStep />} />

          <Route path="hidden" element={<HiddenConfigStep />} />
          <Route path="hidden/details" element={<HiddenDetailsStep />} />
          <Route path="hidden/review" element={<DealFinishStep />} />

          {/* Happy Hour keeps its dedicated single-page editor. */}
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

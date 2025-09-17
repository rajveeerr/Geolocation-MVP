// web/src/pages/merchant/DealCreatePage.tsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DealCreationProvider } from '@/context/DealCreationContext';
import { DealBasicsStep } from '@/components/merchant/create-deal/DealBasicsStep';
import { DealOfferStep } from '@/components/merchant/create-deal/DealOfferStep';
import { DealScheduleStep } from '@/components/merchant/create-deal/DealScheduleStep';
import { DealInstructionsStep } from '@/components/merchant/create-deal/DealInstructionsStep';
import { DealReviewStep } from '@/components/merchant/create-deal/DealReviewStep';
import { DealTypeStep } from '@/components/merchant/create-deal/DealTypeStep';

// --- NEW: Import hooks and components for status checking ---
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { Clock } from 'lucide-react';
import { PATHS } from '@/routing/paths';

// The actual deal creation form flow
const DealCreationFlow = () => (
  <DealCreationProvider>
    <Routes>
      <Route index element={<DealTypeStep />} />
      <Route path="basics" element={<DealBasicsStep />} />
      <Route path="offer" element={<DealOfferStep />} />
      <Route path="schedule" element={<DealScheduleStep />} />
      <Route path="instructions" element={<DealInstructionsStep />} />
      <Route path="review" element={<DealReviewStep />} />
    </Routes>
  </DealCreationProvider>
);

// A new component to display the pending status message
const PendingApprovalMessage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-50">
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-neutral-900">
          Your Merchant Profile is Pending Approval
        </h1>
        <p className="mt-4 text-neutral-600">
          Our team is currently reviewing your application. This usually takes
          1-2 business days. You will be able to create deals as soon as your
          profile is approved. We'll notify you via email.
        </p>
        <Button
          onClick={() => navigate(PATHS.MERCHANT_DASHBOARD)}
          className="mt-8"
          variant="secondary"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

// --- MODIFIED: The main page component now acts as a gatekeeper ---
export const CreateDealPage = () => {
  const { data: merchantData, isLoading, error } = useMerchantStatus();

  if (isLoading) {
    return <LoadingOverlay message="Checking your merchant status..." />;
  }

  if (error) {
    // This could happen if the API fails or if the user is not a merchant at all
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl text-red-600">
          Could not verify your merchant status.
        </h2>
        <p className="text-neutral-500">
          Please try again later or contact support.
        </p>
      </div>
    );
  }

  const status = merchantData?.data?.merchant?.status;

  if (status === 'PENDING') {
    return <PendingApprovalMessage />;
  }

  if (status === 'APPROVED') {
    // If approved, show the normal deal creation flow
    return <DealCreationFlow />;
  }

  // Handle other statuses like REJECTED or if no status is found
  return (
    <div className="py-20 text-center">
      <h2 className="text-xl font-bold text-neutral-800">
        Unable to Create Deal
      </h2>
      <p className="mt-2 text-neutral-500">
        Your merchant profile is not approved for deal creation.
      </p>
      <p className="text-neutral-500">
        Current status:{' '}
        <span className="font-semibold">{status || 'Not Found'}</span>
      </p>
    </div>
  );
};

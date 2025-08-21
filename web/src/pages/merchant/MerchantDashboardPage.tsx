// src/pages/merchant/MerchantDashboardPage.tsx
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

type MerchantStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const MerchantDashboardPage = () => {
  // In a real app, you would fetch the merchant's status from an API like this:
  // const { data: merchant } = useQuery('/api/merchant/profile');
  // const merchantStatus = merchant?.status || 'PENDING';
  
  // For development/demo purposes, we simulate the status
  // In production, this would come from your API
  const merchantStatus: MerchantStatus = (() => {
    // You can change this value to test different states
    return 'APPROVED' as MerchantStatus; // Change to 'APPROVED' or 'REJECTED' to test other states
  })();

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Dashboard</h1>
        {merchantStatus === 'APPROVED' && (
          <Link to={PATHS.MERCHANT_DEALS_CREATE}>
            <Button size="lg" className="rounded-lg">Create New Deal</Button>
          </Link>
        )}
      </div>
      
      {merchantStatus === 'PENDING' && (
        <div className="p-6 rounded-lg bg-amber-100 border border-amber-200">
          <h2 className="text-xl font-bold text-amber-800">Application Pending</h2>
          <p className="text-amber-700 mt-2">
            Your application to become a merchant is currently under review. 
            We'll notify you via email once it's approved. This usually takes 1-2 business days.
          </p>
        </div>
      )}

      {merchantStatus === 'APPROVED' && (
        <div className="p-6 rounded-lg bg-green-100 border border-green-200">
          <h2 className="text-xl font-bold text-green-800">You're Approved!</h2>
          <p className="text-green-700 mt-2">
            Welcome to CitySpark! You can now start creating deals to attract new customers. Click the button above to get started.
          </p>
        </div>
      )}

      {merchantStatus === 'REJECTED' && (
        <div className="p-6 rounded-lg bg-red-100 border border-red-200">
          <h2 className="text-xl font-bold text-red-800">Application Not Approved</h2>
          <p className="text-red-700 mt-2">
            Unfortunately, your merchant application was not approved at this time. 
            Please contact our support team if you have any questions or would like to reapply.
          </p>
          <div className="mt-4 space-x-3">
            <Link to={PATHS.CONTACT}>
              <Button variant="secondary">Contact Support</Button>
            </Link>
            <Link to={PATHS.MERCHANT_ONBOARDING}>
              <Button>Reapply</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
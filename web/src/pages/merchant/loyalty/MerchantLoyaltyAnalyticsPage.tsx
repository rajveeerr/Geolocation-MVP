import { useLoyaltyAnalytics, useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';

export const MerchantLoyaltyAnalyticsPage = () => {
  const { data, isLoading, error } = useLoyaltyAnalytics();
  const { data: program } = useMerchantLoyaltyProgram();

  // Redirect to setup if program not initialized
  if (error || !program) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Loyalty Analytics</h1>
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="font-semibold text-neutral-900">No loyalty program found</h3>
          <p className="mt-2 text-neutral-600">Please initialize your loyalty program first.</p>
          <a href="/merchant/loyalty/setup" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
            Set Up Program
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">Loyalty Analytics</h1>
      {isLoading ? (
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-100" />
      ) : data ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-500">Issued Points</div>
            <div className="text-2xl font-bold">{data.analytics.points.issued}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-500">Redeemed Points</div>
            <div className="text-2xl font-bold">{data.analytics.points.redeemed}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-500">Outstanding Points</div>
            <div className="text-2xl font-bold">{data.analytics.points.outstanding}</div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">No analytics available.</div>
      )}
    </div>
  );
};

export default MerchantLoyaltyAnalyticsPage;



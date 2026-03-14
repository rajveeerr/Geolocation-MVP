import { useLoyaltyAnalytics, useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { MerchantLoyaltyLayout, MerchantLoyaltyProgramMissingState } from '@/components/merchant/loyalty/MerchantLoyaltyLayout';

export const MerchantLoyaltyAnalyticsPage = () => {
  const { data, isLoading, error } = useLoyaltyAnalytics();
  const { data: program } = useMerchantLoyaltyProgram();

  if (error || !program?.program) {
    return (
      <MerchantLoyaltyLayout title="Loyalty Analytics" subtitle="Track points movement, user adoption, and redemption impact.">
        <MerchantLoyaltyProgramMissingState />
      </MerchantLoyaltyLayout>
    );
  }

  const analytics = data?.analytics;

  return (
    <MerchantLoyaltyLayout title="Loyalty Analytics" subtitle="Track points movement, user adoption, and redemption impact.">
      {isLoading ? (
        <div className="grid gap-4">
          <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
          <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      ) : analytics ? (
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-500">Issued Points</div>
              <div className="text-2xl font-bold">{analytics.points.issued}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-500">Redeemed Points</div>
              <div className="text-2xl font-bold">{analytics.points.redeemed}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-500">Outstanding Points</div>
              <div className="text-2xl font-bold">{analytics.points.outstanding}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-500">Total Users</div>
              <div className="text-2xl font-bold">{analytics.users.total}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-500">Active Users</div>
              <div className="text-2xl font-bold">{analytics.users.active}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-500">Total Discount Value</div>
              <div className="text-2xl font-bold">${analytics.discounts.totalValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-900">Program Snapshot</h3>
              <div className="mt-3 grid gap-2 text-sm text-neutral-700">
                <div className="flex justify-between"><span>Status</span><span className="font-semibold">{analytics.program.isActive ? 'Active' : 'Inactive'}</span></div>
                <div className="flex justify-between"><span>Points per $1</span><span className="font-semibold">{analytics.program.pointsPerDollar}</span></div>
                <div className="flex justify-between"><span>Minimum redemption</span><span className="font-semibold">{analytics.program.minimumRedemption} pts</span></div>
                <div className="flex justify-between"><span>Redemption value</span><span className="font-semibold">${analytics.program.redemptionValue}</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-900">Recent Redemptions</h3>
              {analytics.recentRedemptions.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-600">No recent redemptions yet.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                  {analytics.recentRedemptions.slice(0, 5).map((item: any, idx: number) => (
                    <li key={idx} className="rounded-md border border-neutral-200 p-2">
                      {item.description || `Redemption #${item.id || idx + 1}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">No analytics available.</div>
      )}
    </MerchantLoyaltyLayout>
  );
};

export default MerchantLoyaltyAnalyticsPage;



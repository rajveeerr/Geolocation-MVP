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
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : analytics ? (
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Issued Points</div>
              <div className="text-2xl font-bold">{analytics.points.issued}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Redeemed Points</div>
              <div className="text-2xl font-bold">{analytics.points.redeemed}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Outstanding Points</div>
              <div className="text-2xl font-bold">{analytics.points.outstanding}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-2xl font-bold">{analytics.users.total}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Active Users</div>
              <div className="text-2xl font-bold">{analytics.users.active}</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total Discount Value</div>
              <div className="text-2xl font-bold">${analytics.discounts.totalValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Program Snapshot</h3>
              <div className="mt-3 grid gap-2 text-sm text-foreground">
                <div className="flex justify-between"><span>Status</span><span className="font-semibold">{analytics.program.isActive ? 'Active' : 'Inactive'}</span></div>
                <div className="flex justify-between"><span>Points per $1</span><span className="font-semibold">{analytics.program.pointsPerDollar}</span></div>
                <div className="flex justify-between"><span>Minimum redemption</span><span className="font-semibold">{analytics.program.minimumRedemption} pts</span></div>
                <div className="flex justify-between"><span>Redemption value</span><span className="font-semibold">${analytics.program.redemptionValue}</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground">Recent Redemptions</h3>
              {analytics.recentRedemptions.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No recent redemptions yet.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {analytics.recentRedemptions.slice(0, 5).map((item: any, idx: number) => (
                    <li key={idx} className="rounded-md border border-border p-2">
                      {item.description || `Redemption #${item.id || idx + 1}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted p-4 text-muted-foreground">No analytics available.</div>
      )}
    </MerchantLoyaltyLayout>
  );
};

export default MerchantLoyaltyAnalyticsPage;



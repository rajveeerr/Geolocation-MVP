import { useLoyaltyCustomers, useAdjustLoyaltyPoints, useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { Fragment, useState } from 'react';
import { MerchantLoyaltyLayout, MerchantLoyaltyProgramMissingState } from '@/components/merchant/loyalty/MerchantLoyaltyLayout';
import { useToast } from '@/hooks/use-toast';

export const MerchantLoyaltyCustomersPage = () => {
  const { data: program, error: programError } = useMerchantLoyaltyProgram();
  const { toast } = useToast();
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState('currentBalance');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useLoyaltyCustomers(limit, offset, sortBy, order);
  const adjust = useAdjustLoyaltyPoints();
  const [adjustingUserId, setAdjustingUserId] = useState<number | null>(null);
  const [adjustPoints, setAdjustPoints] = useState(10);
  const [reason, setReason] = useState('Manual bonus');
  const [adjustType, setAdjustType] = useState<'BONUS' | 'ADJUSTED' | 'REFUNDED'>('BONUS');

  if (programError || !program?.program) {
    return (
      <MerchantLoyaltyLayout title="Loyalty Customers" subtitle="See each member’s points health and apply manual adjustments when needed.">
        <MerchantLoyaltyProgramMissingState />
      </MerchantLoyaltyLayout>
    );
  }

  const total = data?.pagination.total || 0;
  const hasMore = data?.pagination.hasMore || false;

  return (
    <MerchantLoyaltyLayout
      title="Loyalty Customers"
      subtitle="See each member’s points health and apply manual adjustments when needed."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setOffset(0);
          }}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
        >
          <option value="currentBalance">Sort: Current Balance</option>
          <option value="lifetimeEarned">Sort: Lifetime Earned</option>
          <option value="lifetimeRedeemed">Sort: Lifetime Redeemed</option>
          <option value="lastEarnedAt">Sort: Last Earned</option>
        </select>
        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value as 'asc' | 'desc');
            setOffset(0);
          }}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
        >
          <option value="desc">Order: Descending</option>
          <option value="asc">Order: Ascending</option>
        </select>
        <span className="ml-auto text-sm text-neutral-600">Total customers: {total}</span>
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
      ) : !data || data.customers.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">No customers found.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Customer</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Balance</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Lifetime</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {data.customers.map((c) => (
                <Fragment key={c.userId}>
                  <tr>
                    <td className="px-4 py-2">{c.userName} <div className="text-xs text-neutral-500">{c.userEmail}</div></td>
                    <td className="px-4 py-2 font-semibold">{c.currentBalance} pts</td>
                    <td className="px-4 py-2 text-sm text-neutral-600">Earned {c.lifetimeEarned} · Redeemed {c.lifetimeRedeemed}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                        onClick={() => {
                          setAdjustingUserId(adjustingUserId === c.userId ? null : c.userId);
                          setAdjustPoints(10);
                          setReason('Manual bonus');
                          setAdjustType('BONUS');
                        }}
                      >
                        {adjustingUserId === c.userId ? 'Close' : 'Adjust points'}
                      </button>
                    </td>
                  </tr>
                  {adjustingUserId === c.userId && (
                    <tr>
                      <td className="px-4 pb-4" colSpan={4}>
                        <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-3">
                          <div className="grid gap-2 sm:grid-cols-4">
                            <input
                              className="rounded-md border border-neutral-300 p-2 text-sm"
                              type="number"
                              min={1}
                              value={adjustPoints}
                              onChange={(e) => setAdjustPoints(Number(e.target.value || 0))}
                              placeholder="Points"
                            />
                            <select className="rounded-md border border-neutral-300 p-2 text-sm" value={adjustType} onChange={(e) => setAdjustType(e.target.value as 'BONUS' | 'ADJUSTED' | 'REFUNDED')}>
                              <option value="BONUS">Bonus</option>
                              <option value="ADJUSTED">Adjusted</option>
                              <option value="REFUNDED">Refunded</option>
                            </select>
                            <input
                              className="rounded-md border border-neutral-300 p-2 text-sm sm:col-span-2"
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="Reason"
                            />
                          </div>
                          <div className="mt-2 flex justify-end gap-2">
                            <button type="button" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm" onClick={() => setAdjustingUserId(null)}>
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                              disabled={adjust.isPending}
                              onClick={() => {
                                if (adjustPoints <= 0 || !reason.trim()) {
                                  toast({ title: 'Invalid adjustment', description: 'Add points and reason.', variant: 'destructive' });
                                  return;
                                }
                                adjust.mutate(
                                  { userId: c.userId, points: adjustPoints, reason: reason.trim(), type: adjustType },
                                  {
                                    onSuccess: () => {
                                      toast({ title: 'Points updated' });
                                      setAdjustingUserId(null);
                                    },
                                    onError: (err) => toast({ title: 'Update failed', description: (err as Error).message, variant: 'destructive' }),
                                  },
                                );
                              }}
                            >
                              {adjust.isPending ? 'Saving...' : 'Apply adjustment'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && data && data.customers.length > 0 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={offset === 0}
            onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50"
            disabled={!hasMore}
            onClick={() => setOffset((prev) => prev + limit)}
          >
            Next
          </button>
        </div>
      )}
    </MerchantLoyaltyLayout>
  );
};

export default MerchantLoyaltyCustomersPage;



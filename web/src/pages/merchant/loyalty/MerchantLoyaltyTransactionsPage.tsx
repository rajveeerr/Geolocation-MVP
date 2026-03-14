import { useMerchantLoyaltyTransactions, useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { useState } from 'react';
import { MerchantLoyaltyLayout, MerchantLoyaltyProgramMissingState } from '@/components/merchant/loyalty/MerchantLoyaltyLayout';

export const MerchantLoyaltyTransactionsPage = () => {
  const { data: program, error: programError } = useMerchantLoyaltyProgram();
  const [type, setType] = useState<string>('');
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useMerchantLoyaltyTransactions(limit, offset, type || undefined);

  if (programError || !program?.program) {
    return (
      <MerchantLoyaltyLayout title="Loyalty Transactions" subtitle="Audit every points movement and its before/after balance impact.">
        <MerchantLoyaltyProgramMissingState />
      </MerchantLoyaltyLayout>
    );
  }

  const hasMore = data?.hasMore || false;

  return (
    <MerchantLoyaltyLayout title="Loyalty Transactions" subtitle="Audit every points movement and its before/after balance impact.">
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setOffset(0);
          }}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
        >
          <option value="">All types</option>
          <option value="EARNED">Earned</option>
          <option value="REDEEMED">Redeemed</option>
          <option value="BONUS">Bonus</option>
          <option value="ADJUSTED">Adjusted</option>
          <option value="REFUNDED">Refunded</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <span className="ml-auto text-sm text-neutral-600">Total records: {data?.total || 0}</span>
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
      ) : !data || data.transactions.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">No transactions found.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Time</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Points</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Balance</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-neutral-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {data.transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-2 text-sm text-neutral-600">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm">{tx.type}</td>
                  <td className={`px-4 py-2 font-semibold ${tx.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.points >= 0 ? `+${tx.points}` : tx.points}</td>
                  <td className="px-4 py-2 text-sm">{tx.balanceBefore} → {tx.balanceAfter}</td>
                  <td className="px-4 py-2 text-sm text-neutral-700">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && data && data.transactions.length > 0 && (
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

export default MerchantLoyaltyTransactionsPage;



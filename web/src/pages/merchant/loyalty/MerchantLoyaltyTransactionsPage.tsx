import { useMerchantLoyaltyTransactions, useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { Link } from 'react-router-dom';

export const MerchantLoyaltyTransactionsPage = () => {
  const { data: program } = useMerchantLoyaltyProgram();
  const { data, isLoading, error } = useMerchantLoyaltyTransactions();

  if (error || !program) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Loyalty Transactions</h1>
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="font-semibold text-neutral-900">No loyalty program found</h3>
          <p className="mt-2 text-neutral-600">Please initialize your loyalty program first.</p>
          <Link to="/merchant/loyalty/setup" className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
            Set Up Program
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">Loyalty Transactions</h1>
      {isLoading ? (
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-100" />
      ) : !data || data.transactions.length === 0 ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">No transactions found.</div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
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
    </div>
  );
};

export default MerchantLoyaltyTransactionsPage;



import { useMemo, useState } from 'react';
import { useLoyaltyBalances, useLoyaltyTransactions } from '@/hooks/useLoyalty';

export const LoyaltyHistoryPage = () => {
  const { balancesResponse } = useLoyaltyBalances();
  const merchants = balancesResponse?.balances || [];

  const [selectedMerchantIndex, setSelectedMerchantIndex] = useState(0);
  const selectedMerchantId = useMemo(() => {
    return merchants[selectedMerchantIndex]?.merchantId || 0;
  }, [merchants, selectedMerchantIndex]);

  const { transactionsResponse, isLoading } = useLoyaltyTransactions(selectedMerchantId, 50, 0);

  return (
    <div className="min-h-screen bg-neutral-50 pt-24">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Loyalty History</h1>
        <p className="mt-1 text-neutral-600">View your points earned and redeemed by merchant.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {merchants.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">
            No loyalty activity yet.
          </div>
        ) : (
          merchants.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedMerchantIndex(idx)}
              className={`rounded-full px-3 py-1 text-sm font-semibold shadow-sm border ${
                idx === selectedMerchantIndex
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
              aria-pressed={idx === selectedMerchantIndex}
            >
              {m.merchantName}
            </button>
          ))
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-bold text-neutral-900">Transactions</h2>
        {isLoading ? (
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-100" />
        ) : !transactionsResponse || transactionsResponse.transactions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">
            No transactions to display.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-200">
            {transactionsResponse.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{tx.description}</div>
                  <div className="text-xs text-neutral-500">{new Date(tx.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${tx.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                  </div>
                  <div className="text-xs text-neutral-500">{tx.balanceBefore} → {tx.balanceAfter}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
};

export default LoyaltyHistoryPage;



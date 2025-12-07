import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useLoyaltyBalances } from '@/hooks/useLoyalty';

export const LoyaltyWallet = () => {
  const { balancesResponse, totalPoints, isLoading } = useLoyaltyBalances();

  if (isLoading) {
    return <div className="h-36 w-full animate-pulse rounded-xl bg-neutral-100" />;
  }

  const balances = balancesResponse?.balances || [];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Your Loyalty Wallet</h3>
          <p className="text-neutral-600">Total points across merchants</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-500">Total points</p>
          <p className="text-base font-semibold text-neutral-800">{totalPoints}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {balances.length === 0 ? (
          <div className="col-span-full rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center text-neutral-600">
            No loyalty points yet. Start earning by ordering with participating merchants.
          </div>
        ) : (
          balances.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-3">
                {b.merchantLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.merchantLogo} alt={b.merchantName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-neutral-200" />
                )}
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{b.merchantName}</div>
                  <div className="text-xs text-neutral-500">Lifetime {b.lifetimeEarned} · Redeemed {b.lifetimeRedeemed}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-neutral-900">{b.currentBalance} pts</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <Link
          to={PATHS.LOYALTY_HISTORY}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm hover:bg-neutral-100"
        >
          View transaction history
        </Link>
      </div>
    </div>
  );
};



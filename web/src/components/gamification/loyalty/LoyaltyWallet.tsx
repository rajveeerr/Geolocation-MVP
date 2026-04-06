import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useLoyaltyBalances } from '@/hooks/useLoyalty';

export const LoyaltyWallet = () => {
  const { balancesResponse, totalPoints, isLoading } = useLoyaltyBalances();

  if (isLoading) {
    return (
      <div className="h-36 w-full animate-pulse rounded-[1.75rem] bg-neutral-100/80" />
    );
  }

  const balances = balancesResponse?.balances || [];

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
            Loyalty
          </p>
          <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-neutral-950">
            Your Loyalty Wallet
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            Total points across merchants
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-black/[0.03] px-5 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] sm:min-w-40 sm:text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Total points
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-900">
            {totalPoints}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {balances.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-black/5 bg-black/[0.03] p-4 text-center text-neutral-600">
            No loyalty points yet. Start earning by ordering with participating
            merchants.
          </div>
        ) : (
          balances.map((b, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              <div className="flex items-center gap-3">
                {b.merchantLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.merchantLogo}
                    alt={b.merchantName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-neutral-200" />
                )}
                <div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {b.merchantName}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Lifetime {b.lifetimeEarned} · Redeemed {b.lifetimeRedeemed}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-neutral-900">
                  {b.currentBalance} pts
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <Link
          to={PATHS.LOYALTY_HISTORY}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/85 px-4 py-2 text-xs font-medium text-neutral-800 shadow-[0_10px_25px_rgba(15,23,42,0.08)] backdrop-blur transition-colors hover:bg-white"
        >
          View transaction history
        </Link>
      </div>
    </div>
  );
};

import { useInitializeLoyaltyProgram, useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { useState } from 'react';

export const MerchantLoyaltySetupPage = () => {
  const { data } = useMerchantLoyaltyProgram();
  const init = useInitializeLoyaltyProgram();
  const [pointsPerDollar, setPointsPerDollar] = useState(0.4);
  const [minimumRedemption, setMinimumRedemption] = useState(25);
  const [redemptionValue, setRedemptionValue] = useState(5);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    init.mutate({ pointsPerDollar, minimumRedemption, redemptionValue });
  };

  if (data?.program) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Loyalty Program</h1>
        <p className="mt-2 text-neutral-600">Program already initialized.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">Initialize Loyalty Program</h1>
      <form onSubmit={onSubmit} className="mt-4 grid max-w-lg gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-neutral-700">Points per $1</span>
          <input className="rounded-md border border-neutral-300 p-2" type="number" step="0.1" value={pointsPerDollar} onChange={(e) => setPointsPerDollar(Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-neutral-700">Minimum Redemption (points)</span>
          <input className="rounded-md border border-neutral-300 p-2" type="number" value={minimumRedemption} onChange={(e) => setMinimumRedemption(Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-neutral-700">Redemption Value ($)</span>
          <input className="rounded-md border border-neutral-300 p-2" type="number" step="0.5" value={redemptionValue} onChange={(e) => setRedemptionValue(Number(e.target.value))} />
        </label>
        <button className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50" disabled={init.isPending}>
          {init.isPending ? 'Initializing...' : 'Initialize'}
        </button>
      </form>
    </div>
  );
};

export default MerchantLoyaltySetupPage;



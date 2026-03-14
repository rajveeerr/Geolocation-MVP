import { useInitializeLoyaltyProgram, useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MerchantLoyaltyLayout } from '@/components/merchant/loyalty/MerchantLoyaltyLayout';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';

export const MerchantLoyaltySetupPage = () => {
  const { data } = useMerchantLoyaltyProgram();
  const init = useInitializeLoyaltyProgram();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pointsPerDollar, setPointsPerDollar] = useState(0.4);
  const [minimumRedemption, setMinimumRedemption] = useState(25);
  const [redemptionValue, setRedemptionValue] = useState(5);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pointsPerDollar <= 0 || minimumRedemption <= 0 || redemptionValue <= 0) {
      toast({
        title: 'Invalid values',
        description: 'All values must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    init.mutate(
      { pointsPerDollar, minimumRedemption, redemptionValue },
      {
        onSuccess: () => {
          toast({ title: 'Loyalty program initialized' });
          navigate(PATHS.MERCHANT_LOYALTY_PROGRAM);
        },
        onError: (error) => {
          toast({ title: 'Setup failed', description: (error as Error).message, variant: 'destructive' });
        },
      },
    );
  };

  if (data?.program) {
    return (
      <MerchantLoyaltyLayout
        title="Loyalty Setup"
        subtitle="Your program is already configured. You can still review key rules below."
      >
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-neutral-900">Program already initialized</h3>
          <p className="mt-1 text-sm text-neutral-600">Use Program settings to update earning and redemption rules anytime.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Points per $1</p>
              <p className="text-lg font-bold text-neutral-900">{data.program.pointsPerDollar}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Minimum redemption</p>
              <p className="text-lg font-bold text-neutral-900">{data.program.minimumRedemption} pts</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Redemption value</p>
              <p className="text-lg font-bold text-neutral-900">${data.program.redemptionValue}</p>
            </div>
          </div>

          <Link to={PATHS.MERCHANT_LOYALTY_PROGRAM} className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">
            Go to Program Settings
          </Link>
        </div>
      </MerchantLoyaltyLayout>
    );
  }

  return (
    <MerchantLoyaltyLayout
      title="Loyalty Setup"
      subtitle="Configure your earn and redeem rules once. You can tweak them later from Program settings."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Initialize Program</h2>
          <p className="mt-1 text-sm text-neutral-600">These values directly power backend points calculations and redemption checks.</p>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">Points per $1 spent</span>
              <input className="rounded-md border border-neutral-300 p-2" type="number" step="0.1" min="0.1" value={pointsPerDollar} onChange={(e) => setPointsPerDollar(Number(e.target.value))} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">Minimum redemption (points)</span>
              <input className="rounded-md border border-neutral-300 p-2" type="number" min="1" value={minimumRedemption} onChange={(e) => setMinimumRedemption(Number(e.target.value))} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">Redemption value ($)</span>
              <input className="rounded-md border border-neutral-300 p-2" type="number" min="0.5" step="0.5" value={redemptionValue} onChange={(e) => setRedemptionValue(Number(e.target.value))} />
            </label>
          </div>

          <button className="mt-5 rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50" disabled={init.isPending}>
            {init.isPending ? 'Initializing...' : 'Initialize Loyalty Program'}
          </button>
        </form>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="text-lg font-semibold text-neutral-900">Live Preview</h3>
          <p className="mt-1 text-sm text-neutral-600">For a $100 bill:</p>
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-600">Customer earns</p>
            <p className="text-2xl font-bold text-neutral-900">{Math.floor(100 * pointsPerDollar)} points</p>
          </div>
          <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-600">First redemption unlocks at</p>
            <p className="text-2xl font-bold text-neutral-900">{minimumRedemption} points = ${redemptionValue}</p>
          </div>
        </div>
      </div>
    </MerchantLoyaltyLayout>
  );
};

export default MerchantLoyaltySetupPage;



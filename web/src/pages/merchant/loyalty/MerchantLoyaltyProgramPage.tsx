import { useMerchantLoyaltyProgram, useSetProgramStatus, useUpdateLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MerchantLoyaltyLayout, MerchantLoyaltyProgramMissingState } from '@/components/merchant/loyalty/MerchantLoyaltyLayout';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';

export const MerchantLoyaltyProgramPage = () => {
  const { data, error } = useMerchantLoyaltyProgram();
  const update = useUpdateLoyaltyProgram();
  const setStatus = useSetProgramStatus();
  const { toast } = useToast();
  const [pointsPerDollar, setPointsPerDollar] = useState<number | ''>(data?.program?.pointsPerDollar ?? '');
  const [minimumRedemption, setMinimumRedemption] = useState<number | ''>(data?.program?.minimumRedemption ?? '');
  const [redemptionValue, setRedemptionValue] = useState<number | ''>(data?.program?.redemptionValue ?? '');

  useEffect(() => {
    if (data?.program) {
      setPointsPerDollar(data.program.pointsPerDollar);
      setMinimumRedemption(data.program.minimumRedemption);
      setRedemptionValue(data.program.redemptionValue);
    }
  }, [data]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      pointsPerDollar === '' ||
      minimumRedemption === '' ||
      redemptionValue === '' ||
      Number(pointsPerDollar) <= 0 ||
      Number(minimumRedemption) <= 0 ||
      Number(redemptionValue) <= 0
    ) {
      toast({ title: 'Invalid settings', description: 'All values must be greater than 0.', variant: 'destructive' });
      return;
    }

    update.mutate(
      {
        pointsPerDollar: Number(pointsPerDollar),
        minimumRedemption: Number(minimumRedemption),
        redemptionValue: Number(redemptionValue),
      },
      {
        onSuccess: () => toast({ title: 'Program updated' }),
        onError: (err) => toast({ title: 'Update failed', description: (err as Error).message, variant: 'destructive' }),
      },
    );
  };

  if (error || !data?.program) {
    return (
      <MerchantLoyaltyLayout title="Program Settings" subtitle="Control earn/redeem rules and activation status.">
        <MerchantLoyaltyProgramMissingState />
      </MerchantLoyaltyLayout>
    );
  }

  return (
    <MerchantLoyaltyLayout
      title="Program Settings"
      subtitle="Update how customers earn points and redeem value at checkout."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Rules</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${data.program.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
              {data.program.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <form onSubmit={onSave} className="grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">Points per $1</span>
              <input className="rounded-md border border-neutral-300 p-2" type="number" step="0.1" min="0.1" value={pointsPerDollar} onChange={(e) => setPointsPerDollar(e.target.value === '' ? '' : Number(e.target.value))} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">Minimum Redemption (points)</span>
              <input className="rounded-md border border-neutral-300 p-2" type="number" min="1" value={minimumRedemption} onChange={(e) => setMinimumRedemption(e.target.value === '' ? '' : Number(e.target.value))} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-neutral-700">Redemption Value ($)</span>
              <input className="rounded-md border border-neutral-300 p-2" type="number" min="0.5" step="0.5" value={redemptionValue} onChange={(e) => setRedemptionValue(e.target.value === '' ? '' : Number(e.target.value))} />
            </label>
            <button className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="text-sm font-semibold text-neutral-900">Program Control</h3>
          <p className="mt-1 text-sm text-neutral-600">Pause earning and redemption at merchant level without losing customer balances.</p>
          <button
            type="button"
            className="mt-4 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold"
            onClick={() => {
              setStatus.mutate(
                { isActive: !data.program.isActive },
                {
                  onSuccess: () => toast({ title: `Program ${data.program.isActive ? 'deactivated' : 'activated'}` }),
                  onError: (err) => toast({ title: 'Status update failed', description: (err as Error).message, variant: 'destructive' }),
                },
              );
            }}
            disabled={setStatus.isPending}
          >
            {setStatus.isPending ? 'Updating...' : data.program.isActive ? 'Deactivate Program' : 'Activate Program'}
          </button>

          <Link to={PATHS.MERCHANT_LOYALTY_ANALYTICS} className="mt-3 inline-block text-sm font-medium text-brand-primary-600 hover:underline">
            View analytics →
          </Link>
        </div>
      </div>
    </MerchantLoyaltyLayout>
  );
};

export default MerchantLoyaltyProgramPage;



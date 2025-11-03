import { useMerchantLoyaltyProgram, useSetProgramStatus, useUpdateLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const MerchantLoyaltyProgramPage = () => {
  const { data, error } = useMerchantLoyaltyProgram();
  const update = useUpdateLoyaltyProgram();
  const setStatus = useSetProgramStatus();
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
    update.mutate({
      ...(pointsPerDollar !== '' ? { pointsPerDollar: Number(pointsPerDollar) } : {}),
      ...(minimumRedemption !== '' ? { minimumRedemption: Number(minimumRedemption) } : {}),
      ...(redemptionValue !== '' ? { redemptionValue: Number(redemptionValue) } : {}),
    });
  };

  if (error || !data?.program) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Loyalty Program Settings</h1>
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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900">Loyalty Program Settings</h1>
      <div className="mt-2 text-neutral-600">Status: {data?.program?.isActive ? 'Active' : 'Inactive'}</div>
      <div className="mt-4 flex items-center gap-2">
        <button className="rounded-md border border-neutral-300 px-3 py-1" onClick={() => setStatus.mutate({ isActive: true })}>Activate</button>
        <button className="rounded-md border border-neutral-300 px-3 py-1" onClick={() => setStatus.mutate({ isActive: false })}>Deactivate</button>
      </div>
      <form onSubmit={onSave} className="mt-6 grid max-w-lg gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-neutral-700">Points per $1</span>
          <input className="rounded-md border border-neutral-300 p-2" type="number" step="0.1" value={pointsPerDollar} onChange={(e) => setPointsPerDollar(e.target.value === '' ? '' : Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-neutral-700">Minimum Redemption (points)</span>
          <input className="rounded-md border border-neutral-300 p-2" type="number" value={minimumRedemption} onChange={(e) => setMinimumRedemption(e.target.value === '' ? '' : Number(e.target.value))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-neutral-700">Redemption Value ($)</span>
          <input className="rounded-md border border-neutral-300 p-2" type="number" step="0.5" value={redemptionValue} onChange={(e) => setRedemptionValue(e.target.value === '' ? '' : Number(e.target.value))} />
        </label>
        <button className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50" disabled={update.isPending}>
          {update.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default MerchantLoyaltyProgramPage;



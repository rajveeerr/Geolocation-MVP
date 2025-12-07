import { useLoyaltyCustomers, useAdjustLoyaltyPoints, useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const MerchantLoyaltyCustomersPage = () => {
  const { data: program } = useMerchantLoyaltyProgram();
  const { data, isLoading, error } = useLoyaltyCustomers();
  const adjust = useAdjustLoyaltyPoints();
  const [adjustPoints, setAdjustPoints] = useState(10);
  const [reason, setReason] = useState('Bonus points');

  if (error || !program) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900">Loyalty Customers</h1>
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
      <h1 className="text-2xl font-bold text-neutral-900">Loyalty Customers</h1>
      {isLoading ? (
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-100" />
      ) : !data || data.customers.length === 0 ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">No customers found.</div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
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
                <tr key={c.userId}>
                  <td className="px-4 py-2">{c.userName} <div className="text-xs text-neutral-500">{c.userEmail}</div></td>
                  <td className="px-4 py-2 font-semibold">{c.currentBalance} pts</td>
                  <td className="px-4 py-2 text-sm text-neutral-600">Earned {c.lifetimeEarned} · Redeemed {c.lifetimeRedeemed}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <input className="w-24 rounded-md border border-neutral-300 p-1 text-sm" type="number" value={adjustPoints} onChange={(e) => setAdjustPoints(Number(e.target.value))} />
                      <input className="w-48 rounded-md border border-neutral-300 p-1 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} />
                      <button className="rounded-md border border-neutral-300 px-2 py-1 text-sm" onClick={() => adjust.mutate({ userId: c.userId, points: adjustPoints, reason, type: 'BONUS' })}>Award</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MerchantLoyaltyCustomersPage;



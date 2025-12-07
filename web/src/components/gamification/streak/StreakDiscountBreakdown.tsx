import { useState } from 'react';
import { useStreakDiscount } from '@/hooks/useStreak';

export const StreakDiscountBreakdown = ({ defaultAmount = 50 }: { defaultAmount?: number }) => {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const { mutateAsync, data, isPending } = useStreakDiscount();

  const calculate = async () => {
    if (!amount || amount <= 0) return;
    await mutateAsync(amount);
  };

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-neutral-900">Streak Discount Preview</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-24 rounded-md border border-neutral-300 px-2 py-1 text-sm"
          />
          <button
            onClick={calculate}
            className="rounded-md bg-neutral-900 px-3 py-1 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? '...' : 'Calculate'}
          </button>
        </div>
      </div>
      <p className="mt-1 text-xs text-neutral-500">Enter your order subtotal to preview how your streak discount will be applied. You can’t set the discount — it’s based on your streak.</p>

      {data && (
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>${data.originalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>Streak Discount ({data.discountPercent}%)</span>
            <span>- ${data.discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold text-neutral-900">
            <span>Total</span>
            <span>${data.finalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};



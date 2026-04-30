import { useState } from 'react';
import { useStreakDiscount } from '@/hooks/useStreak';

export const StreakDiscountBreakdown = ({
  defaultAmount = 50,
}: {
  defaultAmount?: number;
}) => {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const { mutateAsync, data, isPending } = useStreakDiscount();

  const calculate = async () => {
    if (!amount || amount <= 0) return;
    await mutateAsync(amount);
  };

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
            Calculator
          </p>
          <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
            Streak Discount Preview
          </h4>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <input
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="h-11 w-28 rounded-full border border-transparent bg-white px-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-black/10"
          />
          <button
            onClick={calculate}
            className="h-11 rounded-full bg-neutral-950 px-5 text-sm font-medium text-white shadow-[0_10px_30px_rgba(15,23,42,0.22)] disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? '...' : 'Calculate'}
          </button>
        </div>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
        Enter your order subtotal to preview how your streak discount will be
        applied. You can't set the discount, it's based on your streak.
      </p>

      {data && (
        <div className="mt-6 space-y-3 rounded-[1.5rem] border border-black/5 bg-black/[0.025] p-5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span>
            <span>${data.originalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-900">
            <span>Streak Discount ({data.discountPercent}%)</span>
            <span>- ${data.discountAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold text-neutral-950">
            <span>Total</span>
            <span>${data.finalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

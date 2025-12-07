import { useEffect, useState } from 'react';
import { useCalculateRedemption, useRedemptionOptions, useValidateRedemption } from '@/hooks/useLoyalty';

type Props = {
  merchantId: number;
  orderAmount: number;
  onApply: (payload: { pointsToRedeem: number; discountValue: number }) => void;
  onRemove?: () => void;
};

export const LoyaltyRedemptionWidget = ({ merchantId, orderAmount, onApply, onRemove }: Props) => {
  const { options, currentBalance, isLoading } = useRedemptionOptions(merchantId);
  const validate = useValidateRedemption();
  const calc = useCalculateRedemption();
  const [selectedPoints, setSelectedPoints] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [selectedPoints]);

  const handleApply = async () => {
    if (!selectedPoints) return;
    setError(null);
    try {
      const validation = await validate.mutateAsync({ merchantId, points: selectedPoints, orderAmount });
      if (!validation?.data?.validation?.valid) {
        setError(validation?.data?.validation?.error || 'Redemption not valid for this order amount');
        return;
      }
      const calcRes = await calc.mutateAsync({ merchantId, points: selectedPoints });
      const d = calcRes.data.calculation;
      onApply({ pointsToRedeem: d.pointsToRedeem, discountValue: d.discountValue });
    } catch (e: any) {
      setError(e?.message || 'Failed to apply redemption');
    }
  };

  if (isLoading) {
    return <div className="h-16 w-full animate-pulse rounded-xl bg-neutral-100" />;
  }

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-900">Redeem Loyalty Points</div>
          <div className="text-xs text-neutral-500">Balance: {currentBalance} pts</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((tier) => (
          <button
            key={tier.points}
            disabled={!tier.available}
            onClick={() => setSelectedPoints(tier.points)}
            className={`rounded-full px-3 py-1 text-sm font-semibold shadow-sm border ${
              selectedPoints === tier.points
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : tier.available
                ? 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                : 'border-neutral-200 bg-neutral-50 text-neutral-400'
            }`}
            aria-pressed={selectedPoints === tier.points}
            title={tier.available ? `${tier.points} points = $${tier.value} off` : `Need ${tier.pointsNeeded} more points`}
          >
            {tier.points} pts • ${tier.value}
          </button>
        ))}
      </div>

      {error && <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleApply}
          disabled={!selectedPoints || validate.isPending || calc.isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {validate.isPending || calc.isPending ? 'Applying...' : 'Apply'}
        </button>
        {onRemove && (
          <button onClick={onRemove} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">Remove</button>
        )}
      </div>
    </div>
  );
};

export default LoyaltyRedemptionWidget;



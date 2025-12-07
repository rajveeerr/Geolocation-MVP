/**
 * Heist Item Shop Component
 * Displays available items for purchase with coins
 */

import { useState } from 'react';
import { ShoppingBag, Coins, Loader2, Check, AlertCircle } from 'lucide-react';
import { useHeistItems } from '@/hooks/useHeistItems';
import { usePurchaseHeistItem } from '@/hooks/useHeistItems';
import { useGamificationProfile } from '@/hooks/useGamification';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import type { HeistItem } from '@/types/heist';

interface HeistItemShopProps {
  onPurchaseSuccess?: () => void;
}

export function HeistItemShop({ onPurchaseSuccess }: HeistItemShopProps) {
  const { data: items, isLoading: isLoadingItems } = useHeistItems();
  const { data: profile } = useGamificationProfile();
  const { mutate: purchaseItem, isPending: isPurchasing } = usePurchaseHeistItem();
  const { toast } = useToast();
  const [purchasingItemId, setPurchasingItemId] = useState<number | null>(null);

  const coinBalance = profile?.coins || 0;

  const handlePurchase = (item: HeistItem) => {
    if (coinBalance < item.coinCost) {
      toast({
        title: 'Insufficient Coins',
        description: `You need ${item.coinCost} coins to purchase this item.`,
        variant: 'destructive',
      });
      return;
    }

    setPurchasingItemId(item.id);
    purchaseItem(item.id, {
      onSuccess: () => {
        setPurchasingItemId(null);
        onPurchaseSuccess?.();
      },
      onError: () => {
        setPurchasingItemId(null);
      },
    });
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'SWORD':
        return '⚔️';
      case 'HAMMER':
        return '🔨';
      case 'SHIELD':
        return '🛡️';
      default:
        return '🎁';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'SWORD':
        return 'from-red-50 to-red-100 border-red-200';
      case 'HAMMER':
        return 'from-orange-50 to-orange-100 border-orange-200';
      case 'SHIELD':
        return 'from-blue-50 to-blue-100 border-blue-200';
      default:
        return 'from-neutral-50 to-neutral-100 border-neutral-200';
    }
  };

  const formatEffect = (item: HeistItem) => {
    switch (item.effectType) {
      case 'INCREASE_STEAL_PERCENTAGE':
        return `+${item.effectValue}% steal amount`;
      case 'INCREASE_STEAL_BONUS':
        return `+${item.effectValue} bonus points`;
      case 'REDUCE_THEFT_PERCENTAGE':
        return `-${item.effectValue}% points stolen`;
      case 'BLOCK_THEFT_CHANCE':
        return `${item.effectValue}% chance to block`;
      default:
        return item.description;
    }
  };

  if (isLoadingItems) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-neutral-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600">No items available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <ShoppingBag className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Heist Item Shop</h3>
            <p className="text-sm text-neutral-600">Purchase items to enhance your heists</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
          <Coins className="h-5 w-5 text-amber-600" />
          <span className="font-bold text-amber-900">{coinBalance}</span>
          <span className="text-sm text-amber-700">coins</span>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => {
          const canAfford = coinBalance >= item.coinCost;
          const isPurchasingThisItem = isPurchasing && purchasingItemId === item.id;
          const itemIcon = item.icon || getItemIcon(item.type);

          return (
            <div
              key={item.id}
              className={`rounded-xl border-2 bg-gradient-to-br ${getItemColor(item.type)} p-6 transition-all hover:shadow-lg`}
            >
              {/* Item Icon & Name */}
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">{itemIcon}</div>
                <h4 className="text-xl font-bold text-neutral-900">{item.name}</h4>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-700 mb-4 text-center min-h-[3rem]">
                {item.description}
              </p>

              {/* Effect */}
              <div className="bg-white/50 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-neutral-600 mb-1">Effect:</p>
                <p className="text-sm font-bold text-neutral-900">{formatEffect(item)}</p>
              </div>

              {/* Item Details */}
              <div className="space-y-2 mb-4 text-xs text-neutral-600">
                {item.durationHours && (
                  <div className="flex items-center justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">{item.durationHours / 24} days</span>
                  </div>
                )}
                {item.maxUses && (
                  <div className="flex items-center justify-between">
                    <span>Uses:</span>
                    <span className="font-semibold">{item.maxUses}</span>
                  </div>
                )}
                {!item.durationHours && !item.maxUses && (
                  <div className="text-center text-neutral-500 italic">Unlimited uses</div>
                )}
              </div>

              {/* Price & Purchase Button */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Coins className="h-4 w-4 text-amber-600" />
                  <span className="text-2xl font-bold text-neutral-900">{item.coinCost}</span>
                  <span className="text-sm text-neutral-600">coins</span>
                </div>

                <Button
                  variant={canAfford ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full"
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || isPurchasingThisItem}
                  icon={
                    isPurchasingThisItem ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : canAfford ? (
                      <ShoppingBag className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )
                  }
                >
                  {isPurchasingThisItem
                    ? 'Purchasing...'
                    : canAfford
                      ? 'Purchase'
                      : 'Insufficient Coins'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


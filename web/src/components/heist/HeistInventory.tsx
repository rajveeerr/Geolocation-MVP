/**
 * Heist Inventory Component
 * Displays user's active heist items
 */

import { Package, Clock, Zap, Shield, Sword, Hammer } from 'lucide-react';
import { useHeistInventory } from '@/hooks/useHeistItems';
import { formatDistanceToNow, format } from 'date-fns';
import type { HeistInventoryItem } from '@/types/heist';

interface HeistInventoryProps {
  className?: string;
}

export function HeistInventory({ className }: HeistInventoryProps) {
  const { data: inventory, isLoading } = useHeistInventory();

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'SWORD':
        return <Sword className="h-6 w-6 text-red-600" />;
      case 'HAMMER':
        return <Hammer className="h-6 w-6 text-orange-600" />;
      case 'SHIELD':
        return <Shield className="h-6 w-6 text-blue-600" />;
      default:
        return <Package className="h-6 w-6 text-neutral-600" />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'SWORD':
        return 'border-red-200 bg-red-50';
      case 'HAMMER':
        return 'border-orange-200 bg-orange-50';
      case 'SHIELD':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-neutral-200 bg-neutral-50';
    }
  };

  const formatEffect = (item: HeistInventoryItem) => {
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
        return 'Active';
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600 mb-2">Your inventory is empty</p>
        <p className="text-sm text-neutral-500">Purchase items from the shop to get started!</p>
      </div>
    );
  }

  // Group items by type
  const groupedItems = inventory.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, HeistInventoryItem[]>);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
          <Package className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Your Inventory</h3>
          <p className="text-sm text-neutral-600">{inventory.length} active item{inventory.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([type, items]) => (
          <div key={type} className="space-y-2">
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              {type}
            </h4>
            {items.map((item) => {
              const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
              const isExpiringSoon = expiresAt && expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000;
              const usesRemaining = item.usesRemaining;

              return (
                <div
                  key={item.id}
                  className={`rounded-lg border-2 ${getItemColor(item.type)} p-4 transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Icon */}
                      <div className="mt-1">{getItemIcon(item.type)}</div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-neutral-900">{item.name}</h5>
                        </div>
                        <p className="text-sm text-neutral-700 mb-2">{formatEffect(item)}</p>

                        {/* Status Info */}
                        <div className="flex flex-wrap gap-4 text-xs text-neutral-600">
                          {usesRemaining !== null && (
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span>
                                {usesRemaining} use{usesRemaining !== 1 ? 's' : ''} remaining
                              </span>
                            </div>
                          )}
                          {expiresAt && (
                            <div className={`flex items-center gap-1 ${isExpiringSoon ? 'text-orange-600 font-semibold' : ''}`}>
                              <Clock className="h-3 w-3" />
                              <span>
                                Expires {formatDistanceToNow(expiresAt, { addSuffix: true })}
                              </span>
                            </div>
                          )}
                          {!expiresAt && usesRemaining === null && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Zap className="h-3 w-3" />
                              <span>Unlimited uses</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


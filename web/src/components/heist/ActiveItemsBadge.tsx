/**
 * Active Items Badge Component
 * Displays user's active heist items (Shield, Hammer, Sword) in a compact badge
 */

import { Shield, Hammer, Sword, Zap, Clock } from 'lucide-react';
import { useHeistInventory } from '@/hooks/useHeistItems';
import { Tooltip } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { HeistInventoryItem } from '@/types/heist';

interface ActiveItemsBadgeProps {
  className?: string;
  variant?: 'compact' | 'detailed';
  showShield?: boolean;
  showWeapons?: boolean;
}

export function ActiveItemsBadge({ 
  className, 
  variant = 'compact',
  showShield = true,
  showWeapons = true,
}: ActiveItemsBadgeProps) {
  const { data: inventory, isLoading } = useHeistInventory();

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-8 w-8 bg-neutral-200 animate-pulse rounded-full" />
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return null;
  }

  // Filter items based on props
  const filteredItems = inventory.filter((item) => {
    if (item.type === 'SHIELD' && !showShield) return false;
    if ((item.type === 'SWORD' || item.type === 'HAMMER') && !showWeapons) return false;
    return true;
  });

  if (filteredItems.length === 0) {
    return null;
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'SWORD':
        return <Sword className="h-4 w-4 text-red-600" />;
      case 'HAMMER':
        return <Hammer className="h-4 w-4 text-red-800" />;
      case 'SHIELD':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'SWORD':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'HAMMER':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'SHIELD':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-700';
    }
  };

  const formatEffect = (item: HeistInventoryItem) => {
    switch (item.effectType) {
      case 'INCREASE_STEAL_PERCENTAGE':
        return `+${item.effectValue}% steal`;
      case 'INCREASE_STEAL_BONUS':
        return `+${item.effectValue} bonus pts`;
      case 'REDUCE_THEFT_PERCENTAGE':
        return `-${item.effectValue}% theft`;
      case 'BLOCK_THEFT_CHANCE':
        return `${item.effectValue}% block`;
      default:
        return 'Active';
    }
  };

  if (variant === 'compact') {
    // Compact version: Just icons with tooltips
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {filteredItems.map((item) => {
          const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
          const isExpiringSoon = expiresAt && expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000;
          const usesRemaining = item.usesRemaining;

          const tooltipContent = (
            <div className="space-y-1">
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs">{formatEffect(item)}</p>
              {usesRemaining !== null && (
                <p className="text-xs text-neutral-300">
                  {usesRemaining} use{usesRemaining !== 1 ? 's' : ''} left
                </p>
              )}
              {expiresAt && (
                <p className={cn('text-xs', isExpiringSoon ? 'text-red-400 font-semibold' : 'text-neutral-300')}>
                  Expires {formatDistanceToNow(expiresAt, { addSuffix: true })}
                </p>
              )}
              {!expiresAt && usesRemaining === null && (
                <p className="text-xs text-green-400">Unlimited uses</p>
              )}
            </div>
          );

          return (
            <Tooltip key={item.id} content={tooltipContent}>
              <div
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all hover:scale-110 cursor-help',
                  getItemColor(item.type),
                  isExpiringSoon && 'ring-2 ring-red-400'
                )}
                title={`${item.name}: ${formatEffect(item)}`}
              >
                {getItemIcon(item.type)}
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  // Detailed version: Full display with text
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-semibold text-neutral-700">Active Items</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {filteredItems.map((item) => {
          const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
          const isExpiringSoon = expiresAt && expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000;
          const usesRemaining = item.usesRemaining;

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all',
                getItemColor(item.type),
                isExpiringSoon && 'ring-2 ring-red-400'
              )}
            >
              {getItemIcon(item.type)}
              <span>{item.name}</span>
              {usesRemaining !== null && (
                <span className="text-xs opacity-75">({usesRemaining})</span>
              )}
              {expiresAt && (
                <Clock className={cn('h-3 w-3', isExpiringSoon && 'text-red-800')} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


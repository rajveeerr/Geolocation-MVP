// Heist History Row Component
// Displays individual heist record

import { Trophy, Shield, ArrowUp, ArrowDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { getHeistStatusColor, formatPointsChange } from '@/utils/heistUtils';
import type { HeistHistoryItem } from '@/types/heist';
import { cn } from '@/lib/utils';

interface HeistHistoryRowProps {
  heist: HeistHistoryItem;
}

export function HeistHistoryRow({ heist }: HeistHistoryRowProps) {
  const isAttacker = heist.type === 'attacker';
  const isSuccess = heist.status === 'SUCCESS';
  const pointsChange = isAttacker ? heist.pointsStolen || 0 : -(heist.pointsLost || 0);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          isAttacker
            ? 'bg-amber-100 text-amber-600'
            : 'bg-red-100 text-red-600'
        )}>
          {isAttacker ? (
            <Trophy className="h-6 w-6" />
          ) : (
            <Shield className="h-6 w-6" />
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={heist.otherUser?.avatarUrl || undefined} />
              <AvatarFallback>{(heist.otherUser?.name || 'Unknown')?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-neutral-900">
                {isAttacker ? 'You robbed' : 'You were robbed by'} {heist.otherUser?.name || 'Unknown User'}
              </p>
              <p className="text-xs text-neutral-500">
                {formatDistanceToNow(new Date(heist.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Points Change */}
          {isSuccess && (
            <div className="flex items-center gap-2">
              {isAttacker ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
              <span className={cn(
                'text-sm font-bold',
                isAttacker ? 'text-green-600' : 'text-red-600'
              )}>
                {formatPointsChange(pointsChange)} points
              </span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold',
          getHeistStatusColor(heist.status)
        )}>
          {heist.status === 'SUCCESS' ? 'Success' : heist.status.replace('FAILED_', '').replace('_', ' ')}
        </div>
      </div>
    </div>
  );
}


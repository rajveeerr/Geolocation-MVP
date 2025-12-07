// Heist Notification Component
// Displays individual notification

import { Trophy, Shield, Gift, Check, ExternalLink, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getNotificationIcon } from '@/utils/heistUtils';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';
import type { HeistNotification as HeistNotificationType } from '@/types/heist';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

interface HeistNotificationProps {
  notification: HeistNotificationType;
  onMarkRead: () => void;
}

export function HeistNotification({ notification, onMarkRead }: HeistNotificationProps) {
  const icon = getNotificationIcon(notification.type);
  const isRead = notification.isRead;

  const getActionLink = () => {
    if (notification.type === 'HEIST_SUCCESS' || notification.type === 'HEIST_VICTIM') {
      return PATHS.LEADERBOARD;
    }
    if (notification.type === 'TOKEN_EARNED') {
      return PATHS.REFERRALS;
    }
    return null;
  };

  const actionLink = getActionLink();

  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4 transition-all',
        isRead ? 'border-neutral-200 opacity-75' : 'border-amber-200 shadow-sm'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0',
          notification.type === 'HEIST_SUCCESS' && 'bg-amber-100',
          notification.type === 'HEIST_VICTIM' && 'bg-red-100',
          notification.type === 'TOKEN_EARNED' && 'bg-green-100'
        )}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={cn(
              'font-semibold text-neutral-900',
              !isRead && 'font-bold'
            )}>
              {notification.title}
            </h3>
            {!isRead && (
              <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-neutral-600 mb-2">{notification.message}</p>
          <p className="text-xs text-neutral-400">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {!isRead ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkRead}
                icon={<Check className="h-3 w-3" />}
              >
                Mark Read
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Check className="h-3 w-3" />
                <span>Read</span>
              </div>
            )}
            {actionLink && (
              <Link 
                to={actionLink} 
                className={cn(isRead && 'pointer-events-none')}
                onClick={(e) => isRead && e.preventDefault()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ExternalLink className="h-3 w-3" />}
                  disabled={isRead}
                  className={cn(isRead && 'opacity-50 cursor-not-allowed')}
                >
                  {notification.type === 'HEIST_SUCCESS' || notification.type === 'HEIST_VICTIM'
                    ? 'View Leaderboard'
                    : 'View Referrals'}
                </Button>
              </Link>
            )}
            {(notification.type === 'HEIST_SUCCESS' || notification.type === 'HEIST_VICTIM') && (
              <Link 
                to={PATHS.HEIST_HISTORY}
                className={cn(isRead && 'pointer-events-none')}
                onClick={(e) => isRead && e.preventDefault()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<History className="h-3 w-3" />}
                  disabled={isRead}
                  className={cn(isRead && 'opacity-50 cursor-not-allowed')}
                >
                  View History
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// Heist Notification Badge Component
// Compact badge showing unread notification count

import { Bell } from 'lucide-react';
import { useHeistUnreadCount } from '@/hooks/useHeistNotifications';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

interface HeistNotificationBadgeProps {
  className?: string;
}

export function HeistNotificationBadge({ className }: HeistNotificationBadgeProps) {
  const unreadCount = useHeistUnreadCount();

  // Always show the badge, but only show count if > 0
  return (
    <Link 
      to={PATHS.HEIST_NOTIFICATIONS} 
      className={cn('relative', className)}
      aria-label={`Heist notifications: ${unreadCount} unread`}
    >
      <button className="relative flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </Link>
  );
}


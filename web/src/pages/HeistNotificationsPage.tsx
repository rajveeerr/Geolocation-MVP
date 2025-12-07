// Heist Notifications Page
// Displays all heist-related notifications

import { useState } from 'react';
import { Bell, Check, CheckCheck, Trophy, Shield, Gift, Filter, History, ShoppingBag } from 'lucide-react';
import { useHeistNotifications, useMarkHeistNotificationsRead } from '@/hooks/useHeistNotifications';
import { HeistNotification } from '@/components/heist/HeistNotification';
import { Button } from '@/components/common/Button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import type { HeistNotificationType } from '@/types/heist';

export function HeistNotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<HeistNotificationType | 'all'>('all');
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const navigate = useNavigate();

  const { data: notificationsData, isLoading } = useHeistNotifications({
    unreadOnly: unreadOnly ? true : undefined, // Only pass if true, otherwise show all
    type: typeFilter === 'all' ? undefined : typeFilter,
    limit,
    offset,
  });

  const markAsReadMutation = useMarkHeistNotificationsRead();

  const handleMarkAllRead = () => {
    markAsReadMutation.mutate(
      { markAll: true },
      {
        onSuccess: () => {
          // Optional: Show success toast
        },
        onError: (error) => {
          console.error('Failed to mark all notifications as read:', error);
          // Optional: Show error toast
        },
      }
    );
  };

  const handleMarkRead = (notificationId: number) => {
    markAsReadMutation.mutate(
      { notificationId },
      {
        onSuccess: () => {
          // Optional: Show success toast
        },
        onError: (error) => {
          console.error('Failed to mark notification as read:', error);
          // Optional: Show error toast
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-neutral-50 min-h-screen pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-neutral-200 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  return (
    <div className="bg-neutral-50 min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">Heist Notifications</h1>
              <p className="text-neutral-600">
                Stay updated on all heist activities
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(PATHS.HEIST_ITEM_SHOP)}
                icon={<ShoppingBag className="h-4 w-4" />}
              >
                Item Shop
              </Button>
              <Link
                to={PATHS.HEIST_HISTORY}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium text-neutral-700"
              >
                <History className="h-4 w-4" />
                <span>Heist History</span>
              </Link>
              {unreadCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={markAsReadMutation.isPending}
                  icon={<CheckCheck className="h-4 w-4" />}
                >
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              {/* Unread Filter */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unreadOnly"
                  checked={unreadOnly}
                  onChange={(e) => {
                    setUnreadOnly(e.target.checked);
                    setOffset(0);
                  }}
                  className="h-4 w-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
                />
                <label htmlFor="unreadOnly" className="text-sm font-medium text-neutral-700">
                  Unread Only ({unreadCount})
                </label>
              </div>

              {/* Type Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'HEIST_SUCCESS', 'HEIST_VICTIM', 'TOKEN_EARNED'] as const).map((type) => {
                    const isSelected = typeFilter === type;
                    const displayText = type === 'all' 
                      ? 'All' 
                      : type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                    
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setTypeFilter(type);
                          setOffset(0);
                        }}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
                          isSelected
                            ? 'bg-brand-primary-500 text-white shadow-sm'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        )}
                      >
                        {displayText}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <HeistNotification
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => handleMarkRead(notification.id)}
                />
              ))}

              {/* Pagination */}
              {notifications.length >= limit && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <Bell className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Notifications</h3>
              <p className="text-neutral-600">
                {unreadOnly
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


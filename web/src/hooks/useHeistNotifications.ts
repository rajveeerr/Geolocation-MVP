// Hook for fetching heist notifications

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getHeistNotifications, markHeistNotificationsRead } from '@/services/heistService';
import type { HeistNotificationsResponse, MarkNotificationReadRequest } from '@/types/heist';

export interface UseHeistNotificationsParams {
  unreadOnly?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export function useHeistNotifications(params?: UseHeistNotificationsParams) {
  return useQuery<HeistNotificationsResponse, Error>({
    queryKey: ['heist', 'notifications', params],
    queryFn: () => getHeistNotifications(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for marking notifications as read
 */
export function useMarkHeistNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation<MarkNotificationReadResponse, Error, MarkNotificationReadRequest>({
    mutationFn: markHeistNotificationsRead,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['heist', 'notifications'] });
      
      // Snapshot the previous value for rollback
      const previousData = queryClient.getQueriesData<HeistNotificationsResponse>({ 
        queryKey: ['heist', 'notifications'] 
      });
      
      // Optimistically update the cache immediately
      queryClient.setQueriesData<HeistNotificationsResponse>(
        { queryKey: ['heist', 'notifications'] },
        (oldData) => {
          if (!oldData) return oldData;
          
          const updatedNotifications = oldData.notifications.map((notification) => {
            if (variables.markAll) {
              return { ...notification, isRead: true };
            }
            if (variables.notificationId === notification.id) {
              return { ...notification, isRead: true };
            }
            return notification;
          });
          
          // Calculate new unread count
          const newUnreadCount = variables.markAll 
            ? 0 
            : Math.max(0, oldData.unreadCount - (variables.notificationId ? 1 : 0));
          
          return {
            ...oldData,
            notifications: updatedNotifications,
            unreadCount: newUnreadCount,
          };
        }
      );
      
      // Return context with snapshot for potential rollback
      return { previousData };
    },
    onSuccess: () => {
      // Mutation succeeded - the optimistic update is already applied in onMutate
      // Don't refetch or invalidate immediately to prevent UI flicker/revert
      // The optimistic update will persist until the next natural refetch
      // (window focus, navigation, stale time expiration, etc.)
      // This ensures smooth UX - the read state stays applied
    },
    onError: (error, variables, context) => {
      // On error, revert to previous state
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Failed to mark notification as read:', error);
      // Invalidate on error to get fresh data
      queryClient.invalidateQueries({ queryKey: ['heist', 'notifications'] });
    },
  });
}

/**
 * Hook to get unread notification count
 */
export function useHeistUnreadCount() {
  const { data } = useHeistNotifications({ unreadOnly: true, limit: 1 });
  return data?.unreadCount || 0;
}


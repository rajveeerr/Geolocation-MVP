/**
 * React Query hooks for heist items
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHeistItems, getHeistInventory, purchaseHeistItem } from '@/services/heistService';
import { useToast } from '@/hooks/use-toast';
import type { HeistItem, HeistInventoryItem } from '@/types/heist';

/**
 * Hook to fetch available heist items
 */
export function useHeistItems() {
  return useQuery<HeistItem[]>({
    queryKey: ['heist', 'items'],
    queryFn: getHeistItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch user's heist item inventory
 */
export function useHeistInventory() {
  return useQuery<HeistInventoryItem[]>({
    queryKey: ['heist', 'inventory'],
    queryFn: getHeistInventory,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to purchase a heist item
 */
export function usePurchaseHeistItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId: number) => purchaseHeistItem(itemId),
    onSuccess: (data, itemId) => {
      // Invalidate inventory to refresh
      queryClient.invalidateQueries({ queryKey: ['heist', 'inventory'] });
      
      // Invalidate user profile to refresh coin balance
      queryClient.invalidateQueries({ queryKey: ['gamification', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast({
        title: 'Item Purchased!',
        description: data.message || 'Item added to your inventory',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to purchase item',
        variant: 'destructive',
      });
    },
  });
}



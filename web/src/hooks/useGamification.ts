import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationService } from '../services/gamificationService';
import { toast } from 'sonner';

// Query keys
export const GAMIFICATION_KEYS = {
  profile: ['gamification', 'profile'],
  transactions: (page: number, limit: number) => ['gamification', 'transactions', page, limit],
  achievements: ['gamification', 'achievements'],
  coinPackages: ['gamification', 'coin-packages'],
  loyaltyTiers: ['gamification', 'loyalty-tiers'],
  paymentHistory: (page: number, limit: number) => ['gamification', 'payments', page, limit],
};

// Get user's gamification profile
export function useGamificationProfile() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.profile,
    queryFn: async () => {
      const response = await gamificationService.getProfile();
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds instead of 5 minutes for more frequent updates
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// Get coin transaction history
export function useCoinTransactions(page = 1, limit = 20) {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.transactions(page, limit),
    queryFn: async () => {
      const response = await gamificationService.getTransactions(page, limit);
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get achievements
export function useAchievements() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.achievements,
    queryFn: async () => {
      const response = await gamificationService.getAchievements();
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get coin packages
export function useCoinPackages() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.coinPackages,
    queryFn: async () => {
      const response = await gamificationService.getCoinPackages();
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Get loyalty tiers
export function useLoyaltyTiers() {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.loyaltyTiers,
    queryFn: async () => {
      const response = await gamificationService.getLoyaltyTiers();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Get payment history
export function usePaymentHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: GAMIFICATION_KEYS.paymentHistory(page, limit),
    queryFn: async () => {
      const response = await gamificationService.getPaymentHistory(page, limit);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create payment order mutation
export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (packageIndex: number) => gamificationService.createPaymentOrder(packageIndex),
    onSuccess: () => {
      toast.success('Payment order created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payment order');
    },
  });
}

// Capture payment mutation
export function useCapturePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => gamificationService.capturePayment(orderId),
    onSuccess: (data) => {
      if (data.success && data.data) {
        toast.success(`🎉 ${data.data.coinsAwarded} coins added to your account!`);
        
        // Multiple approaches to ensure cache is updated
        queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.profile });
        queryClient.refetchQueries({ queryKey: GAMIFICATION_KEYS.profile });
        queryClient.invalidateQueries({ queryKey: ['gamification', 'transactions'] });
        queryClient.invalidateQueries({ queryKey: ['gamification', 'payments'] });
        
        // Force all gamification-related queries to be stale
        queryClient.invalidateQueries({ queryKey: ['gamification'] });
        
        // Also trigger a delayed refetch to catch any async updates
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: GAMIFICATION_KEYS.profile });
        }, 500);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Payment capture failed');
    },
  });
}

// Custom hook to refresh gamification data manually
export function useRefreshGamificationData() {
  const queryClient = useQueryClient();
  
  return {
    refreshProfile: () => {
      queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.profile });
      queryClient.refetchQueries({ queryKey: GAMIFICATION_KEYS.profile });
    },
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      queryClient.refetchQueries({ queryKey: ['gamification'] });
    }
  };
}

// Development only: Award coins mutation
export function useAwardCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, type, description }: { amount: number; type?: string; description?: string }) =>
      gamificationService.awardCoins(amount, type, description),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`🪙 ${data.data?.transaction?.amount || 0} coins awarded!`);
        // Refresh profile and transactions
        queryClient.invalidateQueries({ queryKey: GAMIFICATION_KEYS.profile });
        queryClient.invalidateQueries({ queryKey: ['gamification', 'transactions'] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to award coins');
    },
  });
}
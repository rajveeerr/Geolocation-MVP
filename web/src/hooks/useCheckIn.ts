import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/services/api';
import { useToast } from './use-toast';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import { STREAK_QUERY_KEY } from './useStreak';

interface CheckInPayload {
  dealId: number;
  latitude: number;
  longitude: number;
}

interface CheckInResponse {
  pointsAwarded: number;
  firstCheckIn: boolean;
  withinRange: boolean;
}

interface UseCheckInOptions {
  onSuccess?: (data: { pointsEarned: number; withinRange: boolean }) => void;
}

export const useCheckIn = (options?: UseCheckInOptions) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { openModal } = useModal();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const checkInMutation = useMutation({
    mutationFn: (payload: CheckInPayload) =>
      apiPost<CheckInResponse, CheckInPayload>('/users/check-in', payload),
    onSuccess: (response: any) => {
      // Check if response is successful
      if (!response || !response.success) {
        const errorMessage = response?.error || 'Check-in failed. Please try again.';
        toast({
          title: 'Check-in Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        return;
      }

      // Check if we have data
      if (!response.data) {
        toast({
          title: 'Check-in Failed',
          description: 'Invalid response from server. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Check if user is within range
      if (!response.data.withinRange) {
        toast({
          title: 'Too Far Away',
          description: "You're not close enough to the merchant to check in.",
          variant: 'destructive',
        });
        return;
      }

      // Success - user is within range
      const pointsEarned = response.data.pointsAwarded || 0;
      
      // Call success callback if provided
      options?.onSuccess?.({
        pointsEarned,
        withinRange: response.data.withinRange,
      });
      
      // Don't show toast if callback is provided (modal will handle it)
      if (!options?.onSuccess) {
        toast({
          title: 'Check-in Successful!',
          description: `You earned ${pointsEarned} points!`,
        });
      }

      // If streak data is returned, update cache and show contextual notifications
      if (response.data.streak) {
        const s = response.data.streak;
        queryClient.setQueryData(STREAK_QUERY_KEY, s);
        if (s.newWeek) {
          toast({ title: 'Streak advanced!', description: s.message });
        }
        if (s.streakBroken) {
          toast({ title: 'Streak broken', description: 'Starting fresh with 10% discount.', variant: 'destructive' });
        }
        if (s.maxDiscountReached) {
          toast({ title: 'Maximum discount reached! 🎉', description: 'You now have 45% OFF.' });
        }
      }

      // Invalidate user data to refetch their new point total
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] }); // Also refresh leaderboard
    },
    onError: (error: any) => {
      // Handle network errors, API errors, etc.
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Unable to check in. Please try again.';
      toast({
        title: 'Check-in Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsCheckingIn(false);
    },
  });

  const performCheckIn = (dealId: string) => {
    if (!user) {
      openModal();
      return;
    }

    setIsCheckingIn(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        checkInMutation.mutate({
          dealId: parseInt(dealId, 10),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        toast({
          title: 'Geolocation Error',
          description: error.message,
          variant: 'destructive',
        });
        setIsCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return {
    isCheckingIn,
    checkIn: performCheckIn,
  };
};

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

/**
 * Reason a check-in failed at the proximity step.
 * - OUT_OF_RANGE: customer is not within radius of the merchant location.
 * - TRUCK_NOT_LIVE: merchant is a food truck but their current scheduled stop has ended.
 * - TRUCK_NO_STOP_TODAY: merchant is a food truck and no stop covers right now.
 */
export type CheckInFailureReason =
  | 'OUT_OF_RANGE'
  | 'TRUCK_NOT_LIVE'
  | 'TRUCK_NO_STOP_TODAY';

interface CheckInResponse {
  pointsAwarded: number;
  firstCheckIn: boolean;
  withinRange: boolean;
  /** Populated by BE when withinRange is false to drive a more specific message. */
  failureReason?: CheckInFailureReason;
  /** Optional merchant business name surfaced by BE for friendlier copy. */
  merchantBusinessName?: string;
  /** Optional current truck stop address surfaced by BE when relevant. */
  currentStopAddress?: string;
  eligibleRewards?: Array<{
    id: number;
    title: string;
    description?: string | null;
    rewardType: string;
    rewardAmount: number;
    checkInCondition: 'ANY_CHECKIN' | 'FIRST_VISIT' | 'BIRTHDAY';
    expiresAt: string;
  }>;
  lotteryEntry?: {
    gameId: string;
    entered: boolean;
    newEntry: boolean;
    totalEntries: number;
    drawAt: string;
  } | null;
  gameSession?: {
    sessionToken: string;
    gameType: 'SCRATCH_CARD' | 'SPIN_WHEEL' | 'PICK_A_CARD';
    title: string;
    subtitle?: string | null;
    expiresAt: string;
  } | null;
  streak?: {
    currentStreak: number;
    currentDiscountPercent: number;
    message: string;
    newWeek: boolean;
    streakBroken: boolean;
    maxDiscountReached: boolean;
  };
}

interface UseCheckInOptions {
  onSuccess?: (data: {
    pointsEarned: number;
    withinRange: boolean;
    eligibleRewards?: CheckInResponse['eligibleRewards'];
    lotteryEntry?: CheckInResponse['lotteryEntry'];
    gameSession?: CheckInResponse['gameSession'];
  }) => void;
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
        const reason = response.data.failureReason as CheckInFailureReason | undefined;
        const name = response.data.merchantBusinessName ?? 'This truck';
        const stopAddr = response.data.currentStopAddress;
        const messages: Record<CheckInFailureReason, { title: string; description: string }> = {
          OUT_OF_RANGE: {
            title: 'Too far away',
            description: stopAddr
              ? `You're not close enough — ${name} is at ${stopAddr}.`
              : "You're not close enough to the merchant to check in.",
          },
          TRUCK_NOT_LIVE: {
            title: `${name} isn't at a stop right now`,
            description: 'Check back when they go live again.',
          },
          TRUCK_NO_STOP_TODAY: {
            title: `${name} hasn't posted today's location yet`,
            description: 'Try again once they share where they will be.',
          },
        };
        const fallback = {
          title: 'Too Far Away',
          description: "You're not close enough to the merchant to check in.",
        };
        const { title, description } = reason ? messages[reason] : fallback;
        toast({ title, description, variant: 'destructive' });

        // Refresh the deal so the UI re-renders to "no current stop" if applicable.
        queryClient.invalidateQueries({ queryKey: ['deal-detail'] });
        return;
      }

      // Success - user is within range
      const pointsEarned = response.data.pointsAwarded || 0;
      
      // Call success callback if provided
      options?.onSuccess?.({
        pointsEarned,
        withinRange: response.data.withinRange,
        eligibleRewards: response.data.eligibleRewards,
        lotteryEntry: response.data.lotteryEntry,
        gameSession: response.data.gameSession,
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
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'checkinLotteryCurrent'] });
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

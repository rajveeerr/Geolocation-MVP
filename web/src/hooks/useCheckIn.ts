import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/services/api';
import { useToast } from './use-toast';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';

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

export const useCheckIn = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { openModal } = useModal();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const checkInMutation = useMutation({
    mutationFn: (payload: CheckInPayload) =>
      apiPost<CheckInResponse, CheckInPayload>('/users/check-in', payload),
    onSuccess: (response: any) => {
      if (response.success && response.data) {
        if (response.data.withinRange) {
          toast({
            title: 'Check-in Successful!',
            description: `You earned ${response.data.pointsAwarded} points!`,
          });
          // Invalidate user data to refetch their new point total
          queryClient.invalidateQueries({ queryKey: ['user'] });
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] }); // Also refresh leaderboard
        } else {
          toast({
            title: 'Too Far Away',
            description: "You're not close enough to the merchant to check in.",
            variant: 'destructive',
          });
        }
      } else {
        throw new Error(response.error || 'Check-in failed.');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Check-in Error',
        description: error.message,
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

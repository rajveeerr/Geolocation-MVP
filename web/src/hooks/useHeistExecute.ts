// Hook for executing heists

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executeHeist } from '@/services/heistService';
import type { HeistExecuteResponse } from '@/types/heist';
import { useToast } from '@/hooks/use-toast';

export interface ExecuteHeistError extends Error {
  code?: string;
  details?: {
    cooldownEndsAt?: string;
    protectionEndsAt?: string;
    hoursRemaining?: number;
    tokensAvailable?: number;
    tokensNeeded?: number;
    targetPoints?: number;
    minimumRequired?: number;
  };
}

/**
 * Hook for executing a heist
 * Handles success/error states and updates related queries
 */
export function useHeistExecute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<HeistExecuteResponse, ExecuteHeistError, number>({
    mutationFn: (victimId: number) => executeHeist(victimId),
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['heist', 'tokens'] });
      queryClient.invalidateQueries({ queryKey: ['heist', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['heist', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['heist', 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      
      // Show success toast
      toast({
        title: 'Heist Successful!',
        description: `You stole ${data.pointsStolen} points!`,
      });
    },
    onError: (error: ExecuteHeistError) => {
      // Map error codes to user-friendly messages
      let title = 'Heist Failed';
      let description = error.message || 'Unable to execute heist';
      
      switch (error.code) {
        case 'INSUFFICIENT_TOKENS':
          title = 'Insufficient Tokens';
          description = 'You need at least 1 Heist Token. Refer friends to earn tokens!';
          break;
        case 'COOLDOWN_ACTIVE':
          title = 'On Cooldown';
          const hours = error.details?.hoursRemaining || 0;
          description = `You can perform another heist in ${hours} hour${hours !== 1 ? 's' : ''}`;
          break;
        case 'TARGET_PROTECTED':
          title = 'Target Protected';
          const protectionHours = error.details?.hoursRemaining || 0;
          description = `This player was recently robbed and is protected for ${protectionHours} more hour${protectionHours !== 1 ? 's' : ''}`;
          break;
        case 'INVALID_TARGET':
          title = 'Invalid Target';
          description = error.message || 'Cannot rob this player';
          break;
        case 'INSUFFICIENT_VICTIM_POINTS':
          title = 'Target Has Too Few Points';
          description = `Target must have at least ${error.details?.minimumRequired || 20} points`;
          break;
        case 'FEATURE_DISABLED':
          title = 'Feature Disabled';
          description = 'Heist feature is currently disabled';
          break;
        default:
          title = 'Heist Failed';
          description = error.message || 'Unable to execute heist';
      }
      
      toast({
        title,
        description,
        variant: 'destructive',
      });
    },
  });
}


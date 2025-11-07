// Heist Action Button Component
// Shows eligibility status and allows heist execution

import { useState } from 'react';
import { Trophy, Clock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useHeistEligibility } from '@/hooks/useHeistEligibility';
import { useHeistTokens } from '@/hooks/useHeistTokens';
import { useHeistExecute } from '@/hooks/useHeistExecute';
import { HeistConfirmModal } from './HeistConfirmModal';
import { cn } from '@/lib/utils';
import { formatTimeRemaining } from '@/utils/heistUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeistActionButtonProps {
  victimId: number;
  victimName: string;
  victimPoints: number;
  onSuccess?: () => void;
  className?: string;
}

export function HeistActionButton({
  victimId,
  victimName,
  victimPoints,
  onSuccess,
  className,
}: HeistActionButtonProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { data: tokens } = useHeistTokens();
  const { data: eligibility, isLoading: isLoadingEligibility } = useHeistEligibility(victimId, true);
  const { mutate: executeHeist, isPending: isExecuting } = useHeistExecute();

  const handleClick = () => {
    if (eligibility?.eligible) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = () => {
    executeHeist(victimId, {
      onSuccess: (data) => {
        setShowConfirmModal(false);
        onSuccess?.(data);
      },
    });
  };

  // Calculate potential steal (5% of victim points, max 100)
  const potentialSteal = eligibility?.pointsWouldSteal || Math.min(Math.floor(victimPoints * 0.05), 100);

  // Determine button state
  const isDisabled = !eligibility?.eligible || isExecuting || isLoadingEligibility;
  const hasTokens = (tokens?.balance || 0) > 0;

  // Get disabled reason for tooltip
  const getDisabledReason = () => {
    if (isLoadingEligibility) return 'Checking eligibility...';
    if (!eligibility) return 'Unable to check eligibility';
    if (!eligibility.eligible) {
      // Check for specific failure reasons in order of priority
      if (eligibility.reason) {
        // If reason is provided, use it (includes "already robbed" message)
        return eligibility.reason;
      }
      if (!eligibility.checks.sufficientTokens) {
        return 'You need at least 1 Heist Token. Refer friends to earn tokens!';
      }
      if (!eligibility.checks.notOnCooldown) {
        const hours = eligibility.details?.hoursRemaining || 0;
        return `You can perform another heist in ${formatTimeRemaining(hours)}`;
      }
      if (!eligibility.checks.targetNotProtected) {
        const hours = eligibility.details?.hoursRemaining || 0;
        return `This player is protected for ${formatTimeRemaining(hours)}`;
      }
      if (!eligibility.checks.targetHasSufficientPoints) {
        return `Target must have at least ${eligibility.details?.minimumRequired || 20} points`;
      }
      if (eligibility.checks.notAlreadyRobbed === false) {
        return 'You have already robbed this user. You cannot rob the same person twice.';
      }
      if (!eligibility.checks.withinDailyLimit) {
        return `You have reached the daily heist limit of ${eligibility.details?.limit || 3}`;
      }
      return 'Cannot perform heist';
    }
    return '';
  };

  const buttonContent = (
    <Button
      variant={eligibility?.eligible ? 'primary' : 'secondary'}
      size="sm"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn('relative', className)}
      icon={isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
    >
      {isExecuting ? 'Executing...' : eligibility?.eligible ? 'Rob' : 'Cannot Rob'}
    </Button>
  );

  if (isDisabled && !isExecuting) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs space-y-1">
              <p className="font-semibold text-sm">{getDisabledReason()}</p>
              {!eligibility?.checks.sufficientTokens && (
                <p className="text-xs text-neutral-300">Current balance: {tokens?.balance || 0} tokens</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      {buttonContent}
      {showConfirmModal && (
        <HeistConfirmModal
          victimId={victimId}
          victimName={victimName}
          victimPoints={victimPoints}
          potentialSteal={potentialSteal}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmModal(false)}
          isExecuting={isExecuting}
        />
      )}
    </>
  );
}


// Token Balance Badge Component
// Compact inline display that opens a modal with full token details

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { useHeistTokens } from '@/hooks/useHeistTokens';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { HeistTokenBalance } from './HeistTokenBalance';

interface HeistTokenBadgeProps {
  className?: string;
}

export function HeistTokenBadge({ className }: HeistTokenBadgeProps) {
  const { data: tokens, isLoading } = useHeistTokens();
  const [isOpen, setIsOpen] = useState(false);

  const balance = tokens?.balance || 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-1.5 text-neutral-400', className)}>
        <Trophy className="h-4 w-4 animate-pulse" />
        <span className="text-sm font-semibold">-</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center space-x-1.5 text-amber-600 hover:text-amber-700 transition-colors',
          'rounded-lg px-2 py-1 hover:bg-amber-50 active:bg-amber-100',
          'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
          className
        )}
        aria-label={`Heist Tokens: ${balance} available. Click to view details.`}
        title="Click to view Heist Token details"
      >
        <Trophy className="h-4 w-4" />
        <span className="text-sm font-semibold">{balance}</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 sm:rounded-lg">
          <div className="p-6">
            <HeistTokenBalance onClose={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


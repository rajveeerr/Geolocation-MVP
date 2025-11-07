// Heist Confirmation Modal
// Shows confirmation dialog before executing heist

import { Trophy, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeistTokens } from '@/hooks/useHeistTokens';

interface HeistConfirmModalProps {
  victimId: number;
  victimName: string;
  victimPoints: number;
  potentialSteal: number;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting: boolean;
}

export function HeistConfirmModal({
  victimName,
  victimPoints,
  potentialSteal,
  onConfirm,
  onCancel,
  isExecuting,
}: HeistConfirmModalProps) {
  const { data: tokens } = useHeistTokens();
  const currentBalance = tokens?.balance || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-md w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
        >
          <button
            onClick={onCancel}
            disabled={isExecuting}
            className="absolute top-4 right-4 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <Trophy className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Confirm Heist</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Are you sure you want to rob this player?
              </p>
            </div>

            {/* Target Info */}
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-600">Target</span>
                <span className="text-sm font-bold text-neutral-900">{victimName}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-600">Current Points</span>
                <span className="text-sm font-bold text-neutral-900">{victimPoints.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Points to Steal</span>
                <span className="text-lg font-bold text-amber-600">{potentialSteal}</span>
              </div>
            </div>

            {/* Cost Info */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-700">Token Cost</span>
                <span className="text-sm font-bold text-amber-900">1 Token</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-medium text-amber-700">Your Balance</span>
                <span className="text-sm font-bold text-amber-900">
                  {currentBalance} Token{currentBalance !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Important</p>
                <p className="text-xs text-yellow-700 mt-1">
                  You can only perform 1 heist every 24 hours. This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={onCancel}
                disabled={isExecuting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={onConfirm}
                disabled={isExecuting}
                className="flex-1"
                icon={<Trophy className="h-4 w-4" />}
              >
                {isExecuting ? 'Executing...' : 'Confirm Heist'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


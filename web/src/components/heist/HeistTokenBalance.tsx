// Full Token Balance Display Component
// Shows detailed token information

import { Trophy, TrendingUp, TrendingDown, Gift, ShoppingBag } from 'lucide-react';
import { useHeistTokens } from '@/hooks/useHeistTokens';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { Button } from '@/components/common/Button';

interface HeistTokenBalanceProps {
  onClose?: () => void;
}

export function HeistTokenBalance({ onClose: _onClose }: HeistTokenBalanceProps) {
  const { data: tokens, isLoading } = useHeistTokens();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-32 bg-neutral-200 animate-pulse rounded" />
        <div className="h-20 bg-neutral-200 animate-pulse rounded" />
      </div>
    );
  }

  const balance = tokens?.balance || 0;
  const totalEarned = tokens?.totalEarned || 0;
  const totalSpent = tokens?.totalSpent || 0;
  const lastEarnedAt = tokens?.lastEarnedAt;
  const lastSpentAt = tokens?.lastSpentAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">Heist Tokens</h3>
            <p className="text-sm text-neutral-600">Use tokens to steal points from other players</p>
          </div>
        </div>
      </div>

      {/* Current Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center"
      >
        <p className="text-sm font-medium text-amber-700 mb-2">Current Balance</p>
        <p className="text-4xl font-bold text-amber-900">{balance}</p>
        <p className="text-sm text-amber-600 mt-1">
          {balance === 0 ? 'No tokens available' : `${balance} token${balance !== 1 ? 's' : ''} ready to use`}
        </p>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-green-200 bg-green-50 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-700">Total Earned</p>
          </div>
          <p className="text-2xl font-bold text-green-900">{totalEarned}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-700">Total Spent</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalSpent}</p>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-neutral-900">Recent Activity</h4>
        
        {lastEarnedAt && (
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Gift className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">Token Earned</p>
              <p className="text-xs text-neutral-500">
                {formatDistanceToNow(new Date(lastEarnedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {lastSpentAt && (
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <Trophy className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">Token Spent</p>
              <p className="text-xs text-neutral-500">
                {formatDistanceToNow(new Date(lastSpentAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {!lastEarnedAt && !lastSpentAt && (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center">
            <p className="text-sm text-neutral-500">No activity yet</p>
          </div>
        )}
      </div>

      {/* Item Shop Link */}
      <div className="pt-4 border-t border-neutral-200">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => navigate(PATHS.HEIST_ITEM_SHOP)}
          icon={<ShoppingBag className="h-4 w-4" />}
        >
          Visit Item Shop
        </Button>
        <p className="text-xs text-neutral-500 text-center mt-2">
          Purchase items to enhance your heists
        </p>
      </div>

    </div>
  );
}


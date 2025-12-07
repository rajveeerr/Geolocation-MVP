// Heist Statistics Component
// Displays user's heist statistics

import { Trophy, TrendingUp, TrendingDown, Target, Shield } from 'lucide-react';
import { useHeistStats } from '@/hooks/useHeistStats';
import { motion } from 'framer-motion';
import { formatPointsChange } from '@/utils/heistUtils';
import { cn } from '@/lib/utils';

export function HeistStats() {
  const { data: stats, isLoading } = useHeistStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-neutral-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-neutral-500">No statistics available</div>;
  }

  const attackerStats = stats.asAttacker;
  const victimStats = stats.asVictim;
  const successRate = attackerStats.total > 0
    ? Math.round((attackerStats.successful / attackerStats.total) * 100)
    : 0;
  const avgPointsPerHeist = attackerStats.successful > 0
    ? Math.round(attackerStats.totalPointsStolen / attackerStats.successful)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Heist Statistics</h2>
        <p className="text-neutral-600">Your performance as an attacker and victim</p>
      </div>

      {/* Net Points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center"
      >
        <p className="text-sm font-medium text-amber-700 mb-2">Net Points Gained</p>
        <p className={cn(
          'text-4xl font-bold',
          stats.netPoints >= 0 ? 'text-amber-900' : 'text-red-600'
        )}>
          {formatPointsChange(stats.netPoints)}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* As Attacker */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg border border-amber-200 bg-amber-50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Target className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-900">As Attacker</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Total Heists</span>
              <span className="text-sm font-bold text-amber-900">{attackerStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Successful</span>
              <span className="text-sm font-bold text-green-600">{attackerStats.successful}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Failed</span>
              <span className="text-sm font-bold text-red-600">{attackerStats.failed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Total Points Stolen</span>
              <span className="text-sm font-bold text-amber-900">{attackerStats.totalPointsStolen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Success Rate</span>
              <span className="text-sm font-bold text-amber-900">{successRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-amber-700">Avg Points/Heist</span>
              <span className="text-sm font-bold text-amber-900">{avgPointsPerHeist}</span>
            </div>
          </div>
        </motion.div>

        {/* As Victim */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-lg border border-red-200 bg-red-50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900">As Victim</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-red-700">Times Robbed</span>
              <span className="text-sm font-bold text-red-900">{victimStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-red-700">Total Points Lost</span>
              <span className="text-sm font-bold text-red-900">{victimStats.totalPointsLost}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


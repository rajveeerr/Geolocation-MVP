// Heist History Page
// Displays user's heist history as attacker and victim

import { useState } from 'react';
import { Trophy, Shield, ArrowUp, ArrowDown, Filter, Clock, ShoppingBag } from 'lucide-react';
import { useHeistHistory } from '@/hooks/useHeistHistory';
import { HeistHistoryRow } from '@/components/heist/HeistHistoryRow';
import { Button } from '@/components/common/Button';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import type { HeistRole } from '@/types/heist';

export function HeistHistoryPage() {
  const [roleFilter, setRoleFilter] = useState<HeistRole>('both');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [offset, setOffset] = useState(0);
  const limit = 20;
  const navigate = useNavigate();

  const { data: history, isLoading, error } = useHeistHistory({
    role: roleFilter === 'both' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit,
    offset,
  });

  if (isLoading) {
    return (
      <div className="bg-neutral-50 min-h-screen pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-neutral-200 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-50 min-h-screen pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-600">Failed to load heist history</p>
          </div>
        </div>
      </div>
    );
  }

  const heists = history?.heists || [];
  const hasMore = history?.hasMore || false;

  return (
    <div className="bg-neutral-50 min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">Heist History</h1>
              <p className="text-neutral-600">
                View all your heist attempts and when you were targeted
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(PATHS.HEIST_ITEM_SHOP)}
              icon={<ShoppingBag className="h-4 w-4" />}
              className="ml-4 flex-shrink-0"
            >
              Item Shop
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              {/* Role Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Role</label>
                <div className="flex gap-2">
                  {(['both', 'attacker', 'victim'] as const).map((role) => (
                    <Button
                      key={role}
                      variant={roleFilter === role ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setRoleFilter(role);
                        setOffset(0);
                      }}
                    >
                      {role === 'both' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-neutral-700 mb-2 block">Status</label>
                <div className="flex gap-2">
                  {(['all', 'SUCCESS', 'FAILED_COOLDOWN', 'FAILED_TARGET_PROTECTED'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setStatusFilter(status);
                        setOffset(0);
                      }}
                    >
                      {status === 'all' ? 'All' : status.replace('FAILED_', '').replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History List */}
          {heists.length > 0 ? (
            <div className="space-y-4">
              {heists.map((heist) => (
                <HeistHistoryRow key={heist.id} heist={heist} />
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-neutral-600">
                  Showing {offset + 1}-{offset + heists.length} of {history?.total || 0}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <Trophy className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Heist History</h3>
              <p className="text-neutral-600 mb-6">
                You haven't performed any heists yet. Go to the leaderboard to get started!
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/leaderboard'}>
                Go to Leaderboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


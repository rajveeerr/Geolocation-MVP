import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, ShoppingBag, TrendingUp, Layers, Clock } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { PATHS } from '@/routing/paths';
import { useSurpriseAnalytics } from '@/hooks/useSurprises';
import { cn } from '@/lib/utils';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <div className={cn('mb-3 inline-flex rounded-lg p-2', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-neutral-600">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
    </motion.div>
  );
}

function SurpriseAnalyticsContent() {
  const { dealId } = useParams<{ dealId: string }>();
  const { data, isLoading, error } = useSurpriseAnalytics(dealId ? Number(dealId) : null);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error)?.message ?? 'Failed to load analytics'}
        </div>
      </div>
    );
  }

  const { deal, analytics, recentReveals } = data;

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8">
      {/* Back link */}
      <Link
        to={PATHS.MERCHANT_SURPRISES}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Surprises
      </Link>

      {/* Header */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-neutral-900">{deal.title}</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {new Date(deal.startTime).toLocaleDateString()} — {new Date(deal.endTime).toLocaleDateString()} ·{' '}
          <span className="font-medium">{deal.surpriseType.replace('_', ' ')}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Total Reveals"
          value={analytics.totalReveals}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Redeemed"
          value={analytics.totalRedeemed}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={analytics.conversionRate}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={Layers}
          label="Slots Used"
          value={
            analytics.slotsTotal
              ? `${analytics.slotsUsed} / ${analytics.slotsTotal}`
              : `${analytics.slotsUsed} / ∞`
          }
          sub={
            analytics.slotsRemaining !== null
              ? `${analytics.slotsRemaining} remaining`
              : 'Unlimited slots'
          }
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Recent reveals */}
      {recentReveals.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">Recent Reveals</h2>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Revealed At</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-neutral-600">Redeemed At</th>
                </tr>
              </thead>
              <tbody>
                {recentReveals.map((reveal, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      'border-b border-neutral-50',
                      i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50',
                    )}
                  >
                    <td className="px-4 py-3 text-neutral-700">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                        {new Date(reveal.revealedAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          reveal.redeemed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700',
                        )}
                      >
                        {reveal.redeemed ? 'Redeemed' : 'Revealed only'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {reveal.redeemedAt
                        ? new Date(reveal.redeemedAt).toLocaleString()
                        : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export const SurpriseAnalyticsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can view surprise analytics.">
    <SurpriseAnalyticsContent />
  </MerchantProtectedRoute>
);

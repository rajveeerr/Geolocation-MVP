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
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className={cn('mb-3 inline-flex rounded-lg p-2', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
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
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300">
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
        className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-brand-primary-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back to My Surprises
      </Link>

      {/* Header */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-foreground">{deal.title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
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
          color="bg-blue-100 dark:bg-blue-950/40 text-blue-600"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Redeemed"
          value={analytics.totalRedeemed}
          color="bg-green-100 dark:bg-green-950/40 text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={analytics.conversionRate}
          color="bg-purple-100 dark:bg-purple-950/40 text-purple-600"
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
          color="bg-orange-100 dark:bg-orange-950/40 text-orange-600"
        />
      </div>

      {/* Recent reveals */}
      {recentReveals.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground">Recent Reveals</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Revealed At</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Redeemed At</th>
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
                      'border-b border-border',
                      i % 2 === 0 ? 'bg-card' : 'bg-muted/50',
                    )}
                  >
                    <td className="px-4 py-3 text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(reveal.revealedAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          reveal.redeemed
                            ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
                        )}
                      >
                        {reveal.redeemed ? 'Redeemed' : 'Revealed only'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
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

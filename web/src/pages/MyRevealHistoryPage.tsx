import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProtectedRoute } from '@/routing/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { useMyRevealHistory } from '@/hooks/useSurprises';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import type { RevealHistoryItem, SurpriseType } from '@/types/surprises';

const TYPE_LABELS: Record<SurpriseType, string> = {
  LOCATION_BASED: 'Location',
  TIME_BASED: 'Time',
  ENGAGEMENT_BASED: 'Check-in',
  RANDOM_DROP: 'Random Drop',
};

function HistoryCard({ item }: { item: RevealHistoryItem }) {
  const expired = !item.redeemed && new Date(item.expiresAt) < new Date();
  const discount = item.deal.discountPercentage
    ? `${item.deal.discountPercentage}% off`
    : item.deal.discountAmount
      ? `$${item.deal.discountAmount} off`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      {/* Logo / icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100">
        {item.deal.merchant.logoUrl ? (
          <img
            src={item.deal.merchant.logoUrl}
            alt={item.deal.merchant.businessName}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <span className="text-xl">🎁</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-neutral-900">{item.deal.title}</p>
            <p className="text-xs text-neutral-500">{item.deal.merchant.businessName}</p>
          </div>
          {discount && (
            <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              {discount}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-medium">
            {TYPE_LABELS[item.deal.surpriseType]}
          </span>
          <span>Revealed {new Date(item.revealedAt).toLocaleDateString()}</span>
        </div>

        {/* Status */}
        <div className="mt-2">
          {item.redeemed ? (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Redeemed {item.redeemedAt ? new Date(item.redeemedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          ) : expired ? (
            <span className="flex items-center gap-1 text-xs font-medium text-neutral-400">
              <XCircle className="h-3.5 w-3.5" />
              Expired — missed it
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <Clock className="h-3.5 w-3.5" />
              Revealed, not yet redeemed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MyRevealHistoryContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyRevealHistory(page);

  const reveals = data?.reveals ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={PATHS.SURPRISES}
            className="flex items-center gap-1 text-sm font-medium text-brand-primary-600 hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
              <History className="h-6 w-6 text-brand-primary-500" />
              My Reveal History
            </h1>
            {total > 0 && (
              <p className="mt-0.5 text-sm text-neutral-500">{total} reveal{total !== 1 ? 's' : ''} total</p>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error).message}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && reveals.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-20 text-center">
          <span className="text-5xl">🎁</span>
          <h3 className="mt-3 text-xl font-bold text-neutral-700">No reveals yet</h3>
          <p className="mt-1 text-neutral-500">Start exploring nearby surprises.</p>
          <Link to={PATHS.SURPRISES} className="mt-4 inline-block">
            <Button size="sm" className="rounded-full">Browse Surprises</Button>
          </Link>
        </div>
      )}

      {/* List */}
      {!isLoading && reveals.length > 0 && (
        <>
          <div className="space-y-3">
            {reveals.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const MyRevealHistoryPage = () => (
  <ProtectedRoute>
    <MyRevealHistoryContent />
  </ProtectedRoute>
);

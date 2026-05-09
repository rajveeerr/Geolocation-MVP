import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { ProtectedRoute } from '@/routing/ProtectedRoute';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import {
  useMyCateringOrders,
  type MyCateringOrderListItem,
} from '@/hooks/useCatering';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as const;

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  CONFIRMED: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  PREPARING: 'bg-violet-100 text-violet-700 ring-violet-600/20',
  READY: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  COMPLETED: 'bg-neutral-100 text-neutral-700 ring-neutral-400/20',
  CANCELLED: 'bg-rose-100 text-rose-800 ring-rose-600/20',
};

const STATUS_HINT: Record<string, string> = {
  PENDING: 'Waiting for the merchant to confirm.',
  CONFIRMED: 'The merchant accepted your request.',
  PREPARING: 'Your order is being prepared.',
  READY: 'Ready for pickup or out for delivery.',
  COMPLETED: 'Order complete.',
  CANCELLED: 'This order was cancelled.',
};

const formatMoney = (n: number) => `$${n.toFixed(2)}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

function OrderCard({ order }: { order: MyCateringOrderListItem }) {
  const meta = (order.metadata ?? {}) as Record<string, any>;
  const fulfillmentType = meta.fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup';
  const itemSummary =
    order.cateringOrderItems.length === 0
      ? 'No items'
      : order.cateringOrderItems.length === 1
        ? `${order.cateringOrderItems[0].quantity}× ${order.cateringOrderItems[0].cateringItem.name}`
        : `${order.cateringOrderItems[0].quantity}× ${order.cateringOrderItems[0].cateringItem.name} +${order.cateringOrderItems.length - 1} more`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <Link
        to={PATHS.CATERING_ORDER_CONFIRMATION.replace(':orderId', String(order.id))}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
            {order.merchant.logoUrl ? (
              <img
                src={order.merchant.logoUrl}
                alt={order.merchant.businessName}
                className="h-full w-full object-cover"
              />
            ) : (
              <ChefHat className="h-6 w-6 text-neutral-300" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-neutral-900">
                {order.merchant.businessName}
              </p>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                  STATUS_TONE[order.status] ?? 'bg-neutral-100 text-neutral-700 ring-neutral-400/20',
                )}
              >
                {order.status}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                {fulfillmentType}
              </span>
            </div>
            <p className="truncate text-xs text-neutral-700">{itemSummary}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Placed {formatDate(order.createdAt)}
              </span>
              <span className="font-mono text-neutral-400">{order.orderNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-base font-bold text-neutral-900">{formatMoney(order.finalAmount)}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary-600">
            View
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>

      <p className="mt-3 border-t border-neutral-100 pt-2 text-[11px] text-neutral-500">
        {STATUS_HINT[order.status] ?? ''}
      </p>
    </motion.div>
  );
}

function MyCateringOrdersInner() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useMyCateringOrders({ status: statusFilter, page, limit: 20 });

  const orders = data?.orders ?? [];
  const counts = data?.statusCounts ?? {};
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-screen-md space-y-5 px-4 py-8 sm:px-6">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
            My catering
          </div>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Your catering orders
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Catering requests you've placed and their current status.
          </p>
        </div>

        {(counts.ALL ?? 0) > 0 && (
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
            <Filter className="ml-1 mr-1 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
            {(['ALL', ...STATUSES] as Array<string>).map((s) => {
              const count = counts[s] ?? 0;
              if (s !== 'ALL' && count === 0) return null;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition',
                    statusFilter === s ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                  )}
                >
                  {s}
                  <span
                    className={cn(
                      'ml-1.5 rounded-full px-1.5 py-0.5 text-[11px]',
                      statusFilter === s ? 'bg-white/20' : 'bg-neutral-200',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {(error as Error).message}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
            <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
            <h3 className="text-lg font-semibold text-neutral-900">
              {statusFilter === 'ALL' ? 'No catering orders yet' : `No ${statusFilter.toLowerCase()} orders`}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {statusFilter === 'ALL'
                ? "When you place a catering request, it'll show up here."
                : 'Try a different status filter.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 py-2 text-sm">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="text-xs text-neutral-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const MyCateringOrdersPage = () => (
  <ProtectedRoute>
    <MyCateringOrdersInner />
  </ProtectedRoute>
);

export default MyCateringOrdersPage;

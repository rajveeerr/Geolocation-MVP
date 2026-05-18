import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Filter, Loader2, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import {
  CATERING_STATUSES,
  useMerchantCateringOrders,
  type CateringOrderStatus,
  type MerchantCateringOrder,
} from '@/hooks/useCatering';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  CONFIRMED: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  PREPARING: 'bg-violet-100 text-violet-700 ring-violet-600/20',
  READY: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  COMPLETED: 'bg-neutral-100 text-neutral-700 ring-neutral-400/20',
  CANCELLED: 'bg-rose-100 text-rose-800 ring-rose-600/20',
};

const formatMoney = (n: number) => `$${n.toFixed(2)}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        STATUS_TONE[status] ?? 'bg-neutral-100 text-neutral-700 ring-neutral-400/20',
      )}
    >
      {status}
    </span>
  );
}

function OrderRow({ order }: { order: MerchantCateringOrder }) {
  const meta = (order.metadata ?? {}) as Record<string, any>;
  const customerName = (meta.customerName as string | undefined) ?? order.user.name ?? 'Guest';
  const fulfillmentType = meta.fulfillmentType === 'DELIVERY' ? 'DELIVERY' : 'PICKUP';
  const itemSummary = order.cateringOrderItems.length === 0
    ? 'No items'
    : order.cateringOrderItems.length === 1
      ? `${order.cateringOrderItems[0].quantity}× ${order.cateringOrderItems[0].cateringItem.name}`
      : `${order.cateringOrderItems[0].quantity}× ${order.cateringOrderItems[0].cateringItem.name} +${order.cateringOrderItems.length - 1} more`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'p-4')}
    >
      <Link
        to={PATHS.MERCHANT_CATERING_ORDER_DETAIL.replace(':orderId', String(order.id))}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-neutral-500">{order.orderNumber}</span>
            <StatusBadge status={order.status} />
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold text-neutral-900">{customerName}</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-700">{itemSummary}</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Placed {formatDate(order.createdAt)}
            </span>
            {meta.contactPhone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {meta.contactPhone}
              </span>
            )}
            {meta.eventDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Event {new Date(meta.eventDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
              </span>
            )}
            {fulfillmentType === 'DELIVERY' && meta.deliveryAddress && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3" /> {meta.deliveryAddress}
              </span>
            )}
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
    </motion.div>
  );
}

function MerchantCateringOrdersInner() {
  const [statusFilter, setStatusFilter] = useState<CateringOrderStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useMerchantCateringOrders({ status: statusFilter, page, limit: 20 });

  const orders = data?.orders ?? [];
  const counts = data?.statusCounts ?? {};
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };

  const newOrdersCount = counts.PENDING ?? 0;

  const subtitle = useMemo(() => {
    if (newOrdersCount === 0) return 'Catering requests placed by your customers.';
    return `${newOrdersCount} new request${newOrdersCount === 1 ? '' : 's'} waiting for review.`;
  }, [newOrdersCount]);

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Catering</div>
        <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">Catering orders</h1>
        <p className="mt-2 text-[13px] text-neutral-500 sm:text-sm">{subtitle}</p>
      </div>

      <div className={cn(panelClass, 'flex flex-wrap items-center gap-2 overflow-x-auto p-3')}>
        <Filter className="ml-1 mr-1 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
        {(['ALL', ...CATERING_STATUSES] as Array<CateringOrderStatus | 'ALL'>).map((s) => {
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
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                  statusFilter === s ? 'bg-white/20' : 'bg-neutral-200',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : error ? (
        <div className={cn(panelClass, 'border-rose-200 bg-rose-50 p-4 text-sm text-rose-700')}>
          {(error as Error).message}
        </div>
      ) : orders.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">
            {statusFilter === 'ALL' ? 'No catering orders yet' : `No ${statusFilter.toLowerCase()} orders`}
          </h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            {statusFilter === 'ALL'
              ? 'When customers place a catering request, it lands here.'
              : 'Try a different status filter.'}
          </p>
          {statusFilter === 'ALL' && (
            <p className="mt-4 text-xs text-neutral-500">
              Don't have a catering menu yet?{' '}
              <Link to={PATHS.MERCHANT_CATERING} className="font-medium text-brand-primary-600 hover:underline">
                Set one up
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
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
  );
}

export const MerchantCateringOrdersPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can view catering orders.">
    <MerchantCateringOrdersInner />
  </MerchantProtectedRoute>
);

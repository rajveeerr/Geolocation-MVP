import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import {
  useMerchantCateringOrder,
  useUpdateMerchantCateringOrderStatus,
  type CateringOrderStatus,
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

/** Mirrors the BE transition map. */
const ALLOWED_TRANSITIONS: Record<CateringOrderStatus, CateringOrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const TRANSITION_LABELS: Record<CateringOrderStatus, string> = {
  PENDING: 'Mark pending',
  CONFIRMED: 'Confirm order',
  PREPARING: 'Mark preparing',
  READY: 'Mark ready',
  COMPLETED: 'Mark completed',
  CANCELLED: 'Cancel order',
};

const formatMoney = (n: number) => `$${n.toFixed(2)}`;

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

function MerchantCateringOrderDetailInner() {
  const { orderId: rawId } = useParams<{ orderId: string }>();
  const orderId = rawId ? Number(rawId) : null;
  const isValid = orderId !== null && Number.isFinite(orderId);

  const { data: order, isLoading, error } = useMerchantCateringOrder(isValid ? orderId : null);
  const updateStatus = useUpdateMerchantCateringOrderStatus();

  const [merchantNote, setMerchantNote] = useState('');
  const [pendingTarget, setPendingTarget] = useState<CateringOrderStatus | null>(null);

  const meta = useMemo(() => (order?.metadata ?? {}) as Record<string, any>, [order]);
  const merchantNotesHistory: Array<{ at: string; status: string; note: string | null }> =
    Array.isArray(meta.merchantNotes) ? meta.merchantNotes : [];

  if (!isValid) {
    return (
      <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Order not found</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Order not found</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {(error as Error | undefined)?.message ?? 'You do not have access to this order.'}
        </p>
        <Link to={PATHS.MERCHANT_CATERING_ORDERS} className="mt-4 inline-block text-sm font-medium text-brand-primary-600 hover:underline">
          Back to inbox
        </Link>
      </div>
    );
  }

  const transitions = ALLOWED_TRANSITIONS[order.status] ?? [];
  const fulfillmentType: 'PICKUP' | 'DELIVERY' = meta.fulfillmentType === 'DELIVERY' ? 'DELIVERY' : 'PICKUP';
  const customerName = (meta.customerName as string | undefined) ?? order.user.name ?? 'Guest';

  const handleTransition = async (target: CateringOrderStatus) => {
    setPendingTarget(target);
    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        status: target,
        merchantNote: merchantNote.trim() || null,
      });
      setMerchantNote('');
    } finally {
      setPendingTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-2 py-4">
      <Link
        to={PATHS.MERCHANT_CATERING_ORDERS}
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to catering orders
      </Link>

      <div className={cn(panelClass, 'p-5')}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-neutral-500">{order.orderNumber}</span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                  STATUS_TONE[order.status] ?? 'bg-neutral-100 text-neutral-700 ring-neutral-400/20',
                )}
              >
                {order.status}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                {fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
              {customerName}
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400">Order total</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
              {formatMoney(order.finalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <section className={cn(panelClass, 'p-5')}>
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Items</h2>
        <div className="space-y-3">
          {order.cateringOrderItems.map((line) => (
            <div key={line.id} className="flex gap-3 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                {line.cateringItem.imageUrl ? (
                  <img
                    src={line.cateringItem.imageUrl}
                    alt={line.cateringItem.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ChefHat className="h-5 w-5 text-neutral-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">
                      {line.quantity}× {line.cateringItem.name}
                    </p>
                    <p className="text-xs text-neutral-500">{line.cateringItem.category}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-neutral-900">
                    {formatMoney(line.totalPrice)}
                  </span>
                </div>
                {line.selectedOptions && line.selectedOptions.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-xs text-neutral-600">
                    {line.selectedOptions.map((opt) => (
                      <li key={opt.optionId}>
                        <span className="font-medium text-neutral-700">{opt.optionName}:</span>{' '}
                        {opt.choices.map((c) => c.label).join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
                {line.specialInstructions && (
                  <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-[11px] italic text-amber-900 ring-1 ring-amber-200">
                    "{line.specialInstructions}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1 border-t border-neutral-200 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-medium text-neutral-900">{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span className="text-neutral-900">Total</span>
            <span className="text-neutral-900">{formatMoney(order.finalAmount)}</span>
          </div>
        </div>
      </section>

      {/* Customer + fulfillment */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className={cn(panelClass, 'p-5')}>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Customer</h3>
          <div className="space-y-1.5 text-sm text-neutral-700">
            <p className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-neutral-400" />{customerName}</p>
            {(meta.contactEmail || order.user.email) && (
              <p className="flex items-center gap-2 text-neutral-600">
                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                <a href={`mailto:${meta.contactEmail ?? order.user.email}`} className="hover:underline">
                  {meta.contactEmail ?? order.user.email}
                </a>
              </p>
            )}
            {meta.contactPhone && (
              <p className="flex items-center gap-2 text-neutral-600">
                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                <a href={`tel:${meta.contactPhone}`} className="hover:underline">{meta.contactPhone}</a>
              </p>
            )}
          </div>
        </div>

        <div className={cn(panelClass, 'p-5')}>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">
            {fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}
          </h3>
          <div className="space-y-1.5 text-sm text-neutral-700">
            {fulfillmentType === 'DELIVERY' && meta.deliveryAddress && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                {meta.deliveryAddress}
              </p>
            )}
            {meta.eventDate && (
              <p className="flex items-start gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                Event: {new Date(meta.eventDate).toLocaleDateString()}
              </p>
            )}
            {fulfillmentType === 'PICKUP' && (
              <p className="text-xs text-neutral-500">Reach out to the customer to confirm pickup time.</p>
            )}
          </div>
        </div>
      </section>

      {meta.notes && (
        <section className={cn(panelClass, 'p-5')}>
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">Customer notes</h3>
          <p className="text-sm text-neutral-700">{meta.notes}</p>
        </section>
      )}

      {/* Status actions */}
      {transitions.length > 0 && (
        <section className={cn(panelClass, 'p-5')}>
          <h3 className="text-sm font-semibold text-neutral-900">Update status</h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Optionally add an internal note. The customer doesn't see notes — they appear in your history below.
          </p>

          <div className="mt-3">
            <Label htmlFor="merchant-note" className="text-xs font-medium text-neutral-600">
              Note <span className="font-normal text-neutral-400">(optional)</span>
            </Label>
            <Textarea
              id="merchant-note"
              value={merchantNote}
              onChange={(e) => setMerchantNote(e.target.value)}
              placeholder="e.g. Confirmed by phone, prep starts 9am"
              rows={2}
              maxLength={500}
              className="mt-1.5 resize-none"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {transitions.map((target) => {
              const isCancel = target === 'CANCELLED';
              const isLoading = pendingTarget === target;
              return (
                <Button
                  key={target}
                  type="button"
                  variant={isCancel ? 'secondary' : 'primary'}
                  onClick={() => handleTransition(target)}
                  disabled={updateStatus.isPending}
                  className={cn(
                    'rounded-full px-4',
                    isCancel && 'border border-rose-200 text-rose-700 hover:bg-rose-50',
                  )}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {TRANSITION_LABELS[target]}
                </Button>
              );
            })}
          </div>
        </section>
      )}

      {/* History */}
      {merchantNotesHistory.length > 0 && (
        <section className={cn(panelClass, 'p-5')}>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Status history</h3>
          <ol className="space-y-2 text-sm">
            {merchantNotesHistory.slice().reverse().map((entry, idx) => (
              <li key={`${entry.at}-${idx}`} className="flex flex-wrap items-baseline gap-x-2 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                    STATUS_TONE[entry.status] ?? 'bg-neutral-100 text-neutral-700 ring-neutral-400/20',
                  )}
                >
                  {entry.status}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(entry.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
                {entry.note && <span className="text-sm text-neutral-700">— {entry.note}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

export const MerchantCateringOrderDetailPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can view catering orders.">
    <MerchantCateringOrderDetailInner />
  </MerchantProtectedRoute>
);

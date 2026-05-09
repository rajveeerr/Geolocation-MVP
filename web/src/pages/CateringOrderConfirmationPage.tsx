import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChefHat, Clock, Loader2, MapPin } from 'lucide-react';
import { useCateringOrder } from '@/hooks/useCatering';
import { cn } from '@/lib/utils';

const formatMoney = (n: number) => `$${n.toFixed(2)}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  COMPLETED: 'bg-neutral-100 text-neutral-700 ring-neutral-400/20',
  CANCELLED: 'bg-rose-100 text-rose-800 ring-rose-600/20',
};

export const CateringOrderConfirmationPage = () => {
  const { orderId: rawId } = useParams<{ orderId: string }>();
  const orderId = rawId ? Number(rawId) : null;
  const isValid = orderId !== null && Number.isFinite(orderId);

  const { data: order, isLoading, error } = useCateringOrder(isValid ? orderId : null);

  if (!isValid) {
    return (
      <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Order not found</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Order not found</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {(error as Error | undefined)?.message ?? 'You may not have access to this order.'}
        </p>
      </div>
    );
  }

  const meta = (order.metadata ?? {}) as Record<string, any>;
  const customerName = meta.customerName ?? '';
  const contactEmail = meta.contactEmail ?? '';
  const contactPhone = meta.contactPhone ?? '';
  const fulfillmentType: 'PICKUP' | 'DELIVERY' = meta.fulfillmentType === 'DELIVERY' ? 'DELIVERY' : 'PICKUP';
  const deliveryAddress = meta.deliveryAddress ?? '';
  const eventDate = meta.eventDate ?? null;
  const notes = meta.notes ?? '';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={order.merchant ? `/catering/${order.merchant.id}` : '/'}
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {order.merchant ? `Back to ${order.merchant.businessName}` : 'Back home'}
          </Link>
          <Link
            to="/my-activity/catering"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
          >
            All my orders →
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">Catering request sent</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {order.merchant?.businessName ?? 'The merchant'} will follow up to confirm details and billing.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-emerald-200">
            <span className="text-xs uppercase tracking-wider text-neutral-500">Order #</span>
            <span className="text-sm font-mono font-semibold text-neutral-900">{order.orderNumber}</span>
          </div>
          <div className="mt-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                STATUS_TONE[order.status] ?? 'bg-neutral-100 text-neutral-700 ring-neutral-400/20',
              )}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* Items */}
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
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
                    <p className="text-sm font-semibold text-neutral-900">
                      {line.quantity}× {line.cateringItem.name}
                    </p>
                    <span className="shrink-0 text-sm font-bold text-neutral-900">
                      {formatMoney(line.totalPrice)}
                    </span>
                  </div>
                  {line.selectedOptions && line.selectedOptions.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs text-neutral-500">
                      {line.selectedOptions.map((opt) => (
                        <li key={opt.optionId}>
                          <span className="font-medium text-neutral-700">{opt.optionName}:</span>{' '}
                          {opt.choices.map((c) => c.label).join(', ')}
                        </li>
                      ))}
                    </ul>
                  )}
                  {line.specialInstructions && (
                    <p className="mt-1 text-[11px] italic text-neutral-500">"{line.specialInstructions}"</p>
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
            <p className="text-[11px] text-neutral-500">Taxes and delivery fees not included — quoted by merchant.</p>
          </div>
        </section>

        {/* Fulfillment & contact */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
              {fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'}
            </h3>
            <div className="space-y-2 text-sm text-neutral-700">
              {fulfillmentType === 'DELIVERY' && deliveryAddress && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  {deliveryAddress}
                </p>
              )}
              {eventDate && (
                <p className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  Event date: {new Date(eventDate).toLocaleDateString()}
                </p>
              )}
              {fulfillmentType === 'PICKUP' && (
                <p className="text-xs text-neutral-500">The merchant will share pickup details when they confirm.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">Contact</h3>
            <div className="space-y-1 text-sm text-neutral-700">
              {customerName && <p>{customerName}</p>}
              {contactEmail && <p className="text-neutral-600">{contactEmail}</p>}
              {contactPhone && <p className="text-neutral-600">{contactPhone}</p>}
            </div>
          </div>
        </section>

        {notes && (
          <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="mb-2 text-sm font-semibold text-neutral-900">Notes</h3>
            <p className="text-sm text-neutral-700">{notes}</p>
          </section>
        )}

        <p className="mt-6 text-center text-xs text-neutral-500">
          Order placed {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default CateringOrderConfirmationPage;

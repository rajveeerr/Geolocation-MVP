import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChefHat, Loader2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCateringCart, type CateringCartLine } from '@/context/CateringCartContext';
import { usePlaceCateringOrder } from '@/hooks/useCatering';
import { useAuth } from '@/context/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useModal } from '@/context/ModalContext';
import { cn } from '@/lib/utils';

interface CateringCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'review' | 'checkout';

interface CheckoutFormState {
  customerName: string;
  contactEmail: string;
  contactPhone: string;
  fulfillmentType: 'PICKUP' | 'DELIVERY';
  deliveryAddress: string;
  eventDate: string;
  notes: string;
}

const formatMoney = (n: number) => `$${n.toFixed(2)}`;

const initialCheckout = (defaults?: { name?: string; email?: string }): CheckoutFormState => ({
  customerName: defaults?.name ?? '',
  contactEmail: defaults?.email ?? '',
  contactPhone: '',
  fulfillmentType: 'PICKUP',
  deliveryAddress: '',
  eventDate: '',
  notes: '',
});

function LineRow({
  line,
  onQuantityChange,
  onRemove,
}: {
  line: CateringCartLine;
  onQuantityChange: (uid: string, qty: number) => void;
  onRemove: (uid: string) => void;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
        {line.itemImageUrl ? (
          <img src={line.itemImageUrl} alt={line.itemName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ChefHat className="h-6 w-6 text-neutral-300" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-neutral-900">{line.itemName}</p>
          <button
            type="button"
            onClick={() => onRemove(line.uid)}
            className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Remove line"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {line.selectedOptionsLabel && (
          <p className="line-clamp-2 text-xs text-neutral-500">{line.selectedOptionsLabel}</p>
        )}

        {line.specialInstructions && (
          <p className="line-clamp-1 text-[11px] italic text-neutral-500">"{line.specialInstructions}"</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="inline-flex items-center rounded-full border border-neutral-200">
            <button
              type="button"
              onClick={() => onQuantityChange(line.uid, Math.max(1, line.quantity - 1))}
              disabled={line.pricingType === 'FIXED' || line.quantity <= 1}
              className="rounded-l-full p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-[2.5rem] px-2 text-center text-xs font-semibold text-neutral-900">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(line.uid, line.quantity + 1)}
              disabled={line.pricingType === 'FIXED'}
              className="rounded-r-full p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="text-sm font-bold text-neutral-900">{formatMoney(line.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}

export const CateringCartDrawer = ({ open, onClose }: CateringCartDrawerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { openModal } = useModal();
  const { cart, itemCount, totalAmount, updateQuantity, removeLine, clear } = useCateringCart();
  const placeOrder = usePlaceCateringOrder();

  const [step, setStep] = useState<Step>('review');
  const [form, setForm] = useState<CheckoutFormState>(() =>
    initialCheckout({ name: user?.name ?? undefined, email: user?.email ?? undefined }),
  );

  // Reset to review step + close on ESC.
  useEffect(() => {
    if (open) setStep('review');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Refresh defaults when user becomes available.
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || (user.name ?? ''),
        contactEmail: prev.contactEmail || (user.email ?? ''),
      }));
    }
  }, [user]);

  const startCheckout = () => {
    if (!user) {
      onClose();
      openModal();
      toast({ title: 'Log in to checkout', description: 'Sign in to place a catering order.' });
      return;
    }
    if (cart.lines.length === 0) return;
    setStep('checkout');
  };

  const submitOrder = async () => {
    if (!cart.merchantId) return;
    if (!form.customerName.trim() || !form.contactEmail.trim() || !form.contactPhone.trim()) {
      toast({ title: 'Missing contact info', description: 'Name, email, and phone are required.', variant: 'destructive' });
      return;
    }
    if (form.fulfillmentType === 'DELIVERY' && !form.deliveryAddress.trim()) {
      toast({ title: 'Delivery address required', variant: 'destructive' });
      return;
    }

    try {
      const order = await placeOrder.mutateAsync({
        merchantId: cart.merchantId,
        payload: {
          customerName: form.customerName.trim(),
          contactEmail: form.contactEmail.trim(),
          contactPhone: form.contactPhone.trim(),
          fulfillmentType: form.fulfillmentType,
          deliveryAddress: form.fulfillmentType === 'DELIVERY' ? form.deliveryAddress.trim() : null,
          eventDate: form.eventDate || null,
          notes: form.notes.trim() || null,
          items: cart.lines.map((l) => ({
            cateringItemId: l.cateringItemId,
            quantity: l.quantity,
            selectedChoiceIds: l.selectedChoiceIds,
            specialInstructions: l.specialInstructions,
          })),
        },
      });
      clear();
      onClose();
      navigate(`/catering/orders/${order.id}`);
    } catch {
      // toast shown in hook
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Catering cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-neutral-700" />
                <h2 className="text-base font-semibold text-neutral-900">
                  {step === 'review' ? 'Your cart' : 'Checkout'}
                </h2>
                {step === 'review' && itemCount > 0 && (
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                    {itemCount} item{itemCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {cart.lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingBag className="mb-3 h-10 w-10 text-neutral-300" aria-hidden />
                <h3 className="text-base font-semibold text-neutral-900">Your cart is empty</h3>
                <p className="mt-1 text-sm text-neutral-500">Add items from the menu to start your catering order.</p>
              </div>
            ) : step === 'review' ? (
              <>
                {cart.merchantName && (
                  <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-2 text-xs text-neutral-500">
                    Catering from <span className="font-semibold text-neutral-700">{cart.merchantName}</span>
                  </div>
                )}
                <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
                  {cart.lines.map((line) => (
                    <LineRow
                      key={line.uid}
                      line={line}
                      onQuantityChange={updateQuantity}
                      onRemove={removeLine}
                    />
                  ))}
                </div>
                <footer className="border-t border-neutral-200 bg-white px-5 py-4">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-sm text-neutral-600">Subtotal</span>
                    <span className="text-2xl font-bold text-neutral-900">{formatMoney(totalAmount)}</span>
                  </div>
                  <p className="mb-3 text-[11px] text-neutral-500">
                    Taxes and delivery quoted by the merchant after you place this request.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Clear your cart?')) clear();
                      }}
                      className="rounded-full px-3 text-xs text-neutral-500 hover:text-rose-600"
                    >
                      Clear
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={startCheckout}
                      className="ml-auto flex-1 rounded-full text-base font-semibold"
                    >
                      Checkout
                    </Button>
                  </div>
                </footer>
              </>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setStep('review')}
                    className="text-xs font-medium text-brand-primary-600 hover:underline"
                  >
                    ← Back to cart
                  </button>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="cust-name" className="text-sm font-medium text-neutral-700">
                        Full name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cust-name"
                        value={form.customerName}
                        onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                        className="mt-1.5 h-10"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="cust-email" className="text-sm font-medium text-neutral-700">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cust-email"
                          type="email"
                          value={form.contactEmail}
                          onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                          className="mt-1.5 h-10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cust-phone" className="text-sm font-medium text-neutral-700">
                          Phone <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cust-phone"
                          type="tel"
                          value={form.contactPhone}
                          onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                          className="mt-1.5 h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-neutral-700">Fulfillment</Label>
                      <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {(['PICKUP', 'DELIVERY'] as const).map((kind) => (
                          <button
                            key={kind}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, fulfillmentType: kind }))}
                            className={cn(
                              'rounded-xl border-2 p-3 text-left text-sm transition',
                              form.fulfillmentType === kind
                                ? 'border-brand-primary-500 bg-brand-primary-50'
                                : 'border-neutral-200 hover:border-neutral-300',
                            )}
                          >
                            <span className="font-semibold text-neutral-900">
                              {kind === 'PICKUP' ? 'Pickup' : 'Delivery'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {form.fulfillmentType === 'DELIVERY' && (
                      <div>
                        <Label htmlFor="cust-addr" className="text-sm font-medium text-neutral-700">
                          Delivery address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="cust-addr"
                          value={form.deliveryAddress}
                          onChange={(e) => setForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
                          placeholder="Street, city, ZIP"
                          className="mt-1.5 h-10"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="cust-date" className="text-sm font-medium text-neutral-700">
                        Event date <span className="text-xs font-normal text-neutral-500">(optional)</span>
                      </Label>
                      <Input
                        id="cust-date"
                        type="date"
                        lang="en-US"
                        value={form.eventDate}
                        onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
                        className="mt-1.5 h-10 sm:max-w-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cust-notes" className="text-sm font-medium text-neutral-700">
                        Notes for the merchant <span className="text-xs font-normal text-neutral-500">(optional)</span>
                      </Label>
                      <Textarea
                        id="cust-notes"
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        rows={3}
                        maxLength={1000}
                        className="mt-1.5 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <footer className="border-t border-neutral-200 bg-white px-5 py-4">
                  <div className="mb-3 flex items-baseline justify-between">
                    <span className="text-sm text-neutral-600">Total</span>
                    <span className="text-2xl font-bold text-neutral-900">{formatMoney(totalAmount)}</span>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={submitOrder}
                    disabled={placeOrder.isPending}
                    className="w-full rounded-full py-3 text-base font-semibold"
                  >
                    {placeOrder.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Place catering request
                  </Button>
                  <p className="mt-2 text-center text-[11px] text-neutral-500">
                    No payment now — the merchant will follow up to confirm and bill.
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

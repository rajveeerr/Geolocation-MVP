import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Ticket,
  Plus,
  Trash2,
  Edit2,
  Send,
  Eye,
  Package,
  Globe,
  Lock,
  Check,
  X,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  useEventForManage,
  useUpdateEvent,
  useDeleteEvent,
  usePublishEvent,
  useCreateTicketTier,
  useUpdateTicketTier,
  useDeleteTicketTier,
  useCreateAddOn,
  useUpdateAddOn,
  EVENT_TYPES,
  EVENT_STATUSES,
  TICKET_TIERS,
  type CreateTicketTierPayload,
  type CreateAddOnPayload,
  type EventAddOn,
} from '@/hooks/useMerchantEvents';

// ─── Status Badge ───────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
  PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
  SOLD_OUT: 'bg-purple-100 text-purple-700 border-purple-200',
};

function StatusBadge({ status }: { status: string }) {
  const label = EVENT_STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold',
        statusStyles[status] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200',
      )}
    >
      {label}
    </span>
  );
}

// ─── Section Wrapper ────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-brand-primary-500" />
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Editable Field ─────────────────────────────────────────────────

function EditableField({
  label,
  value,
  onSave,
  type = 'text',
  multiline = false,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="group">
        <label className="mb-0.5 block text-xs font-semibold text-neutral-500">
          {label}
        </label>
        <div className="flex items-start gap-2">
          <span className="flex-1 text-sm text-neutral-800">
            {value || <span className="italic text-neutral-400">Not set</span>}
          </span>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="rounded p-1 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-brand-primary-500"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-0.5 block text-xs font-semibold text-neutral-500">{label}</label>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full rounded-lg border border-brand-primary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          rows={3}
          autoFocus
        />
      ) : (
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full rounded-lg border border-brand-primary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          autoFocus
        />
      )}
      <div className="mt-1.5 flex gap-1.5">
        <button
          onClick={handleSave}
          className="rounded bg-brand-primary-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-primary-600"
        >
          <Check className="mr-1 inline h-3 w-3" />
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded px-2.5 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Ticket Tier Card ───────────────────────────────────────────────

function TicketTierCard({
  tier,
  eventId,
}: {
  tier: {
    id: number;
    name: string;
    tier: string;
    price: number;
    totalQuantity: number;
    soldQuantity: number;
    reservedQuantity: number;
    isActive: boolean;
    description: string | null;
    maxPerOrder: number;
  };
  eventId: number;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: tier.name,
    price: tier.price,
    totalQuantity: tier.totalQuantity,
    description: tier.description ?? '',
    maxPerOrder: tier.maxPerOrder,
  });
  const updateTier = useUpdateTicketTier(eventId);
  const deleteTier = useDeleteTicketTier(eventId);
  const { toast } = useToast();

  const remaining = tier.totalQuantity - tier.soldQuantity - tier.reservedQuantity;
  const soldPercent = tier.totalQuantity > 0
    ? Math.round((tier.soldQuantity / tier.totalQuantity) * 100)
    : 0;

  const handleSave = () => {
    updateTier.mutate(
      { tierId: tier.id, data: form },
      {
        onSuccess: () => {
          toast({ title: 'Tier updated' });
          setEditing(false);
        },
        onError: (err) =>
          toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      },
    );
  };

  const handleDelete = () => {
    if (!confirm('Delete this ticket tier?')) return;
    deleteTier.mutate(tier.id, {
      onSuccess: (data) =>
        toast({ title: data.action === 'deactivated' ? 'Tier deactivated' : 'Tier deleted' }),
      onError: (err) =>
        toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  if (!tier.isActive) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 opacity-60">
        <div className="flex items-center justify-between">
          <span className="font-medium text-neutral-500 line-through">{tier.name}</span>
          <span className="text-xs text-neutral-400">Deactivated</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      {!editing ? (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900">{tier.name}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                {TICKET_TIERS.find((t) => t.value === tier.tier)?.label ?? tier.tier}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(true)}
                className="rounded p-1.5 text-neutral-400 hover:text-brand-primary-500 hover:bg-neutral-100"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="rounded p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {tier.description && (
            <p className="mb-2 text-sm text-neutral-500">{tier.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-neutral-900">${tier.price.toFixed(2)}</span>
            <span className="text-neutral-500">
              {tier.soldQuantity} sold / {tier.totalQuantity} total
            </span>
            <span className="text-green-600">{remaining} left</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100">
            <div
              className="h-1.5 rounded-full bg-brand-primary-500 transition-all"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Price ($)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                Total Quantity (min {tier.soldQuantity})
              </label>
              <input
                type="number"
                min={tier.soldQuantity || 1}
                value={form.totalQuantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalQuantity: Number(e.target.value) }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">Max Per Order</label>
              <input
                type="number"
                min={1}
                value={form.maxPerOrder}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxPerOrder: Number(e.target.value) }))
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateTier.isPending}
              className="rounded-lg bg-brand-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-primary-600 disabled:opacity-50"
            >
              {updateTier.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add-On Card ────────────────────────────────────────────────────

function AddOnCard({ addOn, eventId }: { addOn: EventAddOn; eventId: number }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: addOn.name,
    price: addOn.price,
    category: addOn.category,
    description: addOn.description ?? '',
    maxPerUser: addOn.maxPerUser,
  });
  const updateAddOn = useUpdateAddOn(eventId);
  const { toast } = useToast();

  const handleSave = () => {
    updateAddOn.mutate(
      { addOnId: addOn.id, data: form },
      {
        onSuccess: () => {
          toast({ title: 'Add-on updated' });
          setEditing(false);
        },
        onError: (err) =>
          toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      },
    );
  };

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-800">{addOn.name}</span>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
              {addOn.category}
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            ${addOn.price.toFixed(2)} · Max {addOn.maxPerUser}/person
            {addOn.description && ` · ${addOn.description}`}
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="rounded p-1.5 text-neutral-400 hover:text-brand-primary-500"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-brand-primary-200 bg-brand-primary-50/30 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Category</label>
          <input
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Price ($)</label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100">Cancel</button>
        <button
          onClick={handleSave}
          disabled={updateAddOn.isPending}
          className="rounded-lg bg-brand-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-primary-600 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Add Tier Form ──────────────────────────────────────────────────

function AddTierForm({
  eventId,
  onClose,
}: {
  eventId: number;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateTicketTierPayload>({
    name: '',
    tier: 'GENERAL_ADMISSION',
    price: 0,
    totalQuantity: 100,
    maxPerOrder: 10,
  });
  const createTier = useCreateTicketTier(eventId);
  const { toast } = useToast();

  const handleSubmit = () => {
    createTier.mutate(form, {
      onSuccess: () => {
        toast({ title: 'Ticket tier created' });
        onClose();
      },
      onError: (err) =>
        toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-lg border-2 border-brand-primary-200 bg-brand-primary-50/30 p-4 space-y-3"
    >
      <h4 className="text-sm font-bold text-neutral-700">New Ticket Tier</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g., General Admission"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Tier *</label>
          <select
            value={form.tier}
            onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as typeof form.tier }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {TICKET_TIERS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Price ($) *</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Quantity *</label>
          <input
            type="number"
            min={1}
            value={form.totalQuantity}
            onChange={(e) => setForm((f) => ({ ...f, totalQuantity: Number(e.target.value) }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Max/Order</label>
          <input
            type="number"
            min={1}
            value={form.maxPerOrder}
            onChange={(e) => setForm((f) => ({ ...f, maxPerOrder: Number(e.target.value) }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-neutral-600">Description</label>
        <input
          value={form.description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What's included..."
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!form.name || form.totalQuantity < 1 || createTier.isPending}
          className="rounded-lg bg-brand-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-primary-600 disabled:opacity-50"
        >
          {createTier.isPending ? 'Creating...' : 'Create Tier'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Add Add-On Form ────────────────────────────────────────────────

function AddAddOnForm({
  eventId,
  onClose,
}: {
  eventId: number;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateAddOnPayload>({
    name: '',
    category: '',
    price: 0,
    maxPerUser: 1,
  });
  const createAddOn = useCreateAddOn(eventId);
  const { toast } = useToast();

  const handleSubmit = () => {
    createAddOn.mutate(form, {
      onSuccess: () => {
        toast({ title: 'Add-on created' });
        onClose();
      },
      onError: (err) =>
        toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-lg border-2 border-brand-primary-200 bg-brand-primary-50/30 p-4 space-y-3"
    >
      <h4 className="text-sm font-bold text-neutral-700">New Add-On</h4>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g., VIP Parking"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Category *</label>
          <input
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="e.g., Parking, F&B, Merch"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-600">Price ($) *</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-neutral-600">Description</label>
        <input
          value={form.description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What this add-on includes..."
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!form.name || !form.category || createAddOn.isPending}
          className="rounded-lg bg-brand-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-primary-600 disabled:opacity-50"
        >
          {createAddOn.isPending ? 'Creating...' : 'Create Add-On'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Content ───────────────────────────────────────────────────

function EventManageContent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const numericId = eventId ? Number(eventId) : undefined;

  const { data: event, isLoading, error } = useEventForManage(numericId);
  const updateEvent = useUpdateEvent(numericId ?? 0);
  const deleteEvent = useDeleteEvent();
  const publishEvent = usePublishEvent(numericId ?? 0);

  const [showAddTier, setShowAddTier] = useState(false);
  const [showAddAddOn, setShowAddAddOn] = useState(false);

  const handleFieldUpdate = (field: string, value: unknown) => {
    updateEvent.mutate(
      { [field]: value } as Record<string, unknown>,
      {
        onSuccess: () => toast({ title: 'Updated' }),
        onError: (err) =>
          toast({ title: 'Error', description: err.message, variant: 'destructive' }),
      },
    );
  };

  const handlePublish = () => {
    publishEvent.mutate(undefined, {
      onSuccess: () =>
        toast({ title: 'Event Published!', description: 'Your event is now live.' }),
      onError: (err) =>
        toast({ title: 'Cannot Publish', description: err.message, variant: 'destructive' }),
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete/cancel this event?')) return;
    deleteEvent.mutate(numericId!, {
      onSuccess: () => {
        toast({ title: 'Event removed' });
        navigate(PATHS.MERCHANT_EVENTS);
      },
      onError: (err) =>
        toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-red-600">Event not found</p>
        <Link to={PATHS.MERCHANT_EVENTS}>
          <Button variant="secondary" className="rounded-lg">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isDraft = event.status === 'DRAFT';
  const isPublished = event.status === 'PUBLISHED';

  // Cast addOns safely
  const addOns: EventAddOn[] = (event as unknown as { addOns?: EventAddOn[] }).addOns ?? [];

  return (
    <div className="container mx-auto max-w-screen-lg px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(PATHS.MERCHANT_EVENTS)}
          className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-neutral-900">{event.title}</h1>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-sm text-neutral-500">
              {EVENT_TYPES.find((t) => t.value === event.eventType)?.label ?? event.eventType}
              {' · '}
              Created {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/events/${event.id}`} target="_blank">
              <Button variant="secondary" size="sm" className="rounded-lg">
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Preview
              </Button>
            </Link>
            {isPublished && (
              <Link to={PATHS.MERCHANT_EVENTS_CHECKIN.replace(':eventId', String(event.id))}>
                <Button variant="secondary" size="sm" className="rounded-lg">
                  <QrCode className="mr-1.5 h-3.5 w-3.5" />
                  Check In
                </Button>
              </Link>
            )}
            {isDraft && (
              <Button
                size="sm"
                className="rounded-lg"
                onClick={handlePublish}
                disabled={publishEvent.isPending}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                {publishEvent.isPending ? 'Publishing...' : 'Publish'}
              </Button>
            )}
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
              title="Delete/Cancel"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Publish requirements banner */}
      {isDraft && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Ready to publish?</p>
            <ul className="mt-1 space-y-0.5 text-sm text-amber-700">
              <li className="flex items-center gap-1.5">
                {event.coverImageUrl ? (
                  <Check className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <X className="h-3.5 w-3.5 text-red-500" />
                )}
                Cover image
              </li>
              {!event.isFreeEvent && (
                <li className="flex items-center gap-1.5">
                  {event.ticketTiers.length > 0 ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-red-500" />
                  )}
                  At least one ticket tier (for paid events)
                </li>
              )}
            </ul>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Event Details */}
        <Section title="Event Details" icon={Calendar}>
          <div className="grid gap-4 sm:grid-cols-2">
            <EditableField
              label="Title"
              value={event.title}
              onSave={(v) => handleFieldUpdate('title', v)}
            />
            <EditableField
              label="Short Description"
              value={event.shortDescription ?? ''}
              onSave={(v) => handleFieldUpdate('shortDescription', v)}
            />
            <div className="sm:col-span-2">
              <EditableField
                label="Description"
                value={event.description}
                onSave={(v) => handleFieldUpdate('description', v)}
                multiline
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-neutral-500">
                Start Date
              </label>
              <p className="text-sm text-neutral-800">
                {startDate.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-neutral-500">
                End Date
              </label>
              <p className="text-sm text-neutral-800">
                {endDate.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </Section>

        {/* Venue / Location */}
        <Section title="Venue" icon={MapPin}>
          <div className="grid gap-4 sm:grid-cols-2">
            {event.isVirtualEvent ? (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-neutral-700">Virtual Event</span>
                {event.virtualEventUrl && (
                  <a
                    href={event.virtualEventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-primary-500 underline"
                  >
                    Link
                  </a>
                )}
              </div>
            ) : (
              <>
                <EditableField
                  label="Venue Name"
                  value={event.venueName ?? ''}
                  onSave={(v) => handleFieldUpdate('venueName', v)}
                />
                <EditableField
                  label="Venue Address"
                  value={event.venueAddress ?? ''}
                  onSave={(v) => handleFieldUpdate('venueAddress', v)}
                />
              </>
            )}
          </div>
        </Section>

        {/* Stats */}
        <Section title="Attendance" icon={Users}>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-neutral-50 p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">{event.currentAttendees}</p>
              <p className="text-xs text-neutral-500">Attendees</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">
                {event.maxAttendees ?? '∞'}
              </p>
              <p className="text-xs text-neutral-500">Capacity</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">
                {event.availableTickets}
              </p>
              <p className="text-xs text-neutral-500">Tickets Left</p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                {event.isPrivate ? (
                  <Lock className="h-4 w-4 text-amber-500" />
                ) : (
                  <Globe className="h-4 w-4 text-green-500" />
                )}
                <p className="text-sm font-bold text-neutral-900">
                  {event.isPrivate ? 'Private' : 'Public'}
                </p>
              </div>
              <p className="text-xs text-neutral-500">Visibility</p>
            </div>
          </div>
        </Section>

        {/* Ticket Tiers */}
        <Section
          title="Ticket Tiers"
          icon={Ticket}
          action={
            !showAddTier && (
              <button
                onClick={() => setShowAddTier(true)}
                className="flex items-center gap-1 rounded-lg bg-brand-primary-50 px-3 py-1.5 text-sm font-medium text-brand-primary-600 hover:bg-brand-primary-100"
              >
                <Plus className="h-4 w-4" />
                Add Tier
              </button>
            )
          }
        >
          <div className="space-y-3">
            {event.ticketTiers.map((tier) => (
              <TicketTierCard key={tier.id} tier={tier} eventId={event.id} />
            ))}
            {showAddTier && (
              <AddTierForm
                eventId={event.id}
                onClose={() => setShowAddTier(false)}
              />
            )}
            {event.ticketTiers.length === 0 && !showAddTier && (
              <p className="py-6 text-center text-sm text-neutral-400">
                {event.isFreeEvent
                  ? 'This is a free event — no ticket tiers needed.'
                  : 'No ticket tiers yet. Add one to enable ticket sales.'}
              </p>
            )}
          </div>
        </Section>

        {/* Add-Ons */}
        <Section
          title="Add-Ons"
          icon={Package}
          action={
            !showAddAddOn && (
              <button
                onClick={() => setShowAddAddOn(true)}
                className="flex items-center gap-1 rounded-lg bg-brand-primary-50 px-3 py-1.5 text-sm font-medium text-brand-primary-600 hover:bg-brand-primary-100"
              >
                <Plus className="h-4 w-4" />
                Add Add-On
              </button>
            )
          }
        >
          <div className="space-y-3">
            {addOns.map((addOn) => (
              <AddOnCard key={addOn.id} addOn={addOn} eventId={event.id} />
            ))}
            {showAddAddOn && (
              <AddAddOnForm
                eventId={event.id}
                onClose={() => setShowAddAddOn(false)}
              />
            )}
            {addOns.length === 0 && !showAddAddOn && (
              <p className="py-6 text-center text-sm text-neutral-400">
                No add-ons yet. Add optional extras like parking, merch, or F&B.
              </p>
            )}
          </div>
        </Section>

        {/* Media */}
        <Section title="Media" icon={Calendar}>
          <div className="space-y-4">
            <EditableField
              label="Cover Image URL"
              value={event.coverImageUrl ?? ''}
              onSave={(v) => handleFieldUpdate('coverImageUrl', v)}
              type="url"
            />
            {event.coverImageUrl && (
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <img
                  src={event.coverImageUrl}
                  alt="Cover"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
            <EditableField
              label="Video URL"
              value={event.videoUrl ?? ''}
              onSave={(v) => handleFieldUpdate('videoUrl', v)}
              type="url"
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

// ─── Exported Page ──────────────────────────────────────────────────

export const EventManagePage = () => (
  <MerchantProtectedRoute fallbackMessage="Only event organizers can manage events.">
    <EventManageContent />
  </MerchantProtectedRoute>
);

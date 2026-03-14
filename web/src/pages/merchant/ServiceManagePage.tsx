import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Send, Pause, Ban, CheckCircle2, Clock, QrCode, UserCheck, UserX, Sparkles } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import {
  SERVICE_BOOKING_STATUSES,
  useCancelService,
  useCompleteServiceBooking,
  useConfirmServiceBooking,
  useCreateServiceAddOn,
  useCreateServicePricingTier,
  useDeleteService,
  useDeleteServiceAddOn,
  useDeleteServicePricingTier,
  useMerchantService,
  useMerchantServiceBookings,
  useNoShowServiceBooking,
  usePauseService,
  usePublishService,
  useServiceCheckIn,
  useUpdateService,
  useUpdateServiceAddOn,
  useUpdateServicePricingTier,
} from '@/hooks/useServices';

function ServiceManageInner() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const parsedServiceId = Number(serviceId);
  const { toast } = useToast();
  const navigate = useNavigate();

  const serviceQuery = useMerchantService(parsedServiceId);
  const [bookingStatus, setBookingStatus] = useState<string>('');
  const [coverUploadOpen, setCoverUploadOpen] = useState(false);
  const bookingsQuery = useMerchantServiceBookings({
    serviceId: parsedServiceId,
    status: bookingStatus || undefined,
    page: 1,
    limit: 20,
  });

  const updateService = useUpdateService(parsedServiceId);
  const deleteService = useDeleteService();
  const publishService = usePublishService(parsedServiceId);
  const pauseService = usePauseService(parsedServiceId);
  const cancelService = useCancelService(parsedServiceId);

  const createTier = useCreateServicePricingTier(parsedServiceId);
  const updateTier = useUpdateServicePricingTier(parsedServiceId);
  const deleteTier = useDeleteServicePricingTier(parsedServiceId);

  const createAddOn = useCreateServiceAddOn(parsedServiceId);
  const updateAddOn = useUpdateServiceAddOn(parsedServiceId);
  const deleteAddOn = useDeleteServiceAddOn(parsedServiceId);

  const confirmBooking = useConfirmServiceBooking();
  const completeBooking = useCompleteServiceBooking();
  const noShowBooking = useNoShowServiceBooking();
  const checkInBooking = useServiceCheckIn();

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    serviceType: '',
    category: '',
    durationMinutes: 60,
    coverImageUrl: '',
    tags: '',
    requiresApproval: false,
    advanceBookingDays: 30,
    cancellationHours: 24,
    maxBookingsPerDay: '',
  });

  const [tierForm, setTierForm] = useState({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 60,
    totalSlots: '',
    maxPerUser: 1,
  });
  const [editingTierId, setEditingTierId] = useState<number | null>(null);
  const [editTierForm, setEditTierForm] = useState({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 60,
    totalSlots: '',
    maxPerUser: 1,
    isActive: true,
  });

  const [addOnForm, setAddOnForm] = useState({
    name: '',
    description: '',
    price: 0,
    isOptional: true,
  });

  const service = serviceQuery.data;

  useEffect(() => {
    if (!service) return;
    setServiceForm({
      title: service.title,
      description: service.description,
      shortDescription: service.shortDescription || '',
      serviceType: service.serviceType,
      category: service.category || '',
      durationMinutes: service.durationMinutes,
      coverImageUrl: service.coverImageUrl || '',
      tags: (service.tags || []).join(', '),
      requiresApproval: service.requiresApproval,
      advanceBookingDays: service.advanceBookingDays,
      cancellationHours: service.cancellationHours,
      maxBookingsPerDay: service.maxBookingsPerDay ? String(service.maxBookingsPerDay) : '',
    });
  }, [service]);

  if (!parsedServiceId || Number.isNaN(parsedServiceId)) {
    return <div className="p-8 text-center text-neutral-500">Invalid service ID.</div>;
  }

  if (serviceQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (serviceQuery.error || !service) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {(serviceQuery.error as Error)?.message || 'Failed to load service'}
      </div>
    );
  }

  const onSaveService = () => {
    updateService.mutate(
      {
        title: serviceForm.title,
        description: serviceForm.description,
        shortDescription: serviceForm.shortDescription || undefined,
        serviceType: serviceForm.serviceType,
        category: serviceForm.category || undefined,
        durationMinutes: Number(serviceForm.durationMinutes),
        coverImageUrl: serviceForm.coverImageUrl || undefined,
        tags: serviceForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        requiresApproval: serviceForm.requiresApproval,
        advanceBookingDays: Number(serviceForm.advanceBookingDays),
        cancellationHours: Number(serviceForm.cancellationHours),
        maxBookingsPerDay: serviceForm.maxBookingsPerDay ? Number(serviceForm.maxBookingsPerDay) : undefined,
      },
      {
        onSuccess: () => toast({ title: 'Service updated' }),
        onError: (error) => toast({ title: 'Update failed', description: error.message, variant: 'destructive' }),
      },
    );
  };

  const startEditTier = (tier: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    durationMinutes: number;
    totalSlots: number | null;
    maxPerUser: number;
    isActive: boolean;
  }) => {
    setEditingTierId(tier.id);
    setEditTierForm({
      name: tier.name,
      description: tier.description || '',
      price: Number(tier.price),
      durationMinutes: Number(tier.durationMinutes),
      totalSlots: tier.totalSlots === null ? '' : String(tier.totalSlots),
      maxPerUser: Number(tier.maxPerUser),
      isActive: tier.isActive,
    });
  };

  const onSaveTierEdit = () => {
    if (!editingTierId) return;
    if (!editTierForm.name.trim()) {
      toast({ title: 'Tier name required', variant: 'destructive' });
      return;
    }
    if (Number(editTierForm.price) < 0 || Number(editTierForm.durationMinutes) < 1 || Number(editTierForm.maxPerUser) < 1) {
      toast({ title: 'Invalid tier values', description: 'Price must be >= 0, duration and max/user must be >= 1.', variant: 'destructive' });
      return;
    }

    updateTier.mutate(
      {
        tierId: editingTierId,
        data: {
          name: editTierForm.name.trim(),
          description: editTierForm.description.trim() || undefined,
          price: Number(editTierForm.price),
          durationMinutes: Number(editTierForm.durationMinutes),
          totalSlots: editTierForm.totalSlots === '' ? undefined : Number(editTierForm.totalSlots),
          maxPerUser: Number(editTierForm.maxPerUser),
          isActive: editTierForm.isActive,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Tier updated' });
          setEditingTierId(null);
        },
        onError: (e) => toast({ title: 'Update failed', description: e.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-2 py-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={PATHS.MERCHANT_SERVICES} className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to services
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-neutral-900">Manage Service</h1>
          <p className="text-sm text-neutral-500">Status: <span className="font-semibold">{service.status}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => publishService.mutate(undefined, { onSuccess: () => toast({ title: 'Service published' }), onError: (e) => toast({ title: 'Publish failed', description: e.message, variant: 'destructive' }) })}
            disabled={publishService.isPending}
          >
            <Send className="mr-1.5 h-4 w-4" /> Publish
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => pauseService.mutate(undefined, { onSuccess: () => toast({ title: 'Service paused' }), onError: (e) => toast({ title: 'Pause failed', description: e.message, variant: 'destructive' }) })}
            disabled={pauseService.isPending}
          >
            <Pause className="mr-1.5 h-4 w-4" /> Pause
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => cancelService.mutate(undefined, { onSuccess: () => toast({ title: 'Service cancelled' }), onError: (e) => toast({ title: 'Cancel failed', description: e.message, variant: 'destructive' }) })}
            disabled={cancelService.isPending}
          >
            <Ban className="mr-1.5 h-4 w-4" /> Cancel
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (!confirm('Delete or cancel this service?')) return;
              deleteService.mutate(service.id, {
                onSuccess: () => {
                  toast({ title: 'Service removed' });
                  navigate(PATHS.MERCHANT_SERVICES);
                },
                onError: (e) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }),
              });
            }}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
          <Link to={PATHS.MERCHANT_SERVICES_CHECKIN.replace(':serviceId', String(service.id))}>
            <Button size="sm" variant="secondary">
              <QrCode className="mr-1.5 h-4 w-4" /> Check-In Page
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-bold text-neutral-900">Service Details</h2>
          <div className="mt-4 grid gap-3">
            <input value={serviceForm.title} onChange={(e) => setServiceForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
            <textarea value={serviceForm.description} onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
            <input value={serviceForm.shortDescription} onChange={(e) => setServiceForm((p) => ({ ...p, shortDescription: e.target.value }))} placeholder="Short description" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={serviceForm.serviceType} onChange={(e) => setServiceForm((p) => ({ ...p, serviceType: e.target.value }))} placeholder="Service type" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
              <input value={serviceForm.category} onChange={(e) => setServiceForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="number" value={serviceForm.durationMinutes} onChange={(e) => setServiceForm((p) => ({ ...p, durationMinutes: Number(e.target.value || 0) }))} placeholder="Duration" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
              <input type="number" value={serviceForm.advanceBookingDays} onChange={(e) => setServiceForm((p) => ({ ...p, advanceBookingDays: Number(e.target.value || 0) }))} placeholder="Advance days" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
              <input type="number" value={serviceForm.cancellationHours} onChange={(e) => setServiceForm((p) => ({ ...p, cancellationHours: Number(e.target.value || 0) }))} placeholder="Cancellation hrs" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={() => setCoverUploadOpen(true)}>
              {serviceForm.coverImageUrl ? 'Change cover image' : 'Upload cover image'}
            </Button>
            {serviceForm.coverImageUrl ? (
              <div className="rounded-lg border border-neutral-200 p-2">
                <img src={serviceForm.coverImageUrl} alt="Service cover" className="h-40 w-full rounded-md object-cover" />
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setServiceForm((p) => ({ ...p, coverImageUrl: '' }))}
                  >
                    Remove image
                  </Button>
                </div>
              </div>
            ) : null}
            <input value={serviceForm.tags} onChange={(e) => setServiceForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated)" className="rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={serviceForm.requiresApproval} onChange={(e) => setServiceForm((p) => ({ ...p, requiresApproval: e.target.checked }))} />
              Requires approval before confirmation
            </label>
            <Button size="sm" onClick={onSaveService} disabled={updateService.isPending}>Save service details</Button>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-bold text-neutral-900">Pricing Tiers</h2>
          <p className="mt-1 text-xs text-neutral-500">At least one active tier is required for publish.</p>
          <div className="mt-3 space-y-2">
            {(service.pricingTiers || []).map((tier) => (
              <div key={tier.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{tier.name}</p>
                    <p className="text-xs text-neutral-500">₹{tier.price} • {tier.durationMinutes} min • max/user {tier.maxPerUser} • {tier.totalSlots ?? '∞'} slots</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startEditTier(tier)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (!confirm('Delete this tier?')) return;
                        deleteTier.mutate(tier.id, {
                          onSuccess: () => toast({ title: 'Tier removed' }),
                          onError: (e) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }),
                        });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {editingTierId === tier.id && (
                  <div className="mt-3 rounded-lg border border-dashed border-neutral-200 p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">Editing pricing tier</p>
                        <p className="text-xs text-neutral-500">Update values and save to apply changes instantly.</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${editTierForm.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                        {editTierForm.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-xs font-medium text-neutral-600">
                        Tier name
                        <input
                          value={editTierForm.name}
                          onChange={(e) => setEditTierForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Premium Slot"
                          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-medium text-neutral-600">
                        Description
                        <input
                          value={editTierForm.description}
                          onChange={(e) => setEditTierForm((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional"
                          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal"
                        />
                      </label>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-xs font-medium text-neutral-600">
                        Price (₹)
                        <input
                          type="number"
                          min={0}
                          value={editTierForm.price}
                          onChange={(e) => setEditTierForm((prev) => ({ ...prev, price: Number(e.target.value || 0) }))}
                          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-medium text-neutral-600">
                        Duration (minutes)
                        <input
                          type="number"
                          min={1}
                          value={editTierForm.durationMinutes}
                          onChange={(e) => setEditTierForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value || 1) }))}
                          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal"
                        />
                      </label>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-xs font-medium text-neutral-600">
                        Total slots
                        <input
                          type="number"
                          min={0}
                          value={editTierForm.totalSlots}
                          onChange={(e) => setEditTierForm((prev) => ({ ...prev, totalSlots: e.target.value }))}
                          placeholder="Leave empty for unlimited"
                          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-medium text-neutral-600">
                        Max bookings per user
                        <input
                          type="number"
                          min={1}
                          value={editTierForm.maxPerUser}
                          onChange={(e) => setEditTierForm((prev) => ({ ...prev, maxPerUser: Number(e.target.value || 1) }))}
                          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-normal"
                        />
                      </label>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                        <input
                          type="checkbox"
                          checked={editTierForm.isActive}
                          onChange={(e) => setEditTierForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                        />
                        Tier active
                      </label>
                      <p className="text-xs text-neutral-500">Inactive tiers won’t be offered for new bookings.</p>
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => setEditingTierId(null)}>
                        Cancel
                      </Button>
                      <Button type="button" size="sm" onClick={onSaveTierEdit} disabled={updateTier.isPending}>
                        {updateTier.isPending ? 'Saving…' : 'Save changes'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 rounded-lg border border-dashed border-neutral-200 p-3">
            <input value={tierForm.name} onChange={(e) => setTierForm((p) => ({ ...p, name: e.target.value }))} placeholder="Tier name" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
            <input value={tierForm.description} onChange={(e) => setTierForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
            <div className="grid gap-2 sm:grid-cols-2">
              <input type="number" min={0} value={tierForm.price} onChange={(e) => setTierForm((p) => ({ ...p, price: Number(e.target.value || 0) }))} placeholder="Price" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
              <input type="number" min={1} value={tierForm.durationMinutes} onChange={(e) => setTierForm((p) => ({ ...p, durationMinutes: Number(e.target.value || 1) }))} placeholder="Duration minutes" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input type="number" min={0} value={tierForm.totalSlots} onChange={(e) => setTierForm((p) => ({ ...p, totalSlots: e.target.value }))} placeholder="Total slots (optional)" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
              <input type="number" min={1} value={tierForm.maxPerUser} onChange={(e) => setTierForm((p) => ({ ...p, maxPerUser: Number(e.target.value || 1) }))} placeholder="Max per user" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
            </div>
            <Button
              size="sm"
              onClick={() => {
                createTier.mutate(
                  {
                    name: tierForm.name,
                    description: tierForm.description || undefined,
                    price: Number(tierForm.price),
                    durationMinutes: Number(tierForm.durationMinutes),
                    totalSlots: tierForm.totalSlots ? Number(tierForm.totalSlots) : undefined,
                    maxPerUser: Number(tierForm.maxPerUser),
                  },
                  {
                    onSuccess: () => {
                      setTierForm({ name: '', description: '', price: 0, durationMinutes: 60, totalSlots: '', maxPerUser: 1 });
                      toast({ title: 'Tier created' });
                    },
                    onError: (e) => toast({ title: 'Create failed', description: e.message, variant: 'destructive' }),
                  },
                );
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add pricing tier
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-bold text-neutral-900">Add-Ons</h2>
          <div className="mt-3 space-y-2">
            {(service.addOns || []).map((addOn) => (
              <div key={addOn.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{addOn.name}</p>
                  <p className="text-xs text-neutral-500">₹{addOn.price} • {addOn.isOptional ? 'Optional' : 'Required'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const price = prompt('Update add-on price', String(addOn.price));
                      if (price === null) return;
                      updateAddOn.mutate(
                        { addOnId: addOn.id, data: { price: Number(price) } },
                        {
                          onSuccess: () => toast({ title: 'Add-on updated' }),
                          onError: (e) => toast({ title: 'Update failed', description: e.message, variant: 'destructive' }),
                        },
                      );
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (!confirm('Delete this add-on?')) return;
                      deleteAddOn.mutate(addOn.id, {
                        onSuccess: () => toast({ title: 'Add-on removed' }),
                        onError: (e) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive' }),
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-2 rounded-lg border border-dashed border-neutral-200 p-3">
            <input value={addOnForm.name} onChange={(e) => setAddOnForm((p) => ({ ...p, name: e.target.value }))} placeholder="Add-on name" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
            <input value={addOnForm.description} onChange={(e) => setAddOnForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
            <div className="grid gap-2 sm:grid-cols-2">
              <input type="number" min={0} value={addOnForm.price} onChange={(e) => setAddOnForm((p) => ({ ...p, price: Number(e.target.value || 0) }))} placeholder="Price" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" />
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" checked={addOnForm.isOptional} onChange={(e) => setAddOnForm((p) => ({ ...p, isOptional: e.target.checked }))} />
                Optional add-on
              </label>
            </div>
            <Button
              size="sm"
              onClick={() => {
                createAddOn.mutate(
                  {
                    name: addOnForm.name,
                    description: addOnForm.description || undefined,
                    price: Number(addOnForm.price),
                    isOptional: addOnForm.isOptional,
                  },
                  {
                    onSuccess: () => {
                      setAddOnForm({ name: '', description: '', price: 0, isOptional: true });
                      toast({ title: 'Add-on created' });
                    },
                    onError: (e) => toast({ title: 'Create failed', description: e.message, variant: 'destructive' }),
                  },
                );
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add add-on
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Bookings Dashboard</h2>
              <p className="text-xs text-neutral-500">Confirm, complete, mark no-show, and check-in bookings.</p>
            </div>
            <select
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {SERVICE_BOOKING_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {bookingsQuery.isLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
            </div>
          )}

          {bookingsQuery.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {(bookingsQuery.error as Error).message}
            </div>
          )}

          {!bookingsQuery.isLoading && !bookingsQuery.error && (bookingsQuery.data?.bookings?.length || 0) === 0 && (
            <div className="rounded-lg border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-500">
              No bookings for this filter.
            </div>
          )}

          <div className="space-y-3">
            {(bookingsQuery.data?.bookings || []).map((booking) => (
              <div key={booking.id} className="rounded-lg border border-neutral-200 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Booking #{booking.id} • {booking.status}</p>
                    <p className="text-xs text-neutral-500">{booking.user?.name || booking.user?.email || `User #${booking.userId}`}</p>
                    <p className="text-xs text-neutral-500">{new Date(booking.bookingDate).toLocaleDateString()} • {booking.startTime}-{booking.endTime}</p>
                    <p className="text-xs text-neutral-500">Code: {booking.confirmationCode}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => confirmBooking.mutate(booking.id, { onSuccess: () => toast({ title: 'Booking confirmed' }), onError: (e) => toast({ title: 'Action failed', description: e.message, variant: 'destructive' }) })}
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => completeBooking.mutate(booking.id, { onSuccess: () => toast({ title: 'Booking completed' }), onError: (e) => toast({ title: 'Action failed', description: e.message, variant: 'destructive' }) })}
                    >
                      <Clock className="mr-1 h-3.5 w-3.5" /> Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => noShowBooking.mutate(booking.id, { onSuccess: () => toast({ title: 'Marked as no-show' }), onError: (e) => toast({ title: 'Action failed', description: e.message, variant: 'destructive' }) })}
                    >
                      <UserX className="mr-1 h-3.5 w-3.5" /> No-show
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const qrData = prompt('Paste qrData for check-in');
                        if (!qrData) return;
                        checkInBooking.mutate(
                          { bookingId: booking.id, qrData },
                          {
                            onSuccess: () => toast({ title: 'Checked in successfully' }),
                            onError: (e) => toast({ title: 'Check-in failed', description: e.message, variant: 'destructive' }),
                          },
                        );
                      }}
                    >
                      <UserCheck className="mr-1 h-3.5 w-3.5" /> Check-in
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-brand-primary-100 bg-brand-primary-50 p-3 text-xs text-brand-primary-700">
            <Sparkles className="mb-1 h-4 w-4" />
            Booking actions are fully backend-driven and update merchant/user booking state in real-time via query invalidation.
          </div>
        </section>
      </div>

      <ImageUploadModal
        open={coverUploadOpen}
        onOpenChange={setCoverUploadOpen}
        onUploadComplete={(urls: string[]) => {
          if (urls[0]) {
            setServiceForm((prev) => ({ ...prev, coverImageUrl: urls[0] }));
          }
        }}
        context="service_cover"
        maxFiles={1}
        title="Upload service cover image"
      />
    </div>
  );
}

export function ServiceManagePage() {
  return (
    <MerchantProtectedRoute fallbackMessage="Only merchants can manage services.">
      <ServiceManageInner />
    </MerchantProtectedRoute>
  );
}

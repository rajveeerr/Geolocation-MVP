import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { useCreateService } from '@/hooks/useServices';

function ServiceCreateInner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createService = useCreateService();
  const [coverUploadOpen, setCoverUploadOpen] = useState(false);

  const [form, setForm] = useState({
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

  const onSubmit = () => {
    if (!form.title.trim() || !form.description.trim() || !form.serviceType.trim()) {
      toast({ title: 'Missing required fields', description: 'Title, description and service type are required.', variant: 'destructive' });
      return;
    }

    createService.mutate(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        serviceType: form.serviceType.trim(),
        category: form.category.trim() || undefined,
        durationMinutes: Number(form.durationMinutes),
        coverImageUrl: form.coverImageUrl.trim() || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        requiresApproval: form.requiresApproval,
        advanceBookingDays: Number(form.advanceBookingDays),
        cancellationHours: Number(form.cancellationHours),
        maxBookingsPerDay: form.maxBookingsPerDay ? Number(form.maxBookingsPerDay) : undefined,
      },
      {
        onSuccess: (service) => {
          toast({ title: 'Service created', description: 'Now add pricing tiers and publish when ready.' });
          navigate(PATHS.MERCHANT_SERVICES_MANAGE.replace(':serviceId', String(service.id)));
        },
        onError: (error) => {
          toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-2 py-4">
      <Link to={PATHS.MERCHANT_SERVICES} className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-brand-primary-600 hover:underline">
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back to services
      </Link>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-neutral-900">Create Service</h1>
        <p className="mt-1 text-sm text-neutral-500">This creates a draft. Add tiers and publish from manage page.</p>

        <div className="mt-5 grid gap-4">
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Service title *"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Full description *"
            rows={4}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />
          <input
            value={form.shortDescription}
            onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
            placeholder="Short description"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.serviceType}
              onChange={(e) => setForm((prev) => ({ ...prev, serviceType: e.target.value }))}
              placeholder="Service type * (e.g., SALON, FITNESS)"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <input
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Category"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value || 0) }))}
              placeholder="Duration minutes"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <Button type="button" variant="secondary" size="sm" onClick={() => setCoverUploadOpen(true)}>
              {form.coverImageUrl ? 'Change cover image' : 'Upload cover image'}
            </Button>
          </div>

          {form.coverImageUrl ? (
            <div className="rounded-lg border border-neutral-200 p-2">
              <img src={form.coverImageUrl} alt="Service cover" className="h-40 w-full rounded-md object-cover" />
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setForm((prev) => ({ ...prev, coverImageUrl: '' }))}
                >
                  Remove image
                </Button>
              </div>
            </div>
          ) : null}

          <input
            value={form.tags}
            onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
            placeholder="Tags (comma separated)"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              min={1}
              value={form.advanceBookingDays}
              onChange={(e) => setForm((prev) => ({ ...prev, advanceBookingDays: Number(e.target.value || 1) }))}
              placeholder="Advance booking days"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <input
              type="number"
              min={1}
              value={form.cancellationHours}
              onChange={(e) => setForm((prev) => ({ ...prev, cancellationHours: Number(e.target.value || 1) }))}
              placeholder="Cancellation hours"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
            <input
              type="number"
              min={0}
              value={form.maxBookingsPerDay}
              onChange={(e) => setForm((prev) => ({ ...prev, maxBookingsPerDay: e.target.value }))}
              placeholder="Max bookings/day"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.requiresApproval}
              onChange={(e) => setForm((prev) => ({ ...prev, requiresApproval: e.target.checked }))}
            />
            Requires manual merchant approval before booking confirmation
          </label>

          <div className="rounded-lg border border-brand-primary-100 bg-brand-primary-50 p-3 text-xs text-brand-primary-700">
            <Sparkles className="mb-1 h-4 w-4" />
            Publish requires at least one active pricing tier and a cover image. You can configure tiers and add-ons on the next screen.
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <Link to={PATHS.MERCHANT_SERVICES}>
              <Button variant="secondary" size="sm">Cancel</Button>
            </Link>
            <Button onClick={onSubmit} size="sm" disabled={createService.isPending}>
              {createService.isPending ? 'Creating…' : 'Create service'}
            </Button>
          </div>
        </div>
      </div>

      <ImageUploadModal
        open={coverUploadOpen}
        onOpenChange={setCoverUploadOpen}
        onUploadComplete={(urls: string[]) => {
          if (urls[0]) {
            setForm((prev) => ({ ...prev, coverImageUrl: urls[0] }));
          }
        }}
        context="service_cover"
        maxFiles={1}
        title="Upload service cover image"
      />
    </div>
  );
}

export function ServiceCreatePage() {
  return (
    <MerchantProtectedRoute fallbackMessage="Only merchants can create services.">
      <ServiceCreateInner />
    </MerchantProtectedRoute>
  );
}

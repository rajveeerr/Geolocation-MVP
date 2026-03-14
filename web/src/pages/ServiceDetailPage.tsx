import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MapPin, Building2, Phone, Calendar, Plus, Minus, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { useCreateServiceBooking, usePublicServiceDetail } from '@/hooks/useServices';
import { PATHS } from '@/routing/paths';

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const parsedServiceId = Number(serviceId);
  const { toast } = useToast();

  const [tierId, setTierId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [addOnQuantities, setAddOnQuantities] = useState<Record<number, number>>({});

  const serviceQuery = usePublicServiceDetail(parsedServiceId);
  const bookingMutation = useCreateServiceBooking(parsedServiceId);

  const selectedTier = useMemo(
    () => serviceQuery.data?.pricingTiers?.find((tier) => tier.id === tierId),
    [serviceQuery.data?.pricingTiers, tierId],
  );

  const addOnTotal = useMemo(() => {
    const addOns = serviceQuery.data?.addOns ?? [];
    return addOns.reduce((total, addOn) => total + (addOnQuantities[addOn.id] || 0) * addOn.price, 0);
  }, [serviceQuery.data?.addOns, addOnQuantities]);

  const estimatedTotal = (selectedTier?.price || 0) + addOnTotal;

  const handleBook = () => {
    if (!tierId || !bookingDate || !startTime) {
      toast({ title: 'Missing details', description: 'Please select tier, date, and time.', variant: 'destructive' });
      return;
    }

    const addOns = Object.entries(addOnQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([addOnId, quantity]) => ({ addOnId: Number(addOnId), quantity }));

    bookingMutation.mutate(
      {
        tierId,
        bookingDate,
        startTime,
        notes: notes || undefined,
        specialRequests: specialRequests || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        addOns,
      },
      {
        onSuccess: (booking) => {
          toast({
            title: 'Booking placed',
            description: `Booking ${booking.confirmationCode} is ${booking.status.toLowerCase()}.`,
          });
        },
        onError: (error) => {
          toast({ title: 'Booking failed', description: error.message, variant: 'destructive' });
        },
      },
    );
  };

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

  if (serviceQuery.error || !serviceQuery.data) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {(serviceQuery.error as Error)?.message || 'Failed to load service'}
        </div>
      </div>
    );
  }

  const service = serviceQuery.data;

  return (
    <div className="container mx-auto max-w-screen-xl px-6 py-8">
      <Link to={PATHS.DISCOVER_SERVICES} className="text-sm font-medium text-brand-primary-600 hover:underline">
        ← Back to services
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="h-64 bg-gradient-to-br from-brand-primary-500/20 to-brand-primary-700/30">
            {service.coverImageUrl ? (
              <img src={service.coverImageUrl} alt={service.title} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-neutral-900">{service.title}</h1>
            <p className="mt-2 text-neutral-600">{service.description}</p>

            <div className="mt-4 grid gap-2 text-sm text-neutral-500 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{service.merchant?.businessName || 'Merchant'}</span>
              </div>
              {service.merchant?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{service.merchant.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{service.durationMinutes} min base duration</span>
              </div>
              {service.merchant?.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{service.merchant.phoneNumber}</span>
                </div>
              )}
            </div>

            {service.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900">Book this service</h2>
          <p className="mt-1 text-sm text-neutral-500">Pick a tier, date, and time. Add-ons are optional.</p>

          <div className="mt-4 space-y-3">
            <label className="text-sm font-semibold text-neutral-700">Pricing tier</label>
            <div className="space-y-2">
              {(service.pricingTiers || []).map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setTierId(tier.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    tierId === tier.id ? 'border-brand-primary-500 bg-brand-primary-50' : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">{tier.name}</span>
                    <span className="text-sm font-bold text-brand-primary-600">₹{tier.price}</span>
                  </div>
                  <p className="text-xs text-neutral-500">{tier.durationMinutes} min • Max per user: {tier.maxPerUser}</p>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-neutral-700">Start time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm" />
              </div>
            </div>

            {(service.addOns || []).length > 0 && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">Add-ons</label>
                <div className="space-y-2">
                  {(service.addOns || []).map((addOn) => {
                    const qty = addOnQuantities[addOn.id] || 0;
                    return (
                      <div key={addOn.id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{addOn.name}</p>
                          <p className="text-xs text-neutral-500">₹{addOn.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAddOnQuantities((prev) => ({ ...prev, [addOn.id]: Math.max(0, qty - 1) }))}
                            className="rounded-md border border-neutral-200 p-1"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setAddOnQuantities((prev) => ({ ...prev, [addOn.id]: qty + 1 }))}
                            className="rounded-md border border-neutral-200 p-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Contact phone (optional)"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
              />
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Contact email (optional)"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
              />
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for merchant (optional)"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
              rows={2}
            />
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Special requests (optional)"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
              rows={2}
            />

            <div className="rounded-lg bg-brand-primary-50 p-3 text-sm text-brand-primary-700">
              <div className="flex items-center justify-between">
                <span>Estimated total</span>
                <span className="font-bold">₹{estimatedTotal.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-brand-primary-600">Final amount is confirmed by backend validation and selected add-ons.</p>
            </div>

            <Button className="w-full rounded-lg" onClick={handleBook} disabled={bookingMutation.isPending}>
              <Calendar className="mr-2 h-4 w-4" />
              {bookingMutation.isPending ? 'Booking…' : 'Confirm booking'}
            </Button>

            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
              <Sparkles className="h-3.5 w-3.5 text-brand-primary-500" />
              Your confirmation code and QR data are generated by backend after booking.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

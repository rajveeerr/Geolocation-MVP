import { useState } from 'react';
import { Calendar, Clock, Building2, XCircle } from 'lucide-react';
import { ProtectedRoute } from '@/routing/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import {
  SERVICE_BOOKING_STATUSES,
  useCancelMyServiceBooking,
  useMyServiceBookings,
  type ServiceBookingStatus,
} from '@/hooks/useServices';

type StatusFilter = ServiceBookingStatus | 'ALL';

function MyServiceBookingsInner() {
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const { toast } = useToast();
  const cancelBooking = useCancelMyServiceBooking();

  const query = useMyServiceBookings({ status: status === 'ALL' ? undefined : status, limit: 30, page: 1 });
  const bookings = query.data?.bookings ?? [];

  return (
    <div className="container mx-auto max-w-screen-lg px-6 py-8">
      <h1 className="text-3xl font-bold text-neutral-900">My Service Bookings</h1>
      <p className="mt-1 text-neutral-500">Track and manage all bookings made for services.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(['ALL', ...SERVICE_BOOKING_STATUSES.map((s) => s.value)] as StatusFilter[]).map((value) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              status === value ? 'bg-brand-primary-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {value === 'ALL' ? 'All' : value}
          </button>
        ))}
      </div>

      {query.isLoading && (
        <div className="mt-10 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
        </div>
      )}

      {query.error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {(query.error as Error).message}
        </div>
      )}

      {!query.isLoading && !query.error && bookings.length === 0 && (
        <div className="mt-8 rounded-xl border-2 border-dashed border-neutral-200 py-12 text-center text-neutral-500">
          No bookings found for this filter.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {bookings.map((booking) => {
          const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
          return (
            <div key={booking.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-900">{booking.service?.title || `Service #${booking.serviceId}`}</h3>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">Confirmation: {booking.confirmationCode}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-primary-600">₹{booking.totalAmount}</p>
                  <p className="text-xs text-neutral-500">Booking ID #{booking.id}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {booking.startTime} - {booking.endTime}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {booking.service?.merchant?.businessName || 'Merchant'}
                </div>
              </div>

              {canCancel && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (!confirm('Cancel this booking?')) return;
                      cancelBooking.mutate(
                        { bookingId: booking.id },
                        {
                          onSuccess: () => toast({ title: 'Booking cancelled' }),
                          onError: (error) =>
                            toast({ title: 'Cancellation failed', description: error.message, variant: 'destructive' }),
                        },
                      );
                    }}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Cancel booking
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MyServiceBookingsPage() {
  return (
    <ProtectedRoute>
      <MyServiceBookingsInner />
    </ProtectedRoute>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, QrCode, ScanLine, XCircle } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { useServiceCheckIn } from '@/hooks/useServices';

interface CheckInLog {
  success: boolean;
  message: string;
}

export function ServiceCheckInPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const parsedServiceId = Number(serviceId);
  const { toast } = useToast();

  const [bookingId, setBookingId] = useState('');
  const [qrData, setQrData] = useState('');
  const [logs, setLogs] = useState<CheckInLog[]>([]);

  const checkIn = useServiceCheckIn();

  const handleCheckIn = () => {
    const id = Number(bookingId);
    if (!id || !qrData.trim()) {
      toast({ title: 'Missing data', description: 'Booking ID and qrData are required.', variant: 'destructive' });
      return;
    }

    checkIn.mutate(
      { bookingId: id, qrData: qrData.trim() },
      {
        onSuccess: (response) => {
          toast({ title: 'Check-in successful', description: response.message });
          setLogs((prev) => [{ success: true, message: response.message }, ...prev].slice(0, 20));
          setQrData('');
        },
        onError: (error) => {
          toast({ title: 'Check-in failed', description: error.message, variant: 'destructive' });
          setLogs((prev) => [{ success: false, message: error.message }, ...prev].slice(0, 20));
        },
      },
    );
  };

  if (!parsedServiceId || Number.isNaN(parsedServiceId)) {
    return <div className="p-8 text-center text-muted-foreground">Invalid service ID.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link to={PATHS.MERCHANT_SERVICES_MANAGE.replace(':serviceId', String(parsedServiceId))} className="inline-flex items-center justify-center rounded-lg bg-foreground p-2 text-background">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Check-In</h1>
          <p className="text-sm text-muted-foreground">Scan/enter booking QR payload and booking ID for arrival check-in.</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-brand-primary-500" />
          <h2 className="font-semibold text-foreground">Check-in Console</h2>
        </div>

        <div className="space-y-3">
          <input
            type="number"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            placeholder="Booking ID"
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm"
          />
          <div className="relative">
            <QrCode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
              placeholder="Paste qrData"
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 text-sm"
            />
          </div>
          <button
            onClick={handleCheckIn}
            disabled={checkIn.isPending}
            className="w-full rounded-lg bg-brand-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-700 disabled:opacity-60"
          >
            {checkIn.isPending ? 'Checking in…' : 'Check in customer'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-foreground">Recent attempts</h3>
        {logs.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">No check-ins yet.</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, idx) => (
              <div
                key={`${log.message}-${idx}`}
                className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
                  log.success ? 'border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300' : 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                }`}
              >
                {log.success ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <XCircle className="mt-0.5 h-4 w-4" />}
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

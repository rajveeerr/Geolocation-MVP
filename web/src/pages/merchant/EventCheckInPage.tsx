import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Camera,
  ArrowLeft,
  MapPin,
  Loader2,
  ScanLine,
} from 'lucide-react';
import { useCheckIn } from '@/hooks/useTickets';
import { useEventForManage } from '@/hooks/useMerchantEvents';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────

interface CheckInResult {
  success: boolean;
  message: string;
  ticket?: {
    id: number;
    ticketNumber: string;
    status: string;
  };
  bonusPoints?: number;
}

// ─── Page ───────────────────────────────────────────────────────

function EventCheckInPageInner() {
  const { eventId } = useParams<{ eventId: string }>();
  const parsedEventId = Number(eventId);
  const { toast } = useToast();

  const [qrInput, setQrInput] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [locationName, setLocationName] = useState('');
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([]);

  const eventQuery = useEventForManage(parsedEventId);
  const checkInMutation = useCheckIn(parsedEventId);

  // Request geolocation on mount
  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          // Geolocation denied or unavailable — that's fine
        },
      );
    }
  };

  const handleCheckIn = () => {
    if (!qrInput.trim()) {
      toast({ title: 'Missing QR Code', description: 'Please enter or scan a QR code', variant: 'destructive' });
      return;
    }

    checkInMutation.mutate(
      {
        qrCode: qrInput.trim(),
        latitude,
        longitude,
        locationName: locationName || undefined,
      },
      {
        onSuccess: (data) => {
          const result: CheckInResult = {
            success: true,
            message: data.message,
            ticket: data.ticket
              ? { id: data.ticket.id, ticketNumber: data.ticket.ticketNumber, status: data.ticket.status }
              : undefined,
            bonusPoints: data.bonusPoints,
          };
          setRecentCheckIns((prev) => [result, ...prev.slice(0, 19)]);
          setQrInput('');
          toast({ title: 'Check-in Successful!', description: data.message });
        },
        onError: (err) => {
          const result: CheckInResult = {
            success: false,
            message: err.message,
          };
          setRecentCheckIns((prev) => [result, ...prev.slice(0, 19)]);
          toast({ title: 'Check-in Failed', description: err.message, variant: 'destructive' });
        },
      },
    );
  };

  if (!parsedEventId || isNaN(parsedEventId)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-400">Invalid event ID</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={PATHS.MERCHANT_EVENTS_MANAGE.replace(':eventId', eventId!)}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Event Check-In</h1>
          {eventQuery.data && (
            <p className="text-sm text-zinc-400 line-clamp-1">{eventQuery.data.title}</p>
          )}
        </div>
      </div>

      {/* Event quick stats */}
      {eventQuery.data && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-zinc-900 rounded-xl text-center">
            <p className="text-xs text-zinc-500">Attendees</p>
            <p className="text-lg font-bold text-white">{eventQuery.data.currentAttendees}</p>
          </div>
          <div className="p-3 bg-zinc-900 rounded-xl text-center">
            <p className="text-xs text-zinc-500">Capacity</p>
            <p className="text-lg font-bold text-white">{eventQuery.data.maxAttendees ?? '∞'}</p>
          </div>
          <div className="p-3 bg-zinc-900 rounded-xl text-center">
            <p className="text-xs text-zinc-500">Checked In</p>
            <p className="text-lg font-bold text-emerald-400">{recentCheckIns.filter((c) => c.success).length}</p>
          </div>
        </div>
      )}

      {/* Scanner area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ScanLine className="w-5 h-5 text-red-500" />
          <h2 className="font-semibold text-lg">Scan or Enter QR Code</h2>
        </div>

        {/* QR input */}
        <div className="space-y-3">
          <div className="relative">
            <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Paste or scan QR code value…"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {/* Optional location name */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Location name (optional)"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending || !qrInput.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors"
            >
              {checkInMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking in…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Check In
                </>
              )}
            </button>
            <button
              onClick={requestLocation}
              title="Get current location"
              className={cn(
                'px-3 py-3 rounded-xl border transition-colors',
                latitude
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white',
              )}
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>

          {latitude && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Location captured: {latitude.toFixed(4)}, {longitude?.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* Recent check-ins */}
      <div>
        <h3 className="font-semibold text-zinc-300 mb-3">
          Recent Check-ins ({recentCheckIns.length})
        </h3>

        {recentCheckIns.length === 0 ? (
          <div className="text-center py-8 bg-zinc-900/50 rounded-xl">
            <Camera className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No check-ins yet</p>
            <p className="text-xs text-zinc-600 mt-1">Scan a QR code to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {recentCheckIns.map((ci, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border',
                    ci.success
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-red-500/5 border-red-500/20',
                  )}
                >
                  {ci.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{ci.message}</p>
                    {ci.ticket && (
                      <p className="text-xs text-zinc-500">Ticket #{ci.ticket.ticketNumber}</p>
                    )}
                  </div>
                  {ci.bonusPoints && (
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full">
                      +{ci.bonusPoints} pts
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Exported directly — route-level ProtectedRoute + MerchantLayout handles auth
export { EventCheckInPageInner as EventCheckInPage };

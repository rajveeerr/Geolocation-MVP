import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
} from 'lucide-react';
import { useMyTickets, useTicketQR, useRefundTicket, type MyTicket } from '@/hooks/useTickets';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Status helpers ──────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  PURCHASED: { label: 'Active', color: 'text-emerald-500 bg-emerald-500/10', icon: CheckCircle2 },
  CHECKED_IN: { label: 'Checked In', color: 'text-blue-500 bg-blue-500/10', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-red-500 bg-red-500/10', icon: XCircle },
  REFUNDED: { label: 'Refunded', color: 'text-amber-500 bg-amber-500/10', icon: RotateCcw },
  EXPIRED: { label: 'Expired', color: 'text-zinc-400 bg-zinc-400/10', icon: AlertCircle },
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
] as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ─── Ticket Card ────────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: MyTicket }) {
  const [expanded, setExpanded] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showRefund, setShowRefund] = useState(false);
  const { toast } = useToast();

  const qrQuery = useTicketQR(showQR ? ticket.id : null);
  const refundMutation = useRefundTicket();

  const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.PURCHASED;
  const StatusIcon = status.icon;
  const isPast = new Date(ticket.event.endDate) < new Date();
  const canRefund = ticket.status === 'PURCHASED' && !isPast;
  const canShowQR = ticket.status === 'PURCHASED' && !isPast;

  const handleRefund = () => {
    refundMutation.mutate(
      { ticketId: ticket.id, reason: refundReason || undefined },
      {
        onSuccess: (data) => {
          toast({ title: 'Ticket Refunded', description: data.message });
          setShowRefund(false);
        },
        onError: (err) => {
          toast({ title: 'Refund Failed', description: err.message, variant: 'destructive' });
        },
      },
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
    >
      {/* Header row */}
      <div
        className="flex items-start gap-4 p-4 sm:p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Event cover */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
          {ticket.event.coverImageUrl ? (
            <img
              src={ticket.event.coverImageUrl}
              alt={ticket.event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Ticket className="w-8 h-8 text-zinc-600" />
            </div>
          )}
        </div>

        {/* Event info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', status.color)}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span className="text-xs text-zinc-500">{ticket.ticketTier?.name}</span>
          </div>

          <Link
            to={PATHS.EVENT_DETAIL.replace(':eventId', String(ticket.eventId))}
            className="font-semibold text-white hover:text-red-400 transition-colors line-clamp-1"
            onClick={(e) => e.stopPropagation()}
          >
            {ticket.event.title}
          </Link>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(ticket.event.startDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(ticket.event.startDate)}
            </span>
            {ticket.event.venueName && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {ticket.event.venueName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            <span>Ticket #{ticket.ticketNumber}</span>
            <span>${Number(ticket.purchasePrice).toFixed(2)}</span>
          </div>
        </div>

        {/* Expand chevron */}
        <button className="text-zinc-500 p-1">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-zinc-800"
          >
            <div className="p-4 sm:p-5 space-y-4">
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {canShowQR && (
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    {showQR ? 'Hide QR' : 'Show QR Code'}
                  </button>
                )}
                {canRefund && (
                  <button
                    onClick={() => setShowRefund(!showRefund)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Refund
                  </button>
                )}
                <Link
                  to={PATHS.EVENT_DETAIL.replace(':eventId', String(ticket.eventId))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  View Event
                </Link>
              </div>

              {/* QR Code display */}
              {showQR && (
                <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl">
                  {qrQuery.isLoading ? (
                    <div className="w-48 h-48 bg-zinc-100 rounded-lg animate-pulse" />
                  ) : qrQuery.data?.qrCodeImage ? (
                    <>
                      <img
                        src={qrQuery.data.qrCodeImage}
                        alt="Ticket QR Code"
                        className="w-48 h-48 rounded-lg"
                      />
                      <p className="text-xs text-zinc-500 text-center">
                        Show this QR code at the venue for check-in
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-500">Unable to load QR code</p>
                  )}
                </div>
              )}

              {/* Refund form */}
              {showRefund && (
                <div className="p-4 bg-zinc-800/50 rounded-xl space-y-3">
                  <p className="text-sm text-zinc-300">Are you sure you want to refund this ticket?</p>
                  <textarea
                    placeholder="Reason for refund (optional)"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-red-500"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleRefund}
                      disabled={refundMutation.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {refundMutation.isPending ? 'Processing…' : 'Confirm Refund'}
                    </button>
                    <button
                      onClick={() => setShowRefund(false)}
                      className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Ticket details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500 text-xs">Tier</p>
                  <p className="text-white">{ticket.ticketTier?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Price Paid</p>
                  <p className="text-white">${Number(ticket.purchasePrice).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Purchased</p>
                  <p className="text-white">
                    {ticket.purchasedAt ? formatDate(ticket.purchasedAt) : '—'}
                  </p>
                </div>
                {ticket.checkedInAt && (
                  <div>
                    <p className="text-zinc-500 text-xs">Checked In</p>
                    <p className="text-white">{formatDate(ticket.checkedInAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export function MyTicketsPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTER_TABS)[number]['key']>('all');
  const [search, setSearch] = useState('');

  const queryParams = (() => {
    switch (activeFilter) {
      case 'upcoming':
        return { upcoming: true };
      case 'past':
        return { upcoming: false };
      case 'cancelled':
        return { status: 'CANCELLED' };
      default:
        return {};
    }
  })();

  const { data, isLoading, error } = useMyTickets(queryParams);

  const filteredTickets = (data?.tickets ?? []).filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.event.title.toLowerCase().includes(q) ||
      t.ticketNumber.toLowerCase().includes(q) ||
      t.event.venueName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={PATHS.PROFILE}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">My Tickets</h1>
            <p className="text-sm text-zinc-400">View and manage your event tickets</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by event name or ticket #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  activeFilter === tab.key
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-zinc-400">Failed to load your tickets</p>
            <p className="text-xs text-zinc-500 mt-1">{(error as Error).message}</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-zinc-300">No tickets found</p>
            <p className="text-sm text-zinc-500 mt-1">
              {activeFilter === 'all' && !search
                ? 'Buy tickets to upcoming events to see them here'
                : 'Try changing your filters or search'}
            </p>
            <Link
              to={PATHS.HOME}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium transition-colors"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

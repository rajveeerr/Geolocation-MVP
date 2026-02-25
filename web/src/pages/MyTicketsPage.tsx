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
  PURCHASED: { label: 'Active', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  CHECKED_IN: { label: 'Checked In', color: 'text-blue-600 bg-blue-50', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: XCircle },
  REFUNDED: { label: 'Refunded', color: 'text-amber-600 bg-amber-50', icon: RotateCcw },
  EXPIRED: { label: 'Expired', color: 'text-neutral-400 bg-neutral-100', icon: AlertCircle },
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
      className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header row */}
      <div
        className="flex items-start gap-4 p-4 sm:p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Event cover */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
          {ticket.event.coverImageUrl ? (
            <img
              src={ticket.event.coverImageUrl}
              alt={ticket.event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Ticket className="w-8 h-8 text-neutral-300" />
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
            <span className="text-xs text-neutral-400">{ticket.ticketTier?.name}</span>
          </div>

          <Link
            to={PATHS.EVENT_DETAIL.replace(':eventId', String(ticket.eventId))}
            className="font-heading font-bold text-[#1a1a2e] hover:text-brand-primary-600 transition-colors line-clamp-1"
            onClick={(e) => e.stopPropagation()}
          >
            {ticket.event.title}
          </Link>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-neutral-500">
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

          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
            <span>Ticket #{ticket.ticketNumber}</span>
            <span>${Number(ticket.purchasePrice).toFixed(2)}</span>
          </div>
        </div>

        {/* Expand chevron */}
        <button className="text-neutral-400 p-1">
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
            className="overflow-hidden border-t border-neutral-200"
          >
            <div className="p-4 sm:p-5 space-y-4">
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {canShowQR && (
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary-600 text-white rounded-lg text-sm font-medium hover:bg-brand-primary-700 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    {showQR ? 'Hide QR' : 'Show QR Code'}
                  </button>
                )}
                {canRefund && (
                  <button
                    onClick={() => setShowRefund(!showRefund)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Refund
                  </button>
                )}
                <Link
                  to={PATHS.EVENT_DETAIL.replace(':eventId', String(ticket.eventId))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                  View Event
                </Link>
              </div>

              {/* QR Code display */}
              {showQR && (
                <div className="flex flex-col items-center gap-3 p-6 bg-neutral-50 rounded-xl border border-neutral-200">
                  {qrQuery.isLoading ? (
                    <div className="w-48 h-48 bg-neutral-100 rounded-lg animate-pulse" />
                  ) : qrQuery.data?.qrCodeImage ? (
                    <>
                      <img
                        src={qrQuery.data.qrCodeImage}
                        alt="Ticket QR Code"
                        className="w-48 h-48 rounded-lg"
                      />
                      <p className="text-xs text-neutral-500 text-center">
                        Show this QR code at the venue for check-in
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-neutral-500">Unable to load QR code</p>
                  )}
                </div>
              )}

              {/* Refund form */}
              {showRefund && (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                  <p className="text-sm text-neutral-700">Are you sure you want to refund this ticket?</p>
                  <textarea
                    placeholder="Reason for refund (optional)"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full p-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-[#1a1a2e] placeholder-neutral-400 resize-none focus:outline-none focus:border-brand-primary-500"
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
                      className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Ticket details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-neutral-400 text-xs">Tier</p>
                  <p className="text-[#1a1a2e] font-medium">{ticket.ticketTier?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs">Price Paid</p>
                  <p className="text-[#1a1a2e] font-medium">${Number(ticket.purchasePrice).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs">Purchased</p>
                  <p className="text-[#1a1a2e] font-medium">
                    {ticket.purchasedAt ? formatDate(ticket.purchasedAt) : '—'}
                  </p>
                </div>
                {ticket.checkedInAt && (
                  <div>
                    <p className="text-neutral-400 text-xs">Checked In</p>
                    <p className="text-[#1a1a2e] font-medium">{formatDate(ticket.checkedInAt)}</p>
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
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to={PATHS.PROFILE}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#1a1a2e]" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#1a1a2e] tracking-tight">
              My <span className="text-brand-primary-600">Tickets</span>
            </h1>
            <p className="text-sm text-neutral-500">View and manage your event tickets</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by event name or ticket #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-[#1a1a2e] placeholder-neutral-400 focus:outline-none focus:border-brand-primary-500 focus:ring-1 focus:ring-brand-primary-500/20 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors',
                  activeFilter === tab.key
                    ? 'bg-brand-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-[#1a1a2e]',
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
              <div key={i} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="flex items-start gap-4 p-4 sm:p-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-100 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-neutral-100 rounded w-1/3" />
                    <div className="h-5 bg-neutral-100 rounded w-2/3" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="font-heading text-lg font-bold text-[#1a1a2e]">Failed to load your tickets</p>
            <p className="text-sm text-neutral-400 mt-1">{(error as Error).message}</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="font-heading text-lg font-bold text-[#1a1a2e]">No tickets found</p>
            <p className="text-sm text-neutral-400 mt-1 max-w-sm mx-auto">
              {activeFilter === 'all' && !search
                ? 'Buy tickets to upcoming events to see them here'
                : 'Try changing your filters or search'}
            </p>
            <Link
              to={PATHS.HOME}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-brand-primary-600 hover:bg-brand-primary-700 rounded-xl text-sm font-bold text-white transition-colors shadow-sm"
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

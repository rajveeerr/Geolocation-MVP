import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Sparkles, Gift, AlertCircle, RefreshCw, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProtectedRoute } from '@/routing/ProtectedRoute';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { useNearbySurprises, useRevealSurprise, useRedeemSurprise } from '@/hooks/useSurprises';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import type { NearbySurprise, SurpriseDeal, SurpriseType } from '@/types/surprises';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function useCountdown(target: string | undefined) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const tick = () => setRemaining(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (remaining === null) return null;
  const s = Math.floor(remaining / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

const TYPE_LABELS: Record<SurpriseType, string> = {
  LOCATION_BASED: 'Location',
  TIME_BASED: 'Time',
  ENGAGEMENT_BASED: 'Check-in',
  RANDOM_DROP: 'Random Drop',
};

const TYPE_COLORS: Record<SurpriseType, string> = {
  LOCATION_BASED: 'bg-blue-100 text-blue-700',
  TIME_BASED: 'bg-purple-100 text-purple-700',
  ENGAGEMENT_BASED: 'bg-orange-100 text-orange-700',
  RANDOM_DROP: 'bg-pink-100 text-pink-700',
};

// ─── Revealed deal overlay ─────────────────────────────────────────────────────

function RevealedDealCard({
  deal,
  expiresAt,
  dealId,
  onRedeemed,
  onClose,
}: {
  deal: SurpriseDeal;
  expiresAt: string;
  dealId: number;
  onRedeemed: () => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const redeem = useRedeemSurprise();
  const countdown = useCountdown(expiresAt);
  const [confirming, setConfirming] = useState(false);

  const handleRedeem = () => {
    redeem.mutate(dealId, {
      onSuccess: () => {
        toast({ title: 'Deal redeemed!', description: 'Show this screen to the merchant.' });
        onRedeemed();
      },
      onError: (e) => toast({ title: 'Redemption failed', description: e.message, variant: 'destructive' }),
    });
  };

  const discount = deal.discountPercentage
    ? `${deal.discountPercentage}% off`
    : deal.discountAmount
      ? `$${deal.discountAmount} off`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-2xl">{deal.category?.icon}</span>
            <h2 className="mt-1 text-2xl font-bold text-neutral-900">{deal.title}</h2>
            <p className="text-sm text-neutral-500">{deal.merchant.businessName}</p>
          </div>
          {discount && (
            <span className="ml-2 rounded-full bg-green-100 px-3 py-1 text-lg font-bold text-green-700">
              {discount}
            </span>
          )}
        </div>

        <p className="mt-3 text-sm text-neutral-600">{deal.description}</p>

        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">How to redeem</p>
          <p className="mt-0.5 text-sm text-amber-800">{deal.redemptionInstructions}</p>
        </div>

        {countdown !== null && (
          <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="h-4 w-4 flex-shrink-0 text-red-400" />
            <span>
              Expires in <span className="font-semibold text-red-600">{countdown}</span>
            </span>
          </div>
        )}

        {confirming ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              Are you sure? This cannot be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1 rounded-full"
                onClick={handleRedeem}
                disabled={redeem.isPending}
              >
                {redeem.isPending ? 'Redeeming…' : 'Yes, redeem now'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 rounded-full"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="md"
            className="mt-4 w-full rounded-full"
            onClick={() => setConfirming(true)}
          >
            Redeem Now
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Mystery card ──────────────────────────────────────────────────────────────

function SurpriseCard({
  surprise,
  userLat,
  userLng,
  onRevealed,
}: {
  surprise: NearbySurprise;
  userLat: number;
  userLng: number;
  onRevealed: (deal: SurpriseDeal, expiresAt: string) => void;
}) {
  const { toast } = useToast();
  const reveal = useRevealSurprise();
  const redeemCountdown = useCountdown(surprise.isRevealed ? surprise.expiresAt : undefined);
  const revealCountdown = useCountdown(
    surprise.surpriseType === 'TIME_BASED' && !surprise.isRevealed ? surprise.revealAt : undefined,
  );

  const handleReveal = () => {
    reveal.mutate(
      { dealId: surprise.id, lat: userLat, lng: userLng },
      {
        onSuccess: (res) => {
          if (!res.success || !res.data) {
            toast({ title: 'Could not reveal', description: res.error ?? 'Try again', variant: 'destructive' });
            return;
          }
          onRevealed(res.data.deal, res.data.expiresAt);
        },
        onError: (e) => toast({ title: 'Could not reveal', description: e.message, variant: 'destructive' }),
      },
    );
  };

  const isExpired = surprise.isExpired;
  const isRevealed = surprise.isRevealed;
  const isRedeemed = surprise.isRedeemed;

  // Determine CTA state per the API's state matrix
  let ctaContent: React.ReactNode;
  if (!isRevealed && !isExpired) {
    ctaContent = (
      <Button
        size="sm"
        className="w-full rounded-full"
        onClick={handleReveal}
        disabled={reveal.isPending}
      >
        {reveal.isPending ? 'Revealing…' : 'Reveal 🎁'}
      </Button>
    );
  } else if (isRevealed && !isExpired && !isRedeemed) {
    ctaContent = (
      <Button size="sm" className="w-full rounded-full bg-green-600 hover:bg-green-700" onClick={handleReveal}>
        View & Redeem
      </Button>
    );
  } else if (isRevealed && isRedeemed) {
    ctaContent = (
      <div className="w-full rounded-full bg-neutral-100 py-1.5 text-center text-sm font-semibold text-neutral-500">
        Redeemed ✓
      </div>
    );
  } else if (isExpired) {
    ctaContent = (
      <div className="w-full rounded-full bg-neutral-100 py-1.5 text-center text-sm font-semibold text-neutral-400">
        Expired
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md',
        isExpired ? 'opacity-60' : '',
        isRevealed && !isRedeemed && !isExpired ? 'border-green-300 ring-1 ring-green-200' : 'border-neutral-200',
      )}
    >
      {/* Header gradient */}
      <div className="relative h-24 bg-gradient-to-br from-brand-primary-500/20 via-purple-500/10 to-pink-500/20 flex items-center justify-center">
        {isRevealed ? (
          <Gift className="h-10 w-10 text-brand-primary-500" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 backdrop-blur-sm">
            <span className="text-2xl">🎁</span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              TYPE_COLORS[surprise.surpriseType],
            )}
          >
            {TYPE_LABELS[surprise.surpriseType]}
          </span>
        </div>
        {surprise.merchantLogoUrl && (
          <img
            src={surprise.merchantLogoUrl}
            alt={surprise.merchantName}
            className="absolute right-3 top-3 h-8 w-8 rounded-full border border-white/60 object-cover"
          />
        )}
      </div>

      <div className="p-4">
        <p className="text-sm font-medium text-neutral-900 line-clamp-2 italic">
          "{surprise.hint}"
        </p>
        <p className="mt-1 text-xs text-neutral-500">{surprise.merchantName}</p>

        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {formatDistance(surprise.distanceMeters)}
          </span>

          {/* LOCATION_BASED: proximity hint */}
          {surprise.surpriseType === 'LOCATION_BASED' && surprise.revealRadiusMeters && !isRevealed && (
            <span className="text-blue-600">
              {surprise.distanceMeters <= surprise.revealRadiusMeters
                ? 'Close enough!'
                : `Get within ${formatDistance(surprise.revealRadiusMeters)}`}
            </span>
          )}

          {/* TIME_BASED: countdown to reveal */}
          {surprise.surpriseType === 'TIME_BASED' && revealCountdown && !isRevealed && (
            <span className="flex items-center gap-1 text-purple-600">
              <Clock className="h-3 w-3" />
              Unlocks in {revealCountdown}
            </span>
          )}

          {/* Revealed: countdown to expiry */}
          {isRevealed && !isExpired && !isRedeemed && redeemCountdown && (
            <span className="flex items-center gap-1 text-red-500">
              <Clock className="h-3 w-3" />
              {redeemCountdown} left
            </span>
          )}
        </div>

        <div className="mt-3">{ctaContent}</div>
      </div>
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function SurprisesContent() {
  const { toast } = useToast();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [revealedDeal, setRevealedDeal] = useState<{
    deal: SurpriseDeal;
    expiresAt: string;
    dealId: number;
  } | null>(null);
  const locationRequested = useRef(false);

  const { data, isLoading, error, refetch } = useNearbySurprises(
    coords?.lat ?? null,
    coords?.lng ?? null,
  );

  useEffect(() => {
    if (locationRequested.current) return;
    locationRequested.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Location access denied. Enable location to see nearby surprises.'),
    );
  }, []);

  const surprises = data?.surprises ?? [];

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-neutral-900">
            <Sparkles className="h-7 w-7 text-brand-primary-500" />
            Nearby Surprises
          </h1>
          <p className="mt-1 text-neutral-500">Mystery deals hidden until you unlock them.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={PATHS.MY_REVEAL_HISTORY}>
            <Button variant="secondary" size="sm" className="rounded-full">
              <History className="mr-1.5 h-4 w-4" />
              My History
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Location error */}
      {locationError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <p className="text-sm text-amber-800">{locationError}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(error as Error).message}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && surprises.length === 0 && coords && (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-20 text-center">
          <span className="text-5xl">🎁</span>
          <h3 className="mt-3 text-xl font-bold text-neutral-700">No surprises nearby</h3>
          <p className="mt-1 text-neutral-500">Check back soon — merchants add new surprises regularly.</p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && surprises.length > 0 && coords && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surprises.map((surprise) => (
            <SurpriseCard
              key={surprise.id}
              surprise={surprise}
              userLat={coords.lat}
              userLng={coords.lng}
              onRevealed={(deal, expiresAt) =>
                setRevealedDeal({ deal, expiresAt, dealId: surprise.id })
              }
            />
          ))}
        </div>
      )}

      {/* Revealed deal overlay */}
      <AnimatePresence>
        {revealedDeal && (
          <RevealedDealCard
            deal={revealedDeal.deal}
            expiresAt={revealedDeal.expiresAt}
            dealId={revealedDeal.dealId}
            onRedeemed={() => {
              setRevealedDeal(null);
              refetch();
            }}
            onClose={() => setRevealedDeal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export const SurprisesPage = () => (
  <ProtectedRoute>
    <SurprisesContent />
  </ProtectedRoute>
);

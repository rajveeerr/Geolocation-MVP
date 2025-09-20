// src/pages/DealDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { DealWithLocation } from '@/data/deals';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Heart,
  Navigation,
  Clock,
  Tag,
  Info,
  XCircle,
  MapPin,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { cn } from '@/lib/utils';
import { useCheckIn } from '@/hooks/useCheckIn';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const DetailSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border-t border-neutral-200 py-6">
    <div className="flex items-center gap-3">
      <div className="text-brand-primary-600">{icon}</div>
      <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
    </div>
    <div className="prose prose-neutral mt-4 max-w-none text-neutral-600">
      {children}
    </div>
  </div>
);

export const DealDetailPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const { savedDealIds, saveDeal, unsaveDeal } = useSavedDeals();

  const {
    data: deal,
    isLoading,
    error,
  } = useQuery<DealWithLocation, unknown>({
    queryKey: ['deal', dealId],
    queryFn: async () => {
      const res = await apiGet<DealWithLocation>(`/deals/${dealId}`);
      return res.data as DealWithLocation;
    },
    enabled: !!dealId,
  });

  const { isCheckingIn, checkIn } = useCheckIn();

  // Not found / error UI
  const NotFoundDeal = ({
    id,
    message,
  }: {
    id?: string | undefined;
    message?: unknown;
  }) => {
    const messageStr = message ? String(message) : undefined;
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="max-w-xl rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Deal not found
          </h2>
          <p className="mt-3 text-neutral-600">
            We couldn't find the deal{id ? ` with id "${id}"` : ''}.
          </p>
          {messageStr && (
            <p className="mt-2 text-sm text-neutral-500">Error: {messageStr}</p>
          )}
          <div className="mt-6 flex justify-center">
            <Link to={PATHS.ALL_DEALS}>
              <Button size="md" variant="primary">
                Back to all deals
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <LoadingOverlay message="Loading deal details..." />;
  if (error || !deal) return <NotFoundDeal id={dealId} message={error} />;

  const isSaved = savedDealIds.has(deal.id);
  const handleSaveClick = () =>
    isSaved ? unsaveDeal(deal.id) : saveDeal(deal.id);

  // --- NEW: Dynamic meta tags using deal data ---
  const metaDescription = deal.description
    ? deal.description.length > 155
      ? `${deal.description.substring(0, 152)}...`
      : deal.description
    : 'Discover this deal on CitySpark.';

  return (
    <>
      <title>{`${deal.name} in ${deal.location} | CitySpark`}</title>
      <meta name="description" content={metaDescription} />
      <div className="bg-neutral-50">
      <div className="container mx-auto max-w-4xl px-4 py-24">
        {/* Hero Image */}
        <div className="h-80 w-full overflow-hidden rounded-2xl bg-neutral-200 shadow-lg">
          <img
            src={deal.image}
            alt={deal.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative -mt-16 rounded-2xl bg-white p-8 shadow-xl">
          {/* Header */}
          <div className="flex flex-col items-start justify-between sm:flex-row">
            <div>
              <p className="font-semibold text-brand-primary-600">
                {deal.category}
              </p>
              <h1 className="mt-1 text-4xl font-bold text-neutral-900">
                {deal.name}
              </h1>
              <p className="mt-2 text-lg text-neutral-600">
                {deal.dealValue || ''}
              </p>
              <p className="text-neutral-500">{deal.location}</p>
            </div>
            <Button
              onClick={handleSaveClick}
              variant={isSaved ? 'primary' : 'secondary'}
              size="md"
              className="mt-4 flex-shrink-0 sm:mt-0"
            >
              <Heart
                className={cn('mr-2 h-4 w-4', isSaved && 'fill-current')}
              />
              {isSaved ? 'Saved' : 'Save Deal'}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Button
              onClick={() => checkIn(dealId!)}
              disabled={isCheckingIn}
              size="lg"
              className="w-full"
            >
              {isCheckingIn ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-5 w-5" />
              )}
              {isCheckingIn ? 'Checking In...' : 'Check-in & Earn Points'}
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(deal.location)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="mr-2 h-5 w-5" />
                Get Directions
              </a>
            </Button>
          </div>

          {/* Details Sections */}
          <div className="mt-6 space-y-6">
            <DetailSection icon={<Tag className="h-6 w-6" />} title="The Offer">
              <p>{deal.description}</p>
            </DetailSection>

            <DetailSection
              icon={<Info className="h-6 w-6" />}
              title="Booking Info"
            >
              <p>{deal.bookingInfo}</p>
            </DetailSection>

            <DetailSection
              icon={<Clock className="h-6 w-6" />}
              title="Validity"
            >
              <p>
                {deal.expiresAt
                  ? `Valid until ${new Date(deal.expiresAt).toLocaleString()}`
                  : 'Validity not specified'}
              </p>
            </DetailSection>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-neutral-800">Location</h2>
          <div className="h-80 w-full overflow-hidden rounded-2xl border">
            <MapContainer
              center={deal.position as L.LatLngExpression}
              zoom={15}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={deal.position as L.LatLngExpression}>
                <Popup>{deal.name}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

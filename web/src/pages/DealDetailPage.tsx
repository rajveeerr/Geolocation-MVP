// src/pages/DealDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { DealWithLocation } from '@/data/deals';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Heart, Navigation, Clock, Tag, Info, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { cn } from '@/lib/utils';

// Fix for default Leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;


// A small reusable component for detail sections
const DetailSection = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
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

  const { data: deal, isLoading, error } = useQuery<DealWithLocation, unknown>({
    queryKey: ['deal', dealId],
    queryFn: async () => {
      const res = await apiGet<DealWithLocation>(`/deals/${dealId}`);
      return res.data as DealWithLocation;
    },
    enabled: !!dealId,
  });

  // Not found / error UI
  const NotFoundDeal = ({ id, message }: { id?: string | undefined; message?: unknown }) => {
    const messageStr = message ? String(message) : undefined;
    return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="max-w-xl text-center bg-white rounded-2xl border p-10 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Deal not found</h2>
        <p className="mt-3 text-neutral-600">We couldn't find the deal{ id ? ` with id "${id}"` : '' }.</p>
        {messageStr && (
          <p className="mt-2 text-sm text-neutral-500">Error: {messageStr}</p>
        )}
        <div className="mt-6 flex justify-center">
          <Link to={PATHS.ALL_DEALS}>
            <Button size="md" variant="primary">Back to all deals</Button>
          </Link>
        </div>
      </div>
    </div>
    );
  };

  if (isLoading) return <LoadingOverlay message="Loading deal details..." />;
  if (error || !deal) return <NotFoundDeal id={dealId} message={error} />;

  const isSaved = savedDealIds.has(deal.id);
  const handleSaveClick = () => (isSaved ? unsaveDeal(deal.id) : saveDeal(deal.id));

  return (
    <div className="bg-neutral-50">
      <div className="container mx-auto max-w-4xl py-24 px-4">
        {/* Hero Image */}
        <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg bg-neutral-200">
          <img src={deal.image} alt={deal.name} className="w-full h-full object-cover" />
        </div>

        <div className="bg-white p-8 rounded-2xl -mt-16 relative shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <p className="font-semibold text-brand-primary-600">{deal.category}</p>
              <h1 className="text-4xl font-bold text-neutral-900 mt-1">{deal.name}</h1>
              <p className="text-lg text-neutral-600 mt-2">{deal.dealValue || ''}</p>
              <p className="text-neutral-500">{deal.location}</p>
            </div>
            <Button onClick={handleSaveClick} variant={isSaved ? "primary" : "secondary"} size="md" className="mt-4 sm:mt-0 flex-shrink-0">
              <Heart className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} />
              {isSaved ? 'Saved' : 'Save Deal'}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="w-full bg-accent-resy-orange text-white hover:bg-opacity-90">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(deal.location)}`} target="_blank" rel="noopener noreferrer">
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

            <DetailSection icon={<Info className="h-6 w-6" />} title="Booking Info">
              <p>{deal.bookingInfo}</p>
            </DetailSection>

            <DetailSection icon={<Clock className="h-6 w-6" />} title="Validity">
              <p>{deal.expiresAt ? `Valid until ${new Date(deal.expiresAt).toLocaleString()}` : 'Validity not specified'}</p>
            </DetailSection>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Location</h2>
            <div className="h-80 w-full rounded-2xl overflow-hidden border">
                <MapContainer center={deal.position as L.LatLngExpression} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={deal.position as L.LatLngExpression}>
            <Popup>{deal.name}</Popup>
          </Marker>
                </MapContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

// web/src/components/landing/DealResultsMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { DealWithLocation } from '@/data/deals';
import { cn } from '@/lib/utils';

const createCustomIcon = (isHovered: boolean) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="${cn(
        "flex items-center justify-center w-8 h-8 rounded-full bg-primary shadow-lg transition-all duration-200",
        isHovered && "scale-125 z-10"
      )}">
        <div class="w-3 h-3 rounded-full bg-white"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

interface DealResultsMapProps {
  deals: DealWithLocation[];
  hoveredDealId: string | null;
}

export const DealResultsMap = ({ deals, hoveredDealId }: DealResultsMapProps) => {
  const mapCenter: L.LatLngExpression = [40.72, -74.00]; // Centered on NYC

  return (
    <div className="h-full w-full sticky top-20">
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {deals.map((deal) => (
          <Marker
            key={deal.id}
            position={deal.position}
            icon={createCustomIcon(hoveredDealId === deal.id)}
          >
            <Popup>
              <div className="font-sans">
                <b className="text-sm">{deal.name}</b><br />{deal.location}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
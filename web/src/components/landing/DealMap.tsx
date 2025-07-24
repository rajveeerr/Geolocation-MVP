import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const createPulsatingIcon = (isHovered: boolean) => {
  return L.divIcon({
    className: 'custom-pulsating-icon',
    html: `<div class="w-5 h-5 rounded-full bg-gradient-to-r from-brand-primary-400 to-brand-primary-600 flex items-center justify-center ring-4 ${isHovered ? 'ring-brand-primary-400/60' : 'ring-brand-primary-400/40'} transition-all duration-300">
             <div class="w-2 h-2 rounded-full bg-white ${isHovered ? 'animate-pulse' : ''}"></div>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const ChangeView = ({
  center,
  zoom,
}: {
  center: L.LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

interface DealMapProps {
  deals: Array<{
    id: number;
    name: string;
    business: string;
    distance: string;
    position: L.LatLngExpression;
    category: string;
  }>;
  mapCenter: L.LatLngExpression;
  hoveredDealId: number | null;
}

export const DealMap = ({ deals, mapCenter, hoveredDealId }: DealMapProps) => {
  return (
    <div className="relative h-64 w-full bg-gray-200 sm:h-auto sm:w-1/2">
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <ChangeView center={mapCenter} zoom={14} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {deals.map((deal) => (
          <Marker
            key={deal.id}
            position={deal.position}
            icon={createPulsatingIcon(hoveredDealId === deal.id)}
          >
            <Popup>
              <div className="font-sans">
                <b className="text-sm">{deal.name}</b>
                <br />
                <span className="text-xs">{deal.business}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
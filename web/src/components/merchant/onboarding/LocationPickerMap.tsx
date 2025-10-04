import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo, useRef, useEffect } from 'react';

// Fix for default Leaflet icon issue with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  center: { lat: number; lng: number };
  onLocationChange: (coords: { lat: number; lng: number }) => void;
}

// This component ensures the map pans when the center prop changes
// We use the map instance captured in mapRef and an effect below to set the view

export const LocationPickerMap = ({ center, onLocationChange }: Props) => {
  const markerRef = useRef<L.Marker>(null);
  const mapRef = useRef<L.Map | null>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onLocationChange({ lat, lng });
        }
      },
    }),
    [onLocationChange],
  );

  // Ensure map recenters whenever `center` prop changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], 15);
    }
  }, [center.lat, center.lng]);

  // Child component rendered inside MapContainer so useMap is valid
  function MapRefSetter() {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map as unknown as L.Map;
    }, [map]);
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative h-96 w-full overflow-hidden rounded-lg border">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <MapRefSetter />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[center.lat, center.lng]}
            ref={markerRef}
          />
        </MapContainer>
      </div>
    </div>
  );
};

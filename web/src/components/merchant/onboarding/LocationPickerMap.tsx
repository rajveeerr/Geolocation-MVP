import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo, useRef, useState, useEffect } from 'react';

// Fix for default Leaflet icon issue with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
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
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async () => {
    if (!query || query.trim().length === 0) return;
    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          onLocationChange({ lat, lng });
          if (mapRef.current) mapRef.current.flyTo([lat, lng], 15);
        }
      } else {
        // no results
        // eslint-disable-next-line no-console
        console.warn('No search results for', query);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onLocationChange({ lat, lng });
        if (mapRef.current) mapRef.current.flyTo([lat, lng], 15);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error('Geolocation error', err);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

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
    <div className="h-96 w-full rounded-lg overflow-hidden border relative">
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/90 rounded-md p-2 shadow">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for address or place"
          className="rounded-md border px-3 py-2 text-sm w-64"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="rounded-md bg-brand-primary-500 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={handleUseMyLocation}
          className="rounded-md bg-neutral-100 px-3 py-2 text-sm"
        >
          Use my location
        </button>
      </div>

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
  );
};

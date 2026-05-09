import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { TruckSummary } from '@/types/truckSchedule';
import { createTruckIcon, createUserIcon } from './mapIcons';

const FitBounds = ({
  trucks,
  userLocation,
}: {
  trucks: TruckSummary[];
  userLocation?: { lat: number; lng: number } | null;
}) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    try {
      const points: L.LatLngExpression[] = [];
      for (const t of trucks) {
        const stop = t.currentStop ?? t.nextStop;
        if (stop && Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude)) {
          points.push([stop.latitude, stop.longitude]);
        }
      }
      if (userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
        points.push([userLocation.lat, userLocation.lng]);
      }
      if (points.length === 0) return;
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } catch {
      /* ignore */
    }
  }, [map, trucks, userLocation]);
  return null;
};

const InvalidateOnMount = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

interface TruckMapProps {
  trucks: TruckSummary[];
  userLocation?: { lat: number; lng: number } | null;
  highlightedTruckId?: number | null;
  onSelectTruck?: (truck: TruckSummary) => void;
}

const formatTimeWindow = (startsAt: string, endsAt: string) => {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  return `${s.toLocaleTimeString(undefined, opts)} – ${e.toLocaleTimeString(undefined, opts)}`;
};

export const TruckMap = ({ trucks, userLocation, highlightedTruckId, onSelectTruck }: TruckMapProps) => {
  const center = useMemo<L.LatLngExpression>(() => {
    const firstStop = trucks
      .map((t) => t.currentStop ?? t.nextStop)
      .find((s) => s != null);
    if (firstStop) return [firstStop.latitude, firstStop.longitude];
    if (userLocation) return [userLocation.lat, userLocation.lng];
    return [40.72, -74.0];
  }, [trucks, userLocation]);

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full rounded-2xl"
      >
        <InvalidateOnMount />
        <FitBounds trucks={trucks} userLocation={userLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {trucks.map((t) => {
          const stop = t.currentStop ?? t.nextStop;
          if (!stop) return null;
          const live = !!t.currentStop;
          const isHighlighted = highlightedTruckId === t.storeId;
          return (
            <Marker
              key={t.storeId}
              position={[stop.latitude, stop.longitude]}
              icon={createTruckIcon(live || isHighlighted)}
              eventHandlers={{
                click: () => onSelectTruck?.(t),
              }}
            >
              <Popup>
                <div className="font-sans">
                  <div className="text-sm font-semibold text-neutral-900">{t.merchant.businessName}</div>
                  <div className="mt-0.5 text-xs text-neutral-500">{stop.address}</div>
                  <div className="mt-1 text-xs">
                    {live ? (
                      <span className="font-medium text-emerald-700">
                        Live now · until {new Date(stop.endsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-neutral-600">
                        Next: {new Date(stop.startsAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {formatTimeWindow(stop.startsAt, stop.endsAt)}
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup>
              <div className="font-sans text-sm">You are here</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

// // import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// // import 'leaflet/dist/leaflet.css';
// // import L from 'leaflet';
// // import type { DealWithLocation } from '@/data/deals';
// // import { cn } from '@/lib/utils';

// // const createCustomIcon = (isHovered: boolean) => {
// //   return L.divIcon({
// //     className: 'custom-map-marker',
// //     html: `
// //       <div class="${cn(
// //         'flex items-center justify-center w-8 h-8 rounded-full bg-primary shadow-lg transition-all duration-200',
// //         isHovered && 'scale-125 z-10',
// //       )}">
// //         <div class="w-3 h-3 rounded-full bg-white"></div>
// //       </div>
// //     `,
// //     iconSize: [32, 32],
// //     iconAnchor: [16, 16],
// //   });
// // };

// // interface DealResultsMapProps {
// //   deals: DealWithLocation[];
// //   hoveredDealId: string | null;
// // }

// // export const DealResultsMap = ({
// //   deals,
// //   hoveredDealId,
// // }: DealResultsMapProps) => {
// //   const mapCenter: L.LatLngExpression = [40.72, -74.0]; // Centered on NYC

// //   return (
// //     <div className="sticky top-20 h-full w-full">
// //       <MapContainer
// //         center={mapCenter}
// //         zoom={13}
// //         scrollWheelZoom={true}
// //         className="h-full w-full"
// //       >
// //         <TileLayer
// //           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// //           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// //         />
// //         {deals.map((deal) => (
// //           <Marker
// //             key={deal.id}
// //             position={deal.position}
// //             icon={createCustomIcon(hoveredDealId === deal.id)}
// //           >
// //             <Popup>
// //               <div className="font-sans">
// //                 <b className="text-sm">{deal.name}</b>
// //                 <br />
// //                 {deal.location}
// //               </div>
// //             </Popup>
// //           </Marker>
// //         ))}
// //       </MapContainer>
// //     </div>
// //   );
// // };

// // web/src/components/deals/DealResultsMap.tsx

// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import type { DealWithLocation } from '@/data/deals';
// import { cn } from '@/lib/utils';

// // --- THE FIX: New premium orange pin ---
// const createCustomIcon = (isHovered: boolean) => {
//   // We need to render the icon to a string to use in Leaflet's divIcon
//   const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/></svg>`;

//   return L.divIcon({
//     className: 'custom-map-marker',
//     html: `
//       <div class="${cn(
//         "flex items-center justify-center w-10 h-10 rounded-full bg-accent-orange border-2 border-white shadow-lg transition-all duration-200",
//         isHovered && "scale-125 z-10"
//       )}">
//         <div class="text-white">
//           ${iconHtml}
//         </div>
//       </div>
//     `,
//     iconSize: [40, 40],
//     iconAnchor: [20, 40], // Anchor to the bottom of the pin
//   });
// };

// interface DealResultsMapProps {
//   deals: DealWithLocation[];
//   hoveredDealId: string | null;
// }

// export const DealResultsMap = ({ deals, hoveredDealId }: DealResultsMapProps) => {
//   const mapCenter: L.LatLngExpression = [40.72, -74.00]; // Centered on NYC

//   return (
//     <div className="h-full w-full sticky top-20">
//       <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full leaflet-container-dark">
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
//           url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
//         />
//         {deals.map((deal) => (
//           <Marker
//             key={deal.id}
//             position={deal.position}
//             icon={createCustomIcon(hoveredDealId === deal.id)}
//           >
//             <Popup>
//               <div className="font-sans">
//                 <b className="text-sm">{deal.name}</b><br />{deal.location}
//               </div>
//             </Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// };

// web/src/components/deals/DealResultsMap.tsx

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { cn } from '@/lib/utils';
import type { DealWithLocation } from '@/data/deals';
import { useEffect } from 'react';

const createCustomIcon = (isHovered: boolean) => {
  const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/></svg>`;

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="${cn(
        'flex items-center justify-center w-10 h-10 rounded-full bg-red-800 border-2 border-white shadow-lg transition-all duration-200',
        isHovered && 'scale-125 z-10',
      )}">
        <div class="text-white">
          ${iconHtml}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

interface DealResultsMapProps {
  deals: DealWithLocation[];
  hoveredDealId: string | null;
  userLocation?: { lat: number; lng: number } | null;
}
// --- NEW: Helper component to change the map's view smoothly ---
const ChangeView = ({
  center,
  zoom,
}: {
  center: L.LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    // Validate center is a valid lat/lng pair before calling flyTo
    try {
      const [lat, lng] = center as [number, number];
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        // flyTo provides a smooth animated transition
        map.flyTo(center, zoom, { animate: true, duration: 0.8 });
      }
    } catch (err) {
      // ignore invalid centers
    }
  }, [map, center, zoom]);
  return null;
};

// Ensure the leaflet map invalidates its size when the container becomes visible
const EnsureMapVisible = ({ deps }: { deps?: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    // Invalidate size after a tick to allow layout to settle
    const t = setTimeout(() => map.invalidateSize({ animate: true }), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || []);
  return null;
};

// Fit map bounds to include deals and user location when appropriate
const FitBoundsToFeatures = ({
  deals,
  userLocation,
}: {
  deals: DealWithLocation[];
  userLocation?: { lat: number; lng: number } | null;
}) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    try {
      const points: L.LatLngExpression[] = [];
      for (const d of deals) {
        if (Array.isArray(d.position) && d.position.length === 2) {
          const [lat, lng] = d.position as [number, number];
          if (Number.isFinite(lat) && Number.isFinite(lng))
            points.push(d.position as L.LatLngExpression);
        }
      }
      if (
        userLocation &&
        Number.isFinite(userLocation.lat) &&
        Number.isFinite(userLocation.lng)
      )
        points.push([userLocation.lat, userLocation.lng]);
      if (points.length === 0) return;
      const bounds = L.latLngBounds(points as L.LatLngExpression[]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    } catch (err) {
      // ignore
    }
  }, [map, deals, userLocation]);
  return null;
};

export const DealResultsMap = ({
  deals,
  hoveredDealId,
  userLocation,
}: DealResultsMapProps) => {
  // Center the map on the first deal, or a default location if empty
  const mapCenter: L.LatLngExpression =
    deals.length > 0 ? deals[0].position : [40.72, -74.0];
  const hoveredDeal = deals.find((d) => d.id === hoveredDealId);

  // Small user location icon
  const createUserIcon = () =>
    L.divIcon({
      className: 'user-map-marker',
      html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

  return (
    <div className="sticky top-20 h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Ensure map paints correctly when visible */}
        <EnsureMapVisible
          deps={[deals.length, !!userLocation, hoveredDealId]}
        />

        {/* Fit bounds to include features (will be overridden by ChangeView on hover) */}
        <FitBoundsToFeatures deals={deals} userLocation={userLocation} />

        {/* Pan/zoom when a deal is hovered */}
        {hoveredDeal && <ChangeView center={hoveredDeal.position} zoom={15} />}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {deals.map((deal) => (
          <Marker
            key={deal.id}
            position={deal.position}
            icon={createCustomIcon(hoveredDealId === deal.id)}
          >
            <Popup>
              <div className="font-sans">
                <b className="text-sm">{deal.name}</b>
                <br />
                {deal.location}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="font-sans">
                <b className="text-sm">You are here</b>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

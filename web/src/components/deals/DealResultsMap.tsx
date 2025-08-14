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

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { cn } from '@/lib/utils';
import type { DealWithLocation } from '@/data/deals';

const createCustomIcon = (isHovered: boolean) => {
  const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/></svg>`;

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="${cn(
        "flex items-center justify-center w-10 h-10 rounded-full bg-accent-orange border-2 border-white shadow-lg transition-all duration-200",
        isHovered && "scale-125 z-10"
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
}

export const DealResultsMap = ({ deals, hoveredDealId }: DealResultsMapProps) => {
  const mapCenter: L.LatLngExpression = [40.72, -74.00];

  return (
    <div className="h-full w-full sticky top-20">
      {/* --- THE FIX: Removed leaflet-container-dark class --- */}
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        {/* --- THE FIX: Changed URL to the light map theme --- */}
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
                <b className="text-sm">{deal.name}</b><br />{deal.location}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
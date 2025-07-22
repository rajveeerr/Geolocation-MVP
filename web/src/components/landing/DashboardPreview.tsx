import { motion } from 'framer-motion';
import { Zap, Search, Utensils, Coffee } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Enhanced mock data for deals
const deals = [
  {
    id: 1,
    name: '2-for-1 Tacos',
    business: 'Taco Fiesta',
    distance: '0.2 mi',
    position: [51.515, -0.09] as L.LatLngExpression,
    category: 'Food',
  },
  {
    id: 2,
    name: 'Happy Hour Drafts',
    business: 'The Brew House',
    distance: '0.5 mi',
    position: [51.51, -0.1] as L.LatLngExpression,
    category: 'Drinks',
  },
  {
    id: 3,
    name: '50% Off Appetizers',
    business: 'Gourmet Grill',
    distance: '0.8 mi',
    position: [51.52, -0.12] as L.LatLngExpression,
    category: 'Food',
  },
  {
    id: 4,
    name: 'Free Coffee Top-up',
    business: 'Morning Buzz',
    distance: '1.2 mi',
    position: [51.5, -0.08] as L.LatLngExpression,
    category: 'Drinks',
  },
];

// Custom pulsating icon
const createPulsatingIcon = (isHovered: boolean) => {
  return L.divIcon({
    className: 'custom-pulsating-icon',
    html: `<div class="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center ring-4 ${isHovered ? 'ring-blue-400/60' : 'ring-blue-400/40'} transition-all duration-300">
             <div class="w-2 h-2 rounded-full bg-white ${isHovered ? 'animate-pulse' : ''}"></div>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to handle map centering on hover
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

export const DashboardPreview = () => {
  const [hoveredDealId, setHoveredDealId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([
    51.505, -0.09,
  ]);

  useEffect(() => {
    if (hoveredDealId) {
      const deal = deals.find((d) => d.id === hoveredDealId);
      if (deal) {
        setMapCenter(deal.position);
      }
    }
  }, [hoveredDealId]);

  return (
    <div className="relative z-10 mb-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          //   initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 sm:p-4"
        >
          <div className="aspect-w-16 aspect-h-12 sm:aspect-none bg-neutral-background-strong flex flex-col overflow-hidden rounded-xl sm:flex-row">
            {/* Left side: Map */}
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

            {/* Right side: Deals List */}
            <div className="flex h-full w-full flex-col bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30 p-3 sm:w-1/2 sm:p-6">
              {/* Header */}
              <div className="flex-shrink-0">
                <h3 className="text-lg font-semibold text-neutral-text-primary sm:text-xl">
                  Live Deals Near You
                </h3>
                {/* Search Bar */}
                <div className="relative mt-3 sm:mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="Search deals, places..."
                    className="w-full rounded-lg border border-blue-200/60 bg-white/80 py-2 pl-9 pr-4 text-sm outline-none backdrop-blur-sm transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 sm:pl-10 sm:text-base"
                  />
                </div>
                {/* Category Filters */}
                <div className="mt-3 flex items-center gap-2 sm:mt-4">
                  <button className="rounded-full bg-gradient-to-r from-blue-400 to-blue-600 px-3 py-1 text-xs text-white shadow-sm transition-all hover:shadow-md sm:text-sm">
                    All
                  </button>
                  <button className="rounded-full border border-blue-200/60 bg-white/70 px-3 py-1 text-xs text-blue-600 backdrop-blur-sm transition-all hover:border-blue-300 hover:bg-blue-50 sm:text-sm">
                    Food
                  </button>
                  <button className="rounded-full border border-blue-200/60 bg-white/70 px-3 py-1 text-xs text-blue-600 backdrop-blur-sm transition-all hover:border-blue-300 hover:bg-blue-50 sm:text-sm">
                    Drinks
                  </button>
                </div>
              </div>

              {/* Deals List */}
              <div className="-mr-2 mt-3 flex-grow space-y-2 overflow-y-auto pr-1 sm:mt-4 sm:space-y-3">
                {deals.map((deal) => (
                  <motion.div
                    key={deal.id}
                    onMouseEnter={() => setHoveredDealId(deal.id)}
                    onMouseLeave={() => setHoveredDealId(null)}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition-all duration-200 sm:gap-4 sm:p-3 ${hoveredDealId === deal.id ? 'border-blue-200/80 bg-white/90 shadow-lg ring-1 ring-blue-400/20 backdrop-blur-sm' : 'border-blue-100/50 bg-white/60 backdrop-blur-sm'}`}
                  >
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg sm:h-14 sm:w-14 ${deal.category === 'Food' ? 'bg-gradient-to-br from-orange-100 to-orange-200' : 'bg-gradient-to-br from-cyan-100 to-blue-200'}`}
                    >
                      {deal.category === 'Food' ? (
                        <Utensils className="h-6 w-6 text-orange-600 sm:h-7 sm:w-7" />
                      ) : (
                        <Coffee className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold leading-tight text-neutral-text-primary sm:text-base">
                        {deal.name}
                      </p>
                      <p className="text-xs text-neutral-text-secondary sm:text-sm">
                        {deal.business}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-bold text-green-600 sm:text-sm">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>LIVE</span>
                      </div>
                      <p className="text-xs text-neutral-500 sm:text-sm">
                        {deal.distance}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-3 flex-shrink-0 sm:mt-4">
                <button className="w-full rounded-lg bg-brand-primary-light py-2 text-center text-sm font-semibold text-brand-primary-main transition-all duration-300 hover:bg-brand-primary-main hover:text-white">
                  See all deals
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

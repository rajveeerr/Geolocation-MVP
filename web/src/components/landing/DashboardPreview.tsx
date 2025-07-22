import { motion } from 'framer-motion';
import { Zap, Search, Utensils, Coffee } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Enhanced mock data for deals
const deals = [
  { id: 1, name: "2-for-1 Tacos", business: "Taco Fiesta", distance: "0.2 mi", position: [51.515, -0.09] as L.LatLngExpression, category: 'Food' },
  { id: 2, name: "Happy Hour Drafts", business: "The Brew House", distance: "0.5 mi", position: [51.51, -0.1] as L.LatLngExpression, category: 'Drinks' },
  { id: 3, name: "50% Off Appetizers", business: "Gourmet Grill", distance: "0.8 mi", position: [51.52, -0.12] as L.LatLngExpression, category: 'Food' },
  { id: 4, name: "Free Coffee Top-up", business: "Morning Buzz", distance: "1.2 mi", position: [51.50, -0.08] as L.LatLngExpression, category: 'Drinks' },
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
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression, zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export const DashboardPreview = () => {
  const [hoveredDealId, setHoveredDealId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([51.505, -0.09]);

  useEffect(() => {
    if (hoveredDealId) {
      const deal = deals.find(d => d.id === hoveredDealId);
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
          className="rounded-2xl bg-white p-2 sm:p-4 shadow-2xl ring-1 ring-black/5"
        >
          <div className="aspect-w-16 aspect-h-12 sm:aspect-none rounded-xl bg-neutral-background-strong flex flex-col sm:flex-row overflow-hidden">
            {/* Left side: Map */}
            <div className="w-full h-64 sm:h-auto sm:w-1/2 bg-gray-200 relative">
              <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={false} className="w-full h-full">
                <ChangeView center={mapCenter} zoom={14} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {deals.map(deal => (
                  <Marker 
                    key={deal.id} 
                    position={deal.position} 
                    icon={createPulsatingIcon(hoveredDealId === deal.id)}
                  >
                    <Popup>
                      <div className="font-sans">
                        <b className="text-sm">{deal.name}</b><br />
                        <span className="text-xs">{deal.business}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Right side: Deals List */}
            <div className="w-full sm:w-1/2 h-full bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30 p-3 sm:p-6 flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0">
                <h3 className="font-semibold text-lg sm:text-xl text-neutral-text-primary">Live Deals Near You</h3>
                {/* Search Bar */}
                <div className="relative mt-3 sm:mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search deals, places..."
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base rounded-lg border border-blue-200/60 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 outline-none transition"
                  />
                </div>
                {/* Category Filters */}
                <div className="mt-3 sm:mt-4 flex items-center gap-2">
                  <button className="px-3 py-1 text-xs sm:text-sm bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full shadow-sm hover:shadow-md transition-all">All</button>
                  <button className="px-3 py-1 text-xs sm:text-sm bg-white/70 backdrop-blur-sm border border-blue-200/60 text-blue-600 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all">Food</button>
                  <button className="px-3 py-1 text-xs sm:text-sm bg-white/70 backdrop-blur-sm border border-blue-200/60 text-blue-600 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all">Drinks</button>
                </div>
              </div>

              {/* Deals List */}
              <div className="mt-3 sm:mt-4 flex-grow overflow-y-auto pr-1 -mr-2 space-y-2 sm:space-y-3">
                {deals.map(deal => (
                  <motion.div
                    key={deal.id}
                    onMouseEnter={() => setHoveredDealId(deal.id)}
                    onMouseLeave={() => setHoveredDealId(null)}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 border ${hoveredDealId === deal.id ? 'bg-white/90 backdrop-blur-sm shadow-lg border-blue-200/80 ring-1 ring-blue-400/20' : 'bg-white/60 backdrop-blur-sm border-blue-100/50'}`}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex-shrink-0 flex items-center justify-center ${deal.category === 'Food' ? 'bg-gradient-to-br from-orange-100 to-orange-200' : 'bg-gradient-to-br from-cyan-100 to-blue-200'}`}>
                      {deal.category === 'Food' ? 
                        <Utensils className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" /> : 
                        <Coffee className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-sm sm:text-base text-neutral-text-primary leading-tight">{deal.name}</p>
                      <p className="text-xs sm:text-sm text-neutral-text-secondary">{deal.business}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center justify-end gap-1 text-green-600 font-bold text-xs sm:text-sm">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>LIVE</span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-500">{deal.distance}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="mt-3 sm:mt-4 flex-shrink-0">
                  <button className="w-full py-2 text-center text-sm font-semibold text-brand-primary-main bg-brand-primary-light rounded-lg hover:bg-brand-primary-main hover:text-white transition-all duration-300">
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
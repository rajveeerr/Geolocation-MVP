import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DealMap } from './DealMap';
import { DealList } from './DealList';
import L from 'leaflet';

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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 sm:p-4"
        >
          <div className="aspect-w-16 aspect-h-12 sm:aspect-none bg-neutral-background-strong flex flex-col overflow-hidden rounded-xl sm:flex-row">
            <DealMap
              deals={deals}
              mapCenter={mapCenter}
              hoveredDealId={hoveredDealId}
            />
            <DealList
              deals={deals}
              hoveredDealId={hoveredDealId}
              setHoveredDealId={setHoveredDealId}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
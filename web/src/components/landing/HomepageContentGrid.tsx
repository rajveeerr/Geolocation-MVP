import { bookTonightDeals, experiencesData } from '@/data/deals';
import { CarouselCard } from './CarouselCard';
import { motion } from 'framer-motion';

interface HomepageContentGridProps {
  activeTab: string;
}

export const HomepageContentGrid = ({
  activeTab,
}: HomepageContentGridProps) => {
  const content = activeTab === 'deals' ? bookTonightDeals : experiencesData;
  const title =
    activeTab === 'deals' ? 'Popular Homes in your Area' : 'Airbnb Originals';

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-3xl font-bold text-neutral-800">{title}</h2>
        <motion.div
          key={activeTab} // This key is crucial for the re-render animation
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6"
        >
          {content.slice(0, 12).map(
            (
              item, // Show up to 12 items (2 rows)
            ) => (
              <CarouselCard key={item.id} deal={item} />
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
};

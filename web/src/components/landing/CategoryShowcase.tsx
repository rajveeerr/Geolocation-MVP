import { motion } from 'framer-motion';
import { Utensils, GlassWater, ShoppingBag, Sparkles, Coffee, Building } from 'lucide-react';

const categories = [
  { name: 'Restaurants', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { name: 'Bars & Pubs', icon: GlassWater, color: 'bg-purple-100 text-purple-600' },
  { name: 'Coffee Shops', icon: Coffee, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Retail & Boutiques', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { name: 'Health & Beauty', icon: Sparkles, color: 'bg-teal-100 text-teal-600' },
  { name: 'Entertainment', icon: Building, color: 'bg-indigo-100 text-indigo-600' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export const CategoryShowcase = () => {
  return (
    <section className="py-20 sm:py-28 bg-neutral-subtle-background">
      <div className="container mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-text-primary sm:text-4xl">
          Find Your Vibe.
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-text-secondary">
          From craft coffee shops to late-night bites, CitySpark connects you to the heartbeat of your city.
        </p>

        <motion.div 
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 sm:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {categories.map((category, i) => (
            <motion.div
              key={category.name}
              custom={i}
              variants={cardVariants}
              className="group flex flex-col items-center justify-center gap-3 rounded-xl bg-white p-6 shadow-sm border border-neutral-border-light transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${category.color} transition-transform duration-300 group-hover:scale-110`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-text-primary">{category.name}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
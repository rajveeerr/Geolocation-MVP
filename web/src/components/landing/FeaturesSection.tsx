import { MapPin, Tag, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <MapPin className="h-8 w-8 text-brand-primary-main" />,
    title: 'See Your City, Live.',
    description:
      "Ditch the outdated lists. Our live map shows you what's happening *right now*, with deals and hot spots popping up in real-time.",
  },
  {
    icon: <Tag className="h-8 w-8 text-accent-secondary" />,
    title: 'Unlock Exclusive Deals.',
    description:
      "From Happy Hours to secret 'check-in' offers, access deals you won't find anywhere else. Be a local, save like an insider.",
  },
  {
    icon: <Rocket className="h-8 w-8 text-accent-urgent" />,
    title: 'Play Your Way to Perks.',
    description:
      'Earn points for exploring, climb the city leaderboard, and get rewarded for your loyalty. The more you discover, the more you get back.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="w-full bg-white py-20 md:py-28">
      <div className="container mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-3">
        {features.map((feature, i) => (
           <motion.div 
             key={feature.title} 
             className="flex flex-col items-center text-center md:items-start md:text-left"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, amount: 0.5 }}
             transition={{ duration: 0.5, delay: i * 0.15 }}
           >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-background">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-bold">{feature.title}</h3>
            <p className="mt-2 text-base text-neutral-text-secondary">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
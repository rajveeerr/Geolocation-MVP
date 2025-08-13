import { MapPin, Tag, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <MapPin className="text-brand-primary-main h-8 w-8" />,
    title: 'See Your City, Live.',
    description:
      "Ditch the outdated lists. Our live map shows you what's happening *right now*, with deals and hot spots popping up in real-time.",
  },
  {
    icon: <Tag className="text-accent-secondary h-8 w-8" />,
    title: 'Unlock Exclusive Deals.',
    description:
      "From Happy Hours to secret 'check-in' offers, access deals you won't find anywhere else. Be a local, save like an insider.",
  },
  {
    icon: <Rocket className="text-accent-urgent h-8 w-8" />,
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
            <div className="bg-neutral-background mb-4 flex h-16 w-16 items-center justify-center rounded-xl">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-bold">{feature.title}</h3>
            <p className="text-neutral-text-secondary mt-2 text-base">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

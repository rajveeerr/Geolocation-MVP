import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

export const UseCaseContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary-light px-3 py-1 text-sm font-medium text-brand-primary-main">
        <Bell className="h-4 w-4" />
        <span>Real-time Alerts</span>
      </div>
      <h2 className="text-neutral-text-primary mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Never Miss a Moment.
      </h2>
      <p className="text-neutral-text-secondary mt-4 text-lg">
        Get smart notifications for deals starting near you. That happy hour you
        love? You'll know the second it starts. A flash sale at your favorite
        boutique? You're already on your way.
      </p>
    </motion.div>
  );
};

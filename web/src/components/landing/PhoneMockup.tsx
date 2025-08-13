import { motion } from 'framer-motion';
import { Flame, ForkKnife } from 'lucide-react';

export const PhoneMockup = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto h-[450px] w-[220px] rounded-[30px] border-4 border-gray-800 bg-gray-900 shadow-2xl"
    >
      <div className="absolute left-1/2 top-0 h-4 w-16 -translate-x-1/2 rounded-b-lg bg-gray-800"></div>
      <motion.div
        className="absolute left-3 top-20 w-[90%] -translate-x-1/2 rounded-xl bg-white/10 p-3 backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5, type: 'spring' }}
      >
        <div className="flex items-start gap-3">
          <div className="bg-accent-urgent mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              Happy Hour Starting!
            </p>
            <p className="text-xs text-white/80">
              The Rooftop Bar: 50% off all drinks.
            </p>
            <p className="mt-1 text-[10px] text-white/50">
              Just now • 1.2 mi away
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <div className="bg-accent-urgent mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
            <ForkKnife className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              Happy Hour Starting!
            </p>
            <p className="text-xs text-white/80">
              The Rooftop Bar: 50% off all drinks.
            </p>
            <p className="mt-1 text-[10px] text-white/50">
              Just now • 1.2 mi away
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

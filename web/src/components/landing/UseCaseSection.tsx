import { motion } from 'framer-motion';
import { Bell, Flame, ForkKnife } from 'lucide-react';

export const UseCaseSection = () => {
  return (
    <section className="w-full bg-neutral-subtle-background py-20 md:py-28">
      <div className="container mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
        {/* Left Column: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary-light px-3 py-1 text-sm font-medium text-brand-primary-main">
            <Bell className="h-4 w-4" />
            <span>Real-time Alerts</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-text-primary sm:text-4xl">
            Never Miss a Moment.
          </h2>
          <p className="mt-4 text-lg text-neutral-text-secondary">
            Get smart notifications for deals starting near you. That happy hour you love? You'll know the second it starts. A flash sale at your favorite boutique? You're already on your way.
          </p>
        </motion.div>

        {/* Right Column: Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto h-[450px] w-[220px] rounded-[30px] border-4 border-gray-800 bg-gray-900 shadow-2xl"
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-16 rounded-b-lg bg-gray-800"></div>
            {/* Animated Notification */}
            <motion.div 
                className="absolute top-20 left-3 w-[90%] -translate-x-1/2 rounded-xl bg-white/10 p-3 backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5, type: 'spring' }}
            >
                <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-accent-urgent flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white">Happy Hour Starting!</p>
                        <p className="text-xs text-white/80">The Rooftop Bar: 50% off all drinks.</p>
                        <p className="text-[10px] text-white/50 mt-1">Just now • 1.2 mi away</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 mt-4">
                    <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-accent-urgent flex items-center justify-center">
                        <ForkKnife className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white">Happy Hour Starting!</p>
                        <p className="text-xs text-white/80">The Rooftop Bar: 50% off all drinks.</p>
                        <p className="text-[10px] text-white/50 mt-1">Just now • 1.2 mi away</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
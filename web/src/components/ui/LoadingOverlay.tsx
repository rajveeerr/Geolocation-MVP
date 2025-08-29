// src/components/ui/LoadingOverlay.tsx
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({
  message = 'Loading...',
}: LoadingOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />

      {/* Loading Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 flex flex-col items-center justify-center rounded-2xl border border-neutral-200/50 bg-white p-8 shadow-2xl"
      >
        {/* Animated Logo */}
        <div className="mb-6">
          <Logo />
        </div>

        {/* Loading Spinner */}
        <div className="relative mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="border-3 h-8 w-8 rounded-full border-gray-200 border-t-brand-primary-500"
          />

          {/* Pulsing dots */}
          <div className="mt-4 flex justify-center space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="h-2 w-2 rounded-full bg-brand-primary-500"
              />
            ))}
          </div>
        </div>

        {/* Loading Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center font-medium text-neutral-600"
        >
          {message}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-center text-sm text-neutral-400"
        >
          Preparing your experience...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

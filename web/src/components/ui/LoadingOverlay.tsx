// src/components/ui/LoadingOverlay.tsx
import { motion } from 'framer-motion';
import { Logo } from '../common/Logo';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ message = "Loading..." }: LoadingOverlayProps) => {
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
        className="relative z-10 flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-2xl border border-neutral-200/50"
      >
        {/* Animated Logo */}
        <div
          className="mb-6"
        >
          <Logo />
        </div>

        {/* Loading Spinner */}
        <div className="relative mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-gray-200 border-t-brand-primary-500 rounded-full"
          />
          
          {/* Pulsing dots */}
          <div className="flex justify-center mt-4 space-x-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="w-2 h-2 bg-brand-primary-500 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Loading Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-neutral-600 font-medium text-center"
        >
          {message}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-neutral-400 mt-2 text-center"
        >
          Preparing your experience...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

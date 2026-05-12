// src/components/ui/LoadingOverlay.tsx
import { motion } from 'framer-motion';

interface LoadingOverlayProps {}

export const LoadingOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    >
      {/* Breathing mark */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        {/* Soft red glow that pulses with the mark */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 h-14 w-14 rounded-2xl bg-brand-primary-500 blur-2xl"
        />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary-600 shadow-[0_10px_30px_rgba(232,2,3,0.25)]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 8L8 3L13 8L8 13L3 8Z" fill="white" />
            <circle cx="14" cy="4" r="2" fill="white" />
          </svg>
        </div>
      </motion.div>

      {/* Wordmark */}
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mt-5 text-[1.35rem] font-semibold tracking-tight text-neutral-900"
      >
        Yohop
      </motion.span>


    </motion.div>
  );
};

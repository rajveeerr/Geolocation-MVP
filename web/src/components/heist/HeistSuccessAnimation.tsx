// Heist Success Animation Component
// Celebration animation after successful heist

import { Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';

interface HeistSuccessAnimationProps {
  pointsStolen: number;
  newTokenBalance: number;
  onClose: () => void;
}

export function HeistSuccessAnimation({
  pointsStolen,
  newTokenBalance,
  onClose,
}: HeistSuccessAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="relative max-w-md w-full rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-8 shadow-2xl text-center"
          >
            {/* Confetti Effect */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: -200,
                  x: (Math.random() - 0.5) * 400,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
                className="absolute top-1/2 left-1/2"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
              </motion.div>
            ))}

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500"
            >
              <Trophy className="h-10 w-10 text-white" />
            </motion.div>

            {/* Success Message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-amber-900 mb-2"
            >
              Heist Successful!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-amber-700 mb-6"
            >
              You stole <span className="font-bold text-amber-900">{pointsStolen} points</span>!
            </motion.p>

            {/* Token Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-lg border border-amber-200 bg-white p-4 mb-6"
            >
              <p className="text-sm text-neutral-600 mb-1">Remaining Tokens</p>
              <p className="text-2xl font-bold text-amber-600">
                {newTokenBalance} Token{newTokenBalance !== 1 ? 's' : ''}
              </p>
            </motion.div>

            {/* Close Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 500);
                }}
                className="w-full"
              >
                Awesome!
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}


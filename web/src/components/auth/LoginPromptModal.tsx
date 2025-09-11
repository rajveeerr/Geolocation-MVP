// web/src/components/auth/LoginPromptModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginPromptModal = ({ isOpen, onClose }: LoginPromptModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigateToLogin = () => {
    onClose();
    navigate(PATHS.LOGIN);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
          >
            <Button
              onClick={() => {
                // If user is already on home, don't navigate back — just close the modal
                if (location.pathname === PATHS.HOME) {
                  onClose();
                  return;
                }
                navigate(-1);
                onClose();
              }}
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="absolute top-4 left-4"
              aria-label="Go back"
            >
              Back
            </Button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-100">
              <Lock className="h-8 w-8 text-brand-primary-600" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-neutral-900">
              Log in to continue
            </h2>
            <p className="mt-2 text-neutral-600">
              You need to be logged in to save deals, view your profile, and access other personalized features.
            </p>

            <div className="mt-8 space-y-4">
              <Button size="lg" className="w-full bg-accent-resy-orange text-white hover:bg-opacity-90">
                Continue with Google
              </Button>
              <Button onClick={handleNavigateToLogin} variant="secondary" size="lg" className="w-full">
                Login with Email
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-neutral-500">
              Don't have an account?{' '}
              <Link to={PATHS.SIGNUP} onClick={onClose} className="font-semibold text-brand-primary-600 hover:underline">
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

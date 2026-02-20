import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import { PATHS } from '@/routing/paths';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/common/Button';
import { Building, Lock, ArrowRight } from 'lucide-react';

interface MerchantProtectedRouteProps {
  children: ReactNode;
  fallbackMessage?: string;
}

// Access Denied Modal Component
const AccessDeniedModal = ({ 
  isOpen, 
  message, 
  isAuthenticated 
}: { 
  isOpen: boolean; 
  message: string; 
  isAuthenticated: boolean;
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (isAuthenticated) {
      // User is logged in but not a merchant - redirect to onboarding
      navigate(PATHS.MERCHANT_ONBOARDING, { replace: true });
    } else {
      // User is not logged in - redirect to login
      navigate(PATHS.LOGIN, { replace: true });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Access Restricted
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                {message}
              </p>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleAction}
                  className="w-full sm:w-auto px-8"
                >
                  {isAuthenticated ? (
                    <>
                      <Building className="h-4 w-4 mr-2" />
                      Become a Merchant
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const MerchantProtectedRoute = ({ 
  children, 
  fallbackMessage = 'Only merchants can access this page. Please sign up as a merchant to access this feature.' 
}: MerchantProtectedRouteProps) => {
  const { user, isLoadingUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (!isLoadingUser) {
      if (!user) {
        // User is not authenticated
        setModalMessage('Please log in to access this page.');
        setShowModal(true);
      } else if (user.role !== 'MERCHANT' && !user.merchantId) {
        // User is authenticated but not a merchant (no MERCHANT role and no merchant profile)
        setModalMessage(fallbackMessage);
        setShowModal(true);
      }
    }
  }, [user, isLoadingUser, fallbackMessage]);

  // Show loading while checking authentication
  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show modal if access is denied
  if (showModal) {
    return (
      <>
        <AccessDeniedModal
          isOpen={showModal}
          message={modalMessage}
          isAuthenticated={!!user}
        />
        {/* Show a placeholder content while modal is open */}
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Checking access permissions...</p>
          </div>
        </div>
      </>
    );
  }

  // Render the protected content for merchants
  return <>{children}</>;
};

import { useAuth } from '@/context/useAuth';

export const useAdminStatus = () => {
  const { user, isLoadingUser } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';

  return {
    isAdmin,
    isLoading: isLoadingUser,
  };
};

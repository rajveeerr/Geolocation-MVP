import { type ReactNode, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, api } from '@/services/api';

import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { useRedirect } from './RedirectContext';
import type {
  LoginFormValues,
  SignUpFormValues,
} from '@/lib/validationSchemas';
import { AuthContext, type AuthContextType } from './auth-context-definition';

interface User {
  id: number;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  points?: number;
  role?: string;
}

const hasAuthToken = () => !!localStorage.getItem('authToken');

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { consumeRedirectPath } = useRedirect(); // <-- new

  // Set up global auth error handler
  useEffect(() => {
    api.setAuthErrorCallback(() => {
      // Clear user data and invalidate queries when auth fails
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    });
  }, [queryClient]);

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiGet<User>('/auth/me').then((res) => res.data),
    enabled: hasAuthToken(),
    staleTime: Infinity,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors - token is invalid
      if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { mutateAsync: login, isPending: isLoggingIn } = useMutation({
    mutationFn: (credentials: LoginFormValues) =>
      apiPost<{ token: string }, LoginFormValues>('/auth/login', credentials),
    onSuccess: (response) => {
      if (response.success && response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast({
          title: 'Login Successful!',
          description: 'Welcome back to Yohop.',
        });

        const redirectTo = consumeRedirectPath() || PATHS.HOME;
        navigate(redirectTo, { replace: true });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    },
    onError: (error) => {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const { mutateAsync: signup, isPending: isSigningUp } = useMutation({
    mutationFn: (details: SignUpFormValues) => {
      // Combine firstName and lastName into `name` for backend
      const name =
        `${details.firstName || ''} ${details.lastName || ''}`.trim();
      const payload = {
        email: details.email,
        password: details.password,
        name,
        referralCode: (details as any).referralCode || undefined,
      };
      return apiPost<unknown, any>('/auth/register', payload);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Account Created!',
          description: "You've successfully signed up. Please log in.",
        });
        navigate(PATHS.LOGIN);
      } else {
        throw new Error(response.error || 'Signup failed');
      }
    },
    onError: (error) => {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const logout = () => {
    localStorage.removeItem('authToken');
    queryClient.setQueryData(['user'], null);
    navigate(PATHS.HOME);
  };

  const value: AuthContextType = {
    user,
    isLoadingUser,
    login,
    isLoggingIn,
    signup,
    isSigningUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

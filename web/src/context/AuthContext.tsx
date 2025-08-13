import { type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '@/services/api';

import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import type {
  LoginFormValues,
  SignUpFormValues,
} from '@/lib/validationSchemas';
import { AuthContext, type AuthContextType } from './auth-context-definition';

interface User {
  id: number;
  email: string;
  name: string | null;
}

const hasAuthToken = () => !!localStorage.getItem('authToken');

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiGet<User>('/auth/me').then((res) => res.data),
    enabled: hasAuthToken(),
    staleTime: Infinity,
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
          description: 'Welcome back to CitySpark.',
        });
        navigate(PATHS.HOME);
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
    mutationFn: (details: SignUpFormValues) =>
      apiPost<unknown, SignUpFormValues>('/auth/register', details),
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

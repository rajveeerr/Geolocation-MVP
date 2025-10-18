import { createContext } from 'react';
import type {
  LoginFormValues,
  SignUpFormValues,
} from '@/lib/validationSchemas';
import type { ApiResponse } from '@/services/api';

interface User {
  id: number;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  points?: number; 
  role?: string;
}

export interface AuthContextType {
  user: User | null | undefined;
  isLoadingUser: boolean;
  login: (
    credentials: LoginFormValues,
  ) => Promise<ApiResponse<{ token: string }>>;
  isLoggingIn: boolean;
  signup: (details: SignUpFormValues) => Promise<ApiResponse<unknown>>;
  isSigningUp: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

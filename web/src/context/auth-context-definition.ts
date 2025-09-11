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
  profilePictureUrl?: string | null; // <-- Add this optional field
  points?: number; // <-- Add points field
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

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPut } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/useAuth';

interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  user: {
    id: number;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
    points?: number;
    role?: string;
  };
  message: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  return useMutation<UpdateProfileResponse, Error, UpdateProfileRequest>({
    mutationFn: async (data) => {
      const response = await apiPut<UpdateProfileResponse, UpdateProfileRequest>('/auth/profile', data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update profile');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      refetchUser(); // Re-fetch user data to update context
      toast.success(data.message || 'Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  return useMutation<UpdateProfileResponse, Error, string>({
    mutationFn: async (avatarUrl: string) => {
      const response = await apiPut<UpdateProfileResponse, { avatarUrl: string }>('/auth/profile', { avatarUrl });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update avatar');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      refetchUser(); // Re-fetch user data to update context
      toast.success(data.message || 'Avatar updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update avatar: ${error.message}`);
    },
  });
};
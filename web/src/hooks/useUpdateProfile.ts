import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPut } from '@/services/api';
import { toast } from 'sonner';

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
    points: number;
    role: string;
  };
  message: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, UpdateProfileRequest>({
    mutationFn: async (profileData) => {
      const response = await apiPut<UpdateProfileResponse, UpdateProfileRequest>(
        '/auth/profile',
        profileData
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update profile');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // Update the auth context with new user data
      queryClient.setQueryData(['user'], data.user);
      
      toast.success(data.message || 'Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
};

// Hook specifically for updating avatar
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, string>({
    mutationFn: async (avatarUrl) => {
      const response = await apiPut<UpdateProfileResponse, { avatarUrl: string }>(
        '/auth/profile',
        { avatarUrl }
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update avatar');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // Update the auth context with new user data
      queryClient.setQueryData(['user'], data.user);
      
      toast.success('Profile picture updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update profile picture: ${error.message}`);
    },
  });
};

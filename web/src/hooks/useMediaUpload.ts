import { useMutation } from '@tanstack/react-query';
import { apiPostFormData } from '@/services/api';

// Media Upload Types

export interface MediaUploadResponse {
  message: string;
  url: string;
  publicId: string;
}

export interface MediaUploadRequest {
  file: File;
  context?: string; // e.g., 'user_avatar', 'business_logo', 'deal_image'
}

// Hook for Media Upload

export const useMediaUpload = () => {
  return useMutation<MediaUploadResponse, Error, MediaUploadRequest>({
    mutationFn: async ({ file, context = 'general' }: MediaUploadRequest) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', context);

      const res = await apiPostFormData<MediaUploadResponse>('/media/upload', formData);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to upload file');
      }
      return res.data;
    },
  });
};

// Convenience hook for avatar uploads
export const useAvatarUpload = () => {
  return useMutation<MediaUploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', 'user_avatar');

      const res = await apiPostFormData<MediaUploadResponse>('/media/upload', formData);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to upload avatar');
      }
      return res.data;
    },
  });
};

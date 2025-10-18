import { useMutation } from '@tanstack/react-query';
import { apiPostFormData } from '@/services/api';

// Deal Image Upload Types

export interface DealImageUploadResponse {
  success: boolean;
  imageUrl: string;
  error?: string;
}

// Hook for Deal Image Upload

export const useDealImageUpload = () => {
  return useMutation<DealImageUploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiPostFormData<DealImageUploadResponse>('/deals/upload-image', formData);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to upload image');
      }
      return res.data;
    },
  });
};

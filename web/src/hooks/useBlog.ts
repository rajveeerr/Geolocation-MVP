import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, BlogCategory, BlogPostFormData, BlogCategoryFormData } from '@/types/blog';

// ─── Blog Posts ──────────────────────────────────────────

export const useMerchantBlogPosts = (params?: { page?: number; limit?: number; status?: string }) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const status = params?.status;

  return useQuery({
    queryKey: ['merchant-blog-posts', page, limit, status],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) query.set('status', status);
      const res = await apiGet<{ posts: BlogPost[]; total: number }>(`/merchant/blog/posts?${query}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch blog posts');
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useMerchantBlogPost = (postId: number | undefined) => {
  return useQuery({
    queryKey: ['merchant-blog-post', postId],
    queryFn: async () => {
      const res = await apiGet<{ post: BlogPost }>(`/merchant/blog/posts/${postId}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch blog post');
      return res.data.post;
    },
    enabled: !!postId,
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      const res = await apiPost<{ post: BlogPost }, BlogPostFormData>('/merchant/blog/posts', data);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to create blog post');
      return res.data.post;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-posts'] });
      toast({ title: 'Post Created', description: `"${post.title}" has been saved.` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, data }: { postId: number; data: Partial<BlogPostFormData> }) => {
      const res = await apiPut<{ post: BlogPost }, Partial<BlogPostFormData>>(`/merchant/blog/posts/${postId}`, data);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update blog post');
      return res.data.post;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-post', post.id] });
      toast({ title: 'Post Updated', description: `"${post.title}" has been updated.` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiDelete<{ message: string }>(`/merchant/blog/posts/${postId}`);
      if (!res.success) throw new Error(res.error || 'Failed to delete blog post');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-posts'] });
      toast({ title: 'Post Deleted', description: 'Blog post has been deleted.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const usePublishBlogPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiPut<{ post: BlogPost }>(`/merchant/blog/posts/${postId}/publish`, {});
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to publish');
      return res.data.post;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-post', post.id] });
      toast({ title: 'Published', description: `"${post.title}" is now live.` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUnpublishBlogPost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiPut<{ post: BlogPost }>(`/merchant/blog/posts/${postId}/unpublish`, {});
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to unpublish');
      return res.data.post;
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-post', post.id] });
      toast({ title: 'Unpublished', description: `"${post.title}" reverted to draft.` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// ─── Blog Categories ──────────────────────────────────────

export const useMerchantBlogCategories = () => {
  return useQuery({
    queryKey: ['merchant-blog-categories'],
    queryFn: async () => {
      const res = await apiGet<{ categories: BlogCategory[] }>('/merchant/blog/categories');
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch categories');
      return res.data.categories;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BlogCategoryFormData) => {
      const res = await apiPost<{ category: BlogCategory }, BlogCategoryFormData>('/merchant/blog/categories', data);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to create category');
      return res.data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-categories'] });
      toast({ title: 'Category Created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, data }: { categoryId: number; data: Partial<BlogCategoryFormData> }) => {
      const res = await apiPut<{ category: BlogCategory }, Partial<BlogCategoryFormData>>(`/merchant/blog/categories/${categoryId}`, data);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to update category');
      return res.data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-categories'] });
    },
  });
};

export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      const res = await apiDelete<{ message: string }>(`/merchant/blog/categories/${categoryId}`);
      if (!res.success) throw new Error(res.error || 'Failed to delete category');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-blog-categories'] });
      toast({ title: 'Category Deleted' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { BlogPost, BlogCategory } from '@/types/blog';

export const usePublicBlogPosts = (merchantId: number | undefined, params?: { page?: number; category?: string }) => {
  const page = params?.page ?? 1;
  const category = params?.category;

  return useQuery({
    queryKey: ['public-blog-posts', merchantId, page, category],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: '10' });
      if (category) query.set('category', category);
      const res = await apiGet<{ posts: BlogPost[]; total: number }>(`/blog/merchant/${merchantId}?${query}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch blog posts');
      return res.data;
    },
    enabled: !!merchantId,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePublicBlogPost = (merchantId: number | undefined, slug: string | undefined) => {
  return useQuery({
    queryKey: ['public-blog-post', merchantId, slug],
    queryFn: async () => {
      const res = await apiGet<{ post: BlogPost }>(`/blog/${merchantId}/${slug}`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch blog post');
      return res.data.post;
    },
    enabled: !!merchantId && !!slug,
  });
};

export const usePublicBlogCategories = (merchantId: number | undefined) => {
  return useQuery({
    queryKey: ['public-blog-categories', merchantId],
    queryFn: async () => {
      const res = await apiGet<{ categories: BlogCategory[] }>(`/blog/merchant/${merchantId}/categories`);
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch categories');
      return res.data.categories;
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  });
};

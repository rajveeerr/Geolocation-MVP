export interface BlogCategory {
  id: number;
  merchantId: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count?: { posts: number };
}

export interface BlogPost {
  id: number;
  merchantId: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  imageUrls: string[];
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId: number | null;
  category: Pick<BlogCategory, 'id' | 'name' | 'slug'> | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  merchant?: {
    id: number;
    businessName: string;
    logoUrl: string | null;
    city: string | null;
  };
}

export interface BlogPostFormData {
  title: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  tags?: string[];
  categoryId?: number | null;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface BlogCategoryFormData {
  name: string;
  description?: string;
}

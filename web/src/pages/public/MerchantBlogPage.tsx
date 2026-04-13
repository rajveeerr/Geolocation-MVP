import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Calendar, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePublicBlogPosts, usePublicBlogCategories } from '@/hooks/usePublicBlog';

const MerchantBlogPage: React.FC = () => {
  const { merchantId } = useParams();
  const mid = Number(merchantId);

  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const { data, isLoading } = usePublicBlogPosts(mid, { page, category: activeCategory });
  const { data: categories } = usePublicBlogCategories(mid);

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Blog</h1>
        <p className="text-neutral-500 mb-8">Latest updates, stories, and tips.</p>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              type="button"
              onClick={() => { setActiveCategory(undefined); setPage(1); }}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                !activeCategory ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setActiveCategory(cat.slug); setPage(1); }}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition',
                  activeCategory === cat.slug ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Posts */}
        {isLoading && (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-400" />
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="py-20 text-center text-neutral-400">
            <FileText className="mx-auto mb-3 h-10 w-10" />
            <p>No posts yet.</p>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${mid}/${post.slug}`}
              className="group block rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row">
                {post.coverImageUrl && (
                  <div className="sm:w-56 shrink-0">
                    <img
                      src={post.coverImageUrl}
                      alt=""
                      className="h-48 w-full object-cover sm:h-full"
                    />
                  </div>
                )}
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {post.category && (
                      <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                        {post.category.name}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className="flex items-center gap-1 text-xs text-neutral-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 group-hover:text-brand transition">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{post.excerpt}</p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantBlogPage;

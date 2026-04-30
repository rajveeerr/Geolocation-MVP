import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, User, Loader2 } from 'lucide-react';
import { usePublicBlogPost } from '@/hooks/usePublicBlog';

const BlogPostPage: React.FC = () => {
  const { merchantId, slug } = useParams();
  const mid = Number(merchantId);

  const { data: post, isLoading, error } = usePublicBlogPost(mid, slug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Post Not Found</h2>
          <p className="text-neutral-500 mb-4">This blog post doesn't exist or has been unpublished.</p>
          <Link to="/" className="text-brand hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className="w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Link
          to={`/merchants/${mid}/blog`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {post.category && (
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              {post.category.name}
            </span>
          )}
          {post.publishedAt && (
            <span className="flex items-center gap-1.5 text-sm text-neutral-400">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Author */}
        {post.merchant && (
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-neutral-100">
            {post.merchant.logoUrl ? (
              <img
                src={post.merchant.logoUrl}
                alt={post.merchant.businessName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <User className="h-5 w-5 text-neutral-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-neutral-900">{post.merchant.businessName}</p>
              {post.merchant.city && (
                <p className="text-xs text-neutral-500">{post.merchant.city}</p>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <article
          className="prose prose-neutral max-w-none prose-headings:font-bold prose-a:text-brand prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-neutral-100">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;

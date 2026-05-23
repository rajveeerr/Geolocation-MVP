import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { Button } from '@/components/common/Button';
import {
  useMerchantBlogPosts,
  useDeleteBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
} from '@/hooks/useBlog';

const STATUS_TONES: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PUBLISHED: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  ARCHIVED: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
};

const BlogListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMerchantBlogPosts({ page, status: statusFilter || undefined });
  const deleteMutation = useDeleteBlogPost();
  const publishMutation = usePublishBlogPost();
  const unpublishMutation = useUnpublishBlogPost();

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const filtered = search
    ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : posts;

  const handleDelete = (postId: number, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(postId);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
              <FileText className="h-5 w-5 text-brand" />
            </span>
            Blog Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 ml-0.5">
            Write and publish content for your customers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={PATHS.MERCHANT_BLOG_CATEGORIES}>
            <Button variant="secondary" size="sm" className="rounded-xl">
              Categories
            </Button>
          </Link>
          <Link to={PATHS.MERCHANT_BLOG_CREATE}>
            <Button size="sm" className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Drafts</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    {posts.length === 0 ? 'No blog posts yet. Create your first post!' : 'No posts match your search.'}
                  </td>
                </tr>
              )}
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-muted/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.coverImageUrl ? (
                        <img
                          src={post.coverImageUrl}
                          alt=""
                          className="h-10 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{post.title}</p>
                        {post.excerpt && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {post.category?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_TONES[post.status])}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                      : new Date(post.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/merchant/blog/${post.id}/edit`)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {post.status === 'DRAFT' ? (
                        <button
                          type="button"
                          onClick={() => publishMutation.mutate(post.id)}
                          disabled={publishMutation.isPending}
                          className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 dark:bg-emerald-950/30 hover:text-emerald-700 dark:text-emerald-300"
                          title="Publish"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : post.status === 'PUBLISHED' ? (
                        <button
                          type="button"
                          onClick={() => unpublishMutation.mutate(post.id)}
                          disabled={unpublishMutation.isPending}
                          className="rounded-lg p-2 text-amber-500 hover:bg-amber-50 dark:bg-amber-950/30 hover:text-amber-700 dark:text-amber-300"
                          title="Unpublish"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 dark:bg-red-950/30 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogListPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useMerchantBlogCategories,
  useCreateBlogCategory,
  useUpdateBlogCategory,
  useDeleteBlogCategory,
} from '@/hooks/useBlog';

const BlogCategoriesPage: React.FC = () => {
  const { data: categories, isLoading } = useMerchantBlogCategories();
  const createMutation = useCreateBlogCategory();
  const updateMutation = useUpdateBlogCategory();
  const deleteMutation = useDeleteBlogCategory();

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName.trim(), description: newDesc.trim() || undefined });
    setNewName('');
    setNewDesc('');
  };

  const startEdit = (cat: { id: number; name: string; description: string | null }) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    await updateMutation.mutateAsync({
      categoryId: editingId,
      data: { name: editName.trim(), description: editDesc.trim() || undefined },
    });
    setEditingId(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Delete category "${name}"? Posts in this category will become uncategorized.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <Link to={PATHS.MERCHANT_BLOG}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
          <FolderOpen className="h-7 w-7 text-brand" />
          Blog Categories
        </h1>
        <p className="mt-2 text-neutral-600">Organize your blog posts by category.</p>
      </div>

      {/* Create New */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-neutral-800">Add Category</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Name *</Label>
            <Input
              placeholder="e.g., Recipes, Events, Tips"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="Brief description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newName.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create Category
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading && (
          <div className="py-10 text-center text-neutral-400">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </div>
        )}
        {!isLoading && (!categories || categories.length === 0) && (
          <div className="py-10 text-center text-neutral-400">
            No categories yet. Create one above!
          </div>
        )}
        {(categories ?? []).map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4"
          >
            {editingId === cat.id ? (
              <div className="flex-1 space-y-2 mr-4">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm"
                />
                <Input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdate} disabled={updateMutation.isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium text-neutral-900">{cat.name}</p>
                  {cat.description && (
                    <p className="mt-0.5 text-xs text-neutral-500">{cat.description}</p>
                  )}
                  <p className="mt-1 text-xs text-neutral-400">
                    {cat._count?.posts ?? 0} post{(cat._count?.posts ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogCategoriesPage;

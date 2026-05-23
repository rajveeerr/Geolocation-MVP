import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Wand2,
  X,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/common/ImageUpload';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import {
  useMerchantBlogPost,
  useCreateBlogPost,
  useUpdateBlogPost,
  useMerchantBlogCategories,
  useCreateBlogCategory,
} from '@/hooks/useBlog';
import { useAiBlogDraft, useAiStatus } from '@/hooks/useAi';
import type { MenuItemImage } from '@/hooks/useMerchantMenu';

const BlogPostFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const isEditing = !!postId;

  const { data: existingPost, isLoading: loadingPost } = useMerchantBlogPost(
    isEditing ? Number(postId) : undefined,
  );
  const { data: categories } = useMerchantBlogCategories();
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const createCategoryMutation = useCreateBlogCategory();
  const { data: aiStatus } = useAiStatus();
  const aiBlogDraft = useAiBlogDraft();

  const aiEnabled = aiStatus?.aiEnabled ?? false;

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImages, setCoverImages] = useState<MenuItemImage[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // AI state
  const [showAi, setShowAi] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setExcerpt(existingPost.excerpt || '');
      setContent(existingPost.content);
      setTags(existingPost.tags || []);
      setCategoryId(existingPost.categoryId);
      if (existingPost.coverImageUrl) {
        setCoverImages([{
          id: 'cover',
          url: existingPost.coverImageUrl,
          publicId: 'cover',
          name: 'Cover Image',
        }]);
      }
    }
  }, [existingPost]);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const cat = await createCategoryMutation.mutateAsync({ name: newCategoryName.trim() });
    setCategoryId(cat.id);
    setNewCategoryName('');
  };

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim()) return;
    if (!content.trim()) return;

    const data = {
      title: title.trim(),
      excerpt: excerpt.trim() || undefined,
      content,
      coverImageUrl: coverImages[0]?.url || undefined,
      imageUrls: coverImages.map((i) => i.url),
      tags,
      categoryId,
      status,
    };

    if (isEditing) {
      await updateMutation.mutateAsync({ postId: Number(postId), data });
    } else {
      await createMutation.mutateAsync(data);
    }

    navigate(PATHS.MERCHANT_BLOG);
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    const result = await aiBlogDraft.mutateAsync({
      topic: aiTopic.trim(),
      tone: aiTone.trim() || undefined,
    });
    const s = result.suggestion;
    setTitle(s.title);
    setExcerpt(s.excerpt);
    setContent(s.content);
    setTags(s.tags);
    setShowAi(false);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingPost) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(PATHS.MERCHANT_BLOG)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? 'Edit Post' : 'New Blog Post'}
        </h1>
      </div>

      <div className="space-y-6">
        {/* AI Assistant */}
        {aiEnabled && (
          <div className="rounded-2xl border border-ai-border bg-ai-surface p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-card/80 dark:bg-card p-2 text-ai-accent">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ai-text">AI Writing Assistant</p>
                  <p className="text-xs text-ai-text-muted">Generate a full draft from a topic</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="border-ai-border-strong bg-card/80 dark:bg-card text-ai-text hover:bg-card"
                onClick={() => setShowAi(!showAi)}
              >
                {showAi ? 'Hide' : 'Write with AI'}
              </Button>
            </div>

            {showAi && (
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-ai-text-muted">Topic *</Label>
                  <Input
                    placeholder="e.g., 5 tips for choosing the perfect wine pairing"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-ai-text-muted">Tone (optional)</Label>
                  <Input
                    placeholder="e.g., casual, professional, humorous"
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleAiGenerate}
                  disabled={aiBlogDraft.isPending || !aiTopic.trim()}
                  className="gap-1.5"
                >
                  {aiBlogDraft.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    <><Wand2 className="h-4 w-4" />Generate Draft</>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-brand/10 p-2">
              <FileText className="h-5 w-5 text-brand" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Post Details</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Your blog post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(!title.trim() && 'border-red-300')}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                placeholder="Brief summary for previews (optional)"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                maxLength={500}
                className="flex w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your blog post here..."
              />
              {!content.trim() && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Content is required.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                images={coverImages}
                onImagesChange={setCoverImages}
                maxImages={1}
                maxSizeInMB={5}
                context="blog_cover"
              />
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Organization</h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex items-center gap-2">
                <select
                  value={categoryId ?? ''}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500"
                >
                  <option value="">No category</option>
                  {(categories ?? []).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" size="sm" variant="secondary" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full p-0.5 hover:bg-accent"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSaving || !title.trim() || !content.trim()}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSaving || !title.trim() || !content.trim()}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditing ? 'Update & Publish' : 'Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPostFormPage;

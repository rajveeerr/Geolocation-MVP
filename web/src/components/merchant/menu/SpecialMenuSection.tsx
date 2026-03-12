import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { SPECIAL_THEMES } from '@/config/menuTemplates';
import type { MenuCollection } from '@/hooks/useMenuCollections';
import { StandardMenuEditor } from './StandardMenuEditor';

interface SpecialMenuSectionProps {
  collections: MenuCollection[];
  onDeleteCollection: (collection: MenuCollection) => void;
}

export const SpecialMenuSection: React.FC<SpecialMenuSectionProps> = ({
  collections: _collections,
  onDeleteCollection: _onDeleteCollection,
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingCollection, setEditingCollection] = useState<MenuCollection | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<(typeof SPECIAL_THEMES)[0] | null>(null);
  const [customTheme, setCustomTheme] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleThemeClick = (theme: (typeof SPECIAL_THEMES)[0]) => {
    setSelectedTheme(theme);
    setEditingCollection(null);
    setShowEditor(true);
  };

  const handleCustomCreate = () => {
    if (!customTheme.trim()) return;
    setSelectedTheme(null);
    setEditingCollection(null);
    setShowEditor(true);
  };

  return (
    <div className="space-y-5">
      {/* Info card */}
      <div className="rounded-2xl border border-brand/20 bg-brand-subtle px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-brand">
          <span className="text-lg">🎉</span>
          Special Event Menus
        </h3>
        <p className="text-sm text-neutral-500 mt-1">
          Create themed menus for holidays and special occasions
        </p>
      </div>

      {/* Create Event Menu button-card */}
      <button
        type="button"
        onClick={() => {
          setSelectedTheme(null);
          setCustomTheme('');
          setEditingCollection(null);
          setShowEditor(true);
        }}
        className={cn(
          'w-full flex items-center gap-4 rounded-2xl p-5',
          'bg-white border border-neutral-200 shadow-xs',
          'hover:border-brand/30 hover:shadow-md',
          'transition-all duration-200 text-left'
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-neutral-900">Create Event Menu</p>
          <p className="text-xs text-neutral-400 mt-0.5">Custom theme menu</p>
        </div>
        <Plus className="h-5 w-5 text-neutral-400" />
      </button>

      {/* Popular Themes */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
          Popular Themes:
        </h4>
        <div className="flex flex-wrap gap-2">
          {SPECIAL_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleThemeClick(theme)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2',
                'bg-white border border-neutral-200 shadow-xs',
                'hover:border-brand/30 hover:bg-brand-subtle hover:shadow-sm',
                'transition-all duration-150 text-sm font-medium text-neutral-700 hover:text-brand'
              )}
            >
              <span className="text-base leading-none">{theme.icon}</span>
              <span>{theme.name}</span>
            </button>
          ))}

          {/* Custom theme toggle */}
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2',
              'bg-neutral-50 border border-dashed border-neutral-300',
              'hover:border-brand/30 hover:bg-brand-subtle hover:text-brand',
              'transition-all duration-150 text-sm font-medium text-neutral-500'
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Custom Theme
          </button>
        </div>

        {/* Custom theme name input */}
        {showCustomInput && (
          <div className="flex gap-2 mt-4 max-w-md">
            <Input
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="Enter theme name (e.g. Sushi Night)"
              className="bg-white border-neutral-200 text-neutral-800 placeholder:text-neutral-400 focus-visible:ring-brand/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCustomCreate();
                if (e.key === 'Escape') setShowCustomInput(false);
              }}
            />
            <button
              type="button"
              onClick={handleCustomCreate}
              disabled={!customTheme.trim()}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold',
                'bg-brand text-white hover:bg-brand-hover transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Create
            </button>
          </div>
        )}
      </div>

      {/* Editor modal */}
      <StandardMenuEditor
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingCollection(null);
          setSelectedTheme(null);
          setCustomTheme('');
          setShowCustomInput(false);
        }}
        menuType="SPECIAL"
        existingCollection={editingCollection}
        defaultName={
          editingCollection?.name ??
          selectedTheme?.name ??
          customTheme.trim() ??
          'Special Menu'
        }
        themeName={selectedTheme?.name ?? customTheme.trim() ?? undefined}
        icon={selectedTheme?.icon}
        color={selectedTheme?.color}
      />
    </div>
  );
};

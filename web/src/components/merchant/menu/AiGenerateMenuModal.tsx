import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAiMenuParse, type AiParsedMenuItem } from '@/hooks/useAi';

interface AiGenerateMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsGenerated: (items: AiParsedMenuItem[]) => void;
}

export const AiGenerateMenuModal: React.FC<AiGenerateMenuModalProps> = ({
  isOpen,
  onClose,
  onItemsGenerated,
}) => {
  const [rawText, setRawText] = useState('');
  const aiParse = useAiMenuParse();

  const handleGenerate = () => {
    if (!rawText.trim()) return;
    aiParse.mutate(
      { text: rawText.trim() },
      {
        onSuccess: (data) => {
          onItemsGenerated(data.items);
          setRawText('');
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'bg-white border border-neutral-200 text-neutral-800',
          'sm:max-w-lg'
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-neutral-800">
            <Sparkles className="h-5 w-5 text-brand" />
            AI Generate Menu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-neutral-500">
            Paste your menu text, a photo description, or just describe what you serve.
            Our AI will parse it into structured menu items.
          </p>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`e.g.\nClassic Burger - $12.99\nCheese Pizza (Large) - $15\nCaesar Salad - $8.50\nIced Tea - $3`}
            rows={8}
            className={cn(
              'w-full rounded-xl border border-neutral-200 bg-neutral-50',
              'px-4 py-3 text-sm text-neutral-800 placeholder-neutral-400',
              'focus:border-brand/40 focus:outline-none focus:ring-1 focus:ring-brand/20',
              'resize-none'
            )}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {rawText.trim().split('\n').filter(Boolean).length} lines detected
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!rawText.trim() || aiParse.isPending}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-medium',
                  'bg-brand text-white hover:bg-brand-hover transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {aiParse.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Parsing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {aiParse.isError && (
            <p className="text-xs text-red-400">
              {aiParse.error?.message || 'Failed to parse menu. Please try again.'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

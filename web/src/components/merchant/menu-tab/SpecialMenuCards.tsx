import { Plus, PartyPopper, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { POPULAR_EVENT_THEMES } from './constants';

interface SpecialMenuCardsProps {
  onCreateEventMenu: (theme?: string) => void;
}

export const SpecialMenuCards = ({ onCreateEventMenu }: SpecialMenuCardsProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 mb-1">
          <PartyPopper className="h-5 w-5 text-amber-400" />
          <h4 className="font-semibold text-amber-300">Special Event Menus</h4>
        </div>
        <p className="text-sm text-neutral-400">Create themed menus for holidays and special occasions</p>
      </div>

      <button
        onClick={() => onCreateEventMenu()}
        className="flex w-full items-center gap-4 rounded-xl border border-purple-500/30 bg-purple-500/15 p-4 transition-all hover:brightness-110"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
          <Sparkles className="h-6 w-6 text-purple-400" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-semibold text-white">Create Event Menu</h4>
          <p className="text-sm text-neutral-400">Custom theme menu</p>
        </div>
        <Plus className="h-5 w-5 text-neutral-400" />
      </button>

      <div>
        <p className="mb-2 text-sm text-neutral-500">Popular Themes:</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_EVENT_THEMES.map((theme) => (
            <Badge
              key={theme}
              variant="outline"
              className="cursor-pointer border-neutral-600 text-neutral-300 transition-colors hover:border-purple-400 hover:text-purple-300"
              onClick={() => onCreateEventMenu(theme)}
            >
              {theme}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

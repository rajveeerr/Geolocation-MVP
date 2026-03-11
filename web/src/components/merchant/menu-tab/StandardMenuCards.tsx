import { Plus, UtensilsCrossed, Baby, Coffee, IceCream2 } from 'lucide-react';
import { STANDARD_MENU_TEMPLATES } from './constants';
import type { MenuType } from './types';

interface StandardMenuCardsProps {
  onCreateMenu: (menuType: MenuType) => void;
}

const menuTypeIcons: Record<MenuType, React.ReactNode> = {
  daily: <UtensilsCrossed className="h-6 w-6 text-blue-400" />,
  kids: <Baby className="h-6 w-6 text-pink-400" />,
  drinks: <Coffee className="h-6 w-6 text-amber-400" />,
  desserts: <IceCream2 className="h-6 w-6 text-teal-400" />,
};

const menuTypeBgColors: Record<MenuType, string> = {
  daily: 'bg-blue-500/20 border-blue-500/30',
  kids: 'bg-pink-500/20 border-pink-500/30',
  drinks: 'bg-amber-500/20 border-amber-500/30',
  desserts: 'bg-teal-500/20 border-teal-500/30',
};

export const StandardMenuCards = ({ onCreateMenu }: StandardMenuCardsProps) => {
  return (
    <div className="space-y-3">
      {STANDARD_MENU_TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onCreateMenu(template.id)}
          className={`flex w-full items-center gap-4 rounded-xl border p-4 transition-all hover:brightness-110 ${menuTypeBgColors[template.id]}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800/50">
            {menuTypeIcons[template.id]}
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-white">{template.name}</h4>
            <p className="text-sm text-neutral-400">{template.description}</p>
          </div>
          <Plus className="h-5 w-5 text-neutral-400" />
        </button>
      ))}
    </div>
  );
};

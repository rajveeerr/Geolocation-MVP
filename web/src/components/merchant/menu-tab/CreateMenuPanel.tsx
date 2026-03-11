import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandardMenuCards } from './StandardMenuCards';
import { HappyHourMenuCards } from './HappyHourMenuCards';
import { SpecialMenuCards } from './SpecialMenuCards';
import type { MenuType, HappyHourPreset } from './types';

type MenuCategory = 'standard' | 'happy_hour' | 'special';

interface CreateMenuPanelProps {
  onCreateStandardMenu: (menuType: MenuType) => void;
  onCreateHappyHour: (preset: HappyHourPreset) => void;
  onCreateEventMenu: (theme?: string) => void;
}

const categoryTabs: { id: MenuCategory; label: string }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'happy_hour', label: 'Happy Hour' },
  { id: 'special', label: 'Special' },
];

export const CreateMenuPanel = ({ onCreateStandardMenu, onCreateHappyHour, onCreateEventMenu }: CreateMenuPanelProps) => {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('standard');

  return (
    <div className="rounded-2xl border border-neutral-700/50 bg-neutral-800/30 p-6">
      <div className="mb-1 flex items-center gap-2">
        <UtensilsCrossed className="h-5 w-5 text-neutral-400" />
        <h3 className="text-lg font-bold text-white">Create Menu</h3>
      </div>
      <p className="mb-5 text-sm text-neutral-500">Choose a menu type to create for your customers</p>

      {/* Category Tabs */}
      <div className="mb-6 flex items-center gap-2 rounded-full bg-neutral-900/50 p-1">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={cn(
              'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
              activeCategory === tab.id
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeCategory === 'standard' && <StandardMenuCards onCreateMenu={onCreateStandardMenu} />}
      {activeCategory === 'happy_hour' && <HappyHourMenuCards onCreateHappyHour={onCreateHappyHour} />}
      {activeCategory === 'special' && <SpecialMenuCards onCreateEventMenu={onCreateEventMenu} />}
    </div>
  );
};

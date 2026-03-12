import React from 'react';
import {
  UtensilsCrossed,
  Baby,
  Calendar,
  IceCreamCone,
  Wine,
  Plus,
  Beer,
  Soup,
  Moon,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuTemplate } from '@/config/menuTemplates';

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Baby,
  Calendar,
  IceCreamCone,
  Wine,
  Plus,
  Beer,
  Soup,
  Moon,
};

interface MenuTemplateCardProps {
  template: MenuTemplate;
  onClick: (template: MenuTemplate) => void;
  className?: string;
}

export const MenuTemplateCard: React.FC<MenuTemplateCardProps> = ({
  template,
  onClick,
  className,
}) => {
  const IconComponent = ICON_MAP[template.icon] ?? UtensilsCrossed;

  return (
    <button
      type="button"
      onClick={() => onClick(template)}
      className={cn(
        'group flex flex-col items-center gap-3 rounded-2xl p-5',
        'bg-white border border-neutral-200 shadow-xs',
        'hover:border-brand/30 hover:shadow-md hover:bg-neutral-50/50',
        'transition-all duration-200',
        'text-center',
        className
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
          template.color,
          'bg-opacity-15'
        )}
      >
        <IconComponent
          className={cn('h-6 w-6', template.color.replace('bg-', 'text-'))}
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-800 group-hover:text-brand transition-colors leading-snug">
          {template.name}
        </p>
        <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">{template.description}</p>
      </div>
    </button>
  );
};

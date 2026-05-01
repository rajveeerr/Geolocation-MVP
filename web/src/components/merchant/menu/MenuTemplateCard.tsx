import React from 'react';
import {
  ArrowRight,
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
        'group flex h-full flex-col rounded-[1.2rem] border p-4 text-left',
        'border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.04)]',
        'hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]',
        'transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-[0.95rem] transition-transform duration-200 group-hover:scale-[1.03]',
            template.color,
            'bg-opacity-15'
          )}
        >
          <IconComponent
            className={cn('h-5 w-5', template.color.replace('bg-', 'text-'))}
          />
        </div>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
          Template
        </span>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-neutral-700">
          {template.name}
        </p>
        <p className="mt-1 text-xs leading-5 text-neutral-500">{template.description}</p>
      </div>

      <div className="mt-auto pt-5">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-700 transition-colors group-hover:text-neutral-900">
          Use this template
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
};

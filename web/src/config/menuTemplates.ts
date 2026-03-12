import type { MenuCollectionType } from '@/hooks/useMenuCollections';

export interface MenuTemplate {
  id: string;
  name: string;
  description: string;
  menuType: MenuCollectionType;
  subType?: string;
  icon: string; // lucide icon name
  color: string; // tailwind colour class for badge/accent
  defaultItems?: string[]; // suggested category/item names
}

// Standard menu templates shown under the "Standard" tab
export const STANDARD_TEMPLATES: MenuTemplate[] = [
  {
    id: 'daily-menu',
    name: 'Daily Menu',
    description: 'Your everyday menu items',
    menuType: 'STANDARD',
    subType: 'daily',
    icon: 'UtensilsCrossed',
    color: 'bg-blue-500',
  },
  {
    id: 'kids-menu',
    name: 'Kids Menu',
    description: 'Special menu for children',
    menuType: 'STANDARD',
    subType: 'kids',
    icon: 'Baby',
    color: 'bg-pink-500',
  },
  {
    id: 'weekend-special',
    name: 'Weekend Special',
    description: 'Weekend only specials',
    menuType: 'STANDARD',
    subType: 'weekend',
    icon: 'Calendar',
    color: 'bg-purple-500',
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Sweet treats and desserts',
    menuType: 'STANDARD',
    subType: 'desserts',
    icon: 'IceCreamCone',
    color: 'bg-amber-500',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Drinks and refreshments',
    menuType: 'STANDARD',
    subType: 'beverages',
    icon: 'Wine',
    color: 'bg-teal-500',
  },
  {
    id: 'custom',
    name: 'Custom Menu',
    description: 'Create your own menu',
    menuType: 'STANDARD',
    subType: 'custom',
    icon: 'Plus',
    color: 'bg-neutral-500',
  },
];

// Happy Hour templates
export const HAPPY_HOUR_TEMPLATES: MenuTemplate[] = [
  {
    id: 'happy-hour-evening',
    name: 'Evening Happy Hour',
    description: '4 PM – 7 PM specials',
    menuType: 'HAPPY_HOUR',
    subType: 'evening',
    icon: 'Beer',
    color: 'bg-orange-500',
  },
  {
    id: 'happy-hour-lunch',
    name: 'Lunch Deals',
    description: '11 AM – 2 PM deals',
    menuType: 'HAPPY_HOUR',
    subType: 'lunch',
    icon: 'Soup',
    color: 'bg-yellow-500',
  },
  {
    id: 'happy-hour-late-night',
    name: 'Late Night',
    description: '9 PM – 12 AM specials',
    menuType: 'HAPPY_HOUR',
    subType: 'late-night',
    icon: 'Moon',
    color: 'bg-indigo-500',
  },
  {
    id: 'happy-hour-custom',
    name: 'Custom Happy Hour',
    description: 'Set your own time window',
    menuType: 'HAPPY_HOUR',
    subType: 'custom',
    icon: 'Plus',
    color: 'bg-neutral-500',
  },
];

// Popular special / event themes
export const SPECIAL_THEMES = [
  { id: 'taco-tuesday', name: 'Taco Tuesday', icon: '�', color: 'bg-yellow-500' },
  { id: 'wing-wednesday', name: 'Wing Wednesday', icon: '🍗', color: 'bg-orange-500' },
  { id: 'pizza-night', name: 'Pizza Night', icon: '�', color: 'bg-red-500' },
  { id: 'brunch', name: 'Sunday Brunch', icon: '🥞', color: 'bg-amber-500' },
  { id: 'bbq', name: 'BBQ Special', icon: '🔥', color: 'bg-rose-500' },
  { id: 'seafood', name: 'Seafood Fest', icon: '🦞', color: 'bg-cyan-500' },
  { id: 'game-day', name: 'Game Day', icon: '�', color: 'bg-green-500' },
  { id: 'date-night', name: 'Date Night', icon: '🕯️', color: 'bg-pink-500' },
];

export const MENU_TYPE_LABELS: Record<MenuCollectionType, string> = {
  STANDARD: 'Standard',
  HAPPY_HOUR: 'Happy Hour',
  SPECIAL: 'Special',
};

export const MENU_TYPE_DESCRIPTIONS: Record<MenuCollectionType, string> = {
  STANDARD: 'Your regular menu offerings',
  HAPPY_HOUR: 'Time-based discounted menus',
  SPECIAL: 'Event-themed or seasonal menus',
};

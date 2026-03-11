import type { MenuTemplate, HappyHourTemplate } from './types';

export const STANDARD_MENU_TEMPLATES: MenuTemplate[] = [
  { id: 'daily', name: 'Daily Menu', description: 'Your regular menu items' },
  { id: 'kids', name: 'Kids Menu', description: 'Family-friendly options' },
  { id: 'drinks', name: 'Drinks Menu', description: 'Beverages & cocktails' },
  { id: 'desserts', name: 'Desserts Menu', description: 'Sweet treats & desserts' },
];

export const HAPPY_HOUR_TEMPLATES: HappyHourTemplate[] = [
  { id: 'early_morning', name: 'Early Morning Happy Hour', description: '6 AM - 11 AM specials', timeStart: '06:00', timeEnd: '11:00' },
  { id: 'evening', name: 'Evening Happy Hour', description: '4 PM - 7 PM specials', timeStart: '16:00', timeEnd: '19:00' },
  { id: 'late_night', name: 'Late Night Happy Hour', description: '9 PM - 12 AM specials', timeStart: '21:00', timeEnd: '00:00' },
];

export const POPULAR_EVENT_THEMES = [
  'March Madness',
  "Valentine's Day",
  "April Fool's",
  'Super Bowl',
  'Halloween',
  'Christmas',
];

export const META_PREFIX = '[META]';
export const META_SEPARATOR = '|';

export type MenuType = 'daily' | 'kids' | 'drinks' | 'desserts';
export type HappyHourPreset = 'early_morning' | 'evening' | 'late_night';

export interface MenuTemplate {
  id: MenuType;
  name: string;
  description: string;
}

export interface HappyHourTemplate {
  id: HappyHourPreset;
  name: string;
  description: string;
  timeStart: string;
  timeEnd: string;
}

export interface MenuCollectionMetadata {
  menuType: MenuType | 'happy_hour' | 'special_event';
  happyHourPreset?: HappyHourPreset;
  timeStart?: string;
  timeEnd?: string;
  eventTheme?: string;
  storeId?: number;
}

export interface StagedMenuItem {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  isNew?: boolean;
}

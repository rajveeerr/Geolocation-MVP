/**
 * Hardcoded menu items for landing deals. Used instead of API when showing menu peek.
 */
import type { MenuItem } from '@/hooks/useMenuSystem';

const mockMerchant = {
  id: 1,
  name: 'Venue',
  address: '',
  phone: '',
  email: '',
};

function makeItem(
  id: number,
  name: string,
  price: number,
  category: string,
  imageUrl?: string,
): MenuItem {
  return {
    id,
    merchantId: 1,
    name,
    price,
    category,
    isAvailable: true,
    imageUrl: imageUrl || undefined,
    merchant: mockMerchant,
  };
}

// ─── Street Tacos / Food ───────────────────────────────────────────
const TACO_BITES: MenuItem[] = [
  makeItem(1, 'Al Pastor Tacos', 4.5, 'Bites', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80'),
  makeItem(2, 'Carnitas Plate', 12, 'Food', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&q=80'),
  makeItem(3, 'Guacamole & Chips', 6, 'Appetizer', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&q=80'),
  makeItem(4, 'Beef Birria Tacos', 5, 'Bites'),
];
const TACO_DRINKS: MenuItem[] = [
  makeItem(10, 'Horchata', 3, 'Beverage'),
  makeItem(11, 'Jamaica', 3, 'Drink'),
  makeItem(12, 'Margarita', 9, 'Cocktail', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200&q=80'),
];

// ─── Weekend / Club / Events ───────────────────────────────────────
const CLUB_BITES: MenuItem[] = [
  makeItem(20, 'Loaded Nachos', 14, 'Food'),
  makeItem(21, 'Wings Basket', 12, 'Bites'),
  makeItem(22, 'Cheese Fries', 8, 'Appetizer'),
];
const CLUB_DRINKS: MenuItem[] = [
  makeItem(30, 'Craft Beer', 7, 'Beverage'),
  makeItem(31, 'House Cocktail', 12, 'Cocktail'),
  makeItem(32, 'Red Bull Vodka', 14, 'Drink'),
  makeItem(33, 'Sparkling Water', 4, 'Beverage'),
];

// ─── Barnes & Noble (books) — treats & drinks ───────────────────────
const BOOKSTORE_BITES: MenuItem[] = [
  makeItem(40, 'Croissant', 4, 'Bites'),
  makeItem(41, 'Avocado Toast', 10, 'Food'),
  makeItem(42, 'Cookie', 3, 'Bites'),
];
const BOOKSTORE_DRINKS: MenuItem[] = [
  makeItem(50, 'Latte', 5, 'Beverage'),
  makeItem(51, 'Cold Brew', 5, 'Drink'),
  makeItem(52, 'Chai Tea', 4, 'Beverage'),
];

// ─── Self-Care / Salon / Spa ───────────────────────────────────────
const SALON_BITES: MenuItem[] = [
  makeItem(60, 'Fruit Plate', 8, 'Food'),
  makeItem(61, 'Granola Bowl', 7, 'Bites'),
];
const SALON_DRINKS: MenuItem[] = [
  makeItem(70, 'Kombucha', 5, 'Beverage'),
  makeItem(71, 'Green Juice', 7, 'Drink'),
  makeItem(72, 'Sparkling Water', 4, 'Beverage'),
];

// ─── Deal ID → Menu items mapping ──────────────────────────────────
const MENU_BY_DEAL: Record<string, { bites: MenuItem[]; drinks: MenuItem[] }> = {
  // Street Tacos
  st1: { bites: TACO_BITES, drinks: TACO_DRINKS },
  st2: { bites: TACO_BITES, drinks: TACO_DRINKS },
  st3: { bites: TACO_BITES, drinks: TACO_DRINKS },
  st4: { bites: TACO_BITES, drinks: TACO_DRINKS },
  // Weekend Energy — clubs & events
  we1: { bites: CLUB_BITES, drinks: CLUB_DRINKS },
  we2: { bites: BOOKSTORE_BITES, drinks: BOOKSTORE_DRINKS },
  we3: { bites: CLUB_BITES, drinks: CLUB_DRINKS },
  we4: { bites: CLUB_BITES, drinks: CLUB_DRINKS },
  // Self-Care
  sc1: { bites: SALON_BITES, drinks: SALON_DRINKS },
  sc2: { bites: SALON_BITES, drinks: SALON_DRINKS },
  sc3: { bites: SALON_BITES, drinks: SALON_DRINKS },
  sc4: { bites: SALON_BITES, drinks: SALON_DRINKS },
  // Premium / Featured (pd1–pd8)
  pd1: { bites: TACO_BITES, drinks: TACO_DRINKS },
  pd2: { bites: CLUB_BITES, drinks: CLUB_DRINKS },
  pd3: { bites: SALON_BITES, drinks: SALON_DRINKS },
  pd4: { bites: CLUB_BITES, drinks: CLUB_DRINKS },
  pd5: { bites: TACO_BITES, drinks: TACO_DRINKS },
  pd6: { bites: TACO_BITES, drinks: TACO_DRINKS },
  pd7: { bites: CLUB_BITES, drinks: CLUB_DRINKS },
  pd8: { bites: BOOKSTORE_BITES, drinks: BOOKSTORE_DRINKS },
};

/** Get hardcoded menu items for a deal. Returns empty arrays if no menu for this deal. */
export function getLandingMenuItems(dealId: string | undefined): {
  biteItems: MenuItem[];
  drinkItems: MenuItem[];
} {
  if (!dealId) return { biteItems: [], drinkItems: [] };
  const menu = MENU_BY_DEAL[dealId];
  if (!menu) return { biteItems: [], drinkItems: [] };
  return { biteItems: menu.bites, drinkItems: menu.drinks };
}

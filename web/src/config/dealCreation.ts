import { Clock, EyeOff, ShoppingBag, Tag, Trophy, Zap, Repeat, type LucideIcon } from 'lucide-react';
import { PATHS } from '@/routing/paths';

export type DealTypeValue = 'STANDARD' | 'HAPPY_HOUR' | 'RECURRING' | 'REDEEM_NOW' | 'HIDDEN' | 'BOUNTY' | 'BOGO';

export type DealCreationType = {
  value: DealTypeValue;
  title: string;
  eyebrow: string;
  sidebarLabel: string;
  summary: string;
  detailDescription: string;
  bestFor: string;
  route: string;
  selectedAccent: string;
  iconWrap: string;
  icon: LucideIcon;
};

export const dealCreationTypes: DealCreationType[] = [
  {
    value: 'STANDARD',
    title: 'Item Deal',
    eyebrow: 'Core offer',
    sidebarLabel: 'Item Deal',
    summary: 'Promote a single menu item, combo, or short campaign with flexible pricing.',
    detailDescription:
      'A flexible format for one-time promotions, featured items, and seasonal offers.',
    bestFor: 'Flash promos and product pushes',
    route: '/merchant/deals/create/basics',
    selectedAccent: 'bg-[#111827]',
    iconWrap: 'bg-[#fff0e8] text-[#ff5a36]',
    icon: Tag,
  },
  {
    value: 'HAPPY_HOUR',
    title: 'Happy Hour',
    eyebrow: 'Traffic builder',
    sidebarLabel: 'Happy Hour',
    summary: 'Use short windows and curated pricing to fill slower hours with urgency.',
    detailDescription:
      'Short, high-intent offer windows designed to increase traffic during quieter times.',
    bestFor: 'Afternoon and late-night traffic',
    route: '/merchant/deals/create/happy-hour/edit',
    selectedAccent: 'bg-[#1f2937]',
    iconWrap: 'bg-[#e6fffb] text-[#0f766e]',
    icon: Clock,
  },
  {
    value: 'RECURRING',
    title: 'Daily Deal',
    eyebrow: 'Habit loop',
    sidebarLabel: 'Daily Deal',
    summary: 'Create repeatable weekly moments like Taco Tuesday or Wine Wednesday.',
    detailDescription:
      'A repeating schedule that turns a promotion into something customers remember every week.',
    bestFor: 'Recurring weekly rituals',
    route: '/merchant/deals/create/daily-deal/weekdays',
    selectedAccent: 'bg-[#0f172a]',
    iconWrap: 'bg-[#eef2ff] text-[#4338ca]',
    icon: Repeat,
  },
  {
    value: 'REDEEM_NOW',
    title: 'Redeem Now',
    eyebrow: 'Instant unlock',
    sidebarLabel: 'Redeem Now',
    summary: 'Drive immediate action with a spend threshold and a fixed reward.',
    detailDescription:
      'A spend-threshold offer that gives guests an immediate incentive to convert right now.',
    bestFor: 'Fast conversion and same-day visits',
    route: '/merchant/deals/create/redeem-now',
    selectedAccent: 'bg-[#292524]',
    iconWrap: 'bg-[#fff1e6] text-[#f97316]',
    icon: Zap,
  },
  {
    value: 'HIDDEN',
    title: 'Hidden Deal',
    eyebrow: 'Exclusive access',
    sidebarLabel: 'Hidden Deal',
    summary: 'Unlock members-only or code-based offers that feel secret and premium.',
    detailDescription: 'A gated offer that feels private, surprising, or earned through special access.',
    bestFor: 'VIP moments and discovery-based offers',
    route: '/merchant/deals/create/hidden',
    selectedAccent: 'bg-[#18181b]',
    iconWrap: 'bg-[#f3e8ff] text-[#7c3aed]',
    icon: EyeOff,
  },
  {
    value: 'BOUNTY',
    title: 'Bounty Deal',
    eyebrow: 'Reward loop',
    sidebarLabel: 'Bounty Deal',
    summary: 'Incentivize guests with referrals, check-ins, or outcome-based rewards.',
    detailDescription: 'A performance-style offer that rewards actions like referrals, attendance, or check-ins.',
    bestFor: 'Growth campaigns and social reach',
    route: '/merchant/deals/create/bounty',
    selectedAccent: 'bg-[#172554]',
    iconWrap: 'bg-[#e9fff1] text-[#15803d]',
    icon: Trophy,
  },
  {
    value: 'BOGO',
    title: 'BOGO Deal',
    eyebrow: 'Volume incentive',
    sidebarLabel: 'BOGO Deal',
    summary: 'Buy N items, get M at a discount (or free). Classic "Buy 1 Get 1" mechanics.',
    detailDescription:
      'A volume offer where buying N items unlocks M items at a discount - "Buy 2 Get 1 Free" and similar.',
    bestFor: 'Driving larger ticket sizes',
    route: PATHS.MERCHANT_DEALS_BOGO,
    selectedAccent: 'bg-[#7c2d12]',
    iconWrap: 'bg-[#fff7ed] text-[#c2410c]',
    icon: ShoppingBag,
  },
];

export const dealCreationSidebarItems = dealCreationTypes.map((dealType) => ({
  label: dealType.sidebarLabel,
  to: dealType.route,
  icon: dealType.icon,
  match: (pathname: string) => pathname === dealType.route || pathname.startsWith(`${dealType.route}/`),
}));

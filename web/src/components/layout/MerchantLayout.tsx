import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Crown,
  Gift,
  Grid2x2,
  KeyRound,
  Share2,
  Target,
  LogOut,
  Menu,
  Plus,
  ScanSearch,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Ticket,
  Truck,
  UserCircle2,
  UtensilsCrossed,
  WandSparkles,
  X,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/useAuth';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';

type MerchantNavItem = {
  label: string;
  to: string;
  icon: typeof Grid2x2;
  match?: (pathname: string) => boolean;
};

type MerchantNavSection = {
  id: string;
  label: string;
  items: MerchantNavItem[];
};

const navSections: MerchantNavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        to: PATHS.MERCHANT_DASHBOARD,
        icon: Grid2x2,
        match: (pathname) => pathname === PATHS.MERCHANT_DASHBOARD,
      },
      {
        label: 'Analytics',
        to: PATHS.MERCHANT_ANALYTICS,
        icon: BarChart3,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_ANALYTICS),
      },
    ],
  },
  {
    id: 'deals',
    label: 'Deals',
    items: [
      {
        label: 'Deals',
        to: PATHS.MERCHANT_DEALS,
        icon: Ticket,
        match: (pathname) =>
          pathname.startsWith('/merchant/deals') &&
          !pathname.startsWith(PATHS.MERCHANT_DEALS_HIDDEN) &&
          !pathname.startsWith(PATHS.MERCHANT_DEALS_BOUNTIES),
      },
    ],
  },
  {
    id: 'menu',
    label: 'Menu',
    items: [
      {
        label: 'Menu',
        to: PATHS.MERCHANT_MENU,
        icon: UtensilsCrossed,
        match: (pathname) => pathname.startsWith('/merchant/menu'),
      },
      {
        label: 'Packages',
        to: PATHS.MERCHANT_MENU_COLLECTIONS,
        icon: UtensilsCrossed,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_MENU_COLLECTIONS),
      },
      {
        label: 'Inventory',
        to: PATHS.MERCHANT_INVENTORY,
        icon: Boxes,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_INVENTORY),
      },
    ],
  },
  {
    id: 'locations',
    label: 'Locations',
    items: [
      {
        label: 'Stores',
        to: PATHS.MERCHANT_STORES,
        icon: Store,
        match: (pathname) => pathname.startsWith('/merchant/stores'),
      },
      {
        label: 'Food trucks',
        to: PATHS.MERCHANT_TRUCKS,
        icon: Truck,
        match: (pathname) => pathname.startsWith('/merchant/trucks'),
      },
    ],
  },
  {
    id: 'catering',
    label: 'Catering',
    items: [
      {
        label: 'Catering Menu',
        to: PATHS.MERCHANT_CATERING,
        icon: UtensilsCrossed,
        match: (pathname) =>
          pathname.startsWith(PATHS.MERCHANT_CATERING) &&
          !pathname.startsWith(PATHS.MERCHANT_CATERING_ORDERS),
      },
      {
        label: 'Catering Orders',
        to: PATHS.MERCHANT_CATERING_ORDERS,
        icon: ShoppingBag,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_CATERING_ORDERS),
      },
    ],
  },
  {
    id: 'incentives',
    label: 'Incentives',
    items: [
      {
        label: 'Bounties',
        to: PATHS.MERCHANT_DEALS_BOUNTIES,
        icon: Target,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_DEALS_BOUNTIES),
      },
      {
        label: 'Check-in rewards',
        to: PATHS.MERCHANT_CHECKIN_GAMES,
        icon: ScanSearch,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_CHECKIN_GAMES),
      },
      {
        label: 'Referral deals',
        to: PATHS.MERCHANT_REFERRAL_DEALS,
        icon: Share2,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_REFERRAL_DEALS),
      },
      {
        label: 'Hidden deals',
        to: PATHS.MERCHANT_DEALS_HIDDEN,
        icon: KeyRound,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_DEALS_HIDDEN),
      },
      {
        label: 'Surprise rewards',
        to: PATHS.MERCHANT_SURPRISES,
        icon: WandSparkles,
        match: (pathname) => pathname.startsWith('/merchant/surprises'),
      },
      {
        label: 'Cashback rewards',
        to: PATHS.MERCHANT_KICKBACKS,
        icon: CircleDollarSign,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_KICKBACKS),
      },
      {
        label: 'Membership tiers',
        to: PATHS.MERCHANT_MEMBERSHIP_TIERS,
        icon: Crown,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_MEMBERSHIP_TIERS),
      },
    ],
  },
  {
    id: 'experiences',
    label: 'Experiences',
    items: [
      {
        label: 'Events',
        to: PATHS.MERCHANT_EVENTS,
        icon: Building2,
        match: (pathname) => pathname.startsWith('/merchant/events'),
      },
      {
        label: 'Services',
        to: PATHS.MERCHANT_SERVICES,
        icon: Sparkles,
        match: (pathname) => pathname.startsWith('/merchant/services'),
      },
    ],
  },
  {
    id: 'loyalty',
    label: 'Loyalty',
    items: [
      {
        label: 'Analytics',
        to: PATHS.MERCHANT_LOYALTY_ANALYTICS,
        icon: Gift,
        match: (pathname) => pathname === PATHS.MERCHANT_LOYALTY_ANALYTICS,
      },
      {
        label: 'Program',
        to: PATHS.MERCHANT_LOYALTY_PROGRAM,
        icon: Gift,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_PROGRAM),
      },
      {
        label: 'Customers',
        to: PATHS.MERCHANT_LOYALTY_CUSTOMERS,
        icon: Gift,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_CUSTOMERS),
      },
      {
        label: 'Transactions',
        to: PATHS.MERCHANT_LOYALTY_TRANSACTIONS,
        icon: Gift,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_TRANSACTIONS),
      },
      {
        label: 'Setup',
        to: PATHS.MERCHANT_LOYALTY_SETUP,
        icon: Gift,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_SETUP),
      },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      {
        label: 'Blog Posts',
        to: PATHS.MERCHANT_BLOG,
        icon: FileText,
        match: (pathname) => pathname === PATHS.MERCHANT_BLOG || pathname.includes('/merchant/blog/') && !pathname.includes('categories'),
      },
      {
        label: 'Create Post',
        to: PATHS.MERCHANT_BLOG_CREATE,
        icon: FileText,
        match: (pathname) => pathname === PATHS.MERCHANT_BLOG_CREATE,
      },
      {
        label: 'Categories',
        to: PATHS.MERCHANT_BLOG_CATEGORIES,
        icon: FileText,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_BLOG_CATEGORIES),
      },
    ],
  },
  {
    id: 'business',
    label: 'My Business',
    items: [
      {
        label: 'Business Profile',
        to: PATHS.MERCHANT_BUSINESS,
        icon: Building2,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_BUSINESS),
      },
    ],
  },
];

// pageTitles is matched in order — keep more-specific entries above their parents.
const pageTitles: Array<{ match: (pathname: string) => boolean; title: string; subtitle: string }> = [
  {
    match: (pathname) => pathname === PATHS.MERCHANT_DASHBOARD,
    title: 'Dashboard',
    subtitle: 'Your control center for storefront, campaigns, and customer activity.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_ANALYTICS),
    title: 'Analytics',
    subtitle: 'Track performance with a focused operating view.',
  },
  // ─── Deals
  {
    match: (pathname) => pathname === PATHS.MERCHANT_DEALS_CREATE,
    title: 'Create deal',
    subtitle: 'Set up a new promotion, recurring deal, happy hour, or hidden offer.',
  },
  {
    match: (pathname) => /^\/merchant\/deals\/\d+\/edit$/.test(pathname),
    title: 'Edit deal',
    subtitle: 'Tune an existing promotion.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/deals') && !pathname.startsWith(PATHS.MERCHANT_DEALS_HIDDEN),
    title: 'Deals',
    subtitle: 'Create, tune, and monitor promotions from one place.',
  },
  // ─── Menu
  {
    match: (pathname) => pathname === PATHS.MERCHANT_MENU_CREATE,
    title: 'Add menu item',
    subtitle: 'Add a new dish, drink, or product to your menu.',
  },
  {
    match: (pathname) => /^\/merchant\/menu\/\d+\/edit$/.test(pathname),
    title: 'Edit menu item',
    subtitle: 'Update pricing, availability, or details.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_MENU_COLLECTIONS),
    title: 'Packages',
    subtitle: 'Group menu items into themed sets.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/menu'),
    title: 'Menu',
    subtitle: 'Keep your menu structured, current, and ready to publish.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_INVENTORY),
    title: 'Inventory',
    subtitle: 'Track stock levels, restock items, and prevent overselling.',
  },
  // ─── Locations
  {
    match: (pathname) => pathname === PATHS.MERCHANT_STORES_CREATE,
    title: 'Add store',
    subtitle: 'Add a new physical location to your business.',
  },
  {
    match: (pathname) => /^\/merchant\/stores\/\d+\/edit$/.test(pathname),
    title: 'Edit store',
    subtitle: 'Update store details, hours, or features.',
  },
  {
    match: (pathname) => /^\/merchant\/stores\/\d+$/.test(pathname),
    title: 'Store details',
    subtitle: 'Manage this location\'s settings and content.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/stores'),
    title: 'Stores',
    subtitle: 'Manage locations, visibility, and store-level performance.',
  },
  {
    match: (pathname) => pathname === PATHS.MERCHANT_TRUCKS_CREATE,
    title: 'Add a food truck',
    subtitle: 'Set up a mobile venue and optionally post your first stop.',
  },
  {
    match: (pathname) => /^\/merchant\/trucks\/\d+$/.test(pathname),
    title: 'Truck schedule',
    subtitle: 'Post upcoming stops for this truck.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/trucks'),
    title: 'Food trucks',
    subtitle: 'Post upcoming stops so customers know where you\'ll be.',
  },
  // ─── Catering
  {
    match: (pathname) => /^\/merchant\/catering\/orders\/\d+$/.test(pathname),
    title: 'Order details',
    subtitle: 'Review and progress this catering order.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_CATERING_ORDERS),
    title: 'Catering orders',
    subtitle: 'Review, confirm, and track catering requests from your customers.',
  },
  {
    match: (pathname) => pathname === PATHS.MERCHANT_CATERING_CREATE,
    title: 'New catering item',
    subtitle: 'Build a per-person package, platter, or boxed lunch.',
  },
  {
    match: (pathname) => /^\/merchant\/catering\/\d+\/edit$/.test(pathname),
    title: 'Edit catering item',
    subtitle: 'Tweak pricing, options, or visibility.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/catering'),
    title: 'Catering menu',
    subtitle: 'Build a separate catering menu with per-person pricing and customization options.',
  },
  // ─── Deals (sub-views)
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_DEALS_BOGO),
    title: 'BOGO deals',
    subtitle: '"Buy N Get M" deals — drive larger ticket sizes with volume incentives.',
  },
  // ─── Incentives
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_DEALS_BOUNTIES),
    title: 'Bounties',
    subtitle: 'Reward customers for bringing friends in.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_REFERRAL_DEALS),
    title: 'Referral deals',
    subtitle: 'Per-deal share mechanics — both the referrer and the friend get something. (Preview — not live yet.)',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_REFERRALS),
    title: 'Referral programs',
    subtitle: 'Reward customers for bringing in new people. (Preview — not live yet.)',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_DEALS_HIDDEN),
    title: 'Hidden deals',
    subtitle: 'Deals locked behind an access code — share with select customers only.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_CHECKIN_GAMES),
    title: 'Check-in rewards',
    subtitle: 'Configure games and rewards customers earn for checking in.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/surprises'),
    title: 'Surprise rewards',
    subtitle: 'Reveal-based offers that surprise customers near you.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_KICKBACKS),
    title: 'Cashback rewards',
    subtitle: 'Track how referrals convert into spend and kickback distributed.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_MEMBERSHIP_TIERS),
    title: 'Membership tiers',
    subtitle: 'Subscription perks like discounts, free delivery, and priority access. (Preview — not live yet.)',
  },
  // ─── Experiences
  {
    match: (pathname) => pathname === PATHS.MERCHANT_EVENTS_CREATE,
    title: 'Create event',
    subtitle: 'Schedule a live experience for your customers.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/events'),
    title: 'Events',
    subtitle: 'Coordinate live experiences and attendance operations.',
  },
  {
    match: (pathname) => pathname === PATHS.MERCHANT_SERVICES_CREATE,
    title: 'Create service',
    subtitle: 'Add a new bookable service.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/services'),
    title: 'Services',
    subtitle: 'Organize bookable services with a calmer workflow.',
  },
  // ─── Loyalty
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_PROGRAM),
    title: 'Loyalty program',
    subtitle: 'Configure points, rewards, and how customers progress.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_CUSTOMERS),
    title: 'Loyalty customers',
    subtitle: 'See member balances, recent activity, and segments.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_TRANSACTIONS),
    title: 'Loyalty transactions',
    subtitle: 'Audit every points event across your customers.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_SETUP),
    title: 'Loyalty setup',
    subtitle: 'Initial configuration for your loyalty program.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/loyalty'),
    title: 'Loyalty analytics',
    subtitle: 'Review customer retention and refine your program.',
  },
  // ─── Content + business
  {
    match: (pathname) => pathname === PATHS.MERCHANT_BLOG_CREATE,
    title: 'Create post',
    subtitle: 'Write content to publish on your storefront.',
  },
  {
    match: (pathname) => /^\/merchant\/blog\/\d+\/edit$/.test(pathname),
    title: 'Edit post',
    subtitle: 'Update an existing blog post.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_BLOG_CATEGORIES),
    title: 'Blog categories',
    subtitle: 'Organize your blog by topic.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/blog'),
    title: 'Blog',
    subtitle: 'Write and publish content for your customers.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_BUSINESS),
    title: 'My Business',
    subtitle: 'Review the identity, status, and core details behind your merchant account.',
  },
];

const getActiveSection = (pathname: string) =>
  navSections.find((section) =>
    section.items.some((item) => (item.match ? item.match(pathname) : pathname.startsWith(item.to))),
  ) ?? navSections[0];

const searchableNavItems = navSections.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    sectionLabel: section.label,
  })),
);

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'Y';

function MerchantSidebar({
  pathname,
  onNavigate,
  merchantDisplayName,
  merchantTagline,
  merchantInitials,
  merchantLogoUrl,
  collapsed = false,
  onToggleCollapse,
}: {
  pathname: string;
  onNavigate?: () => void;
  merchantDisplayName: string;
  merchantTagline: string;
  merchantInitials: string;
  merchantLogoUrl?: string | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const activeSection = getActiveSection(pathname);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navSections.map((section) => [section.id, section.id === activeSection.id])),
  );

  useEffect(() => {
    setExpandedSections((current) => ({
      ...current,
      [activeSection.id]: true,
    }));
  }, [activeSection.id]);

  useEffect(() => {
    setLogoLoadFailed(false);
  }, [merchantLogoUrl]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  // Collapsed mode: icon-only sidebar
  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center">
        <div className="border-b border-neutral-200/80 px-2 py-5 w-full flex flex-col items-center gap-3">
          <Link to={PATHS.MERCHANT_DASHBOARD} onClick={onNavigate} title={merchantDisplayName}>
            {merchantLogoUrl && !logoLoadFailed ? (
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-white shadow-[0_8px_18px_rgba(17,17,17,0.18)]">
                <img
                  src={merchantLogoUrl}
                  alt={merchantDisplayName}
                  className="h-full w-full object-cover object-center"
                  onError={() => setLogoLoadFailed(true)}
                />
              </span>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-[#111111] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(17,17,17,0.18)]">
                {merchantInitials}
              </span>
            )}
          </Link>
          {onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-[0.6rem] border border-neutral-200 bg-white text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-700"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto w-full px-2 py-4">
          <div className="space-y-1">
            {navSections.map((section) =>
              section.items.map((item) => {
                const isActive = item.match ? item.match(pathname) : pathname.startsWith(item.to);
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    title={item.label}
                    className={cn(
                      'flex items-center justify-center rounded-[0.7rem] p-2.5 transition',
                      isActive
                        ? 'bg-neutral-100 text-neutral-950'
                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </NavLink>
                );
              }),
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200/80 px-2 py-3 w-full flex flex-col items-center">
          <Link
            to={PATHS.MERCHANT_DEALS_CREATE}
            onClick={onNavigate}
            title="Create deal"
            className="flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-neutral-950 text-white transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200/80 px-5 py-5">
        <div className="flex items-center justify-between gap-2">
          <Link to={PATHS.MERCHANT_DASHBOARD} onClick={onNavigate} className="inline-flex min-w-0 items-center gap-3">
            {merchantLogoUrl && !logoLoadFailed ? (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-white shadow-[0_8px_18px_rgba(17,17,17,0.18)]">
                <img
                  src={merchantLogoUrl}
                  alt={merchantDisplayName}
                  className="h-full w-full object-cover object-center"
                  onError={() => setLogoLoadFailed(true)}
                />
              </span>
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#111111] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(17,17,17,0.18)]">
                {merchantInitials}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[1.05rem] font-semibold tracking-tight text-neutral-950">{merchantDisplayName}</span>
              <span className="block truncate text-xs text-neutral-500">{merchantTagline}</span>
            </span>
          </Link>
          {onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.6rem] border border-neutral-200 bg-white text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-700"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="pb-4">
          <div className="text-[1.7rem] font-semibold tracking-tight text-neutral-950">Merchant</div>
          <div className="mt-1 text-[13px] text-neutral-500">Business workspace</div>
        </div>

        <div className="space-y-1">
          {navSections.map((section) => {
            const isExpanded = expandedSections[section.id] ?? false;
            const sectionHasActiveItem = section.items.some((item) =>
              item.match ? item.match(pathname) : pathname.startsWith(item.to),
            );

            return (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[0.9rem] px-3 py-2 text-left text-[14px] font-medium transition',
                    sectionHasActiveItem
                      ? 'text-neutral-950'
                      : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-950',
                  )}
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-neutral-500 transition-transform',
                      isExpanded ? 'rotate-180' : 'rotate-0',
                    )}
                  />
                </button>

                {isExpanded ? (
                  <div className="mt-1 space-y-1 pb-2">
                    {section.items.map((item) => {
                      const isActive = item.match ? item.match(pathname) : pathname.startsWith(item.to);

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={onNavigate}
                          className={cn(
                            'block rounded-[0.7rem] px-4 py-2.5 text-[13px] transition',
                            isActive
                              ? 'bg-neutral-100 font-semibold text-neutral-950'
                              : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950',
                          )}
                        >
                          {item.label}
                        </NavLink>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-neutral-200/80 px-4 py-4">
        <div className="rounded-[1.2rem] border border-neutral-200/80 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <p className="text-[13px] font-semibold text-neutral-950">Quick actions</p>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Jump into publishing or switch back to the customer-facing app.
          </p>
          <div className="mt-4 grid gap-2">
            <Link
              to={PATHS.MERCHANT_DEALS_CREATE}
              onClick={onNavigate}
              className="inline-flex items-center justify-center rounded-[1rem] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Create deal
            </Link>
            <Link
              to={PATHS.HOME}
              onClick={onNavigate}
              className="inline-flex items-center justify-center rounded-[1rem] border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Switch to browsing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MerchantWorkspaceSearch({
  onNavigateTo,
}: {
  onNavigateTo: (to: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return searchableNavItems.slice(0, 8);
    }

    return searchableNavItems.filter((item) => {
      const haystack = `${item.label} ${item.sectionLabel} ${item.to}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (to: string) => {
    onNavigateTo(to);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[13px] text-neutral-500 shadow-sm transition hover:border-neutral-300 hover:text-neutral-700"
      >
        <Search className="h-4 w-4" />
        <span>Search workspace</span>
        <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-400">Ctrl K</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[340px] overflow-hidden rounded-[1.1rem] border border-neutral-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          <div className="border-b border-neutral-200 p-3">
            <div className="flex items-center gap-2 rounded-[0.9rem] border border-neutral-200 bg-neutral-50 px-3 py-2">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages, tools, and create flows"
                className="w-full bg-transparent text-[13px] text-neutral-800 outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto p-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={`${item.sectionLabel}-${item.to}`}
                  type="button"
                  onClick={() => handleNavigate(item.to)}
                  className="flex w-full items-start justify-between rounded-[0.9rem] px-3 py-2.5 text-left transition hover:bg-neutral-50"
                >
                  <div>
                    <div className="text-[13px] font-medium text-neutral-900">{item.label}</div>
                    <div className="mt-0.5 text-xs text-neutral-500">{item.sectionLabel}</div>
                  </div>
                  <div className="ml-4 truncate text-xs text-neutral-400">{item.to}</div>
                </button>
              ))
            ) : (
              <div className="px-3 py-5 text-center text-[13px] text-neutral-500">
                No workspace matches found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const SIDEBAR_COLLAPSED_KEY = 'merchant-sidebar-collapsed';

export const MerchantLayout = ({ children }: { children?: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: merchantData } = useMerchantStatus();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const pageMeta = useMemo(
    () =>
      pageTitles.find((item) => item.match(location.pathname)) ?? {
        title: 'Merchant Workspace',
        subtitle: 'Manage your merchant experience with a more structured interface.',
      },
    [location.pathname],
  );

  const activeSection = useMemo(() => getActiveSection(location.pathname), [location.pathname]);
  const merchantName = merchantData?.data?.merchant?.businessName?.trim() || user?.name?.trim() || 'Merchant Business';
  const profileAvatarUrl = user?.avatarUrl || null;
  const merchantLogoUrl = merchantData?.data?.merchant?.logoUrl || null;
  const merchantStatus = merchantData?.data?.merchant?.status;
  const merchantCity = merchantData?.data?.merchant?.city?.trim();
  const merchantInitials = getInitials(merchantName);
  const [mobileLogoLoadFailed, setMobileLogoLoadFailed] = useState(false);
  const profileName = user?.name?.trim() || 'Merchant';
  const merchantTagline =
    merchantCity && merchantStatus
      ? `${merchantCity} · ${merchantStatus.toLowerCase()}`
      : merchantCity
        ? merchantCity
        : merchantStatus
          ? `${merchantStatus.toLowerCase()} merchant workspace`
          : 'Refined control center';

  useEffect(() => {
    setMobileLogoLoadFailed(false);
  }, [merchantLogoUrl]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-neutral-900">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'hidden shrink-0 border-r border-neutral-200/70 bg-[#fbfbfc] lg:block transition-[width] duration-300 ease-in-out',
            sidebarCollapsed ? 'w-[72px]' : 'w-[320px]',
          )}
        >
          <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
            <MerchantSidebar
              pathname={location.pathname}
              merchantDisplayName={merchantName}
              merchantTagline={merchantTagline}
              merchantInitials={merchantInitials}
              merchantLogoUrl={merchantLogoUrl}
              collapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapsed}
            />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/92 backdrop-blur-2xl">
            <div className="border-b border-neutral-200/80 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-neutral-200 bg-white text-neutral-700 shadow-sm lg:hidden"
                    aria-label="Open merchant sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </button>

                  <Link to={PATHS.MERCHANT_DASHBOARD} className="flex min-w-0 items-center gap-3 lg:hidden">
                    {merchantLogoUrl && !mobileLogoLoadFailed ? (
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-200 bg-white">
                        <img
                          src={merchantLogoUrl}
                          alt={merchantName}
                          className="h-full w-full object-cover object-center"
                          onError={() => setMobileLogoLoadFailed(true)}
                        />
                      </span>
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-neutral-950 text-sm font-semibold text-white">
                        {merchantInitials}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="max-w-[280px] truncate text-[15px] font-semibold tracking-tight text-neutral-950">{merchantName}</div>
                      <div className="max-w-[280px] truncate text-xs text-neutral-500">{merchantTagline}</div>
                    </div>
                  </Link>
                </div>

                <nav className="hidden items-center gap-2 xl:flex">
                  {navSections.map((section) => {
                    const isActive = section.id === activeSection.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => navigate(section.items[0].to)}
                        className={cn(
                          'rounded-full px-4 py-2 text-[13px] font-medium transition',
                          isActive
                            ? 'bg-neutral-100 text-neutral-950 shadow-sm ring-1 ring-neutral-200/80'
                            : 'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-950',
                        )}
                      >
                        {section.label}
                      </button>
                    );
                  })}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                  <MerchantWorkspaceSearch onNavigateTo={(to) => navigate(to)} />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-[13px] text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
                      >
                        <span className="hidden max-w-[120px] truncate font-medium sm:inline">{profileName}</span>
                        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white text-neutral-900">
                          {profileAvatarUrl ? (
                            <img
                              src={profileAvatarUrl}
                              alt={profileName}
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <UserCircle2 className="h-4 w-4" />
                          )}
                        </span>
                        <ChevronDown className="hidden h-4 w-4 text-neutral-400 sm:block" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-[240px] rounded-[1.15rem] border-neutral-200 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
                    >
                      <DropdownMenuLabel className="px-3 py-2">
                        <div className="truncate text-[13px] font-semibold text-neutral-950">{profileName}</div>
                        <div className="truncate text-xs font-normal text-neutral-500">{merchantTagline}</div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild className="rounded-[0.85rem] px-3 py-2 text-[13px]">
                        <Link to={PATHS.MERCHANT_DASHBOARD}>
                          <Grid2x2 className="mr-2 h-4 w-4" />
                          <span>Merchant dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-[0.85rem] px-3 py-2 text-[13px]">
                        <Link to={PATHS.PROFILE}>
                          <UserCircle2 className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-[0.85rem] px-3 py-2 text-[13px]">
                        <Link to={PATHS.SETTINGS}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-[0.85rem] px-3 py-2 text-[13px]">
                        <Link to={PATHS.HOME}>
                          <Store className="mr-2 h-4 w-4" />
                          <span>Browse app</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={logout}
                        className="rounded-[0.85rem] px-3 py-2 text-[13px] text-red-600 focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="bg-[#f5f5f7] px-4 py-4 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
                  <Link
                    to={activeSection.items[0]?.to ?? PATHS.MERCHANT_DASHBOARD}
                    className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500 transition-colors hover:text-neutral-900"
                  >
                    {activeSection.label}
                  </Link>
                  <ChevronRight className="h-3 w-3 shrink-0 text-neutral-400" aria-hidden />
                  <span className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-900">
                    {pageMeta.title}
                  </span>
                </nav>
                <h1 className="mt-1.5 truncate text-[1.55rem] font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem]">
                  {pageMeta.title}
                </h1>
                <p className="mt-1 max-w-3xl text-[13px] text-neutral-500 sm:text-sm">{pageMeta.subtitle}</p>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[2px]"
            aria-label="Close merchant sidebar"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[88vw] max-w-[340px] border-r border-neutral-200/80 bg-[#fbfbfc] shadow-2xl">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-neutral-200 bg-white text-neutral-700 shadow-sm"
                aria-label="Close merchant sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-64px)]">
              <MerchantSidebar
                pathname={location.pathname}
                onNavigate={() => setMobileSidebarOpen(false)}
                merchantDisplayName={merchantName}
                merchantTagline={merchantTagline}
                merchantInitials={merchantInitials}
                merchantLogoUrl={merchantLogoUrl}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

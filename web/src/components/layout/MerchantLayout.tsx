import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ChevronDown,
  CircleDollarSign,
  Gift,
  Grid2x2,
  LogOut,
  Menu,
  Plus,
  ScanSearch,
  Search,
  Settings,
  Sparkles,
  Store,
  Ticket,
  UserCircle2,
  UtensilsCrossed,
  WandSparkles,
  X,
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
      {
        label: 'Kickbacks',
        to: PATHS.MERCHANT_KICKBACKS,
        icon: CircleDollarSign,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_KICKBACKS),
      },
      {
        label: 'Profile',
        to: PATHS.PROFILE,
        icon: UserCircle2,
        match: (pathname) => pathname.startsWith(PATHS.PROFILE),
      },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    items: [
      {
        label: 'Deals',
        to: PATHS.MERCHANT_DEALS,
        icon: Ticket,
        match: (pathname) => pathname.startsWith('/merchant/deals'),
      },
      {
        label: 'Create Deal',
        to: PATHS.MERCHANT_DEALS_CREATE,
        icon: Ticket,
        match: (pathname) => pathname === PATHS.MERCHANT_DEALS_CREATE,
      },
      {
        label: 'Menu',
        to: PATHS.MERCHANT_MENU,
        icon: UtensilsCrossed,
        match: (pathname) => pathname.startsWith('/merchant/menu'),
      },
      {
        label: 'Add Menu Item',
        to: PATHS.MERCHANT_MENU_CREATE,
        icon: UtensilsCrossed,
        match: (pathname) => pathname === PATHS.MERCHANT_MENU_CREATE,
      },
      {
        label: 'Collections',
        to: PATHS.MERCHANT_MENU_COLLECTIONS,
        icon: UtensilsCrossed,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_MENU_COLLECTIONS),
      },
      {
        label: 'Stores',
        to: PATHS.MERCHANT_STORES,
        icon: Store,
        match: (pathname) => pathname.startsWith('/merchant/stores'),
      },
      {
        label: 'Add Store',
        to: PATHS.MERCHANT_STORES_CREATE,
        icon: Store,
        match: (pathname) => pathname === PATHS.MERCHANT_STORES_CREATE,
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
        label: 'Create Event',
        to: PATHS.MERCHANT_EVENTS_CREATE,
        icon: Building2,
        match: (pathname) => pathname === PATHS.MERCHANT_EVENTS_CREATE,
      },
      {
        label: 'Services',
        to: PATHS.MERCHANT_SERVICES,
        icon: Sparkles,
        match: (pathname) => pathname.startsWith('/merchant/services'),
      },
      {
        label: 'Create Service',
        to: PATHS.MERCHANT_SERVICES_CREATE,
        icon: Sparkles,
        match: (pathname) => pathname === PATHS.MERCHANT_SERVICES_CREATE,
      },
      {
        label: 'Surprises',
        to: PATHS.MERCHANT_SURPRISES,
        icon: WandSparkles,
        match: (pathname) => pathname.startsWith('/merchant/surprises'),
      },
      {
        label: 'Create Surprise',
        to: PATHS.MERCHANT_SURPRISES_CREATE,
        icon: WandSparkles,
        match: (pathname) => pathname === PATHS.MERCHANT_SURPRISES_CREATE,
      },
      {
        label: 'Check-in Games',
        to: PATHS.MERCHANT_CHECKIN_GAMES,
        icon: ScanSearch,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_CHECKIN_GAMES),
      },
      {
        label: 'Loyalty',
        to: PATHS.MERCHANT_LOYALTY_ANALYTICS,
        icon: Gift,
        match: (pathname) => pathname.startsWith('/merchant/loyalty'),
      },
      {
        label: 'Loyalty Program',
        to: PATHS.MERCHANT_LOYALTY_PROGRAM,
        icon: Gift,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_PROGRAM),
      },
      {
        label: 'Loyalty Customers',
        to: PATHS.MERCHANT_LOYALTY_CUSTOMERS,
        icon: Gift,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_CUSTOMERS),
      },
      {
        label: 'Loyalty Transactions',
        to: PATHS.MERCHANT_LOYALTY_TRANSACTIONS,
        icon: Gift,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_TRANSACTIONS),
      },
      {
        label: 'Loyalty Setup',
        to: PATHS.MERCHANT_LOYALTY_SETUP,
        icon: Gift,
        match: (pathname) => pathname.startsWith(PATHS.MERCHANT_LOYALTY_SETUP),
      },
    ],
  },
];

const pageTitles: Array<{ match: (pathname: string) => boolean; title: string; subtitle: string }> = [
  {
    match: (pathname) => pathname === PATHS.MERCHANT_DASHBOARD,
    title: 'Merchant Dashboard',
    subtitle: 'A cleaner control center for your storefront, campaigns, and customer activity.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/deals'),
    title: 'Deals',
    subtitle: 'Create, tune, and monitor promotions from one place.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/menu'),
    title: 'Menu',
    subtitle: 'Keep your menu structured, current, and ready to publish.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/stores'),
    title: 'Stores',
    subtitle: 'Manage locations, visibility, and store-level performance.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/events'),
    title: 'Events',
    subtitle: 'Coordinate live experiences and attendance operations.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/services'),
    title: 'Services',
    subtitle: 'Organize bookable services with a calmer workflow.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/surprises'),
    title: 'Surprises',
    subtitle: 'Launch reveal-based offers with stronger visual control.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_CHECKIN_GAMES),
    title: 'Check-in Games',
    subtitle: 'Shape a polished post check-in reward experience.',
  },
  {
    match: (pathname) => pathname.startsWith('/merchant/loyalty'),
    title: 'Loyalty',
    subtitle: 'Review customer retention and refine your program.',
  },
  {
    match: (pathname) => pathname.startsWith(PATHS.MERCHANT_ANALYTICS),
    title: 'Analytics',
    subtitle: 'Track performance with a more focused operating view.',
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
}: {
  pathname: string;
  onNavigate?: () => void;
  merchantDisplayName: string;
  merchantTagline: string;
  merchantInitials: string;
}) {
  const activeSection = getActiveSection(pathname);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navSections.map((section) => [section.id, section.id === activeSection.id])),
  );

  useEffect(() => {
    setExpandedSections((current) => ({
      ...current,
      [activeSection.id]: true,
    }));
  }, [activeSection.id]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200/80 px-5 py-5">
        <Link to={PATHS.MERCHANT_DASHBOARD} onClick={onNavigate} className="inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#111111] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(17,17,17,0.18)]">
            {merchantInitials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[1.05rem] font-semibold tracking-tight text-neutral-950">{merchantDisplayName}</span>
            <span className="block truncate text-xs text-neutral-500">{merchantTagline}</span>
          </span>
        </Link>
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

export const MerchantLayout = ({ children }: { children?: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: merchantData } = useMerchantStatus();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
  const merchantStatus = merchantData?.data?.merchant?.status;
  const merchantCity = merchantData?.data?.merchant?.city?.trim();
  const merchantInitials = getInitials(merchantName);
  const profileName = user?.name?.trim() || 'Merchant';
  const merchantTagline =
    merchantCity && merchantStatus
      ? `${merchantCity} · ${merchantStatus.toLowerCase()}`
      : merchantCity
        ? merchantCity
        : merchantStatus
          ? `${merchantStatus.toLowerCase()} merchant workspace`
          : 'Refined control center';

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-neutral-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[320px] shrink-0 border-r border-neutral-200/70 bg-[#fbfbfc] lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <MerchantSidebar
              pathname={location.pathname}
              merchantDisplayName={merchantName}
              merchantTagline={merchantTagline}
              merchantInitials={merchantInitials}
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

                  <Link to={PATHS.MERCHANT_DASHBOARD} className="hidden items-center gap-3 lg:flex">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-neutral-950 text-sm font-semibold text-white">
                      {merchantInitials}
                    </span>
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

                  <Link
                    to={PATHS.MERCHANT_DEALS_CREATE}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-5 text-[13px] font-semibold text-white transition hover:bg-neutral-800"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-[13px] text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
                      >
                        <span className="hidden max-w-[120px] truncate font-medium sm:inline">{profileName}</span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9f99d] text-neutral-900">
                          <UserCircle2 className="h-4 w-4" />
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
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {activeSection.label}
                  </p>
                  <h1 className="truncate text-[1.55rem] font-semibold tracking-tight text-neutral-950 sm:text-[1.75rem]">
                    {pageMeta.title}
                  </h1>
                  <p className="mt-1 max-w-3xl text-[13px] text-neutral-500 sm:text-sm">{pageMeta.subtitle}</p>
                </div>

                <div className="hidden min-w-[220px] rounded-[1.15rem] border border-neutral-200/80 bg-white/90 px-4 py-3 shadow-sm lg:block">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Active section</div>
                  <div className="mt-1 text-[13px] font-semibold text-neutral-900">{activeSection.label}</div>
                  <div className="mt-1 text-[13px] text-neutral-500">{activeSection.items.length} integrated destinations ready.</div>
                </div>
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
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

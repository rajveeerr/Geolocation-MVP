import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Gift,
  Grid2x2,
  Menu,
  Plus,
  ScanSearch,
  Search,
  Sparkles,
  Store,
  Ticket,
  UserCircle2,
  UtensilsCrossed,
  WandSparkles,
  X,
} from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

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
        label: 'Menu',
        to: PATHS.MERCHANT_MENU,
        icon: UtensilsCrossed,
        match: (pathname) => pathname.startsWith('/merchant/menu'),
      },
      {
        label: 'Stores',
        to: PATHS.MERCHANT_STORES,
        icon: Store,
        match: (pathname) => pathname.startsWith('/merchant/stores'),
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
      {
        label: 'Surprises',
        to: PATHS.MERCHANT_SURPRISES,
        icon: WandSparkles,
        match: (pathname) => pathname.startsWith('/merchant/surprises'),
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
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      {
        label: 'Profile',
        to: PATHS.PROFILE,
        icon: UserCircle2,
        match: (pathname) => pathname.startsWith(PATHS.PROFILE),
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

function MerchantSidebar({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const activeSection = getActiveSection(pathname);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200/80 px-5 py-5">
        <Link to={PATHS.MERCHANT_DASHBOARD} onClick={onNavigate} className="inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#111111] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(17,17,17,0.18)]">
            Y
          </span>
          <span className="min-w-0">
            <span className="block text-[1.05rem] font-semibold tracking-tight text-neutral-950">Merchant Business</span>
            <span className="block text-xs text-neutral-500">Refined control center</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="rounded-[1.75rem] border border-neutral-200/80 bg-white/80 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="px-3 pb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Workspace</div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div>
                <div className="text-xl font-semibold tracking-tight text-neutral-950">{activeSection.label}</div>
                <div className="text-sm text-neutral-500">Tools for this part of your merchant workspace.</div>
              </div>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                {activeSection.items.length} items
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            {activeSection.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.match ? item.match(pathname) : pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-3 rounded-[1.15rem] px-3 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#f4f5f7] text-neutral-950 ring-1 ring-neutral-200/90'
                      : 'text-neutral-600 hover:bg-[#f7f7f8] hover:text-neutral-950',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-[0.95rem] transition-colors',
                      isActive
                        ? 'bg-neutral-950 text-white'
                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-950 group-hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-opacity',
                      isActive ? 'opacity-100 text-neutral-400' : 'opacity-0 group-hover:opacity-60',
                    )}
                  />
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200/80 px-4 py-4">
        <div className="rounded-[1.5rem] border border-neutral-200/80 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold text-neutral-950">Quick actions</p>
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

export const MerchantLayout = ({ children }: { children?: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-neutral-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[320px] shrink-0 border-r border-neutral-200/70 bg-[#fbfbfc] lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <MerchantSidebar pathname={location.pathname} />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-[#f5f5f7]/88 backdrop-blur-2xl">
            <div className="border-b border-neutral-200/70 px-4 py-3 sm:px-6 lg:px-8">
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
                    <span className="flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-neutral-950 text-sm font-semibold text-white">
                      Y
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-neutral-950">Merchant Business</span>
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
                          'rounded-[0.95rem] px-4 py-2 text-sm font-medium transition',
                          isActive
                            ? 'bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-200'
                            : 'text-neutral-500 hover:bg-white/70 hover:text-neutral-950',
                        )}
                      >
                        {section.label}
                      </button>
                    );
                  })}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500 shadow-sm md:flex">
                    <Search className="h-4 w-4" />
                    <span>Search workspace</span>
                  </div>

                  <Link
                    to={PATHS.MERCHANT_DEALS_CREATE}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create
                  </Link>

                  <Link
                    to={PATHS.PROFILE}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-700 shadow-sm"
                  >
                    <span className="hidden font-medium sm:inline">Merchant</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9f99d] text-neutral-900">
                      <UserCircle2 className="h-4 w-4" />
                    </span>
                    <ChevronDown className="hidden h-4 w-4 text-neutral-400 sm:block" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {activeSection.label}
                  </p>
                  <h1 className="truncate text-[1.9rem] font-semibold tracking-tight text-neutral-950 sm:text-[2.1rem]">
                    {pageMeta.title}
                  </h1>
                  <p className="mt-1 max-w-3xl text-sm text-neutral-500 sm:text-[15px]">{pageMeta.subtitle}</p>
                </div>

                <div className="hidden min-w-[220px] rounded-[1.25rem] border border-neutral-200/80 bg-white/90 px-4 py-3 shadow-sm lg:block">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Active section</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">{activeSection.label}</div>
                  <div className="mt-1 text-sm text-neutral-500">{activeSection.items.length} integrated destinations ready.</div>
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
              <MerchantSidebar pathname={location.pathname} onNavigate={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

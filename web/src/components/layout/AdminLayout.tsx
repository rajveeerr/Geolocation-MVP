// web/src/components/layout/AdminLayout.tsx
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  Menu,
  X,
  Building,
  BarChart3,
  TrendingUp,
  Award,
  Database,
  Bell,
  Users,
  ChevronDown,
  Search,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { useState } from 'react';

/* ─── Types ──────────────────────────────────────────────────────── */

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

type SidebarEntry = NavItem | NavGroup;

function isGroup(entry: SidebarEntry): entry is NavGroup {
  return 'items' in entry;
}

/* ─── Navigation Config ──────────────────────────────────────────── */

const SIDEBAR_NAV: SidebarEntry[] = [
  {
    to: '/admin',
    icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
    label: 'Overview',
    end: true
  },
  {
    to: '/admin/real-time',
    icon: <TrendingUp className="h-[18px] w-[18px]" />,
    label: 'Real-Time Analytics',
  },
  {
    label: 'User Management',
    icon: <Users className="h-[18px] w-[18px]" />,
    items: [
      { to: PATHS.ADMIN_CUSTOMERS, icon: <Users className="h-[15px] w-[15px]" />, label: 'All Users' },
      { to: PATHS.ADMIN_MERCHANTS, icon: <Building className="h-[15px] w-[15px]" />, label: 'Businesses' },
      { to: '/admin/crm', icon: <Database className="h-[15px] w-[15px]" />, label: 'Customer CRM' },
    ],
  },
  {
    label: 'Analytics & Reporting',
    icon: <BarChart3 className="h-[18px] w-[18px]" />,
    items: [
      { to: '/admin/analytics', icon: <TrendingUp className="h-[15px] w-[15px]" />, label: 'Performance' },
      { to: '/admin/city-analytics', icon: <Award className="h-[15px] w-[15px]" />, label: 'City Analytics' },
    ],
  },
  {
    label: 'Marketplace',
    icon: <Award className="h-[18px] w-[18px]" />,
    items: [
      { to: '/admin/master-data', icon: <Database className="h-[15px] w-[15px]" />, label: 'Master Data' },
      { to: PATHS.ADMIN_NUDGES, icon: <Bell className="h-[15px] w-[15px]" />, label: 'Nudges' },
    ],
  },
  {
    label: 'Revenue & Finance',
    icon: <span className="font-bold flex items-center justify-center w-[18px] h-[18px]">$</span>,
    items: [],
  },
  {
    label: 'Marketing & Growth',
    icon: <span className="font-bold flex items-center justify-center w-[18px] h-[18px] text-[15px]">{'>'}</span>,
    items: [],
  },
  {
    label: 'Community',
    icon: <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    items: [],
  },
  {
    label: 'Settings & Admin',
    icon: <Settings className="h-[18px] w-[18px]" />,
    items: [],
  },
  {
    to: '/admin/chat',
    icon: <MessageSquare className="h-[18px] w-[18px]" />,
    label: 'Chat',
  },
];

/* ─── Sidebar Link ───────────────────────────────────────────────── */

const SidebarLink = ({ to, icon, label, end, collapsed }: NavItem & { collapsed?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
        isActive
          ? 'bg-brand-primary-600 text-white shadow-sm'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
      )
    }
  >
    <span className="flex-shrink-0">{icon}</span>
    {!collapsed && <span className="truncate">{label}</span>}
  </NavLink>
);

/* ─── Expandable Group ───────────────────────────────────────────── */

const SidebarGroup = ({ group, collapsed }: { group: NavGroup; collapsed?: boolean }) => {
  const location = useLocation();
  const isChildActive = group.items.some((item) => location.pathname === item.to);
  const [open, setOpen] = useState(isChildActive);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
          isChildActive
            ? 'text-brand-primary-700 bg-brand-primary-50'
            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
        )}
      >
        <span className="flex-shrink-0">{group.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{group.label}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </>
        )}
      </button>
      {open && !collapsed && (
        <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-neutral-100 pl-3">
          {group.items.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Sidebar Content ────────────────────────────────────────────── */

const SidebarContent = ({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) => (
  <div className="flex h-full flex-col">
    {/* Logo */}
    <div className="flex h-16 items-center px-4">
      <Logo />
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" onClick={onNavigate}>
      {SIDEBAR_NAV.map((entry, i) =>
        isGroup(entry) ? (
          <SidebarGroup key={i} group={entry} collapsed={collapsed} />
        ) : (
          <SidebarLink key={entry.to} {...entry} collapsed={collapsed} />
        )
      )}
    </nav>

    {/* Bottom links */}
    <div className="border-t border-neutral-100 px-3 py-3 space-y-1">
      <SidebarLink
        to="/admin"
        icon={<Settings className="h-[18px] w-[18px]" />}
        label="Settings"
        end
        collapsed={collapsed}
      />
    </div>
  </div>
);

/* ─── Top Header Bar ─────────────────────────────────────────────── */

const TopHeader = ({ onMenuToggle }: { onMenuToggle: () => void }) => (
  <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200/60 bg-white/80 px-4 backdrop-blur-xl sm:px-8">
    {/* Left: mobile toggle + search */}
    <div className="flex items-center gap-3">
      <button
        onClick={onMenuToggle}
        className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 sm:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden sm:flex items-center gap-2 rounded-xl bg-neutral-100/80 px-4 py-2 text-sm text-neutral-400 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary-200 focus-within:shadow-sm">
        <Search className="h-4 w-4" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-48 bg-transparent text-neutral-700 placeholder:text-neutral-400 outline-none lg:w-72"
        />
      </div>
    </div>

    {/* Right: actions */}
    <div className="flex items-center gap-2">
      <button className="relative rounded-xl p-2.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-primary-500 ring-2 ring-white" />
      </button>
      <button className="rounded-xl p-2.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
        <MessageSquare className="h-[18px] w-[18px]" />
      </button>

      <div className="ml-2 flex items-center gap-3 rounded-xl border border-neutral-200/60 px-3 py-1.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-100 text-sm font-bold text-brand-primary-700">
          A
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-neutral-800 leading-tight">Admin</p>
          <p className="text-[11px] text-neutral-400 leading-tight">Super Admin</p>
        </div>
      </div>
    </div>
  </header>
);

/* ─── Main Layout ────────────────────────────────────────────────── */

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50/50">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-[260px] flex-shrink-0 flex-col border-r border-neutral-200/60 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="relative w-[280px] flex-shrink-0 bg-white shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

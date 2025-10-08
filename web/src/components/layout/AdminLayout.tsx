// web/src/components/layout/AdminLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Shield, Users, Menu, X, Building, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { useState } from 'react';

const AdminSidebarLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition-colors",
            isActive ? "bg-brand-primary-100 text-brand-primary-700" : "text-neutral-600 hover:bg-neutral-100"
        )}
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

export const AdminLayout = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-neutral-50">
            {/* Desktop sidebar */}
            <aside className="hidden sm:block w-64 flex-shrink-0 border-r bg-white p-4">
                <div className="mb-8">
                    <Logo />
                </div>
                <nav className="space-y-2">
                    <AdminSidebarLink to={PATHS.ADMIN_CITIES} icon={<Building className="h-5 w-5" />} label="Cities" />
                    <AdminSidebarLink to={PATHS.ADMIN_DASHBOARD} icon={<Shield className="h-5 w-5" />} label="Overview" />
                    <AdminSidebarLink to={PATHS.ADMIN_MERCHANTS} icon={<Users className="h-5 w-5" />} label="Merchants" />
                    <AdminSidebarLink to="/admin/city-analytics" icon={<BarChart3 className="h-5 w-5" />} label="City Analytics" />
                    <AdminSidebarLink to={PATHS.ADMIN_CUSTOMERS} icon={<Users className="h-5 w-5" />} label="Customers" />
                </nav>
            </aside>

            {/* Mobile header with toggle */}
            <div className="sm:hidden fixed top-4 left-4 z-50">
                <button
                    aria-label="Open sidebar"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center justify-center rounded-md bg-white p-2 shadow-md"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile slide-over sidebar */}
            {open && (
                <div className="fixed inset-0 z-40 flex">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden />
                    <aside className="relative w-64 flex-shrink-0 border-r bg-white p-4">
                        <div className="mb-8 flex items-center justify-between">
                            <Logo />
                            <button aria-label="Close sidebar" onClick={() => setOpen(false)} className="inline-flex items-center justify-center rounded-md p-2">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="space-y-2">
                            <AdminSidebarLink to={PATHS.ADMIN_DASHBOARD} icon={<Shield className="h-5 w-5" />} label="Overview" />
                            <AdminSidebarLink to={PATHS.ADMIN_CITIES} icon={<Building className="h-5 w-5" />} label="Cities" />
                            <AdminSidebarLink to={PATHS.ADMIN_MERCHANTS} icon={<Users className="h-5 w-5" />} label="Merchants" />
                            <AdminSidebarLink to="/admin/city-analytics" icon={<BarChart3 className="h-5 w-5" />} label="City Analytics" />
                            <AdminSidebarLink to={PATHS.ADMIN_CUSTOMERS} icon={<Users className="h-5 w-5" />} label="Customers" />
                        </nav>
                    </aside>
                </div>
            )}

            <main className="flex-1 p-8 sm:ml-0">
                <Outlet />
            </main>
        </div>
    );
};

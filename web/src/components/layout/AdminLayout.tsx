// web/src/components/layout/AdminLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';

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
    return (
        <div className="flex min-h-screen bg-neutral-50">
            <aside className="w-64 flex-shrink-0 border-r bg-white p-4">
                <div className="mb-8">
                    <Logo />
                </div>
                <nav className="space-y-2">
                    <AdminSidebarLink to={PATHS.ADMIN_DASHBOARD} icon={<Shield className="h-5 w-5" />} label="Dashboard" />
                    <AdminSidebarLink to={PATHS.ADMIN_MERCHANTS} icon={<Users className="h-5 w-5" />} label="Merchants" />
                </nav>
            </aside>
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
};

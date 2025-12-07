// src/components/layout/ProfileDropDown.tsx
import { Link } from 'react-router-dom';
import { LogOut, User, Settings, LayoutDashboard, Shield, Briefcase, Gift } from 'lucide-react'; // <-- Import Shield icon
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus'; // <-- 1. Import the admin hook
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils'; // Import cn utility

export const ProfileDropDown = ({ isMerchant }: { isMerchant: boolean }) => {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminStatus(); // <-- 2. Use the hook to get the admin status

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : (user?.email?.[0].toUpperCase() ?? 'U');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary-main focus:ring-offset-2">
            {/* --- NEW: Add a special ring for admins for extra visual distinction --- */}
            <Avatar className={cn({
                'ring-2 ring-offset-2': isMerchant || isAdmin,
                'ring-destructive': isAdmin, // Admin ring is red (destructive color)
                'ring-brand-primary-500': isMerchant && !isAdmin, // Merchant ring is primary color
            })}>
              <AvatarImage
                src={(user as any)?.avatarUrl || "https://github.com/shadcn.png"}
                alt={user?.name || ''}
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          {isAdmin && <DropdownMenuLabel className="!py-0 !px-2 text-xs font-normal text-destructive">Admin Role</DropdownMenuLabel>}
          {isMerchant && !isAdmin && <DropdownMenuLabel className="!py-0 !px-2 text-xs font-normal text-brand-primary-600">Merchant Profile</DropdownMenuLabel>}
          <DropdownMenuSeparator />

          {/* --- 3. Conditionally render the Admin Dashboard link --- */}
          {isAdmin && (
            <>
              <DropdownMenuItem asChild>
                <Link to={PATHS.ADMIN_DASHBOARD}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {isMerchant && !isAdmin && (
            <>
              <DropdownMenuItem asChild>
                <Link to={PATHS.MERCHANT_DASHBOARD}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Merchant Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Yohop for Business CTA - shows Dashboard for merchants, Onboarding for others */}
          {!isAdmin && !isMerchant && (
            <>
              <DropdownMenuItem asChild>
                <Link to={PATHS.MERCHANT_ONBOARDING}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  <span>Yohop for Business</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

        <DropdownMenuItem asChild>
          <Link to={PATHS.PROFILE}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
          {!isMerchant && (
            <DropdownMenuItem asChild>
              <Link to={PATHS.LOYALTY_HISTORY}>
                <Gift className="mr-2 h-4 w-4" />
                <span>Loyalty Wallet</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to={PATHS.SETTINGS}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

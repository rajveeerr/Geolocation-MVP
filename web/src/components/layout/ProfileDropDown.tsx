// src/components/layout/ProfileDropDown.tsx
import { Link } from 'react-router-dom';
import { LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
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
import { PATHS } from '@/routing/paths';
import { useMerchantStatus } from '@/hooks/useMerchantStatus'; // <-- THE FIX

export const ProfileDropDown = () => {
  const { user, logout } = useAuth();
  const { data: merchantStatus } = useMerchantStatus(); // <-- THE FIX
  const isApprovedMerchant =
    merchantStatus?.data?.merchant?.status === 'APPROVED';

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : (user?.email?.[0].toUpperCase() ?? 'U');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary-main focus:ring-offset-2">
          <Avatar>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt={user?.name || ''}
            />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* --- THE FIX: Conditional Merchant Link --- */}
        {isApprovedMerchant && (
          <>
            <DropdownMenuItem asChild>
              <Link to={PATHS.MERCHANT_DASHBOARD}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Switch to Merchant View</span>
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
        <DropdownMenuItem asChild>
          <Link to={PATHS.SETTINGS}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// src/components/layout/MerchantLayout.tsx
import { Link, Outlet } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { PATHS } from '@/routing/paths';

export const MerchantLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="container mx-auto max-w-screen-xl px-6 h-20 flex items-center justify-between">
          <Logo />
          <Link to={PATHS.HOME}>
            <Button variant="secondary" size="md" className="rounded-full">
              Exit
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-grow flex flex-col">
        <Outlet /> {/* This is where our nested merchant pages will render */}
      </main>
    </div>
  );
};
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-border/40 bg-neutral-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-brand-primary-main" />
          <span className="text-xl font-bold text-neutral-text-primary">
            CitySpark
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/for-business"
            className="text-label text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
          >
            For Businesses
          </Link>
          <Link
            to="/login"
            className="text-label text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
          >
            Login
          </Link>
          <Button>Get the App</Button>
        </nav>
        {/* Mobile menu button could go here */}
      </div>
    </header>
  );
};
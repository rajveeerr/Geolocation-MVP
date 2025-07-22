import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-neutral-border bg-neutral-surface py-12">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-neutral-text-secondary" />
          <span className="text-sm text-neutral-text-secondary">
            © {new Date().getFullYear()} CitySpark. All rights reserved.
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
          <Link to="/about" className="text-sm hover:underline">
            About
          </Link>
          <Link to="/for-business" className="text-sm hover:underline">
            For Businesses
          </Link>
          <Link to="/privacy" className="text-sm hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="text-sm hover:underline">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
};
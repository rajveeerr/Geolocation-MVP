import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { ArrowRight } from 'lucide-react';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/70 backdrop-blur-lg border-b border-neutral-border-light' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-primary-main rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">p</span>
            </div>
            <span className="text-xl font-semibold text-neutral-text-primary">
              promptwatch
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <div className="flex items-center gap-1 text-neutral-text-secondary hover:text-neutral-text-primary cursor-pointer">
            <span className="text-sm font-medium">Resources</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <Link
            to="/agencies"
            className="text-sm font-medium text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
          >
            Agencies
          </Link>
          <Link
            to="/book-demo"
            className="text-sm font-medium text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
          >
            Book a demo
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="google" size="md">
            Join with Google
          </Button>
          <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
            Start 7-day trial
          </Button>
        </div>

        {/* Mobile CTA (condensed) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="primary" size="sm">
            Try Free
          </Button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-neutral-text-secondary hover:text-neutral-text-primary"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-border-light bg-white/95 backdrop-blur-md">
          <nav className="container mx-auto max-w-6xl px-4 py-4 space-y-3">
            <div className="flex items-center gap-1 text-neutral-text-secondary hover:text-neutral-text-primary cursor-pointer py-2">
              <span className="text-sm font-medium">Resources</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Link
              to="/agencies"
              className="block text-sm font-medium text-neutral-text-secondary hover:text-neutral-text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Agencies
            </Link>
            <Link
              to="/book-demo"
              className="block text-sm font-medium text-neutral-text-secondary hover:text-neutral-text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book a demo
            </Link>
            <Link
              to="/pricing"
              className="block text-sm font-medium text-neutral-text-secondary hover:text-neutral-text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            
            <div className="pt-4 border-t border-neutral-border-light space-y-3">
              <Button variant="google" size="md" className="w-full">
                Join with Google
              </Button>
              <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" className="w-full">
                Start 7-day trial
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
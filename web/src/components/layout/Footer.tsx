import { Link } from 'react-router-dom';
import { Linkedin } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { Logo } from '../common/Logo';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-neutral-border bg-white py-8">
      <div className="container mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-text-secondary">
              Discover live deals and exclusive experiences from top-rated local
              businesses. Your real-time map to the city's best moments.
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-800">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Launching v1 soon
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-medium text-neutral-text-primary">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={PATHS.MAP}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  Live Map
                </Link>
              </li>
              <li>
                <Link
                  to={PATHS.HOT_DEALS}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  Hot Deals
                </Link>
              </li>
              <li>
                <Link
                  to={PATHS.PRICING}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="mb-4 font-medium text-neutral-text-primary">
              Business
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={PATHS.FOR_BUSINESSES}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  For Businesses
                </Link>
              </li>
              <li>
                <Link
                  to={PATHS.BUSINESS_SIGNUP}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  Claim Your Business
                </Link>
              </li>
              <li>
                <Link
                  to={PATHS.BUSINESS_DASHBOARD}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  Business Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-medium text-neutral-text-primary">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={PATHS.ABOUT}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to={PATHS.CONTACT}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to={PATHS.SUPPORT}
                  className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-neutral-border pt-8 sm:flex-row">
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-0">
            <span className="text-center text-sm text-neutral-text-secondary sm:text-left">
              © {new Date().getFullYear()} CitySpark All rights reserved
            </span>
            <span className="hidden text-neutral-border sm:inline">·</span>
            <Link
              to={PATHS.PRIVACY}
              className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
            >
              Privacy Policy
            </Link>
            <span className="hidden text-neutral-border sm:inline">·</span>
            <Link
              to={PATHS.TERMS}
              className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
            >
              Terms of Service
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

export const Logo = () => {
  return (
    <Link to={PATHS.HOME} className="group flex items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* subtle glow using brand primary on hover */}
          <div className="absolute inset-0 h-8 w-8 rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-60"></div>

          <div className="relative flex aspect-square h-8 w-8 items-center justify-center rounded-md bg-brand-primary-600 shadow-lg transition-all duration-300 group-hover:bg-brand-primary-700 group-hover:shadow-xl">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              <path
                d="M3 8L8 3L13 8L8 13L3 8Z"
                fill="white"
                className="drop-shadow-sm"
              />
              <circle cx="14" cy="4" r="2" fill="white" />
            </svg>
          </div>
        </div>
        <span className="text-neutral-text-primary text-xl font-semibold tracking-tight transition-colors duration-300">
          CitySpark
        </span>
      </div>
    </Link>
  );
};

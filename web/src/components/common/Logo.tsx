import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

export const Logo = () => {
  return (
    <Link to={PATHS.HOME} className="group flex items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 via-cyan-500 to-purple-600 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-60"></div>

          {/* Main logo container */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
            {/* Animated border ring */}
            <div className="absolute inset-0 animate-pulse rounded-lg border-2 border-transparent bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

            {/* Logo icon with enhanced effects */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 group-hover:animate-pulse"
            >
              <defs>
                <linearGradient
                  id="logoGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
              </defs>
              <path
                d="M3 8L8 3L13 8L8 13L3 8Z"
                fill="url(#logoGradient)"
                stroke="white"
                strokeWidth="1"
                className="drop-shadow-sm"
              />
              <circle
                cx="14"
                cy="4"
                r="2"
                fill="white"
                className="duration-2000 animate-ping"
              />
            </svg>

            {/* Sparkle effect */}
            <div className="absolute right-1 top-1 h-1 w-1 animate-ping rounded-full bg-white opacity-0 group-hover:opacity-100"></div>
          </div>
        </div>
        <span className="text-xl font-semibold tracking-tight text-neutral-text-primary transition-colors duration-300 group-hover:text-blue-600">
          CitySpark
        </span>
      </div>
    </Link>
  );
};

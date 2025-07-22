import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

export const Logo = () => {
    return (
        <Link to={PATHS.HOME} className="flex items-center gap-2 group">
            <div className="flex items-center gap-3">
                <div className="relative">
                    {/* Animated background glow */}
                    <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-blue-400 via-cyan-500 to-purple-600 rounded-lg blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                    
                    {/* Main logo container */}
                    <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        {/* Animated border ring */}
                        <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                        
                        {/* Logo icon with enhanced effects */}
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 group-hover:animate-pulse">
                            <defs>
                                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff" />
                                    <stop offset="100%" stopColor="#e0f2fe" />
                                </linearGradient>
                            </defs>
                            <path d="M3 8L8 3L13 8L8 13L3 8Z" fill="url(#logoGradient)" stroke="white" strokeWidth="1" className="drop-shadow-sm" />
                            <circle cx="14" cy="4" r="2" fill="white" className="animate-ping duration-2000" />
                        </svg>
                        
                        {/* Sparkle effect */}
                        <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                    </div>
                </div>
                <span className="text-xl font-semibold text-neutral-text-primary tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                    CitySpark
                </span>
            </div>
        </Link>
    );
};

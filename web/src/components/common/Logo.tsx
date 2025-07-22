import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

export const Logo = () => {
    return (
        <Link to={PATHS.HOME} className="flex items-center gap-2">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 8L8 3L13 8L8 13L3 8Z" fill="white" stroke="white" strokeWidth="1" />
                            <circle cx="14" cy="4" r="2" fill="white" />
                        </svg>
                    </div>
                </div>
                <span className="text-xl font-semibold text-neutral-text-primary tracking-tight">
                    CitySpark
                </span>
            </div>
        </Link>
    );
};

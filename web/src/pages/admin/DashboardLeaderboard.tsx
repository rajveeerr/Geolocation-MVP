// web/src/pages/admin/DashboardLeaderboard.tsx
import { Link } from 'react-router-dom';

interface LeaderboardItem {
  name: string;
  value: string;
}

export const DashboardLeaderboard = ({
  title,
  data,
  isLoading,
  ctaLink,
}: {
  title: string;
  data?: LeaderboardItem[];
  isLoading: boolean;
  ctaLink: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="font-semibold text-neutral-800">{title}</h3>
      <div className="mt-4 space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-neutral-200 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
          </div>
        ))}
        {data?.map((item, index) => (
          <div key={item.name} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-brand-primary-100 text-brand-primary-600 text-xs font-bold rounded-full">
                {index + 1}
              </span>
              <p className="font-medium text-neutral-700">{item.name}</p>
            </div>
            <p className="font-semibold text-neutral-900">{item.value}</p>
          </div>
        ))}
      </div>
      <Link to={ctaLink} className="text-sm font-semibold text-brand-primary-600 mt-6 block hover:underline">
        View All
      </Link>
    </div>
  );
};
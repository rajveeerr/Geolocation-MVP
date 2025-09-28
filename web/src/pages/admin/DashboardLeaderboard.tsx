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
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 bg-neutral-100 rounded-md animate-pulse" />)}
        {data?.map((item) => (
          <div key={item.name} className="flex justify-between items-center text-sm">
            <p className="font-medium text-neutral-700">{item.name}</p>
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
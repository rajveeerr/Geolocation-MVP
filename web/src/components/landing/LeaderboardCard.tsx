import { Medal } from 'lucide-react';

export const LeaderboardCard = () => (
  <div className="flex h-full flex-col p-6">
    <div className="flex items-center gap-2">
      <Medal className="h-6 w-6 text-accent-secondary" />
      <h3 className="font-semibold text-neutral-text-primary">City Leaderboard</h3>
    </div>
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-text-secondary">1. @janedoe</span>
        <span className="font-bold text-accent-secondary">12,450 pts</span>
      </div>
      <div className="flex items-center justify-between text-sm bg-brand-primary-light p-2 rounded-md">
        <span className="font-semibold text-brand-primary-main">2. You</span>
        <span className="font-bold text-brand-primary-main">9,800 pts</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-text-secondary">3. @citysaver</span>
        <span className="font-bold text-neutral-text-primary">8,100 pts</span>
      </div>
    </div>
  </div>
);
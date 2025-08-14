import { Medal } from 'lucide-react';

export const LeaderboardCard = () => (
  <div className="flex h-full flex-col p-6">
    <div className="flex items-center gap-2">
      <Medal className="text-accent-secondary h-6 w-6" />
      <h3 className="text-neutral-text-primary font-semibold">
        City Leaderboard
      </h3>
    </div>
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-text-secondary font-medium">
          1. @janedoe
        </span>
        <span className="text-accent-secondary font-bold">12,450 pts</span>
      </div>
      <div className="flex items-center justify-between rounded-md bg-brand-primary-light p-2 text-sm">
        <span className="font-semibold text-brand-primary-main">2. You</span>
        <span className="font-bold text-brand-primary-main">9,800 pts</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-text-secondary font-medium">
          3. @citysaver
        </span>
        <span className="text-neutral-text-primary font-bold">8,100 pts</span>
      </div>
    </div>
  </div>
);

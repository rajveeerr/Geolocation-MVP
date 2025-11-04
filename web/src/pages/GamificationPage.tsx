import React from 'react';
import { Trophy } from 'lucide-react';
import GamificationDashboard from '../components/gamification/GamificationDashboard';

export const GamificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pt-24">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary-100">
              <Trophy className="h-5 w-5 text-brand-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Gamification Center
            </h1>
          </div>
          <p className="ml-[52px] text-neutral-600">
            Earn coins, unlock achievements, and climb the loyalty tiers
          </p>
        </div>
        
        <GamificationDashboard />
      </div>
    </div>
  );
};
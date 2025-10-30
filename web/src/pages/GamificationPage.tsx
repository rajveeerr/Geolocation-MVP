import React from 'react';
import GamificationDashboard from '../components/gamification/GamificationDashboard';

export const GamificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎮 Gamification Center
          </h1>
          <p className="text-gray-600">
            Earn coins, unlock achievements, and climb the loyalty tiers!
          </p>
        </div>
        
        <GamificationDashboard />
      </div>
    </div>
  );
};
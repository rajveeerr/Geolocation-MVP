import React from 'react';
import { Coins } from 'lucide-react';
import { useGamificationProfile } from '../../hooks/useGamification';

const CoinDisplay: React.FC = () => {
  const { data: profile, isLoading, refetch } = useGamificationProfile();

  // Refetch profile data when component mounts to ensure fresh data
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Coins className="h-4 w-4" />
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 text-yellow-600">
      <Coins className="h-4 w-4" />
      <span className="font-semibold">{profile.coins.toLocaleString()}</span>
    </div>
  );
};

export default CoinDisplay;
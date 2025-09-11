import { useReferrals } from '@/hooks/useReferrals';
import { ReferralCard } from '@/components/common/ReferralCard';
import { ReferralCardSkeleton } from '@/components/common/ReferralCardSkeleton';

export const ReferralPage = () => {
  const { data: referralData, isLoading, error } = useReferrals();

  if (isLoading) {
    return (
      <div className="bg-neutral-50 min-h-screen pt-24">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-neutral-900">Invite Friends, Earn Rewards</h1>
            <p className="mt-2 text-neutral-600 max-w-md mx-auto">
              Share your unique code with friends. When they sign up, you'll earn bonus points and climb the leaderboard faster!
            </p>
          </div>
          <ReferralCardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !referralData) {
    return <div className="text-center py-20 text-status-expired">Could not load your referral information.</div>;
  }

  return (
    <div className="bg-neutral-50 min-h-screen pt-24">
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-neutral-900">Invite Friends, Earn Rewards</h1>
                <p className="mt-2 text-neutral-600 max-w-md mx-auto">
                    Share your unique code with friends. When they sign up, you'll earn bonus points and climb the leaderboard faster!
                </p>
            </div>
            
            {/* The new card component will handle all the display logic */}
            <ReferralCard code={referralData.referralCode} count={referralData.referralCount} />
        </div>
    </div>
  );
};

import { useReferrals } from '@/hooks/useReferrals';
import { ReferralCard } from '@/components/common/ReferralCard';
import { ReferralCardSkeleton } from '@/components/common/ReferralCardSkeleton';

export const ReferralPage = () => {
  const { data: referralData, isLoading, error } = useReferrals();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-neutral-900">
              Invite Friends, Earn Rewards
            </h1>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">
              Share your unique code with friends. When they sign up, you'll
              earn bonus points and climb the leaderboard faster!
            </p>
          </div>
          <ReferralCardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !referralData) {
    return (
      <div className="text-status-expired py-20 text-center">
        Could not load your referral information.
      </div>
    );
  }

  return (
    <>
      <title>Invite Friends, Earn Rewards | CitySpark</title>
      <meta name="description" content="Share your referral code and earn points when friends join CitySpark." />
    <div className="min-h-screen bg-neutral-50 pt-24">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-neutral-900">
            Invite Friends, Earn Rewards
          </h1>
          <p className="mx-auto mt-2 max-w-md text-neutral-600">
            Share your unique code with friends. When they sign up, you'll earn
            bonus points and climb the leaderboard faster!
          </p>
        </div>

        {/* The new card component will handle all the display logic */}
        <ReferralCard
          code={referralData.referralCode}
          count={referralData.referralCount}
        />
      </div>
    </div>
    </>
  );
};

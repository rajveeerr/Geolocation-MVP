import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { cn } from '@/lib/utils';
import {
  Heart,
  Tag,
  Loader2,
  Settings,
  Star,
  Gift,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useMerchantDeals } from '@/hooks/useMerchantDeals';
import { DealResultCard } from '@/components/deals/DealResultCard';
import { MerchantDealCard } from '@/components/merchant/MerchantDealCard';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { useUpdateAvatar } from '@/hooks/useUpdateProfile';
import { StreakCard } from '@/components/gamification/streak/StreakCard';
import { useStreak } from '@/hooks/useStreak';
import { StreakDiscountBreakdown } from '@/components/gamification/streak/StreakDiscountBreakdown';
import { LoyaltyWallet } from '@/components/gamification/loyalty/LoyaltyWallet';
import { ActiveItemsBadge } from '@/components/heist/ActiveItemsBadge';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'created'>('saved');
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

  const { data: merchantStatusData } = useMerchantStatus();
  const isMerchant = !!merchantStatusData?.data?.merchant;
  const updateAvatar = useUpdateAvatar();

  const { savedDeals, isLoading: isLoadingSaved } = useSavedDeals();
  const { data: merchantDeals = [], isLoading: isLoadingCreated } =
    useMerchantDeals();

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    updateAvatar.mutate(newAvatarUrl);
  };

  const avatarUrl: string | undefined = ((user as any)?.avatarUrl ??
    undefined) as string | undefined;
  const firstName = user?.name?.split(' ')[0] || 'Yohop';

  const TabButton = ({
    tabName,
    label,
  }: {
    tabName: 'saved' | 'created';
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={cn(
        'border-b-2 px-4 py-3 text-sm font-medium tracking-[-0.02em] text-neutral-500 transition-colors',
        activeTab === tabName
          ? 'border-neutral-900 text-neutral-950'
          : 'border-transparent hover:border-neutral-300 hover:text-neutral-800',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(244,244,245,0.92)_42%,_rgba(235,235,240,0.88)_100%)] pt-24">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(240,244,255,0.54),rgba(255,255,255,0))]" />
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
            <ProfilePictureUpload
              currentAvatarUrl={avatarUrl}
              userName={user?.name ?? undefined}
              userEmail={user?.email ?? undefined}
              onAvatarUpdate={handleAvatarUpdate}
              size="lg"
              showUploadButton={true}
            />

            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
                <Sparkles className="h-3.5 w-3.5" />
                Profile
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
                {user?.name || 'Yohop User'}
              </h1>
              <p className="mt-2 text-base text-neutral-500">{user?.email}</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-500">
                {firstName}, this is your quiet control center for saved deals,
                loyalty rewards, and weekly momentum.
              </p>

              {user?.points !== undefined && (
                <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-black/5 bg-black/[0.03] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fff7d6,#ffe49a)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <Star className="h-4 w-4 fill-current text-amber-500" />
                  </div>
                  <span className="text-lg font-semibold tracking-[-0.03em] text-neutral-900">
                    {user.points.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-500">Points</span>
                </div>
              )}

              {!isMerchant && (
                <div className="mt-4">
                  <ActiveItemsBadge variant="detailed" />
                </div>
              )}
            </div>

            <div className="sm:ml-auto sm:self-start">
              <Button
                variant="secondary"
                size="md"
                className="h-11 border-black/10 bg-white/80 px-5 text-neutral-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur"
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {(() => {
            const { streak, isLoading } = useStreak();
            return (
              <>
                <StreakCard streak={streak ?? undefined} loading={isLoading} />
                <StreakDiscountBreakdown />
                {!isMerchant && <LoyaltyWallet />}
              </>
            );
          })()}
        </div>

        <div className="mt-12">
          <div className="mb-6 border-b border-black/10">
            <TabButton tabName="saved" label="Saved Deals" />
            {isMerchant && (
              <TabButton tabName="created" label="My Created Deals" />
            )}
          </div>

          {activeTab === 'saved' && (
            <div className="animate-fade-in">
              {isLoadingSaved ? (
                <LoadingState />
              ) : savedDeals.length === 0 ? (
                <EmptyState
                  icon={<Heart />}
                  title="No Deals Saved Yet"
                  message="Tap the heart on any deal to save it for later."
                  cta={{ text: 'Find Deals to Save', path: PATHS.ALL_DEALS }}
                />
              ) : (
                <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                  {savedDeals.map((deal: any) => (
                    <DealResultCard
                      key={deal.id}
                      deal={deal}
                      isHovered={hoveredDealId === deal.id}
                      onMouseEnter={() => setHoveredDealId(deal.id)}
                      onMouseLeave={() => setHoveredDealId(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'created' && isMerchant && (
            <div className="animate-fade-in">
              {isLoadingCreated ? (
                <LoadingState />
              ) : merchantDeals.length === 0 ? (
                <EmptyState
                  icon={<Tag />}
                  title="You haven't created any deals"
                  message="Go to your Merchant Dashboard to create a new deal."
                  cta={{
                    text: 'Create a Deal',
                    path: PATHS.MERCHANT_DEALS_CREATE,
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {merchantDeals.map((deal: any) => (
                    <MerchantDealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Link to={PATHS.REFERRALS} className="group mt-8 block">
          <div className="flex transform items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f8f8fa,#ebedf3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <Gift className="h-6 w-6 text-neutral-800" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-neutral-900">
                  Invite Friends
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Earn points for every friend who joins!
                </p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-neutral-400 transition-colors group-hover:text-neutral-700" />
          </div>
        </Link>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
  </div>
);

const EmptyState = ({
  icon,
  title,
  message,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  cta?: { text: string; path: string };
}) => (
  <div className="rounded-[1.75rem] border border-dashed border-black/10 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
    <div className="mx-auto h-12 w-12 text-neutral-400">{icon}</div>
    <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-neutral-900">
      {title}
    </h3>
    <p className="mx-auto mt-2 max-w-md text-neutral-500">{message}</p>
    {cta && (
      <Link to={cta.path} className="mt-6 inline-block">
        <Button variant="primary">{cta.text}</Button>
      </Link>
    )}
  </div>
);

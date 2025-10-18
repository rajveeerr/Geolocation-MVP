import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useMerchantDeals } from '@/hooks/useMerchantDeals';
// --- MODIFICATION: Import the list-style card ---
import { DealResultCard } from '@/components/deals/DealResultCard';
import { MerchantDealCard } from '@/components/merchant/MerchantDealCard';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { useUpdateAvatar } from '@/hooks/useUpdateProfile';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'created'>('saved');
  // State to handle hover effects for the list items
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

  const { data: merchantStatusData } = useMerchantStatus();
  const isMerchant = !!merchantStatusData?.data?.merchant;
  const updateAvatar = useUpdateAvatar();

  // These hooks now correctly talk to your new backend endpoints
  const { savedDeals, isLoading: isLoadingSaved } = useSavedDeals();
  const { data: merchantDeals = [], isLoading: isLoadingCreated } =
    useMerchantDeals();
  // merchantDeals is now MerchantDeal[]

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : (user?.email[0].toUpperCase() ?? 'U');

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    updateAvatar.mutate(newAvatarUrl);
  };

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
        'border-b-2 px-4 py-2 font-semibold text-neutral-600 transition-colors',
        activeTab === tabName
          ? 'border-brand-primary-500 text-brand-primary-600'
          : 'border-transparent hover:border-neutral-300',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pt-24">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* --- User Header --- */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ProfilePictureUpload
              currentAvatarUrl={(user as any)?.avatarUrl}
              userName={user?.name}
              userEmail={user?.email}
              onAvatarUpdate={handleAvatarUpdate}
              size="lg"
              showUploadButton={true}
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-neutral-900">
                {user?.name || 'Yohop User'}
              </h1>
              <p className="mt-1 text-neutral-600">{user?.email}</p>

              {/* --- NEW: Points Display --- */}
              {user?.points !== undefined && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-4 py-2">
                  <Star className="h-5 w-5 fill-current text-amber-500" />
                  <span className="text-lg font-bold text-amber-700">
                    {user.points.toLocaleString()}
                  </span>
                  <span className="text-sm text-amber-600">Points</span>
                </div>
              )}
            </div>
            <div className="sm:ml-auto">
              <Button variant="secondary" size="md">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-6 border-b border-neutral-200">
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
                // --- MODIFICATION: Changed from a grid to a vertical list ---
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
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

        {/* --- Referral Link (No Changes) --- */}
        <Link to={PATHS.REFERRALS} className="group mt-8 block">
          <div className="flex transform items-center justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-primary-300 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-100/80">
                <Gift className="h-6 w-6 text-brand-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-800">
                  Invite Friends
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Earn points for every friend who joins!
                </p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-neutral-400 transition-colors group-hover:text-brand-primary-500" />
          </div>
        </Link>
      </div>
    </div>
  );
};

// --- Reusable Helper Components for a clean UI (No Changes) ---
const LoadingState = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-brand-primary-500" />
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
  <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-8 text-center">
    <div className="mx-auto h-12 w-12 text-neutral-400">{icon}</div>
    <h3 className="mt-4 text-lg font-semibold text-neutral-800">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-neutral-500">{message}</p>
    {cta && (
      <Link to={cta.path} className="mt-6 inline-block">
        <Button variant="primary">{cta.text}</Button>
      </Link>
    )}
  </div>
);

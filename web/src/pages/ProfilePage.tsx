import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { cn } from '@/lib/utils';
import { Heart, Tag, Loader2, Settings, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useMerchantDeals } from '@/hooks/useMerchantDeals';
import { PremiumV2DealCard } from '@/components/deals/PremiumV2DealCard';
import { MerchantDealCard } from '@/components/merchant/MerchantDealCard';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';

export const ProfilePage = () => {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState<'saved' | 'created'>('saved');
  
		const { data: merchantStatusData } = useMerchantStatus();
	const isMerchant = !!merchantStatusData?.data?.merchant;
  
	// These hooks now correctly talk to your new backend endpoints
	const { savedDeals, isLoading: isLoadingSaved } = useSavedDeals();
		const { data: merchantDeals = [], isLoading: isLoadingCreated } = useMerchantDeals();
		// merchantDeals is now MerchantDeal[]

	const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : user?.email[0].toUpperCase() ?? 'U';

	const TabButton = ({ tabName, label }: { tabName: 'saved' | 'created'; label: string }) => (
		<button onClick={() => setActiveTab(tabName)} className={cn("px-4 py-2 font-semibold text-neutral-600 border-b-2 transition-colors", activeTab === tabName ? "border-brand-primary-500 text-brand-primary-600" : "border-transparent hover:border-neutral-300")}>{label}</button>
	);

	return (
		<div className="bg-neutral-50 min-h-screen pt-24">
			<div className="container mx-auto max-w-4xl px-4 py-8">
        
						{/* --- User Header --- */}
				<div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
							<Avatar className="h-24 w-24 border-4 border-white shadow-md">
								{/* Use the same placeholder avatar source as the navbar to keep visuals consistent */}
								<AvatarImage src="https://github.com/shadcn.png" alt={user?.name || user?.email} />
								<AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
							</Avatar>
					<div className="text-center sm:text-left">
						<h1 className="text-3xl font-bold text-neutral-900">{user?.name || 'CitySpark User'}</h1>
						<p className="text-neutral-600 mt-1">{user?.email}</p>

						{/* --- NEW: Points Display --- */}
						{user?.points !== undefined && (
							<div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 border border-amber-200">
								<Star className="h-5 w-5 text-amber-500 fill-current" />
								<span className="font-bold text-lg text-amber-700">{user.points.toLocaleString()}</span>
								<span className="text-sm text-amber-600">Points</span>
							</div>
						)}
					</div>
					<div className="sm:ml-auto"><Button variant="secondary" size="md"><Settings className="mr-2 h-4 w-4" />Edit Profile</Button></div>
				</div>

				<div className="mt-12">
					<div className="border-b border-neutral-200 mb-6">
						<TabButton tabName="saved" label="Saved Deals" />
						{isMerchant && <TabButton tabName="created" label="My Created Deals" />}
					</div>
          
					{activeTab === 'saved' && (
						<div className="animate-fade-in">
							{isLoadingSaved ? <LoadingState /> :
							savedDeals.length === 0 ? <EmptyState icon={<Heart/>} title="No Deals Saved Yet" message="Tap the heart on any deal to save it for later." cta={{ text: "Find Deals to Save", path: PATHS.ALL_DEALS }} /> :
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								{/* --- Data Display: This mapping is correct for your backend response --- */}
								{savedDeals.map((deal: any) => <PremiumV2DealCard key={deal.id} deal={deal} />)}
							</div>}
						</div>
					)}

					{activeTab === 'created' && isMerchant && (
						 <div className="animate-fade-in">
							{isLoadingCreated ? <LoadingState /> :
							merchantDeals.length === 0 ? <EmptyState icon={<Tag/>} title="You haven't created any deals" message="Go to your Merchant Dashboard to create a new deal." cta={{ text: "Create a Deal", path: PATHS.MERCHANT_DEALS_CREATE }} /> :
							<div className="grid grid-cols-1 gap-6">
								{merchantDeals.map((deal: any) => <MerchantDealCard key={deal.id} deal={deal} />)}
							</div>}
						</div>
					)}
				</div>
			</div>

			{/* --- Invite Friends Card --- */}
			<Link to={PATHS.REFERRALS} className="block mt-8 group">
				<div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex items-center justify-between hover:border-brand-primary-300 hover:shadow-lg transition-all">
					<div>
						<h3 className="font-bold text-lg text-neutral-800">Invite Friends</h3>
						<p className="text-neutral-500 text-sm mt-1">Earn points for every friend who joins!</p>
					</div>
					<svg className="h-6 w-6 text-brand-primary-500 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3zM8 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zM16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.99 1.97 3.45v2h6v-2c0-2.66-5.33-4-7-4z" fill="currentColor" />
					</svg>
				</div>
			</Link>
		</div>
	);
};

// --- Reusable Helper Components for a clean UI ---
const LoadingState = () => <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-primary-500" /></div>;

const EmptyState = ({icon, title, message, cta}: {icon: React.ReactNode, title: string, message: string, cta?: { text: string, path: string }}) => (
		<div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-neutral-200">
				<div className="mx-auto h-12 w-12 text-neutral-400">{icon}</div>
				<h3 className="mt-4 text-lg font-semibold text-neutral-800">{title}</h3>
				<p className="text-neutral-500 mt-2 max-w-md mx-auto">{message}</p>
				{cta && <Link to={cta.path} className="mt-6 inline-block"><Button variant="primary">{cta.text}</Button></Link>}
		</div>
);


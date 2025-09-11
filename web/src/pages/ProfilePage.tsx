import { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { cn } from '@/lib/utils';
import { Heart, Tag, Loader2, Settings } from 'lucide-react';
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
								{savedDeals.map(savedRelation => <PremiumV2DealCard key={savedRelation.deal.id} deal={savedRelation.deal} />)}
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


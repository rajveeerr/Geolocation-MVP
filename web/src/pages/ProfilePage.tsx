import { useAuth } from '@/context/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/common/Button';
import { Settings, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { PremiumV2DealCard } from '@/components/deals/PremiumV2DealCard';
import { DealCardSkeleton } from '@/components/common/DealCardSkeleton';

export const ProfilePage = () => {
	const { user } = useAuth();

	if (!user) {
		return <div>Please log in to view your profile.</div>;
	}
  
	const userInitials = user.name
		? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
		: user.email[0].toUpperCase();

	// Load saved deals (call hook at top-level to satisfy hooks rules)
	const { savedDeals, isLoading: isLoadingSavedDeals } = useSavedDeals();

	return (
		<div className="bg-neutral-50 min-h-screen pt-24">
			<div className="container mx-auto max-w-4xl px-4 py-8">
        
				{/* --- User Header --- */}
				<div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
					<Avatar className="h-24 w-24 border-4 border-white shadow-md">
						<AvatarImage src="https://github.com/shadcn.png" alt={user.name || user.email} />
						<AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
					</Avatar>
					<div className="text-center sm:text-left">
						<h1 className="text-3xl font-bold text-neutral-900">{user.name || 'CitySpark User'}</h1>
						<p className="text-neutral-600 mt-1">{user.email}</p>
					</div>
					<div className="sm:ml-auto">
						<Button variant="secondary" size="md">
							<Settings className="mr-2 h-4 w-4" />
							Edit Profile
						</Button>
					</div>
				</div>

						{/* --- Saved Deals Section --- */}
						<div className="mt-12">
							<h2 className="text-2xl font-bold text-neutral-800 mb-6">My Saved Deals</h2>

							{isLoadingSavedDeals ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<DealCardSkeleton />
									<DealCardSkeleton />
								</div>
							) : savedDeals && savedDeals.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									{savedDeals.map((deal) => (
										<PremiumV2DealCard key={deal.id} deal={deal} />
									))}
								</div>
							) : (
								<div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-neutral-200">
									<div className="mx-auto h-12 w-12 text-red-300">
										<Heart />
									</div>
									<h3 className="mt-4 text-lg font-semibold text-neutral-800">No Deals Saved Yet</h3>
									<p className="text-neutral-500 mt-2 max-w-md mx-auto">
										Looks like your list is empty. Tap the heart icon on any deal you find interesting to save it here for later!
									</p>
									<Link to={PATHS.ALL_DEALS} className="mt-6 inline-block">
										<Button variant="primary">Find Deals to Save</Button>
									</Link>
								</div>
							)}
						</div>

			</div>
		</div>
	);
};

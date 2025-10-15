// // web/src/pages/AllDealsPage.tsx
// import { useState } from 'react';
// import { DealResultsList } from '@/components/deals/DealResultsList';
// import { DealResultsMap } from '@/components/deals/DealResultsMap';
// import { allDeals } from '@/data/deals';

// export const AllDealsPage = () => {
//   const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

//   return (
//     <div className="mb-12 pt-24">
//       <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2">
//         <div className="no-scrollbar h-screen overflow-y-auto px-4 lg:col-span-1 xl:col-span-1">
//           <DealResultsList
//             deals={allDeals}
//             hoveredDealId={hoveredDealId}
//             setHoveredDealId={setHoveredDealId}
//           />
//         </div>

//         <div className="hidden h-screen lg:col-span-2 lg:block xl:col-span-1">
//           <DealResultsMap deals={allDeals} hoveredDealId={hoveredDealId} />
//         </div>
//       </div>
//     </div>
//   );
// };

// web/src/pages/AllDealsPage.tsx

import { useState, useEffect } from 'react';
import { DealsSidebar } from '@/components/deals/DealsSidebar';
import { DealResultsMap } from '@/components/deals/DealResultsMap';
import type { DealWithLocation } from '@/data/deals';
import { mergeBackendDeals } from '@/data/deals-placeholder';
import type { ApiDeal as PlaceholderApiDeal } from '@/data/deals-placeholder';
import { apiGet } from '@/services/api';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useToast } from '@/hooks/use-toast';

// Define the shape of a deal object as it comes from your backend API
type ApiDeal = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  merchant: {
    businessName: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  discountPercentage?: number | null;
  discountAmount?: number | null;
  category: string;
  startTime: string;
  endTime: string;
  // These fields are not yet in the backend but are in the DealWithLocation type
  rating?: number;
  price?: '$$' | '$$$' | '$';
  bookingInfo?: string;
};

// NOTE: adapting logic now lives in `deals-placeholder.ts` via `mergeBackendDeals`.

export const AllDealsPage = () => {
  const { toast } = useToast();
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);
  const [deals, setDeals] = useState<DealWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State for location and filters ---
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<string>(''); // Start with "All Categories"
  const [searchRadius, setSearchRadius] = useState<number>(10); // Default radius in km
  const [showAllDeals, setShowAllDeals] = useState<boolean>(false);
  
  // --- NEW: Additional filter states ---
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedDealType, setSelectedDealType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // --- NEW: State for search term and debounced search term ---
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  // --- NEW: Effect to get user's location once on mount ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (geoError) => {
          console.error('Geolocation error:', geoError);
          setError(
            'Could not get your location. Please enable location services and refresh.',
          );
          // Fallback to a default location to still show some deals
          setUserLocation({ lat: 40.7128, lng: -74.006 });
        },
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setUserLocation({ lat: 40.7128, lng: -74.006 }); // Fallback
    }
  }, []); // Empty array ensures this runs only once.

  // --- MODIFIED: Effect to fetch deals based on location AND filters ---
  useEffect(() => {
    // Don't fetch until we have the user's location unless the user explicitly
    // asked for ALL deals (no geo filtering).
    if (!userLocation && !showAllDeals) {
      return;
    }

    const fetchFilteredDeals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Short-circuit: some backend endpoints require >=2 chars for search.
        const trimmed = debouncedSearchTerm.trim();
        if (trimmed && trimmed.length < 2) {
          // Don't call the API for 1-char searches. Show friendly placeholders instead.
          setDeals(mergeBackendDeals(undefined));
          setIsLoading(false);
          return;
        }

        // Build query parameters depending on whether user requested ALL deals
        let response;
        if (showAllDeals) {
          const params = new URLSearchParams();
          // Only add category if it's not empty (not "All Categories")
          if (activeCategory) params.append('category', activeCategory);
          if (trimmed) params.append('search', trimmed);
          if (selectedCityId) params.append('cityId', selectedCityId.toString());
          response = await apiGet<{ deals: ApiDeal[] }>(`/deals?${params}`);
        } else {
          // Geo-filtered request. At this point we guarantee userLocation exists
          // because the hook returns early when !userLocation && !showAllDeals.
          const lat = userLocation!.lat.toString();
          const lng = userLocation!.lng.toString();
          const params = new URLSearchParams({
            latitude: lat,
            longitude: lng,
            radius: searchRadius.toString(),
          });
          // Only add category if it's not empty (not "All Categories")
          if (activeCategory) params.append('category', activeCategory);
          if (trimmed) params.append('search', trimmed);
          if (selectedCityId) params.append('cityId', selectedCityId.toString());
          response = await apiGet<{ deals: ApiDeal[] }>(`/deals?${params}`);
        }

        if (response.success && Array.isArray(response.data?.deals)) {
          // Merge backend deals on top of placeholder data so UI always has friendly content
          const merged = mergeBackendDeals(
            response.data.deals as PlaceholderApiDeal[],
          );
          setDeals(merged);
        } else {
          // Handle known backend validation for short search terms gracefully
          const errMsg = response.error || 'Failed to fetch filtered deals.';
          if (
            errMsg.toLowerCase().includes('at least') &&
            errMsg.toLowerCase().includes('character')
          ) {
            // Show placeholders instead of a blocking error for short searches
            setDeals(mergeBackendDeals(undefined));
            setError(null);
            setIsLoading(false);
            return;
          }

          throw new Error(errMsg);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred.';
        console.error('Fetch filtered deals error:', err);
        
        // Set error but don't crash the page - show fallback data
        setError(errorMessage);
        
        // Show user-friendly toast notification
        toast({
          title: 'Connection Issue',
          description: 'Unable to fetch live deals. Showing sample data instead.',
          variant: 'destructive',
        });
        
        // Always provide fallback data so the page doesn't crash
        setDeals(mergeBackendDeals(undefined));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredDeals();
  }, [
    userLocation,
    activeCategory,
    searchRadius,
    debouncedSearchTerm,
    showAllDeals,
    selectedCityId,
    selectedDealType,
    sortBy,
  ]); // Re-run when location, filters, debounced search, or toggle change

  // --- NEW: Debouncing effect for the search term ---
  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Show loading overlay only on initial load when no deals are available
  if (isLoading && deals.length === 0 && !error) {
    return <LoadingOverlay message="Finding deals near you..." />;
  }

  // --- NEW: Dynamic page title and description based on search term ---
  const pageTitle = searchTerm
    ? `Search results for "${searchTerm}" | Yohop`
    : 'Discover Hot Deals Near You | Yohop';

  const pageDescription = searchTerm
    ? `Find the best deals and offers for "${searchTerm}" on Yohop.`
    : 'Browse a live map of all the best deals, discounts, and happy hours happening right now in your city.';

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
  <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50 pt-20">
      <div className="w-full">
        <div className="grid min-h-[calc(100vh-5rem)] grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Pass filter state and setters to the Sidebar */}
          <div className="border-r border-neutral-200/80 bg-white/80 shadow-sm backdrop-blur-sm lg:col-span-5 xl:col-span-4 2xl:col-span-3">
            <div className="h-max overflow-hidden lg:h-screen">
              <DealsSidebar
                deals={deals}
                hoveredDealId={hoveredDealId}
                setHoveredDealId={setHoveredDealId}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchRadius={searchRadius}
                setSearchRadius={setSearchRadius}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isLoading={isLoading} // Pass loading state for UI feedback
                showAllDeals={showAllDeals}
                setShowAllDeals={setShowAllDeals}
                selectedCityId={selectedCityId}
                setSelectedCityId={setSelectedCityId}
                selectedDealType={selectedDealType}
                setSelectedDealType={setSelectedDealType}
                sortBy={sortBy}
                setSortBy={setSortBy}
                error={error} // Pass error state for graceful error handling
              />
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="relative hidden h-[calc(100vh-5rem)] bg-neutral-100/30 lg:col-span-7 lg:block xl:col-span-8 2xl:col-span-9">
            <DealResultsMap
              deals={deals}
              hoveredDealId={hoveredDealId}
              userLocation={userLocation}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

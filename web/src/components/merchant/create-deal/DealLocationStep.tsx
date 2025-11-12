// web/src/components/merchant/create-deal/DealLocationStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Store, Building2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import { useMerchantCities } from '@/hooks/useMerchantCities';
import { cn } from '@/lib/utils';

export const DealLocationStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const { data: storesData, isLoading: isLoadingStores } = useMerchantStores();
  const { data: citiesData, isLoading: isLoadingCities } = useMerchantCities();
  
  // Ensure stores and cities are arrays
  const stores = Array.isArray(storesData) ? storesData : [];
  const cities = Array.isArray(citiesData) ? citiesData : [];

  const applyToAllStores = state.storeIds === null || state.storeIds.length === 0;
  const applyToAllCities = state.cityIds === null || state.cityIds.length === 0;

  const toggleStore = (storeId: number) => {
    const currentStoreIds = state.storeIds || [];
    const newStoreIds = currentStoreIds.includes(storeId)
      ? currentStoreIds.filter(id => id !== storeId)
      : [...currentStoreIds, storeId];
    
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'storeIds',
      value: newStoreIds.length > 0 ? newStoreIds : null,
    });
  };

  const toggleCity = (cityId: number) => {
    const currentCityIds = state.cityIds || [];
    const newCityIds = currentCityIds.includes(cityId)
      ? currentCityIds.filter(id => id !== cityId)
      : [...currentCityIds, cityId];
    
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'cityIds',
      value: newCityIds.length > 0 ? newCityIds : null,
    });
  };

  const handleApplyToAllStores = (checked: boolean) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'storeIds',
      value: checked ? null : [],
    });
  };

  const handleApplyToAllCities = (checked: boolean) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'cityIds',
      value: checked ? null : [],
    });
  };

  return (
    <OnboardingStepLayout
      title="Target your locations"
      subtitle="Choose which stores and cities this deal applies to (optional)"
      onNext={() => navigate('/merchant/deals/create/instructions')}
      onBack={() => navigate('/merchant/deals/create/schedule')}
      isNextDisabled={false}
      progress={70}
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Stores Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-brand-primary-600" />
              <Label className="text-lg font-semibold text-neutral-900">
                Select Stores
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600">Apply to all stores</span>
              <Switch
                checked={applyToAllStores}
                onCheckedChange={handleApplyToAllStores}
              />
            </div>
          </div>
          
          <p className="text-sm text-neutral-600">
            Choose specific stores where this deal will be available. Leave all selected to apply to all stores.
          </p>

          {isLoadingStores ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-neutral-600">Loading stores...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
              <Store className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
              <p className="text-neutral-600">No stores found. Please add stores first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stores.map((store) => {
                const isSelected = state.storeIds?.includes(store.id) ?? true;
                return (
                  <motion.button
                    key={store.id}
                    onClick={() => toggleStore(store.id)}
                    disabled={applyToAllStores}
                    className={cn(
                      'group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all',
                      isSelected && !applyToAllStores
                        ? 'border-brand-primary-500 bg-brand-primary-50'
                        : 'border-neutral-200 bg-white hover:border-brand-primary-300',
                      applyToAllStores && 'opacity-50 cursor-not-allowed'
                    )}
                    whileHover={!applyToAllStores ? { scale: 1.02 } : {}}
                    whileTap={!applyToAllStores ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                        isSelected && !applyToAllStores
                          ? 'bg-brand-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 group-hover:bg-brand-primary-100 group-hover:text-brand-primary-600'
                      )}>
                        {isSelected && !applyToAllStores ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <MapPin className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-neutral-900">
                          {store.address || `Store #${store.id}`}
                        </h4>
                        {store.city && (
                          <p className="text-sm text-neutral-500 mt-1">
                            {store.city.name}, {store.city.state}
                          </p>
                        )}
                        {!store.active && (
                          <span className="inline-block mt-1 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Cities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-primary-600" />
              <Label className="text-lg font-semibold text-neutral-900">
                Select Cities
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600">Apply to all cities</span>
              <Switch
                checked={applyToAllCities}
                onCheckedChange={handleApplyToAllCities}
              />
            </div>
          </div>
          
          <p className="text-sm text-neutral-600">
            Choose specific cities where this deal will be available. Leave all selected to apply to all cities.
          </p>

          {isLoadingCities ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-neutral-600">Loading cities...</p>
            </div>
          ) : cities.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
              <p className="text-neutral-600">No cities found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => {
                const isSelected = state.cityIds?.includes(city.id) ?? true;
                return (
                  <motion.button
                    key={city.id}
                    onClick={() => toggleCity(city.id)}
                    disabled={applyToAllCities}
                    className={cn(
                      'group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all',
                      isSelected && !applyToAllCities
                        ? 'border-brand-primary-500 bg-brand-primary-50'
                        : 'border-neutral-200 bg-white hover:border-brand-primary-300',
                      applyToAllCities && 'opacity-50 cursor-not-allowed'
                    )}
                    whileHover={!applyToAllCities ? { scale: 1.02 } : {}}
                    whileTap={!applyToAllCities ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                        isSelected && !applyToAllCities
                          ? 'bg-brand-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600 group-hover:bg-brand-primary-100 group-hover:text-brand-primary-600'
                      )}>
                        {isSelected && !applyToAllCities ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Building2 className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">
                          {city.name}
                        </h4>
                        <p className="text-sm text-neutral-500">
                          {city.state}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Location Targeting</h4>
              <p className="text-sm text-blue-700 mt-1">
                If you don't select specific stores or cities, the deal will be available at all your locations. 
                Use location targeting to create location-specific promotions or test deals in specific markets.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};


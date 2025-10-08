import { useParams } from 'react-router-dom';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import { StoreCreationWizard } from '@/components/merchant/StoreCreationWizard';


export const StoreFormPage = () => {
  const { storeId } = useParams();
  const isEditing = !!storeId;
  
  const { data: storesData } = useMerchantStores();
  const stores = storesData?.stores || [];
  const existingStore = isEditing ? stores.find(store => store.id === Number(storeId)) : null;

  // Convert existing store data to wizard format
  const existingStoreData = existingStore ? {
    businessName: existingStore.businessName || '',
    address: existingStore.address,
    phoneNumber: existingStore.phoneNumber || '',
    email: existingStore.email || '',
    storeType: existingStore.storeType || 'restaurant',
    cityId: existingStore.cityId,
    latitude: existingStore.latitude,
    longitude: existingStore.longitude,
    verifiedAddress: existingStore.verifiedAddress || '',
    businessHours: existingStore.businessHours || {},
    description: existingStore.description || '',
    features: existingStore.features || [],
    storeImages: [],
    active: existingStore.active,
  } : undefined;

  return (
    <StoreCreationWizard
      isEditing={isEditing}
      storeId={storeId}
      existingStoreData={existingStoreData}
    />
  );
};

export default StoreFormPage;

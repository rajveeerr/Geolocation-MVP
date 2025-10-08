import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { useMerchantStores, type Store } from '@/hooks/useMerchantStores';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building2, 
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';
import { useDeleteStore } from '@/hooks/useMerchantStores';

const StoreDetailCard = ({ store, onEdit, onDelete }: { 
  store: Store; 
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
}) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-brand-primary-100 p-3">
              <Building2 className="h-6 w-6 text-brand-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {store.city.name}, {store.city.state}
              </h1>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Added {formatDate(store.createdAt)}
                </span>
                <span className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  store.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}>
                  {store.active ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(store)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(store)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Address</h3>
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
            <p className="text-neutral-700">{store.address}</p>
          </div>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Location Information</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">City</h4>
                <p className="text-sm text-neutral-600">{store.city.name}, {store.city.state}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Store ID</h4>
                <p className="text-sm text-neutral-600">#{store.id}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Status</h4>
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  store.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}>
                  {store.active ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Coordinates</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Latitude</h4>
                <p className="text-sm text-neutral-600 font-mono">
                  {store.latitude ? store.latitude.toFixed(6) : 'Not set'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">Longitude</h4>
                <p className="text-sm text-neutral-600 font-mono">
                  {store.longitude ? store.longitude.toFixed(6) : 'Not set'}
                </p>
              </div>
              {store.latitude && store.longitude && (
                <div>
                  <h4 className="font-medium text-neutral-900 mb-1">Map Link</h4>
                  <a
                    href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-primary-600 hover:text-brand-primary-700 underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Created</h4>
              <p className="text-sm text-neutral-600">{formatDate(store.createdAt)}</p>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Last Updated</h4>
              <p className="text-sm text-neutral-600">{formatDate(store.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* City Information */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">City Information</h3>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">City Name</h4>
                <p className="text-sm text-neutral-600">{store.city.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">State</h4>
                <p className="text-sm text-neutral-600">{store.city.state}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">City ID</h4>
                <p className="text-sm text-neutral-600">#{store.city.id}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 mb-1">City Status</h4>
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  store.city.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}>
                  {store.city.active ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StoreDetailPage = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { data: storesData, isLoading, error } = useMerchantStores();
  const deleteStoreMutation = useDeleteStore();
  const { openModal } = useModal();

  const stores = storesData?.stores || [];
  const store = storeId ? stores.find(store => store.id === Number(storeId)) : null;

  const handleEdit = (store: Store) => {
    navigate(`/merchant/stores/${store.id}/edit`);
  };

  const handleDelete = (store: Store) => {
    openModal({
      title: 'Delete Store',
      content: `Are you sure you want to delete the store at ${store.address}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteStoreMutation.mutate(store.id, {
          onSuccess: () => {
            navigate(PATHS.MERCHANT_STORES);
          }
        });
      },
      variant: 'destructive'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-32 rounded bg-neutral-200" />
          <div className="h-96 rounded-xl bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Error Loading Store
          </h3>
          <p className="text-red-600">
            {error.message || 'Failed to load store details. Please try again later.'}
          </p>
          <Button 
            className="mt-4" 
            onClick={() => navigate(PATHS.MERCHANT_STORES)}
          >
            Back to Stores
          </Button>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="mb-2 text-lg font-semibold text-neutral-800">
            Store Not Found
          </h3>
          <p className="text-neutral-600">
            The store you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => navigate(PATHS.MERCHANT_STORES)}
          >
            Back to Stores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(PATHS.MERCHANT_STORES)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stores
        </Button>
      </div>

      {/* Store Detail */}
      <StoreDetailCard
        store={store}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default StoreDetailPage;

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { useMerchantStores, useDeleteStore, type Store } from '@/hooks/useMerchantStores';
import { 
  Plus, 
  MapPin, 
  Edit, 
  Trash2, 
  Building2, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const StoreCard = ({ store, onEdit, onDelete, onView }: { 
  store: Store; 
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  onView: (store: Store) => void;
}) => {
  const { openModal } = useModal();

  const handleDelete = () => {
    openModal({
      title: 'Delete Store',
      content: `Are you sure you want to delete the store at ${store.address}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => onDelete(store),
      variant: 'destructive'
    });
  };

  return (
    <div className="rounded-[1.45rem] border border-neutral-200/80 bg-white/95 p-6 shadow-[0_8px_22px_rgba(15,23,42,0.045)] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-[0.95rem] border border-neutral-200/80 bg-neutral-100 p-2.5">
            <Building2 className="h-5 w-5 text-neutral-700" />
          </div>
          <div>
            <h3 
              className="cursor-pointer text-[1.02rem] font-semibold tracking-tight text-neutral-900 transition-colors hover:text-neutral-700"
              onClick={() => onView(store)}
            >
              {store.city.name}, {store.city.state}
            </h3>
            <p className="text-[13px] text-neutral-600">{store.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              store.active
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-700'
            )}
          >
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

      <div className="mb-5 space-y-2">
        <div className="flex items-center gap-2 text-[13px] text-neutral-600">
          <MapPin className="h-4 w-4" />
          <span>
            {store.latitude && store.longitude 
              ? `${store.latitude.toFixed(4)}, ${store.longitude.toFixed(4)}`
              : 'Location not set'
            }
          </span>
        </div>
        <div className="text-xs text-neutral-500">
          Created {new Date(store.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-neutral-100 pt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(store)}
          className="flex-1 rounded-full border-neutral-200 bg-white text-[13px] text-neutral-700 hover:bg-neutral-50"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-3 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const StoreSkeleton = () => (
  <div className="rounded-[1.45rem] border border-neutral-200/80 bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.045)]">
    <div className="animate-pulse">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-neutral-200" />
          <div>
            <div className="mb-2 h-5 w-32 rounded bg-neutral-200" />
            <div className="h-4 w-48 rounded bg-neutral-200" />
          </div>
        </div>
        <div className="h-6 w-16 rounded-full bg-neutral-200" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-4 w-40 rounded bg-neutral-200" />
        <div className="h-3 w-24 rounded bg-neutral-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded bg-neutral-200" />
        <div className="h-8 w-8 rounded bg-neutral-200" />
      </div>
    </div>
  </div>
);

export const StoreManagementPage = () => {
  const navigate = useNavigate();
  const { data: storesData, isLoading, error } = useMerchantStores();
  const deleteStoreMutation = useDeleteStore();

  const stores = storesData?.stores || [];

  const handleEdit = (store: Store) => {
    navigate(`/merchant/stores/${store.id}/edit`);
  };

  const handleView = (store: Store) => {
    navigate(`/merchant/stores/${store.id}`);
  };

  const handleDelete = (store: Store) => {
    deleteStoreMutation.mutate(store.id);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-1 sm:py-4">
        <div className="mb-8">
          <div className="mb-4 h-8 w-64 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StoreSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-1 sm:py-4">
        <div className="rounded-[1.3rem] border border-rose-200 bg-rose-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Error Loading Stores
          </h3>
          <p className="text-red-600">
            {error.message || 'Failed to load your stores. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-1 sm:py-4">
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Commerce</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">Store Management</h1>
          <p className="mt-2 text-[13px] text-neutral-600 sm:text-sm">
            Manage your store locations and settings
          </p>
        </div>
        <Link to={PATHS.MERCHANT_STORES_CREATE}>
          <Button size="lg" className="rounded-full bg-neutral-950 px-5 text-sm text-white hover:bg-neutral-800">
            <Plus className="mr-2 h-5 w-5" />
            Add New Store
          </Button>
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <Building2 className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="mb-2 text-[1.4rem] font-semibold tracking-tight text-neutral-900">
            No stores yet
          </h3>
          <p className="mb-6 text-[13px] text-neutral-600 sm:text-sm">
            Add your first store location to start managing multiple locations.
          </p>
          <Link to={PATHS.MERCHANT_STORES_CREATE}>
            <Button size="lg" className="rounded-full bg-neutral-950 px-5 text-white hover:bg-neutral-800">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Store
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className={cn(panelClass, 'p-5')}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] text-neutral-500">Total stores</h4>
                  <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-neutral-900">
                    {stores.length}
                  </p>
                </div>
                <div className="rounded-[0.95rem] border border-neutral-200/80 bg-neutral-100 p-2.5">
                  <Building2 className="h-5 w-5 text-neutral-700" />
                </div>
              </div>
            </div>

            <div className={cn(panelClass, 'p-5')}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] text-neutral-500">Active stores</h4>
                  <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-neutral-900">
                    {stores.filter(store => store.active).length}
                  </p>
                </div>
                <div className="rounded-[0.95rem] border border-neutral-200/80 bg-emerald-50 p-2.5">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className={cn(panelClass, 'p-5')}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] text-neutral-500">Cities</h4>
                  <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-neutral-900">
                    {new Set(stores.map(store => store.city.name)).size}
                  </p>
                </div>
                <div className="rounded-[0.95rem] border border-neutral-200/80 bg-neutral-100 p-2.5">
                  <MapPin className="h-5 w-5 text-neutral-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Stores Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StoreManagementPage;

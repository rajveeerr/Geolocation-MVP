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
  'rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

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
    <div className="rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card p-6 shadow-[0_8px_22px_rgba(15,23,42,0.045)] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-[0.95rem] border border-border/80 bg-muted p-2.5">
            <Building2 className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 
              className="cursor-pointer text-[1.02rem] font-semibold tracking-tight text-foreground transition-colors hover:text-foreground"
              onClick={() => onView(store)}
            >
              {store.city.name}, {store.city.state}
            </h3>
            <p className="text-[13px] text-muted-foreground">{store.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              store.active
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
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
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {store.latitude && store.longitude 
              ? `${store.latitude.toFixed(4)}, ${store.longitude.toFixed(4)}`
              : 'Location not set'
            }
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Created {new Date(store.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(store)}
          className="flex-1 rounded-full border-border bg-card text-[13px] text-foreground hover:bg-muted"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const StoreSkeleton = () => (
  <div className="rounded-[1.45rem] border border-border/80 bg-card p-6 shadow-[0_8px_22px_rgba(15,23,42,0.045)]">
    <div className="animate-pulse">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent" />
          <div>
            <div className="mb-2 h-5 w-32 rounded bg-accent" />
            <div className="h-4 w-48 rounded bg-accent" />
          </div>
        </div>
        <div className="h-6 w-16 rounded-full bg-accent" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-4 w-40 rounded bg-accent" />
        <div className="h-3 w-24 rounded bg-accent" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded bg-accent" />
        <div className="h-8 w-8 rounded bg-accent" />
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
          <div className="mb-4 h-8 w-64 animate-pulse rounded bg-accent" />
          <div className="h-4 w-96 animate-pulse rounded bg-accent" />
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
        <div className="rounded-[1.3rem] border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-300">
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
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Locations</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-foreground">Store Management</h1>
          <p className="mt-2 text-[13px] text-muted-foreground sm:text-sm">
            Manage your store locations and settings
          </p>
        </div>
        <Link to={PATHS.MERCHANT_STORES_CREATE}>
          <Button size="lg" className="rounded-full bg-foreground px-5 text-sm text-background hover:bg-foreground/85">
            <Plus className="mr-2 h-5 w-5" />
            Add New Store
          </Button>
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-[1.4rem] font-semibold tracking-tight text-foreground">
            No stores yet
          </h3>
          <p className="mb-6 text-[13px] text-muted-foreground sm:text-sm">
            Add your first store location to start managing multiple locations.
          </p>
          <Link to={PATHS.MERCHANT_STORES_CREATE}>
            <Button size="lg" className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/85">
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
                  <h4 className="text-[13px] text-muted-foreground">Total stores</h4>
                  <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-foreground">
                    {stores.length}
                  </p>
                </div>
                <div className="rounded-[0.95rem] border border-border/80 bg-muted p-2.5">
                  <Building2 className="h-5 w-5 text-foreground" />
                </div>
              </div>
            </div>

            <div className={cn(panelClass, 'p-5')}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Active stores</h4>
                  <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-foreground">
                    {stores.filter(store => store.active).length}
                  </p>
                </div>
                <div className="rounded-[0.95rem] border border-border/80 bg-emerald-50 dark:bg-emerald-950/30 p-2.5">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className={cn(panelClass, 'p-5')}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Cities</h4>
                  <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-foreground">
                    {new Set(stores.map(store => store.city.name)).size}
                  </p>
                </div>
                <div className="rounded-[0.95rem] border border-border/80 bg-muted p-2.5">
                  <MapPin className="h-5 w-5 text-foreground" />
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

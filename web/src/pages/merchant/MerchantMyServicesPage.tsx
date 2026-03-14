import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Wrench, Clock, Users, Eye, Trash2, Filter } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  SERVICE_STATUSES,
  useDeleteService,
  useMerchantServices,
  type Service,
  type ServiceStatus,
} from '@/hooks/useServices';

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  PAUSED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        statusStyles[status] ?? 'bg-neutral-100 text-neutral-600',
      )}
    >
      {status}
    </span>
  );
}

function ServiceCard({ service, onDelete }: { service: Service; onDelete: (id: number) => void }) {
  const totalBookings = service._count?.bookings ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
    >
      <div className="relative h-36 bg-gradient-to-br from-brand-primary-500/20 to-brand-primary-700/30">
        {service.coverImageUrl ? (
          <img src={service.coverImageUrl} alt={service.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Wrench className="h-10 w-10 text-brand-primary-400/70" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={service.status} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-neutral-900">{service.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{service.shortDescription || service.description}</p>

        <div className="mt-3 space-y-1.5 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{service.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            <span>{totalBookings} bookings</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link to={PATHS.MERCHANT_SERVICES_MANAGE.replace(':serviceId', String(service.id))} className="flex-1">
            <Button size="sm" className="w-full rounded-lg">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Manage
            </Button>
          </Link>
          <button
            onClick={() => onDelete(service.id)}
            className="rounded-lg border border-red-200 p-2 text-red-500 transition-colors hover:bg-red-50"
            title="Delete service"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

type StatusFilter = ServiceStatus | 'ALL';

function MerchantMyServicesContent() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const { data: services = [], isLoading, error } = useMerchantServices();
  const deleteService = useDeleteService();
  const { toast } = useToast();

  const filteredServices = useMemo(() => {
    if (statusFilter === 'ALL') return services;
    return services.filter((service) => service.status === statusFilter);
  }, [services, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: services.length };
    for (const service of services) {
      counts[service.status] = (counts[service.status] ?? 0) + 1;
    }
    return counts;
  }, [services]);

  const handleDelete = (serviceId: number) => {
    if (!confirm('Delete or cancel this service?')) return;
    deleteService.mutate(serviceId, {
      onSuccess: () => toast({ title: 'Service removed' }),
      onError: (error) => toast({ title: 'Error', description: error.message, variant: 'destructive' }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Services</h1>
          <p className="mt-1 text-neutral-500">Create and manage your services, tiers, add-ons, and bookings.</p>
        </div>
        <Link to={PATHS.MERCHANT_SERVICES_CREATE}>
          <Button size="md" className="rounded-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        </Link>
      </div>

      {services.length > 0 && (
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="mr-1 h-4 w-4 flex-shrink-0 text-neutral-400" />
          {(['ALL', ...SERVICE_STATUSES.map((s) => s.value)] as StatusFilter[]).map((status) => {
            const count = statusCounts[status] ?? 0;
            if (status !== 'ALL' && count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  statusFilter === status
                    ? 'bg-brand-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                )}
              >
                {status}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs',
                    statusFilter === status ? 'bg-white/20' : 'bg-neutral-200',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filteredServices.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-16 text-center">
          <Wrench className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <h3 className="text-xl font-bold text-neutral-700">No services yet</h3>
          <p className="mt-1 text-neutral-500">Create your first service to start accepting bookings.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export const MerchantMyServicesPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage services.">
    <MerchantMyServicesContent />
  </MerchantProtectedRoute>
);

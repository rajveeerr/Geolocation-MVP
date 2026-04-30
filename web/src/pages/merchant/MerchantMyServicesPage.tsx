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
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-sky-100 text-sky-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

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
      className="overflow-hidden rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]"
    >
      <div className="relative h-36 bg-gradient-to-br from-neutral-100 via-white to-[#eef1f5]">
        {service.coverImageUrl ? (
          <img src={service.coverImageUrl} alt={service.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Wrench className="h-10 w-10 text-neutral-300" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={service.status} />
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-[1.02rem] font-semibold tracking-tight text-neutral-900">{service.title}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-neutral-500">{service.shortDescription || service.description}</p>

        <div className="mt-4 space-y-2 text-[13px] text-neutral-500">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>{service.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" />
            <span>{totalBookings} bookings</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-neutral-100 pt-4">
          <Link to={PATHS.MERCHANT_SERVICES_MANAGE.replace(':serviceId', String(service.id))} className="flex-1">
            <Button size="sm" className="w-full rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Manage
            </Button>
          </Link>
          <button
            onClick={() => onDelete(service.id)}
            className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
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
        <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 p-4 text-red-700">{(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-1 sm:py-4">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Experiences</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">My Services</h1>
          <p className="mt-2 text-[13px] text-neutral-500 sm:text-sm">Create and manage your services, tiers, add-ons, and bookings.</p>
        </div>
        <Link to={PATHS.MERCHANT_SERVICES_CREATE}>
          <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        </Link>
      </div>

      {services.length > 0 && (
        <div className={cn(panelClass, 'mb-6 flex items-center gap-2 overflow-x-auto p-3')}>
          <Filter className="mr-1 h-4 w-4 flex-shrink-0 text-neutral-400" />
          {(['ALL', ...SERVICE_STATUSES.map((s) => s.value)] as StatusFilter[]).map((status) => {
            const count = statusCounts[status] ?? 0;
            if (status !== 'ALL' && count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                  statusFilter === status
                    ? 'bg-neutral-950 text-white'
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
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <Wrench className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No services yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">Create your first service to start accepting bookings.</p>
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

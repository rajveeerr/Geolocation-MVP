import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Wrench, MapPin, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { usePublicServices } from '@/hooks/useServices';

export function DiscoverServicesPage() {
  const [search, setSearch] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({ page, limit: 12, search: search || undefined, serviceType: serviceType || undefined }),
    [page, search, serviceType],
  );

  const { data, isLoading, error } = usePublicServices(query);
  const services = data?.services ?? [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto max-w-screen-xl px-6 pt-24 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Discover Services</h1>
        <p className="mt-2 text-neutral-500">
          Book curated experiences and professional services from trusted merchants.
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by service name, description, or tag"
            className="w-full rounded-lg border border-neutral-200 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          />
        </div>
        <input
          value={serviceType}
          onChange={(e) => {
            setServiceType(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by service type"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
        />
      </div>

      {isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && services.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-14 text-center">
          <Wrench className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <h3 className="text-lg font-semibold text-neutral-700">No services found</h3>
          <p className="mt-1 text-sm text-neutral-500">Try a different search term or service type.</p>
        </div>
      )}

      {!isLoading && !error && services.length > 0 && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const minTierPrice = service.pricingTiers?.length
                ? Math.min(...service.pricingTiers.map((tier) => tier.price))
                : null;

              return (
                <div key={service.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                  <div className="h-40 bg-gradient-to-br from-brand-primary-500/20 to-brand-primary-700/30">
                    {service.coverImageUrl ? (
                      <img src={service.coverImageUrl} alt={service.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Wrench className="h-10 w-10 text-brand-primary-400/70" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="line-clamp-1 text-lg font-bold text-neutral-900">{service.title}</h3>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {service.status}
                      </span>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-neutral-500">
                      {service.shortDescription || service.description}
                    </p>
                    <div className="mb-4 space-y-1.5 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">{service.merchant?.businessName || 'Merchant'}</span>
                      </div>
                      {service.merchant?.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="line-clamp-1">{service.merchant.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{service.durationMinutes} min</span>
                      </div>
                    </div>
                    <div className="mb-3 text-sm font-semibold text-brand-primary-600">
                      {minTierPrice !== null ? `Starts at ₹${minTierPrice}` : 'Pricing on detail page'}
                    </div>
                    <Link to={PATHS.SERVICE_DETAIL.replace(':serviceId', String(service.id))}>
                      <Button size="sm" className="w-full rounded-lg">View & Book</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-neutral-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

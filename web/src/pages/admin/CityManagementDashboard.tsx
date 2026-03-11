// web/src/pages/admin/CityManagementDashboard.tsx
import { useState } from 'react';
import { useAdminCities } from '@/hooks/useAdminCities';
import type { AdminCity } from '@/hooks/useAdminCities';
import { useAdminCityStats } from '@/hooks/useAdminCityStats';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPut, apiPost } from '@/services/api';
import type { ApiResponse } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, PlusCircle, MapPin, Building, Globe, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StatCard = ({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) => (
  <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[13px] font-medium text-neutral-500">{title}</p>
        <p className="mt-1.5 text-2xl font-bold font-heading text-neutral-900 tracking-tight">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-50 text-brand-primary-600">
        {icon}
      </div>
    </div>
  </div>
);

export const CityManagementDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({ page: 1, search: '' });
  const { data: statsData, isLoading: isLoadingStats } = useAdminCityStats();
  const { data: citiesResponse, isLoading: isLoadingCities } = useAdminCities(filters);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateCityMutation = useMutation({
    mutationFn: ({ cityId, active }: { cityId: number; active: boolean }) => apiPut(`/admin/cities/${cityId}/active`, { active }),
    onSuccess: () => {
      toast({ title: 'City status updated!' });
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-city-stats'] });
    },
    onError: (error: Error) => toast({ title: 'Error', description: error.message, variant: 'destructive' }),
  });

  const createCityMutation = useMutation<ApiResponse<unknown>, Error, { name: string; state: string; active?: boolean }>({
    mutationFn: (payload) => apiPost('/admin/cities', payload),
    onSuccess: () => {
      toast({ title: 'City created!' });
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-city-stats'] });
      setShowCreateModal(false);
    },
    onError: (error: Error) => toast({ title: 'Error', description: error.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900 tracking-tight">City Management</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage cities and their activation status.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="rounded-xl">
          <PlusCircle className="mr-2 h-4 w-4" /> Add City
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200/60 bg-white p-5 animate-pulse">
              <div className="h-3 bg-neutral-100 rounded-lg w-3/4 mb-3" />
              <div className="h-7 bg-neutral-100 rounded-lg w-1/2" />
            </div>
          ))
        ) : (
          <>
            <StatCard title="Total Cities" value={statsData?.stats.totalCities ?? 0} icon={<Globe className="h-5 w-5" />} />
            <StatCard title="Active Cities" value={statsData?.stats.activeCities ?? 0} icon={<CheckCircle className="h-5 w-5" />} />
            <StatCard title="Cities w/ Stores" value={(statsData?.stats as Record<string, number>)?.citiesWithStores ?? 0} icon={<Building className="h-5 w-5" />} />
            <StatCard title="Active w/ Stores" value={(statsData?.stats as Record<string, number>)?.activeCitiesWithStores ?? 0} icon={<MapPin className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-neutral-100">
          <Input
            placeholder="Search city or state..."
            className="max-w-xs rounded-xl"
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>

        {showCreateModal && (
          <CreateCityModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(payload: { name: string; state: string; active?: boolean }) => createCityMutation.mutate(payload)}
            isLoading={createCityMutation.isPending}
          />
        )}

        {isLoadingCities ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">City</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">State</th>
                  <th className="px-5 py-3.5 text-left text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">Merchants</th>
                  <th className="px-5 py-3.5 text-center text-[12px] font-semibold text-neutral-500 uppercase tracking-wider">Active</th>
                </tr>
              </thead>
              <tbody>
                {citiesResponse?.cities.map((city: AdminCity) => (
                  <tr key={city.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-neutral-900">{city.name}</td>
                    <td className="px-5 py-4 text-neutral-500">{city.state}</td>
                    <td className="px-5 py-4 text-neutral-500">{city.approvedMerchants}</td>
                    <td className="px-5 py-4 text-center">
                      <Switch checked={city.active} onCheckedChange={(active) => updateCityMutation.mutate({ cityId: city.id, active })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateCityModal = ({
  onClose,
  onCreate,
  isLoading,
}: {
  onClose: () => void;
  onCreate: (payload: { name: string; state: string; active?: boolean }) => void;
  isLoading?: boolean;
}) => {
  const [name, setName] = useState('');
  const [stateName, setStateName] = useState('');
  const [active, setActive] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold font-heading text-neutral-900">Create City</h3>
        <p className="text-sm text-neutral-500 mt-1">Add a new city to the platform.</p>
        <div className="mt-4 space-y-3">
          <Input placeholder="City name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
          <Input placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} className="rounded-xl" />
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={(v) => setActive(!!v)} />
            <span className="text-sm text-neutral-600">Active</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="rounded-xl">Cancel</Button>
          <Button onClick={() => onCreate({ name: name.trim(), state: stateName.trim(), active })} disabled={isLoading || !name || !stateName} className="rounded-xl">
            {isLoading ? 'Creating...' : 'Create City'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CityManagementDashboard;

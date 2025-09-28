// web/src/pages/admin/CityManagementDashboard.tsx
// Consolidated CityManagementDashboard implementation
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
import { Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Reusable Stat Card
const StatCard = ({ title, value }: { title: string; value: number | string }) => (
  <div className="bg-white p-4 rounded-lg border shadow-sm">
    <p className="text-sm text-neutral-500">{title}</p>
    <p className="text-2xl font-bold text-neutral-900">{value}</p>
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

  const createCityMutation = useMutation<ApiResponse<any>, Error, { name: string; state: string; active?: boolean }>({
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
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingStats ? (
          <p>Loading stats...</p>
        ) : (
          <>
            <StatCard title="Total Cities" value={statsData?.stats.totalCities ?? 0} />
            <StatCard title="Active Cities" value={statsData?.stats.activeCities ?? 0} />
            <StatCard title="Cities w/ Stores" value={(statsData?.stats as any)?.citiesWithStores ?? 0} />
            <StatCard title="Active w/ Stores" value={(statsData?.stats as any)?.activeCitiesWithStores ?? 0} />
          </>
        )}
      </div>

      {/* Controls and Table Section */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search city or state..."
            className="max-w-xs"
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add City
            </Button>
          </div>
        </div>

        {showCreateModal && (
          <CreateCityModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(payload: { name: string; state: string; active?: boolean }) => createCityMutation.mutate(payload)}
            isLoading={(createCityMutation as any).isLoading === true}
          />
        )}

        {isLoadingCities ? (
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50">
              <tr>
                <th className="p-2">City</th>
                <th className="p-2">State</th>
                <th className="p-2">Merchants</th>
                <th className="p-2 text-center">Active</th>
              </tr>
            </thead>
            <tbody>
              {citiesResponse?.cities.map((city: AdminCity) => (
                <tr key={city.id} className="border-b">
                  <td className="p-2 font-medium">{city.name}</td>
                  <td className="p-2 text-neutral-600">{city.state}</td>
                  <td className="p-2 text-neutral-600">{city.approvedMerchants}</td>
                  <td className="p-2 text-center">
                    <Switch checked={city.active} onCheckedChange={(active) => updateCityMutation.mutate({ cityId: city.id, active })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination would go here */}
      </div>
    </div>
  );
};

// Modal component for creating a new city
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold">Create City</h3>
        <p className="text-sm text-neutral-500 mt-2">Add a new city to the platform.</p>

        <div className="mt-4 space-y-3">
          <Input placeholder="City name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} />
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={(v) => setActive(!!v)} />
            <span className="text-sm text-neutral-600">Active</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={() => onCreate({ name: name.trim(), state: stateName.trim(), active })} disabled={isLoading || !name || !stateName}>
            {isLoading ? 'Creating...' : 'Create City'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CityManagementDashboard;


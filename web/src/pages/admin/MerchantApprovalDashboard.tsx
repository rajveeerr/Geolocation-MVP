// Consolidated MerchantApprovalDashboard implementation
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Loader2, Building, Mail, Clock, CheckCircle, XCircle, Search, MapPin, Tag, Eye, Pause, Play, RotateCcw, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { StatCard } from '@/components/common/StatCard';
import { MerchantLogo } from '@/components/common/MerchantLogo';

interface MerchantOwner {
  id: number;
  email: string;
  name: string | null;
}
interface MerchantStore {
  id: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  city: { id: number; name: string; state: string };
}

interface MerchantApplication {
  id: number;
  businessName: string;
  address: string;
  description?: string | null;
  logoUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  owner: MerchantOwner;
  city?: string;
  category?: string;
  rejectionReason?: string | null;
  suspendedUntil?: string | null;
  suspendedReason?: string | null;
  stores?: MerchantStore[];
  totalDeals?: number;
  totalStores?: number;
}

const RejectionModal = ({ merchant, onClose, onConfirm }: any) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold font-heading text-neutral-900">Reject Merchant</h3>
        <p className="text-sm text-neutral-500 mt-1">{merchant.businessName}</p>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 p-3 mt-4 text-sm focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-100 outline-none"
          placeholder="Optional reason for rejection..." rows={3} />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button className="bg-red-600 text-white rounded-xl hover:bg-red-700" onClick={() => onConfirm(reason)}>Confirm Rejection</Button>
        </div>
      </motion.div>
    </div>
  );
};

const SuspensionModal = ({ merchant, onClose, onConfirm }: any) => {
  const [reason, setReason] = useState('');
  const [days, setDays] = useState(7);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold font-heading text-neutral-900">Suspend Merchant</h3>
        <p className="text-sm text-neutral-500 mt-1">{merchant.businessName}</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Duration (days)</label>
            <Input type="number" value={days} onChange={(e) => setDays(parseInt(e.target.value) || 1)}
              min="1" max="365" className="rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-3 text-sm focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-100 outline-none"
              placeholder="e.g., Policy violation, payment issues..." rows={3} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button className="bg-amber-600 text-white rounded-xl hover:bg-amber-700" onClick={() => onConfirm({ reason, days })}>Confirm Suspension</Button>
        </div>
      </motion.div>
    </div>
  );
};

const MerchantDetailsModal = ({ merchant, onClose }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold font-heading text-neutral-900">{merchant.businessName}</h3>
        <button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">✕</button>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <MerchantLogo src={merchant.logoUrl} name={merchant.businessName} size="lg" />
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-neutral-900">{merchant.businessName}</h4>
            <p className="text-sm text-neutral-500">{merchant.owner.email}</p>
            <p className="text-sm text-neutral-400">Applied: {new Date(merchant.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold text-sm text-neutral-700 mb-3">Business Information</h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>{merchant.address}</span>
              </div>
              {merchant.city && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Building className="h-4 w-4 text-neutral-400" />
                  <span>City: {merchant.city}</span>
                </div>
              )}
              {merchant.category && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Tag className="h-4 w-4 text-neutral-400" />
                  <span>Category: {merchant.category}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-sm text-neutral-700 mb-3">Status</h5>
            <div className="space-y-2 text-sm">
              <span className={cn("inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold",
                merchant.status === 'APPROVED' && "bg-emerald-50 text-emerald-700",
                merchant.status === 'PENDING' && "bg-amber-50 text-amber-700",
                merchant.status === 'REJECTED' && "bg-red-50 text-red-700",
                merchant.status === 'SUSPENDED' && "bg-orange-50 text-orange-700"
              )}>{merchant.status}</span>
              {merchant.rejectionReason && <p className="text-neutral-600"><span className="font-medium">Rejection: </span>{merchant.rejectionReason}</p>}
              {merchant.suspendedUntil && <p className="text-neutral-600"><span className="font-medium">Until: </span>{new Date(merchant.suspendedUntil).toLocaleDateString()}</p>}
              {merchant.suspendedReason && <p className="text-neutral-600"><span className="font-medium">Reason: </span>{merchant.suspendedReason}</p>}
            </div>
          </div>
        </div>

        {merchant.description && (
          <div>
            <h5 className="font-semibold text-sm text-neutral-700 mb-2">Description</h5>
            <p className="text-sm text-neutral-600">{merchant.description}</p>
          </div>
        )}

        {merchant.status === 'APPROVED' && (
          <div>
            <h5 className="font-semibold text-sm text-neutral-700 mb-3">Business Stats</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-[13px] font-medium text-neutral-500">Total Deals</span>
                </div>
                <p className="text-2xl font-bold font-heading text-neutral-900">{merchant.totalDeals || 0}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Building className="h-4 w-4 text-indigo-500" />
                  <span className="text-[13px] font-medium text-neutral-500">Total Stores</span>
                </div>
                <p className="text-2xl font-bold font-heading text-neutral-900">{merchant.totalStores || 0}</p>
              </div>
            </div>

            {merchant.stores && merchant.stores.length > 0 && (
              <div className="mt-4">
                <h6 className="font-medium text-sm text-neutral-700 mb-2.5">Store Locations</h6>
                <div className="space-y-2">
                  {merchant.stores.map((store: MerchantStore) => (
                    <div key={store.id} className="rounded-xl border border-neutral-200/60 bg-white p-3">
                      <p className="font-medium text-sm text-neutral-900">{store.address}</p>
                      <p className="text-[12px] text-neutral-400">{store.city.name}, {store.city.state}</p>
                      <span className={`mt-1 inline-flex px-2 py-0.5 text-[11px] rounded-md font-medium ${store.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {store.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {merchant.status !== 'APPROVED' && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-blue-800">
                {merchant.status === 'PENDING' && 'Pending Approval'}
                {merchant.status === 'REJECTED' && 'Application Rejected'}
                {merchant.status === 'SUSPENDED' && 'Account Suspended'}
              </span>
            </div>
            <p className="text-[13px] text-blue-700">
              {merchant.status === 'PENDING' && 'This application is awaiting admin approval.'}
              {merchant.status === 'REJECTED' && 'This application has been rejected.'}
              {merchant.status === 'SUSPENDED' && 'This account has been suspended.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  </div>
);

export const MerchantApprovalDashboard = () => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'>('PENDING');
  const [merchantToReject, setMerchantToReject] = useState<MerchantApplication | null>(null);
  const [merchantToSuspend, setMerchantToSuspend] = useState<MerchantApplication | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allMerchants = [], isLoading } = useQuery({
    queryKey: ['admin-all-merchants'],
    queryFn: () => apiGet<{ merchants: MerchantApplication[] }>(`/admin/merchants?limit=100`).then(res => res.data?.merchants || []),
  });

  const stats = useMemo(() => {
    const pendingCount = allMerchants.filter(m => m.status === 'PENDING').length;
    const approvedCount = allMerchants.filter(m => m.status === 'APPROVED').length;
    const rejectedCount = allMerchants.filter(m => m.status === 'REJECTED').length;
    const suspendedCount = allMerchants.filter(m => m.status === 'SUSPENDED').length;
    const cityCounts = allMerchants.reduce((acc, merchant) => {
      const city = merchant.city || merchant.address.split(',').slice(-2)[0]?.trim() || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCities = Object.entries(cityCounts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([name, count]) => ({ name, count }));
    return { pendingCount, approvedCount, rejectedCount, suspendedCount, topCities };
  }, [allMerchants]);

  const filteredMerchants = useMemo(() => {
    let filtered = allMerchants.filter(m => m.status === activeTab);
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.city && m.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filtered;
  }, [allMerchants, activeTab, searchTerm]);

  const mutationOptions = {
    onSuccess: () => {
      toast({ title: "Success", description: "Merchant status updated." });
      queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: 'destructive' as const });
    }
  };

  const approveMutation = useMutation({ mutationFn: (merchantId: number) => apiPost(`/admin/merchants/${merchantId}/approve`, {}), ...mutationOptions });
  const rejectMutation = useMutation({ mutationFn: ({ merchantId, reason }: { merchantId: number, reason: string }) => apiPost(`/admin/merchants/${merchantId}/reject`, { reason }), ...mutationOptions, onSettled: () => setMerchantToReject(null) });
  const suspendMutation = useMutation({ mutationFn: ({ merchantId, reason, days }: { merchantId: number, reason: string, days: number }) => apiPost(`/admin/merchants/${merchantId}/suspend`, { reason, days }), ...mutationOptions, onSettled: () => setMerchantToSuspend(null) });
  const unsuspendMutation = useMutation({ mutationFn: (merchantId: number) => apiPost(`/admin/merchants/${merchantId}/unsuspend`, {}), ...mutationOptions });

  const statusTabs = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-neutral-900 tracking-tight">Merchant Approval</h1>
        <p className="mt-1 text-sm text-neutral-500">Review and manage merchant applications.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Pending" value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.pendingCount} icon={<Clock className="h-5 w-5" />} color="amber" />
        <StatCard title="Approved" value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.approvedCount} icon={<CheckCircle className="h-5 w-5" />} color="green" />
        <StatCard title="Rejected" value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.rejectedCount} icon={<XCircle className="h-5 w-5" />} color="red" />
        <StatCard title="Suspended" value={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.suspendedCount} icon={<Pause className="h-5 w-5" />} color="amber" />
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm">
          <p className="text-[13px] font-medium text-neutral-500">Top Cities</p>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin mt-2" /> : (
            <div className="mt-2 space-y-1.5">
              {stats.topCities.map(city => (
                <div key={city.name} className="flex justify-between items-baseline">
                  <p className="text-sm font-semibold text-neutral-800">{city.name}</p>
                  <p className="text-[12px] text-neutral-400">{city.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="inline-flex rounded-xl bg-neutral-100 p-1">
          {statusTabs.map(status => (
            <button key={status} onClick={() => setActiveTab(status)}
              className={cn('rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                activeTab === status ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700')}>
              {status}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input type="text" placeholder="Search merchants..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full sm:w-64 rounded-xl" />
        </div>
      </div>

      {/* Merchant List */}
      <div>
        {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-300" />}
        {!isLoading && filteredMerchants.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-16 text-center">
            <Building className="mx-auto h-10 w-10 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-400">No merchants found with status "{activeTab}".</p>
          </div>
        )}

        <div className="space-y-3">
          {filteredMerchants.map(merchant => (
            <div key={merchant.id} className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <MerchantLogo src={merchant.logoUrl} name={merchant.businessName} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-neutral-900 flex items-center gap-2">
                      <Building className="h-4 w-4 text-neutral-400" />
                      {merchant.businessName}
                    </p>
                    {merchant.status === 'APPROVED' && (
                      <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Premium</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                    <Mail className="h-3.5 w-3.5 text-neutral-400" />
                    {merchant.owner.email}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-[12px] text-neutral-400">
                    {merchant.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{merchant.city}</span>}
                    {merchant.category && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{merchant.category}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(merchant.createdAt).toLocaleDateString()}</span>
                  </div>
                  {merchant.description && <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{merchant.description}</p>}
                  {merchant.rejectionReason && (
                    <div className="mt-2 rounded-lg bg-red-50 border border-red-100 p-2.5 text-[12px]">
                      <span className="font-semibold text-red-700">Rejected: </span>
                      <span className="text-red-600">{merchant.rejectionReason}</span>
                    </div>
                  )}
                  {merchant.suspendedUntil && (
                    <div className="mt-2 rounded-lg bg-orange-50 border border-orange-100 p-2.5 text-[12px]">
                      <span className="font-semibold text-orange-700">Suspended until: </span>
                      <span className="text-orange-600">{new Date(merchant.suspendedUntil).toLocaleDateString()}</span>
                      {merchant.suspendedReason && <p className="mt-1"><span className="font-semibold text-orange-700">Reason: </span><span className="text-orange-600">{merchant.suspendedReason}</span></p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <Button size="sm" variant="secondary" onClick={() => setSelectedMerchant(merchant)} className="rounded-xl">
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
                {activeTab === 'PENDING' && (
                  <>
                    <Button size="sm" className="bg-red-600 text-white rounded-xl hover:bg-red-700" onClick={() => setMerchantToReject(merchant)}>Reject</Button>
                    <Button size="sm" className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700" onClick={() => approveMutation.mutate(merchant.id)}>Approve</Button>
                  </>
                )}
                {activeTab === 'REJECTED' && (
                  <Button size="sm" className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700" onClick={() => approveMutation.mutate(merchant.id)}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
                {activeTab === 'APPROVED' && (
                  <Button size="sm" className="bg-amber-600 text-white rounded-xl hover:bg-amber-700" onClick={() => setMerchantToSuspend(merchant)}>
                    <Pause className="h-4 w-4 mr-1" /> Suspend
                  </Button>
                )}
                {activeTab === 'SUSPENDED' && (
                  <Button size="sm" className="bg-emerald-600 text-white rounded-xl hover:bg-emerald-700" onClick={() => unsuspendMutation.mutate(merchant.id)}>
                    <Play className="h-4 w-4 mr-1" /> Unsuspend
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {merchantToReject && <RejectionModal merchant={merchantToReject} onClose={() => setMerchantToReject(null)} onConfirm={(reason: string) => rejectMutation.mutate({ merchantId: merchantToReject.id, reason })} />}
        {merchantToSuspend && <SuspensionModal merchant={merchantToSuspend} onClose={() => setMerchantToSuspend(null)} onConfirm={({ reason, days }: { reason: string, days: number }) => suspendMutation.mutate({ merchantId: merchantToSuspend.id, reason, days })} />}
        {selectedMerchant && <MerchantDetailsModal merchant={selectedMerchant} onClose={() => setSelectedMerchant(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default MerchantApprovalDashboard;

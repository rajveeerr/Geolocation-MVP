// Consolidated MerchantApprovalDashboard implementation
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Loader2, Building, Mail, Clock, CheckCircle, XCircle, Search, MapPin, Tag, Eye, Pause, Play, RotateCcw } from 'lucide-react';
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
}

const RejectionModal = ({ merchant, onClose, onConfirm }: any) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold">Reject Merchant: {merchant.businessName}</h3>
                <p className="text-sm text-neutral-500 mt-2">Enter an optional reason for rejection. This will be included in the notification email.</p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border rounded-md p-2 mt-4"
                    placeholder="e.g., Incomplete or invalid documentation."
                />
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button className="bg-destructive text-destructive-foreground" onClick={() => onConfirm(reason)}>Confirm Rejection</Button>
                </div>
            </motion.div>
        </div>
    );
};

const SuspensionModal = ({ merchant, onClose, onConfirm }: any) => {
    const [reason, setReason] = useState('');
    const [days, setDays] = useState(7);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold">Suspend Merchant: {merchant.businessName}</h3>
                <p className="text-sm text-neutral-500 mt-2">Enter suspension details.</p>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Suspension Duration (days)</label>
                        <Input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                            min="1"
                            max="365"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Reason for Suspension</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="e.g., Policy violation, payment issues, etc."
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button className="bg-amber-600 text-white" onClick={() => onConfirm({ reason, days })}>Confirm Suspension</Button>
                </div>
            </motion.div>
        </div>
    );
};

const MerchantDetailsModal = ({ merchant, onClose }: any) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">Merchant Details: {merchant.businessName}</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <MerchantLogo src={merchant.logoUrl} name={merchant.businessName} size="lg" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-lg">{merchant.businessName}</h4>
                            <p className="text-sm text-neutral-500">{merchant.owner.email}</p>
                            <p className="text-sm text-neutral-500">Applied: {new Date(merchant.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-medium text-neutral-700 mb-2">Business Information</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-neutral-400" />
                                    <span>{merchant.address}</span>
                                </div>
                                {merchant.city && (
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-neutral-400" />
                                        <span>City: {merchant.city}</span>
                                    </div>
                                )}
                                {merchant.category && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-neutral-400" />
                                        <span>Category: {merchant.category}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h5 className="font-medium text-neutral-700 mb-2">Status Information</h5>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium">Status: </span>
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        merchant.status === 'APPROVED' && "bg-green-100 text-green-800",
                                        merchant.status === 'PENDING' && "bg-amber-100 text-amber-800",
                                        merchant.status === 'REJECTED' && "bg-red-100 text-red-800",
                                        merchant.status === 'SUSPENDED' && "bg-orange-100 text-orange-800"
                                    )}>
                                        {merchant.status}
                                    </span>
                                </div>
                                {merchant.rejectionReason && (
                                    <div>
                                        <span className="font-medium">Rejection Reason: </span>
                                        <span className="text-neutral-600">{merchant.rejectionReason}</span>
                                    </div>
                                )}
                                {merchant.suspendedUntil && (
                                    <div>
                                        <span className="font-medium">Suspended Until: </span>
                                        <span className="text-neutral-600">{new Date(merchant.suspendedUntil).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {merchant.suspendedReason && (
                                    <div>
                                        <span className="font-medium">Suspension Reason: </span>
                                        <span className="text-neutral-600">{merchant.suspendedReason}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {merchant.description && (
                        <div>
                            <h5 className="font-medium text-neutral-700 mb-2">Description</h5>
                            <p className="text-sm text-neutral-600">{merchant.description}</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

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
    queryFn: () => apiGet<{ merchants: MerchantApplication[] }>(`/admin/merchants`).then(res => res.data?.merchants || []),
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

    const topCities = Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return { pendingCount, approvedCount, rejectedCount, suspendedCount, topCities };
  }, [allMerchants]);

  const filteredMerchants = useMemo(() => {
    let filtered = allMerchants.filter(m => m.status === activeTab);
    
    if (searchTerm) {
      filtered = filtered.filter(merchant => 
        merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        merchant.owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (merchant.city && merchant.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (merchant.category && merchant.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [allMerchants, activeTab, searchTerm]);

  const mutationOptions = {
      onSuccess: () => {
          toast({ title: "Success", description: "Merchant status updated." });
          queryClient.invalidateQueries({ queryKey: ['admin-merchants'] });
      },
      onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: 'destructive' });
      }
  };

  const approveMutation = useMutation({
      mutationFn: (merchantId: number) => apiPost(`/admin/merchants/${merchantId}/approve`, {}),
      ...mutationOptions
  });

  const rejectMutation = useMutation({
      mutationFn: ({ merchantId, reason }: { merchantId: number, reason: string }) => apiPost(`/admin/merchants/${merchantId}/reject`, { reason }),
      ...mutationOptions,
      onSettled: () => setMerchantToReject(null)
  });

  const suspendMutation = useMutation({
      mutationFn: ({ merchantId, reason, days }: { merchantId: number, reason: string, days: number }) => 
          apiPost(`/admin/merchants/${merchantId}/suspend`, { reason, days }),
      ...mutationOptions,
      onSettled: () => setMerchantToSuspend(null)
  });

  const unsuspendMutation = useMutation({
      mutationFn: (merchantId: number) => apiPost(`/admin/merchants/${merchantId}/unsuspend`, {}),
      ...mutationOptions
  });

  return (
    <div>
        <h1 className="text-3xl pt-12 font-bold text-neutral-900">Merchant Approval</h1>
        <p className="text-neutral-600 mt-1">Review and manage new merchant applications.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 mt-6">
            <StatCard 
                title="Pending Approvals" 
                value={isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : stats.pendingCount}
                icon={<Clock className="h-6 w-6" />}
                color="amber"
            />
            <StatCard 
                title="Total Approved" 
                value={isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : stats.approvedCount}
                icon={<CheckCircle className="h-6 w-6" />} 
                color="green"
            />
            <StatCard 
                title="Total Rejected" 
                value={isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : stats.rejectedCount}
                icon={<XCircle className="h-6 w-6" />} 
                color="red"
            />
            <StatCard 
                title="Suspended" 
                value={isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : stats.suspendedCount}
                icon={<Pause className="h-6 w-6" />} 
                color="amber"
            />
             <div className="bg-white p-5 rounded-lg border shadow-sm">
                <p className="text-sm font-medium text-neutral-500">Top Cities</p>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mt-2"/> : (
                    <div className="mt-2 space-y-1">
                        {stats.topCities.map(city => (
                            <div key={city.name} className="flex justify-between items-baseline">
                                <p className="font-semibold text-neutral-800">{city.name}</p>
                                <p className="text-sm text-neutral-500">{city.count} merchants</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="border-b">
                {(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={cn("px-4 py-2 font-semibold border-b-2", activeTab === status ? "border-brand-primary-500 text-brand-primary-600" : "border-transparent text-neutral-500 hover:border-neutral-300")}
                >{status}</button>
            ))}
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                    type="text"
                    placeholder="Search merchants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                />
            </div>
        </div>

        <div className="mt-6">
            {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
            {!isLoading && filteredMerchants.length === 0 && <p className="text-center text-neutral-500 py-12">No merchants found with status "{activeTab}".</p>}
            
            <div className="space-y-4">
                {filteredMerchants.map(merchant => (
                    <div key={merchant.id} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <MerchantLogo src={merchant.logoUrl} name={merchant.businessName} size="lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-lg text-neutral-800 flex items-center gap-2 truncate">
                                        <Building className="h-5 w-5 text-neutral-400" /> 
                                        {merchant.businessName}
                                    </p>
                                    {merchant.status === 'APPROVED' && (
                                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100">Premium</span>
                                    )}
                                </div>
                                <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1 truncate">
                                    <Mail className="h-4 w-4 text-neutral-400" />
                                    {merchant.owner.email}
                                </p>
                                
                                <div className="flex flex-wrap gap-4 mt-2 text-xs text-neutral-500">
                                    {merchant.city && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{merchant.city}</span>
                                        </div>
                                    )}
                                    {merchant.category && (
                                        <div className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            <span>{merchant.category}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Applied: {new Date(merchant.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                {merchant.description && (
                                    <p className="text-sm text-neutral-600 mt-2 max-w-xl line-clamp-2">{merchant.description}</p>
                                )}
                                
                                {merchant.rejectionReason && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                        <span className="font-medium text-red-800">Rejection Reason: </span>
                                        <span className="text-red-700">{merchant.rejectionReason}</span>
                                    </div>
                                )}
                                
                                {merchant.suspendedUntil && (
                                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                        <span className="font-medium text-orange-800">Suspended until: </span>
                                        <span className="text-orange-700">{new Date(merchant.suspendedUntil).toLocaleDateString()}</span>
                                        {merchant.suspendedReason && (
                                            <div className="mt-1">
                                                <span className="font-medium text-orange-800">Reason: </span>
                                                <span className="text-orange-700">{merchant.suspendedReason}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => setSelectedMerchant(merchant)}
                                className="w-full sm:w-auto"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                            </Button>
                            
                        {activeTab === 'PENDING' && (
                                <>
                                <Button size="sm" className="bg-destructive text-destructive-foreground w-full sm:w-auto" onClick={() => setMerchantToReject(merchant)}>Reject</Button>
                                <Button size="sm" className="bg-status-live text-white w-full sm:w-auto" onClick={() => approveMutation.mutate(merchant.id)}>Approve</Button>
                                </>
                            )}
                            
                            {activeTab === 'REJECTED' && (
                                <Button size="sm" className="bg-green-600 text-white w-full sm:w-auto" onClick={() => approveMutation.mutate(merchant.id)}>
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Approve
                                </Button>
                            )}
                            
                            {activeTab === 'APPROVED' && (
                                <Button size="sm" className="bg-amber-600 text-white w-full sm:w-auto" onClick={() => setMerchantToSuspend(merchant)}>
                                    <Pause className="h-4 w-4 mr-1" />
                                    Suspend
                                </Button>
                            )}
                            
                            {activeTab === 'SUSPENDED' && (
                                <Button size="sm" className="bg-green-600 text-white w-full sm:w-auto" onClick={() => unsuspendMutation.mutate(merchant.id)}>
                                    <Play className="h-4 w-4 mr-1" />
                                    Unsuspend
                                </Button>
                            )}
                            </div>
                    </div>
                ))}
            </div>
        </div>

        <AnimatePresence>
            {merchantToReject && (
                <RejectionModal
                    merchant={merchantToReject}
                    onClose={() => setMerchantToReject(null)}
                    onConfirm={(reason: string) => rejectMutation.mutate({ merchantId: merchantToReject.id, reason })}
                />
            )}
            {merchantToSuspend && (
                <SuspensionModal
                    merchant={merchantToSuspend}
                    onClose={() => setMerchantToSuspend(null)}
                    onConfirm={({ reason, days }: { reason: string, days: number }) => 
                        suspendMutation.mutate({ merchantId: merchantToSuspend.id, reason, days })
                    }
                />
            )}
            {selectedMerchant && (
                <MerchantDetailsModal
                    merchant={selectedMerchant}
                    onClose={() => setSelectedMerchant(null)}
                />
            )}
        </AnimatePresence>
    </div>
  );
};

export default MerchantApprovalDashboard;

// web/src/pages/admin/MerchantApprovalDashboard.tsx
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/services/api';
import { Button } from '@/components/common/Button';
import { Loader2, Building, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const MerchantAvatar = ({ src, name }: { src?: string | null; name?: string | null }) => {
    const [errored, setErrored] = useState(false);
    const onError = useCallback(() => setErrored(true), []);

    if (!src || errored) {
        return (
            <Avatar className="h-14 w-14 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                <AvatarFallback>{name?.charAt(0) || 'M'}</AvatarFallback>
            </Avatar>
        );
    }

    return (
        <Avatar className="h-14 w-14 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
            <AvatarImage src={src} alt={name || 'Merchant logo'} onError={onError} />
        </Avatar>
    );
};

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  owner: MerchantOwner;
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

export const MerchantApprovalDashboard = () => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [merchantToReject, setMerchantToReject] = useState<MerchantApplication | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-merchants', activeTab],
    queryFn: () => apiGet<{ merchants: MerchantApplication[] }>(`/admin/merchants?status=${activeTab}`).then(res => res.data?.merchants || []),
  });

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

  return (
    <div>
        <h1 className="text-3xl pt-12 font-bold text-neutral-900">Merchant Approval</h1>
        <p className="text-neutral-600 mt-1">Review and manage new merchant applications.</p>

        <div className="border-b mt-6">
            {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={cn("px-4 py-2 font-semibold border-b-2", activeTab === status ? "border-brand-primary-500 text-brand-primary-600" : "border-transparent text-neutral-500 hover:border-neutral-300")}
                >{status}</button>
            ))}
        </div>

        <div className="mt-6">
            {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
            {!isLoading && data?.length === 0 && <p className="text-center text-neutral-500 py-12">No merchants found with status "{activeTab}".</p>}
            
            <div className="space-y-4">
                {data?.map(merchant => (
                    <div key={merchant.id} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <MerchantAvatar src={merchant.logoUrl} name={merchant.businessName} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-lg text-neutral-800 flex items-center gap-2 truncate"><Building className="h-5 w-5 text-neutral-400" /> {merchant.businessName}</p>
                                    {merchant.status === 'APPROVED' && (
                                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100">Premium</span>
                                    )}
                                </div>
                                <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1 truncate"><Mail className="h-4 w-4 text-neutral-400" />{merchant.owner.email}</p>
                                {merchant.description && <p className="text-sm text-neutral-600 mt-2 max-w-xl line-clamp-2">{merchant.description}</p>}
                                <p className="text-xs text-neutral-400 mt-2">Applied on: {new Date(merchant.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {activeTab === 'PENDING' && (
                            <div className="mt-3 sm:mt-0 flex gap-2">
                                <Button size="sm" className="bg-destructive text-destructive-foreground w-full sm:w-auto" onClick={() => setMerchantToReject(merchant)}>Reject</Button>
                                <Button size="sm" className="bg-status-live text-white w-full sm:w-auto" onClick={() => approveMutation.mutate(merchant.id)}>Approve</Button>
                            </div>
                        )}
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
        </AnimatePresence>
    </div>
  );
};

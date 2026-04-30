import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Check, Edit3, MapPin, Store, X } from 'lucide-react';
import { useMerchantStatus, useUpdateBusinessType } from '@/hooks/useBusinessType';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { merchantPanelClass } from '@/components/merchant/MerchantAppleUI';

export const BusinessTypeCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState<'NATIONAL' | 'LOCAL' | ''>('');

  const { data: merchantData, isLoading } = useMerchantStatus();
  const updateBusinessType = useUpdateBusinessType();

  const merchant = merchantData?.merchant;

  const handleEdit = () => {
    setSelectedType(merchant?.businessType || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedType) {
      toast.error('Please select a business type');
      return;
    }

    try {
      await updateBusinessType.mutateAsync({ businessType: selectedType });
      toast.success('Business type updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update business type');
    }
  };

  const handleCancel = () => {
    setSelectedType('');
    setIsEditing(false);
  };

  const getBusinessTypeTone = (type: 'NATIONAL' | 'LOCAL') =>
    type === 'NATIONAL'
      ? 'bg-blue-50 text-blue-700 border-blue-100'
      : 'bg-green-50 text-green-700 border-green-100';

  const getBusinessTypeLabel = (type: 'NATIONAL' | 'LOCAL') =>
    type === 'NATIONAL' ? 'National chain' : 'Local business';

  const getBusinessTypeIcon = (type: 'NATIONAL' | 'LOCAL') =>
    type === 'NATIONAL' ? Building2 : Store;

  if (isLoading) {
    return (
      <section className={merchantPanelClass}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-36 rounded bg-neutral-200" />
          <div className="h-4 w-64 rounded bg-neutral-200" />
          <div className="h-14 w-full rounded-[1rem] bg-neutral-100" />
        </div>
      </section>
    );
  }

  if (!merchant) {
    return null;
  }

  const BusinessTypeIcon = getBusinessTypeIcon(merchant.businessType);

  return (
    <section className={merchantPanelClass}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-neutral-100 text-neutral-800">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">Business Type</h3>
              <p className="mt-1 text-[13px] text-neutral-600">
                Your business classification for better targeting and analytics.
              </p>
            </div>
          </div>

          {!isEditing ? (
            <div className="mt-5 flex flex-col gap-4 rounded-[1.1rem] border border-neutral-200/80 bg-neutral-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-white text-neutral-800 shadow-sm">
                  <BusinessTypeIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold text-neutral-900">{merchant.businessName}</div>
                  <div className="mt-1 text-[13px] text-neutral-600">{getBusinessTypeLabel(merchant.businessType)}</div>
                  {merchant.address ? (
                    <div className="mt-3 flex items-start gap-2 text-[13px] text-neutral-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{merchant.address}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                <Badge className={cn('border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]', getBusinessTypeTone(merchant.businessType))}>
                  {merchant.businessType}
                </Badge>
                <Button variant="outline" size="icon" onClick={handleEdit} className="rounded-[0.9rem]">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4 rounded-[1.1rem] border border-neutral-200/80 bg-neutral-50/60 p-4">
              <div>
                <label className="mb-2 block text-[13px] font-medium text-neutral-700">
                  Select business type
                </label>
                <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'NATIONAL' | 'LOCAL')}>
                  <SelectTrigger className="rounded-[0.95rem] border-neutral-200 bg-white">
                    <SelectValue placeholder="Choose business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL">Local Business</SelectItem>
                    <SelectItem value="NATIONAL">National Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateBusinessType.isPending}
                  className="rounded-[0.9rem]"
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  {updateBusinessType.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateBusinessType.isPending}
                  className="rounded-[0.9rem]"
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

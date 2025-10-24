import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Edit3, Check, X } from 'lucide-react';
import { useMerchantStatus, useUpdateBusinessType } from '@/hooks/useBusinessType';
import { toast } from 'sonner';

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

  const getBusinessTypeColor = (type: 'NATIONAL' | 'LOCAL') => {
    return type === 'NATIONAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getBusinessTypeIcon = (type: 'NATIONAL' | 'LOCAL') => {
    return type === 'NATIONAL' ? '🏢' : '🏪';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!merchant) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Type
        </CardTitle>
        <CardDescription>
          Your business classification for better targeting and analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getBusinessTypeIcon(merchant.businessType)}</span>
                <div>
                  <p className="font-medium text-neutral-800">
                    {merchant.businessName}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {merchant.businessType === 'NATIONAL' ? 'National Chain' : 'Local Business'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getBusinessTypeColor(merchant.businessType)}>
                  {merchant.businessType}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {merchant.address && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <MapPin className="h-4 w-4" />
                <span>{merchant.address}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Select Business Type
              </label>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'NATIONAL' | 'LOCAL')}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOCAL">
                    <div className="flex items-center gap-2">
                      <span>🏪</span>
                      <div>
                        <div className="font-medium">Local Business</div>
                        <div className="text-xs text-neutral-500">Independent, single-location business</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="NATIONAL">
                    <div className="flex items-center gap-2">
                      <span>🏢</span>
                      <div>
                        <div className="font-medium">National Chain</div>
                        <div className="text-xs text-neutral-500">Multi-location business or franchise</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateBusinessType.isPending}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                {updateBusinessType.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={updateBusinessType.isPending}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

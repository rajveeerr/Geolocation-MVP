import { useParams, useNavigate } from 'react-router-dom';
import { useDealDetail } from '@/hooks/useDealDetail';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DealEditPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: deal, isLoading, error } = useDealDetail(dealId || '');

  if (isLoading) {
    return <LoadingOverlay message="Loading deal..." />;
  }

  if (error || !deal) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Deal Not Found</h2>
          <p className="text-red-700 mb-6">
            We couldn't find the deal you're trying to edit.
          </p>
          <Button onClick={() => navigate('/merchant/deals')} variant="outline">
            Back to My Deals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          onClick={() => navigate('/merchant/deals')}
          variant="ghost"
          size="sm"
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Edit Deal</h1>
          <p className="text-neutral-600 mt-1">{deal.title}</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-2">Edit Feature Coming Soon</h3>
            <p className="text-sm text-amber-800">
              Deal editing functionality is currently under development. For now, you can view your deal details below.
              To make changes, please create a new deal or contact support.
            </p>
          </div>
        </div>
      </div>

      {/* Deal Details Preview */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Deal Details</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-600">Title</label>
            <p className="text-neutral-900 mt-1">{deal.title}</p>
          </div>
          {deal.description && (
            <div>
              <label className="text-sm font-medium text-neutral-600">Description</label>
              <p className="text-neutral-900 mt-1">{deal.description}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-neutral-600">Deal Type</label>
            <p className="text-neutral-900 mt-1">
              {typeof deal.dealType === 'string' ? deal.dealType : deal.dealType?.name || 'Standard'}
            </p>
          </div>
          {deal.recurringDays && deal.recurringDays.length > 0 && (
            <div>
              <label className="text-sm font-medium text-neutral-600">Active Days</label>
              <p className="text-neutral-900 mt-1">{deal.recurringDays.join(', ')}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-neutral-600">Status</label>
            <p className="text-neutral-900 mt-1">
              {deal.status.isActive ? 'Active' : deal.status.isExpired ? 'Expired' : 'Upcoming'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <Button
          onClick={() => navigate('/merchant/deals')}
          variant="outline"
        >
          Back to My Deals
        </Button>
        <Button
          onClick={() => navigate('/merchant/deals/create')}
          className="bg-brand-primary-600 hover:bg-brand-primary-700"
        >
          <Edit className="mr-2 h-4 w-4" />
          Create New Deal
        </Button>
      </div>
    </div>
  );
};

export default DealEditPage;


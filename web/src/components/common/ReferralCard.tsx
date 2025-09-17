import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Copy, Check, Share2, Users, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralCardProps {
  code: string;
  count: number;
}

export const ReferralCard = ({ code, count }: ReferralCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/signup?ref=${code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: 'Code Copied!' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Join me on CitySpark!',
          text: `Find the best local deals on CitySpark. Use my code ${code} when you sign up!`,
          url: referralLink,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Link Copied!',
        description:
          'Sharing is not supported on your browser, but the invite link is on your clipboard.',
      });
    }
  };

  return (
    <div className="w-full space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Top Section: The Code */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-100/80">
          <Gift className="h-8 w-8 text-brand-primary-600" />
        </div>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Your Unique Referral Code
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-100 px-6 py-3 text-4xl font-bold tracking-widest text-brand-primary-700">
            {code}
          </div>
          <Button
            onClick={handleCopyCode}
            variant="secondary"
            size="md"
            className="h-16 w-16 rounded-xl border-neutral-300"
          >
            {copied ? (
              <Check className="text-status-live h-6 w-6" />
            ) : (
              <Copy className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Action Button */}
      <Button onClick={handleShare} size="lg" className="w-full">
        <Share2 className="mr-2 h-5 w-5" />
        Share Your Link
      </Button>

      <div className="border-t border-neutral-200 pt-6">
        <div className="flex items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-neutral-800">{count}</p>
            <p className="-mt-1 text-sm text-neutral-500">
              Friends have joined!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

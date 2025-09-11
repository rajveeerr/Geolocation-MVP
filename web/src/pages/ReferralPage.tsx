import { useState } from 'react';
import { useReferrals } from '@/hooks/useReferrals';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { Copy, Check, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ReferralPage = () => {
  const { data: referralData, isLoading, error } = useReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!referralData?.referralCode) return;
    navigator.clipboard.writeText(referralData.referralCode);
    setCopied(true);
    toast({ title: 'Code Copied!' });
    setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
  };

  const handleShare = async () => {
    if (!referralData?.referralCode) return;
    const shareUrl = `${window.location.origin}/signup?ref=${referralData.referralCode}`;
    const sharePayload = {
      title: 'Join me on LocalDeals',
      text: `Use my code ${referralData.referralCode} to sign up and earn rewards!`,
      url: shareUrl,
    };

  if ('share' in navigator && typeof (navigator as any).share === 'function') {
      try {
        // Use native share on supporting devices
        const nav: any = navigator;
        await nav.share(sharePayload);
      } catch {
        // share cancelled or failed — silently ignore
      }
      return;
    }

    // Fallback: copy the signup link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Referral link copied to clipboard' });
    } catch {
      toast({ title: 'Could not copy link. Try manually sharing.' });
    }
  };


  if (isLoading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !referralData) {
    return <div className="text-center py-20 text-red-600">Could not load your referral information.</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900">Invite Friends, Earn Rewards</h2>
        <p className="mt-2 text-neutral-600 max-w-md mx-auto">
          Share your unique code with friends. When they sign up, you'll earn bonus points and climb the leaderboard faster!
        </p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Your Unique Referral Code</p>
        <div className="mt-2 flex justify-center items-center gap-3">
          <div className="text-4xl font-bold text-brand-primary-600 tracking-widest bg-neutral-100 border-2 border-dashed border-neutral-200 rounded-xl px-6 py-3">
            {referralData.referralCode}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleShare} variant="secondary" size="lg" className="h-16 w-16 rounded-xl" aria-label="Share referral">
              <Share2 className="h-6 w-6" />
            </Button>
            <Button onClick={handleCopyCode} variant="secondary" size="lg" className="h-16 w-16 rounded-xl" aria-label="Copy referral code">
              {copied ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Referral count */}
      <div className="mt-12 border-t pt-8">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3zM8 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zM16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.99 1.97 3.45v2h6v-2c0-2.66-5.33-4-7-4z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-800">{referralData.referralCount}</p>
            <p className="text-sm text-neutral-500">Friends Joined</p>
          </div>
        </div>
      </div>
    </div>
  );
};

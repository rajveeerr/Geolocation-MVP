// web/src/components/deals/CheckInModal.tsx
import { useState } from 'react';
import { X, CheckCircle, Gift, Copy, ArrowRight } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';
import { useHappyHourTimer } from '@/hooks/useHappyHourTimer';
import type { DetailedDeal } from '@/hooks/useDealDetail';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DetailedDeal;
  pointsEarned: number;
  onCheckOut?: () => void;
}

export const CheckInModal = ({ isOpen, onClose, deal, pointsEarned, onCheckOut }: CheckInModalProps) => {
  const { toast } = useToast();
  const { data: referrals } = useReferrals();
  const [copied, setCopied] = useState(false);
  
  const referralCode = referrals?.referralCode || '';
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
  const referredCount = referrals?.referralCount || 0;
  const referredUsers = referrals?.referredUsers || [];
  
  // Happy Hour timer
  const happyHourTimer = useHappyHourTimer(deal.context?.isHappyHour ? deal as any : null);
  const showHappyHourTimer = deal.context?.isHappyHour && deal.status?.isActive;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: 'Link Copied!',
      description: 'Referral link copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Check out ${deal.merchant.businessName} on Yohop!`,
        text: `I just checked in at ${deal.merchant.businessName}! Join me and earn rewards. Use my code ${referralCode} when you sign up!`,
        url: referralLink,
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-3xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto text-white relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Check-In Confirmation */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">You're Checked In!</h2>
          <p className="text-xl text-green-400 font-semibold">+{pointsEarned} coins earned</p>
        </div>

        {/* Happy Hour Timer */}
        {showHappyHourTimer && (
          <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-2xl p-6 mb-6">
            <p className="text-sm font-semibold mb-2 text-center">Happy Hour Ends In</p>
            <div className="text-4xl font-bold text-center">
              {String(happyHourTimer.hours).padStart(2, '0')}h{' '}
              {String(happyHourTimer.minutes).padStart(2, '0')}m
            </div>
          </div>
        )}

        {/* Share with Friends Section */}
        <div className="bg-neutral-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="h-6 w-6 text-yellow-400" />
            <h3 className="text-xl font-bold">Share with Friends</h3>
          </div>
          <p className="text-sm text-neutral-300 mb-4">
            Copy your referral link now! Invite 3 friends to check in before the clock runs out and you both get FREE rewards!
          </p>

          {/* Your Invites */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Your invites</span>
              <span className="text-sm font-bold text-yellow-400">{referredCount}</span>
            </div>
            <div className="flex items-center gap-2">
              {referredUsers.slice(0, 4).map((user, idx) => (
                <div
                  key={user.id || idx}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 bg-neutral-700 border-neutral-600 text-neutral-300"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}</span>
                  )}
                </div>
              ))}
              {referredCount > 4 && (
                <div className="w-12 h-12 rounded-full bg-neutral-700 border-2 border-neutral-600 flex items-center justify-center text-sm font-semibold">
                  +{referredCount - 4}
                </div>
              )}
            </div>
          </div>

          {/* Maximum Cash Reward */}
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-4">
            <div className="text-3xl font-bold text-yellow-400 mb-1">${(referredCount * 10).toFixed(0)}</div>
            <div className="text-sm text-neutral-300">Maximum Cash Reward</div>
            <div className="text-xs text-neutral-400 mt-1">$10 per friend</div>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Your referral link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-neutral-700 text-white rounded-lg px-4 py-2 text-sm border border-neutral-600"
              />
              <button
                onClick={handleCopyLink}
                className={cn(
                  'px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2',
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-neutral-600 text-white hover:bg-neutral-500'
                )}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-4 font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            Share Link
            <ArrowRight className="h-5 w-5" />
          </button>
          {onCheckOut && (
            <button
              onClick={onCheckOut}
              className="flex-1 bg-neutral-700 text-white rounded-xl px-6 py-4 font-semibold hover:bg-neutral-600 transition-colors"
            >
              Check Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


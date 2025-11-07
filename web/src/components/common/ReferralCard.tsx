import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Copy, Check, Share2, Users, Gift, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { ReferredUser } from '@/hooks/useReferrals';

interface ReferralCardProps {
  code: string;
  count: number;
  referredUsers?: ReferredUser[];
}

export const ReferralCard = ({ code, count, referredUsers = [] }: ReferralCardProps) => {
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
          title: 'Join me on Yohop!',
          text: `Find the best local deals on Yohop. Use my code ${code} when you sign up!`,
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
        <div className="flex items-center justify-center gap-4 mb-4">
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

        {/* Referred Users List */}
        {referredUsers.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Referred Friends</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {referredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {user.name || user.email}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>{user.points.toLocaleString()} points</span>
                      <span>•</span>
                      <span>Joined {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {referredUsers.length === 0 && count === 0 && (
          <div className="text-center py-4">
            <User className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">
              No friends have joined yet. Share your code to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

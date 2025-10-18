import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Mail, 
  Copy,
  Check,
  X
} from 'lucide-react';
import { useShareDeal } from '@/hooks/useDealSharing';
import { toast } from 'sonner';

interface DealSharingProps {
  dealId: number;
  dealTitle: string;
  dealUrl: string;
  className?: string;
}

export const DealSharing = ({ dealId, dealTitle, dealUrl, className }: DealSharingProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const shareDealMutation = useShareDeal();

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5 text-blue-400" />,
      color: 'bg-blue-400 hover:bg-blue-500',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5 text-green-600" />,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-5 w-5 text-gray-600" />,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      id: 'copy_link',
      name: 'Copy Link',
      icon: <Copy className="h-5 w-5 text-gray-600" />,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  const handleShare = async (platform: string) => {
    if (platform === 'copy_link') {
      await navigator.clipboard.writeText(dealUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard');
      return;
    }

    if (platform === 'email' && !recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    try {
      const result = await shareDealMutation.mutateAsync({
        dealId,
        platform: platform as any,
        message: customMessage || `Check out this amazing deal: ${dealTitle}`,
        recipientEmail: platform === 'email' ? recipientEmail : undefined,
      });

      if (result.success) {
        toast.success('Deal shared successfully');
        setIsDialogOpen(false);
        setCustomMessage('');
        setRecipientEmail('');
        setSelectedPlatform('');
      }
    } catch (error) {
      toast.error('Failed to share deal');
    }
  };

  const openDialog = () => {
    setIsDialogOpen(true);
    setSelectedPlatform('');
    setCustomMessage('');
    setRecipientEmail('');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openDialog}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Deal</DialogTitle>
            <DialogDescription>
              Share "{dealTitle}" with your friends and family
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-3">
              <Label>Choose Platform</Label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      selectedPlatform === platform.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPlatform(platform.id)}
                  >
                    {platform.icon}
                    <span className="text-sm">{platform.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            {selectedPlatform && selectedPlatform !== 'copy_link' && (
              <div className="space-y-2">
                <Label htmlFor="message">Custom Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Check out this amazing deal: ${dealTitle}`}
                  rows={3}
                />
              </div>
            )}

            {/* Email Recipient */}
            {selectedPlatform === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleShare(selectedPlatform)}
                disabled={!selectedPlatform || shareDealMutation.isPending}
                className="flex-1"
              >
                {shareDealMutation.isPending ? (
                  'Sharing...'
                ) : selectedPlatform === 'copy_link' ? (
                  copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )
                ) : (
                  `Share on ${platforms.find(p => p.id === selectedPlatform)?.name}`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

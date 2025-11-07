// web/src/components/merchant/create-deal/DealHiddenStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { EyeOff, RefreshCw, Copy, Check, Link2, QrCode, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { generateAccessCode } from '@/utils/dealTypeUtils';

export const DealHiddenStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const accessCode = state.accessCode || generateAccessCode();
  const shareableLink = `${window.location.origin}/deals/hidden/${accessCode}`;

  const handleGenerateCode = () => {
    const newCode = generateAccessCode();
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'accessCode',
      value: newCode,
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <OnboardingStepLayout
      title="Create your hidden deal"
      subtitle="Set up an exclusive access code for this special deal"
      onNext={() => navigate('/merchant/deals/create/basics')}
      onBack={() => navigate('/merchant/deals/create/type')}
      isNextDisabled={false}
      progress={20}
    >
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Access Code Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-brand-primary-600" />
            <Label htmlFor="accessCode" className="text-lg font-semibold text-neutral-900">
              Access Code
            </Label>
          </div>
          <p className="text-sm text-neutral-600">
            Create a unique code that customers will need to access this deal. Leave empty to auto-generate.
          </p>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                id="accessCode"
                type="text"
                value={state.accessCode || accessCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  dispatch({
                    type: 'UPDATE_FIELD',
                    field: 'accessCode',
                    value: value || null,
                  });
                }}
                placeholder="e.g., SECRET123"
                maxLength={20}
                className="h-12 text-lg font-mono tracking-wider text-center"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleGenerateCode}
              className="h-12 px-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700">
                The access code will be used to create a shareable link. Customers can use this code or the direct link to access your hidden deal.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Shareable Link Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-neutral-200 bg-gradient-to-r from-white to-neutral-50 p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Shareable Link</h3>
              <p className="text-sm text-neutral-600">Share this link with your customers</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={shareableLink}
                readOnly
                className="h-12 text-sm font-mono bg-neutral-50"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="h-12 px-4"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-600">
                💡 <strong>Tip:</strong> Share this link via email, SMS, social media, or print it on flyers. Only customers with this link can see your deal.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Menu Items Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">Menu Items Auto-Hidden</h4>
              <p className="text-sm text-amber-700 mt-1">
                All menu items in hidden deals are automatically hidden from public view. They will only be visible to customers who access the deal using the access code or shareable link.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Optional Bounty Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        >
          <div className="flex items-start gap-3">
            <QrCode className="h-5 w-5 text-neutral-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-neutral-900">Optional: Add Bounty Rewards</h4>
              <p className="text-sm text-neutral-600 mt-1">
                You can optionally add bounty rewards to hidden deals. Customers who bring friends will earn cash back. You can configure this in the advanced settings.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </OnboardingStepLayout>
  );
};


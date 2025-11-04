import React, { useState } from 'react';
import { Button } from '../common/Button';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useCoinPackages, useCreatePaymentOrder } from '../../hooks/useGamification';
import { Coins, Zap, Star, Crown, Diamond } from 'lucide-react';
import type { CoinPackage } from '../../types/gamification';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CoinPurchase: React.FC = () => {
  const { data: packages, isLoading } = useCoinPackages();
  const createOrder = useCreatePaymentOrder();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [processingPackage, setProcessingPackage] = useState<number | null>(null);

  const getPackageIcon = (coins: number) => {
    if (coins >= 5000) return <Diamond className="h-6 w-6 text-blue-600" />;
    if (coins >= 2500) return <Crown className="h-6 w-6 text-purple-600" />;
    if (coins >= 1000) return <Star className="h-6 w-6 text-amber-600" />;
    if (coins >= 500) return <Zap className="h-6 w-6 text-orange-600" />;
    return <Coins className="h-6 w-6 text-green-600" />;
  };

  const getPackageIconBg = (coins: number) => {
    if (coins >= 5000) return 'bg-blue-100';
    if (coins >= 2500) return 'bg-purple-100';
    if (coins >= 1000) return 'bg-amber-100';
    if (coins >= 500) return 'bg-orange-100';
    return 'bg-green-100';
  };

  const getBestValuePackage = (packages: CoinPackage[]) => {
    // Calculate value as coins per dollar
    let bestValue = 0;
    let bestIndex = -1;
    
    packages.forEach((pkg, index) => {
      const value = pkg.coins / pkg.price;
      if (value > bestValue) {
        bestValue = value;
        bestIndex = index;
      }
    });
    
    return bestIndex;
  };

  const handlePurchase = async (packageIndex: number) => {
    try {
      setProcessingPackage(packageIndex);
      const result = await createOrder.mutateAsync(packageIndex);
      if (result.success && result.data?.approvalUrl) {
        setSelectedPackage(packageIndex);
        // PayPal will handle the redirect
        window.location.href = result.data.approvalUrl;
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPackage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="text-center text-neutral-600">
          <p>No coin packages available at the moment.</p>
        </div>
      </div>
    );
  }

  const bestValueIndex = getBestValuePackage(packages);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const hasPayPalConfig = paypalClientId && paypalClientId.trim() !== '';

  const content = (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Coins className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Purchase Coins</h2>
          </div>
          <p className="text-neutral-600">
            Buy coins to unlock special deals, rewards, and exclusive offers. 
            Choose the package that works best for you!
          </p>
        </div>

        {!hasPayPalConfig && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              PayPal is not configured. Please set VITE_PAYPAL_CLIENT_ID in your environment variables.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md",
                selectedPackage === index && 'ring-2 ring-brand-primary-500'
              )}
            >
              {index === bestValueIndex && (
                <div className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                  Best Value
                </div>
              )}
              
              <div className="text-center">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg mx-auto mb-4", getPackageIconBg(pkg.coins))}>
                  {getPackageIcon(pkg.coins)}
                </div>
                
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{pkg.label}</h3>
                
                <div className="text-2xl font-bold text-neutral-900 mb-2">
                  {pkg.coins.toLocaleString()} Coins
                </div>
                
                <div className="text-xl font-semibold text-brand-primary-600 mb-4">
                  ${pkg.price.toFixed(2)}
                </div>
                
                <div className="text-sm text-neutral-600 mb-4">
                  {(pkg.coins / pkg.price).toFixed(0)} coins per $1
                </div>
                
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={() => handlePurchase(index)}
                  disabled={processingPackage === index || !hasPayPalConfig}
                >
                  {processingPackage === index ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Buy ${pkg.coins.toLocaleString()} Coins`
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-center space-y-4">
          <h4 className="text-lg font-semibold text-neutral-900">How it works</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-100">
                <span className="text-brand-primary-600 font-bold">1</span>
              </div>
              <p className="text-neutral-600">Choose your coin package</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-100">
                <span className="text-brand-primary-600 font-bold">2</span>
              </div>
              <p className="text-neutral-600">Pay securely with PayPal</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-100">
                <span className="text-brand-primary-600 font-bold">3</span>
              </div>
              <p className="text-neutral-600">Coins added instantly to your account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Only wrap with PayPalScriptProvider if client ID is configured
  if (hasPayPalConfig) {
    return (
      <PayPalScriptProvider
        options={{
          clientId: paypalClientId,
          currency: import.meta.env.VITE_PAYPAL_CURRENCY || 'USD',
          intent: 'capture',
        }}
      >
        {content}
      </PayPalScriptProvider>
    );
  }

  return content;
};

export default CoinPurchase;
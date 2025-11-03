import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCoinPackages, useCreatePaymentOrder } from '../../hooks/useGamification';
import { Coins, Zap, Star, Crown, Diamond } from 'lucide-react';
import type { CoinPackage } from '../../types/gamification';
import { toast } from 'sonner';

const CoinPurchase: React.FC = () => {
  const { data: packages, isLoading } = useCoinPackages();
  const createOrder = useCreatePaymentOrder();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [processingPackage, setProcessingPackage] = useState<number | null>(null);

  const getPackageIcon = (coins: number) => {
    if (coins >= 5000) return <Diamond className="h-6 w-6 text-blue-500" />;
    if (coins >= 2500) return <Crown className="h-6 w-6 text-purple-500" />;
    if (coins >= 1000) return <Star className="h-6 w-6 text-yellow-500" />;
    if (coins >= 500) return <Zap className="h-6 w-6 text-orange-500" />;
    return <Coins className="h-6 w-6 text-green-500" />;
  };

  const getPackageColor = (coins: number) => {
    if (coins >= 5000) return 'border-blue-500 bg-blue-50';
    if (coins >= 2500) return 'border-purple-500 bg-purple-50';
    if (coins >= 1000) return 'border-yellow-500 bg-yellow-50';
    if (coins >= 500) return 'border-orange-500 bg-orange-50';
    return 'border-green-500 bg-green-50';
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
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No coin packages available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  const bestValueIndex = getBestValuePackage(packages);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const hasPayPalConfig = paypalClientId && paypalClientId.trim() !== '';

  const content = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span>Purchase Coins</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Buy coins to unlock special deals, rewards, and exclusive offers. 
            Choose the package that works best for you!
          </p>

          {!hasPayPalConfig && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                PayPal is not configured. Please set VITE_PAYPAL_CLIENT_ID in your environment variables.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg, index) => (
              <Card
                key={index}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedPackage === index ? 'ring-2 ring-blue-500' : ''
                } ${getPackageColor(pkg.coins)}`}
              >
                {index === bestValueIndex && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    Best Value
                  </Badge>
                )}
                
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getPackageIcon(pkg.coins)}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{pkg.label}</h3>
                  
                  <div className="text-2xl font-bold text-yellow-600 mb-2">
                    {pkg.coins.toLocaleString()} Coins
                  </div>
                  
                  <div className="text-xl font-semibold text-green-600 mb-4">
                    ${pkg.price.toFixed(2)}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    {(pkg.coins / pkg.price).toFixed(0)} coins per $1
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(index)}
                    disabled={processingPackage === index || !hasPayPalConfig}
                  >
                    {processingPackage === index ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Buy ${pkg.coins.toLocaleString()} Coins`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h4 className="font-semibold text-lg">How it works</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="text-gray-600">Choose your coin package</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <p className="text-gray-600">Pay securely with PayPal</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <p className="text-gray-600">Coins added instantly to your account</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
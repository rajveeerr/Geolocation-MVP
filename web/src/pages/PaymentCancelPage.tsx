import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-xl">
              <XCircle className="h-8 w-8 text-red-500" />
              <span>Payment Cancelled</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700 font-medium">Your PayPal payment was cancelled.</p>
              <p className="text-red-600 text-sm mt-1">You can try again anytime.</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={() => navigate(PATHS.GAMIFICATION)} className="w-full">
                Back to Coins
              </Button>
              <Button variant="secondary" onClick={() => navigate(PATHS.HOME)} className="w-full">
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};



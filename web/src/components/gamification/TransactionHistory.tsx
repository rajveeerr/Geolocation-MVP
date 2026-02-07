import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useCoinTransactions } from '../../hooks/useGamification';
import { History, Coins, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CoinTransactionType } from '../../types/gamification';

const TransactionHistory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, error } = useCoinTransactions(currentPage, limit);

  const getTransactionIcon = (type: CoinTransactionType) => {
    switch (type) {
      case 'PURCHASE':
      case 'EARNED':
      case 'BONUS':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'SPENT':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'REFUND':
        return <ArrowUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: CoinTransactionType) => {
    switch (type) {
      case 'PURCHASE':
      case 'EARNED':
      case 'BONUS':
        return 'text-green-600';
      case 'SPENT':
        return 'text-red-600';
      case 'REFUND':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionBadgeColor = (type: CoinTransactionType) => {
    switch (type) {
      case 'PURCHASE':
        return 'bg-blue-100 text-blue-800';
      case 'EARNED':
        return 'bg-green-100 text-green-800';
      case 'SPENT':
        return 'bg-red-100 text-red-800';
      case 'BONUS':
        return 'bg-purple-100 text-purple-800';
      case 'REFUND':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toLocaleString()}`;
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Failed to load transaction history. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No transactions yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Start earning coins by checking into deals or purchase coin packages!
          </p>
        </CardContent>
      </Card>
    );
  }

  const { transactions, pagination } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-blue-500" />
          <span>Coin Transaction History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getTransactionBadgeColor(transaction.type)}>
                      {transaction.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                  {transaction.metadata && (
                    <div className="text-xs text-gray-400 mt-1">
                      Balance: {transaction.balanceBefore.toLocaleString()} → {transaction.balanceAfter.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                  {formatAmount(transaction.amount)} coins
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages} 
              ({pagination.total} total transactions)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={pagination.page >= pagination.pages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
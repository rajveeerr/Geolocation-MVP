/**
 * Heist Item Shop Page
 * Full page for purchasing and managing heist items
 */

import { useState } from 'react';
import { ShoppingBag, Package } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HeistItemShop } from '@/components/heist/HeistItemShop';
import { HeistInventory } from '@/components/heist/HeistInventory';

export const HeistItemShopPage = () => {
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');

  return (
    <>
      <title>Heist Item Shop | Yohop</title>
      <meta name="description" content="Purchase items to enhance your heists and protect yourself from robberies." />
      
      <div className="min-h-screen bg-neutral-50 pt-24">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Heist Item Shop
            </h1>
            <p className="mx-auto max-w-2xl text-neutral-600">
              Purchase powerful items to enhance your heists or protect yourself from robberies.
              Items are purchased with coins and can significantly impact your heist success rate.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'shop' | 'inventory')} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="shop" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Shop
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shop" className="mt-0">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <HeistItemShop
                  onPurchaseSuccess={() => {
                    // Optionally switch to inventory tab after purchase
                    // setActiveTab('inventory');
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="mt-0">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <HeistInventory />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};


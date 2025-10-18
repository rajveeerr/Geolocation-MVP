import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Heart,
  ShoppingBag,
  TrendingUp,
  Users,
  Clock,
  Phone,
  Mail,
  Award,
  Target,
  Zap,
  Gift,
  ChevronRight,
  ExternalLink,
  Filter,
  Search,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data generator for customer details
const generateMockCustomerData = (customerId: string) => {
  const merchants = [
    { id: 1, name: "Tony's Little Star Pizza", category: "Food & Beverage", location: "Downtown" },
    { id: 2, name: "Blue Bottle Coffee", category: "Food & Beverage", location: "Midtown" },
    { id: 3, name: "Equinox Fitness", category: "Health & Fitness", location: "Uptown" },
    { id: 4, name: "Sephora", category: "Beauty & Wellness", location: "Mall District" },
    { id: 5, name: "AMC Theaters", category: "Entertainment", location: "Entertainment District" },
    { id: 6, name: "Nike Store", category: "Retail", location: "Shopping Center" }
  ];

  const deals = [
    { id: 1, title: "Happy Hour Pizza", discount: "30% OFF", value: 25.99, merchantId: 1 },
    { id: 2, title: "Morning Rush Special", discount: "50% OFF", value: 8.50, merchantId: 2 },
    { id: 3, title: "Personal Training Package", discount: "20% OFF", value: 120.00, merchantId: 3 },
    { id: 4, title: "Beauty Bundle", discount: "15% OFF", value: 45.99, merchantId: 4 },
    { id: 5, title: "Movie Night Special", discount: "25% OFF", value: 18.75, merchantId: 5 },
    { id: 6, title: "Sneaker Sale", discount: "40% OFF", value: 89.99, merchantId: 6 }
  ];

  const customerNames = [
    "Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", "Lisa Thompson",
    "James Wilson", "Maria Garcia", "Robert Brown", "Jennifer Davis", "Christopher Lee"
  ];

  const customerEmails = [
    "sarah.j@email.com", "m.chen@email.com", "emily.r@email.com", "david.k@email.com", "lisa.t@email.com",
    "james.w@email.com", "maria.g@email.com", "robert.b@email.com", "jennifer.d@email.com", "chris.l@email.com"
  ];

  const customerIdNum = parseInt(customerId) || 1;
  const name = customerNames[(customerIdNum - 1) % customerNames.length];
  const email = customerEmails[(customerIdNum - 1) % customerEmails.length];

  // Generate check-ins (tap-ins)
  const checkIns = Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => {
    const deal = deals[Math.floor(Math.random() * deals.length)];
    const merchant = merchants.find(m => m.id === deal.merchantId)!;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    return {
      id: i + 1,
      dealId: deal.id,
      dealTitle: deal.title,
      merchantId: merchant.id,
      merchantName: merchant.name,
      merchantCategory: merchant.category,
      location: merchant.location,
      discount: deal.discount,
      value: deal.value,
      checkedInAt: date.toISOString(),
      pointsEarned: Math.floor(Math.random() * 50) + 10,
      status: Math.random() > 0.1 ? 'completed' : 'pending'
    };
  });

  // Generate purchases
  const purchases = checkIns.filter(ci => ci.status === 'completed').map((checkIn, i) => ({
    id: i + 1,
    checkInId: checkIn.id,
    dealTitle: checkIn.dealTitle,
    merchantName: checkIn.merchantName,
    amount: checkIn.value,
    discount: checkIn.discount,
    finalAmount: checkIn.value * (1 - parseFloat(checkIn.discount) / 100),
    purchasedAt: checkIn.checkedInAt,
    paymentMethod: ['Credit Card', 'Debit Card', 'Apple Pay', 'Google Pay'][Math.floor(Math.random() * 4)],
    pointsEarned: checkIn.pointsEarned
  }));

  // Generate saved deals
  const savedDeals = Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, i) => {
    const deal = deals[Math.floor(Math.random() * deals.length)];
    const merchant = merchants.find(m => m.id === deal.merchantId)!;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    return {
      id: i + 1,
      dealId: deal.id,
      dealTitle: deal.title,
      merchantName: merchant.name,
      merchantCategory: merchant.category,
      discount: deal.discount,
      value: deal.value,
      savedAt: date.toISOString(),
      isUsed: Math.random() > 0.3
    };
  });

  // Generate referral activity
  const referrals = Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: i + 1,
      referredEmail: `friend${i + 1}@email.com`,
      referredName: `Friend ${i + 1}`,
      status: Math.random() > 0.3 ? 'completed' : 'pending',
      pointsEarned: 50,
      referredAt: date.toISOString()
    };
  });

  // Calculate stats
  const totalSpent = purchases.reduce((sum, p) => sum + p.finalAmount, 0);
  const totalSaved = purchases.reduce((sum, p) => sum + (p.amount - p.finalAmount), 0);
  const totalPoints = checkIns.reduce((sum, ci) => sum + ci.pointsEarned, 0);
  const favoriteCategory = merchants.reduce((acc, merchant) => {
    const count = checkIns.filter(ci => ci.merchantCategory === merchant.category).length;
    return count > acc.count ? { category: merchant.category, count } : acc;
  }, { category: 'Food & Beverage', count: 0 });

  return {
    id: customerIdNum,
    name,
    email,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalPoints,
    level: Math.floor(totalPoints / 100) + 1,
    stats: {
      totalCheckIns: checkIns.length,
      totalPurchases: purchases.length,
      totalSpent: totalSpent,
      totalSaved: totalSaved,
      totalPoints,
      savedDeals: savedDeals.length,
      referrals: referrals.length,
      favoriteCategory: favoriteCategory.category
    },
    checkIns: checkIns.sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()),
    purchases: purchases.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()),
    savedDeals: savedDeals.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()),
    referrals
  };
};

export const CustomerDetailPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  if (!customerId) {
    return <div>Customer ID not found</div>;
  }

  const customer = generateMockCustomerData(customerId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCheckIns = customer.checkIns.filter(ci => 
    ci.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ci.merchantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPurchases = customer.purchases.filter(p => 
    p.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.merchantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/admin/customers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Customers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
              <p className="text-gray-600">Comprehensive view of customer activity and engagement</p>
            </div>
          </div>
        </div>

        {/* Customer Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                  <AvatarFallback className="text-2xl">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </p>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{customer.stats.totalPoints}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{customer.stats.totalCheckIns}</div>
                  <div className="text-sm text-gray-600">Check-ins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{customer.stats.totalPurchases}</div>
                  <div className="text-sm text-gray-600">Purchases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(customer.stats.totalSpent)}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(customer.stats.totalSaved)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Saved Deals</p>
                  <p className="text-2xl font-bold text-blue-600">{customer.stats.savedDeals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Referrals</p>
                  <p className="text-2xl font-bold text-purple-600">{customer.stats.referrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Favorite Category</p>
                  <p className="text-lg font-bold text-orange-600">{customer.stats.favoriteCategory}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="saved">Saved Deals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customer.checkIns.slice(0, 5).map((checkIn, index) => (
                      <motion.div
                        key={checkIn.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-white"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{checkIn.dealTitle}</p>
                          <p className="text-sm text-gray-600">{checkIn.merchantName}</p>
                          <p className="text-xs text-gray-500">{formatDate(checkIn.checkedInAt)}</p>
                        </div>
                        <Badge className={getStatusColor(checkIn.status)}>
                          {checkIn.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-medium">{formatDate(customer.joinedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active:</span>
                      <span className="font-medium">{formatDate(customer.lastActiveAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <Badge variant="secondary">Level {customer.level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Points:</span>
                      <span className="font-medium text-blue-600">{customer.stats.totalPoints}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referrals */}
            {customer.referrals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Referral Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customer.referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                        <div>
                          <p className="font-medium">{referral.referredName}</p>
                          <p className="text-sm text-gray-600">{referral.referredEmail}</p>
                          <p className="text-xs text-gray-500">{formatDate(referral.referredAt)}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(referral.status)}>
                            {referral.status}
                          </Badge>
                          <p className="text-sm text-green-600 mt-1">+{referral.pointsEarned} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="checkins" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Check-in History</CardTitle>
                <CardDescription>All customer check-ins and tap-ins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCheckIns.map((checkIn, index) => (
                    <motion.div
                      key={checkIn.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{checkIn.dealTitle}</h3>
                        <p className="text-gray-600">{checkIn.merchantName} • {checkIn.merchantCategory}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {checkIn.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(checkIn.checkedInAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(checkIn.status)}>
                          {checkIn.status}
                        </Badge>
                        <p className="text-sm text-blue-600 mt-1">+{checkIn.pointsEarned} pts</p>
                        <p className="text-sm text-gray-600">{checkIn.discount}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>All completed purchases and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPurchases.map((purchase, index) => (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-green-100 rounded-lg">
                        <ShoppingBag className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{purchase.dealTitle}</h3>
                        <p className="text-gray-600">{purchase.merchantName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(purchase.purchasedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {purchase.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(purchase.finalAmount)}</p>
                        <p className="text-sm text-gray-500 line-through">{formatCurrency(purchase.amount)}</p>
                        <p className="text-sm text-blue-600">+{purchase.pointsEarned} pts</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Deals Tab */}
          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Deals</CardTitle>
                <CardDescription>Deals saved by the customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customer.savedDeals.map((deal, index) => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="p-3 bg-red-100 rounded-lg">
                        <Heart className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{deal.dealTitle}</h3>
                        <p className="text-gray-600">{deal.merchantName} • {deal.merchantCategory}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Saved {formatDate(deal.savedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={deal.isUsed ? "default" : "secondary"}>
                          {deal.isUsed ? "Used" : "Available"}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">{deal.discount}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(deal.value)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

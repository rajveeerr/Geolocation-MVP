import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  DollarSign, 
  Clock, 
  Zap, 
  Utensils,
  AlertTriangle,
  Leaf,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { useMenuItems, useMenuCategories } from '@/hooks/useMenuSystem';

interface MenuDisplayProps {
  merchantId?: number;
  className?: string;
}

export const MenuDisplay = ({ merchantId, className }: MenuDisplayProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  // Fetch menu data
  const { data: menuItems, isLoading: isLoadingItems } = useMenuItems({
    merchantId,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    isAvailable: showAvailableOnly ? true : undefined,
    search: searchTerm || undefined,
  });

  const { data: categories, isLoading: isLoadingCategories } = useMenuCategories();

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('appetizer') || categoryLower.includes('starter')) {
      return <Utensils className="h-4 w-4 text-red-800" />;
    }
    if (categoryLower.includes('main') || categoryLower.includes('entree')) {
      return <Utensils className="h-4 w-4 text-red-500" />;
    }
    if (categoryLower.includes('dessert') || categoryLower.includes('sweet')) {
      return <Utensils className="h-4 w-4 text-pink-500" />;
    }
    if (categoryLower.includes('drink') || categoryLower.includes('beverage')) {
      return <Utensils className="h-4 w-4 text-blue-500" />;
    }
    return <Utensils className="h-4 w-4 text-gray-500" />;
  };

  // Get unique categories from menu items
  const availableCategories = Array.from(new Set(menuItems?.map(item => item.category) || []));

  if (isLoadingItems || isLoadingCategories) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h2>
        <p className="text-gray-600">Discover our delicious offerings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showAvailableOnly ? 'default' : 'outline'}
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
          className="w-full sm:w-auto"
        >
          {showAvailableOnly ? 'Available Only' : 'Show All'}
        </Button>
      </div>

      {/* Menu Items */}
      {menuItems && menuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {getCategoryIcon(item.category)}
                      <span className="ml-2">{item.category}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                    </div>
                    {item.preparationTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{item.preparationTime}min</span>
                      </div>
                    )}
                    {item.calories && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-red-800" />
                        <span className="text-sm">{item.calories} cal</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Allergens and Dietary Info */}
                {(item.allergens?.length || item.dietaryInfo?.length) && (
                  <div className="space-y-2">
                    {item.allergens?.length && (
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.map((allergen) => (
                          <Badge key={allergen} variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {item.dietaryInfo?.length && (
                      <div className="flex flex-wrap gap-1">
                        {item.dietaryInfo.map((diet) => (
                          <Badge key={diet} variant="secondary" className="text-xs">
                            <Leaf className="h-3 w-3 mr-1" />
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Ingredients */}
                {item.ingredients?.length && (
                  <div>
                    <p className="text-sm font-medium mb-1">Ingredients:</p>
                    <p className="text-sm text-muted-foreground">
                      {item.ingredients.join(', ')}
                    </p>
                  </div>
                )}

                {/* Merchant Info */}
                {item.merchant && (
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{item.merchant.name}</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.merchant.address}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {item.merchant.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.merchant.email}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No items match "${searchTerm}"`
              : 'No menu items available at the moment'
            }
          </p>
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Clock, 
  Utensils,
  Image,
  AlertTriangle,
  Leaf,
  Zap
} from 'lucide-react';
import { 
  useMerchantMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  type MenuItem,
  type CreateMenuItemRequest,
  type UpdateMenuItemRequest
} from '@/hooks/useMerchantMenuManagement';
import { toast } from 'sonner';

export const MerchantMenuManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch menu items
  const { data: menuItems, isLoading } = useMerchantMenuItems();
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuItemMutation = useUpdateMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();

  // Form state
  const [formData, setFormData] = useState<CreateMenuItemRequest>({
    name: '',
    description: '',
    price: 0,
    category: '',
    isAvailable: true,
    imageUrl: '',
    allergens: [],
    dietaryInfo: [],
    preparationTime: 0,
    calories: 0,
    ingredients: [],
  });

  // Get unique categories
  const categories = Array.from(new Set(menuItems?.map(item => item.category) || []));

  // Filter items by category
  const filteredItems = menuItems?.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  }) || [];

  const handleCreateItem = async () => {
    try {
      await createMenuItemMutation.mutateAsync(formData);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        isAvailable: true,
        imageUrl: '',
        allergens: [],
        dietaryInfo: [],
        preparationTime: 0,
        calories: 0,
        ingredients: [],
      });
      setIsDialogOpen(false);
      toast.success('Menu item created successfully');
    } catch (error) {
      toast.error('Failed to create menu item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      await updateMenuItemMutation.mutateAsync({
        itemId: editingItem.id,
        data: formData,
      });
      setEditingItem(null);
      setIsDialogOpen(false);
      toast.success('Menu item updated successfully');
    } catch (error) {
      toast.error('Failed to update menu item');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItemMutation.mutateAsync(itemId);
        toast.success('Menu item deleted successfully');
      } catch (error) {
        toast.error('Failed to delete menu item');
      }
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl || '',
      allergens: item.allergens || [],
      dietaryInfo: item.dietaryInfo || [],
      preparationTime: item.preparationTime || 0,
      calories: item.calories || 0,
      ingredients: item.ingredients || [],
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      isAvailable: true,
      imageUrl: '',
      allergens: [],
      dietaryInfo: [],
      preparationTime: 0,
      calories: 0,
      ingredients: [],
    });
    setIsDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('appetizer') || categoryLower.includes('starter')) {
      return <Utensils className="h-4 w-4 text-orange-500" />;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Manage your restaurant menu items and categories
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
          className="whitespace-nowrap"
        >
          All Items ({menuItems?.length || 0})
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeTab === category ? 'default' : 'outline'}
            onClick={() => setActiveTab(category)}
            className="whitespace-nowrap"
          >
            {getCategoryIcon(category)}
            <span className="ml-2">{category}</span>
            <span className="ml-2">
              ({menuItems?.filter(item => item.category === category).length || 0})
            </span>
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading menu items...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
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
                      <span className="font-semibold">${item.price.toFixed(2)}</span>
                    </div>
                    {item.preparationTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{item.preparationTime}min</span>
                      </div>
                    )}
                    {item.calories && (
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-orange-500" />
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

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(item)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update menu item information' : 'Create a new menu item for your restaurant'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Grilled Salmon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Main Course"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the dish..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preparationTime">Prep Time (min)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    min="0"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
                <Label htmlFor="isAvailable">Available for ordering</Label>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Ingredients</h3>
              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                <Input
                  id="ingredients"
                  value={formData.ingredients?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    ingredients: e.target.value.split(',').map(ing => ing.trim()).filter(Boolean)
                  })}
                  placeholder="Salmon, Lemon, Herbs, Olive Oil"
                />
              </div>
            </div>

            {/* Allergens and Dietary Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Allergens & Dietary Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="allergens">Allergens (comma-separated)</Label>
                <Input
                  id="allergens"
                  value={formData.allergens?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    allergens: e.target.value.split(',').map(all => all.trim()).filter(Boolean)
                  })}
                  placeholder="Nuts, Dairy, Gluten"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietaryInfo">Dietary Information (comma-separated)</Label>
                <Input
                  id="dietaryInfo"
                  value={formData.dietaryInfo?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    dietaryInfo: e.target.value.split(',').map(diet => diet.trim()).filter(Boolean)
                  })}
                  placeholder="Vegetarian, Vegan, Gluten-Free"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={editingItem ? handleUpdateItem : handleCreateItem}
                className="flex-1"
                disabled={!formData.name || !formData.category || formData.price <= 0}
              >
                {editingItem ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

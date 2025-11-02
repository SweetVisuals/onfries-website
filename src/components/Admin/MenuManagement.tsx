import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Menu as MenuIcon, FileText } from 'lucide-react';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability, MenuItem } from '../../lib/database';
import { useToast } from '@/hooks/use-toast';

const MenuManagement: React.FC = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleAddItem = async (newItemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newItem = await addMenuItem(newItemData);
      setMenuItems(prev => [...prev, newItem]);
      setIsAddDialogOpen(false);
      toast({
        title: 'Success',
        description: `${newItem.name} has been added to the menu`,
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add menu item',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateItem = async (id: string, updatedData: Partial<MenuItem>) => {
    try {
      const updatedItem = await updateMenuItem(id, updatedData);
      setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      setEditingItem(undefined);
      toast({
        title: 'Success',
        description: `${updatedItem.name} has been updated`,
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update menu item',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const item = menuItems.find(item => item.id === id);
      await deleteMenuItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Success',
        description: `${item?.name} has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const updatedItem = await toggleMenuItemAvailability(id, isAvailable);
      setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      toast({
        title: 'Success',
        description: `${updatedItem.name} is now ${isAvailable ? 'available' : 'unavailable'}`,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item availability',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Menu Management</CardTitle>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                </DialogHeader>
                <MenuItemForm onSubmit={handleAddItem} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-lg">Loading menu items...</div>
          </CardContent>
        </Card>
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && setEditingItem(undefined)}>
                        <DialogTrigger asChild>
                          <div onClick={() => setEditingItem(item)} className="cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors">
                            <Edit className="w-4 h-4" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Menu Item</DialogTitle>
                          </DialogHeader>
                          <MenuItemForm
                            initialData={editingItem || undefined}
                            onSubmit={(data) => handleUpdateItem(item.id, data)}
                          />
                        </DialogContent>
                      </Dialog>
                      <div 
                        onClick={() => handleDeleteItem(item.id)}
                        className="cursor-pointer hover:bg-red-500/10 rounded p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 hover:text-red-700" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-foreground">Available:</Label>
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={(checked) => handleToggleAvailability(item.id, checked)}
                        />
                      </div>
                    </div>

                    {item.preparation_time && (
                      <p className="text-xs text-foreground">
                        Prep time: {item.preparation_time} minutes
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <Badge variant={item.is_available ? "default" : "secondary"}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Badge variant="outline">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MenuIcon className="w-16 h-16 text-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-foreground">No menu items found</h3>
            <p className="text-foreground mb-4">
              {selectedCategory === 'All' 
                ? "You haven't added any menu items yet." 
                : `No items found in the ${selectedCategory} category.`}
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                </DialogHeader>
                <MenuItemForm onSubmit={handleAddItem} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MenuItemForm: React.FC<{
  initialData?: MenuItem;
  onSubmit: (data: any) => void;
}> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    category: initialData?.category || 'Main Courses',
    image: initialData?.image || '',
    is_available: initialData?.is_available ?? true,
    preparation_time: initialData?.preparation_time || 15,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = ['Main Courses', 'Burgers', 'Fries', 'Drinks', 'Desserts', 'Sides', 'Appetizers'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter item name"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter item description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input 
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="prepTime">Prep Time (min)</Label>
          <Input 
            id="prepTime"
            type="number"
            min="1"
            value={formData.preparation_time}
            onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) || 15 })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input 
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <Label htmlFor="available">Available for ordering</Label>
      </div>
      
      <Button type="submit" className="w-full">
        {initialData ? 'Update Item' : 'Add Item'}
      </Button>
    </form>
  );
};

export default MenuManagement;
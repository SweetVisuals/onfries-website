import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CreditCard as Edit, TriangleAlert as AlertTriangle, Package } from 'lucide-react';
import { menuItems, menuCategories } from '../../data/menuData';
import { useToast } from '@/hooks/use-toast';

const StockManagement: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState(menuItems.map(item => ({
    ...item,
    stock: Math.floor(Math.random() * 50) + 10, // Random stock for demo
    soldOutOverride: false // New property for sold out override
  })));
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredItems = items.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const updateItemStock = (itemId: string, newStock: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, stock: newStock } : item
      )
    );
    
    toast({
      title: 'Stock updated',
      description: `Stock level updated successfully`,
    });
  };

  const toggleItemAvailability = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );

    const item = items.find(i => i.id === itemId);
    toast({
      title: item?.isAvailable ? 'Item disabled' : 'Item enabled',
      description: `${item?.name} is now ${item?.isAvailable ? 'unavailable' : 'available'}`,
    });
  };

  const toggleSoldOutOverride = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, soldOutOverride: !item.soldOutOverride } : item
      )
    );

    const item = items.find(i => i.id === itemId);
    toast({
      title: item?.soldOutOverride ? 'Sold out override enabled' : 'Sold out override disabled',
      description: `${item?.name} is now ${item?.soldOutOverride ? 'marked as sold out' : 'available'}`,
    });
  };

  const updateItem = (updatedItem: any) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );

    toast({
      title: 'Item updated',
      description: `${updatedItem.name} has been updated successfully`,
    });
  };

  const addNewItem = (newItem: any) => {
    const item = {
      ...newItem,
      id: Date.now().toString(),
      stock: 0
    };
    
    setItems(prevItems => [...prevItems, item]);
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Item added',
      description: `${newItem.name} has been added to the menu`,
    });
  };

  const getLowStockItems = () => items.filter(item => item.stock < 5);

  return (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {getLowStockItems().length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                {getLowStockItems().length} items are running low on stock
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Stock Management</CardTitle>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                </DialogHeader>
                <ItemForm onSubmit={addNewItem} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2 mt-4">
            {menuCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Stock Overview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold">{item.stock}</div>
                        <div className="text-xs text-gray-500">in stock</div>
                      </div>
                      {item.stock < 5 && (
                        <Badge variant="destructive" className="text-xs">
                          Low
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sold Out Management */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sold Out Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Sold Out:</Label>
                        <Switch
                          checked={item.soldOutOverride}
                          onCheckedChange={() => toggleSoldOutOverride(item.id)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Stock:</Label>
                        <Input
                          type="number"
                          value={item.stock}
                          onChange={(e) => updateItemStock(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-8"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">No items match your current filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ItemForm: React.FC<{ initialData?: any; onSubmit: (data: any) => void }> = ({ 
  initialData, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    price: 0,
    category: 'Main Courses',
    image: '',
    preparationTime: 15,
    isAvailable: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Input 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price ($)</Label>
          <Input 
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        
        <div>
          <Label>Prep Time (min)</Label>
          <Input 
            type="number"
            value={formData.preparationTime}
            onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 15 })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label>Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {menuCategories.filter(cat => cat !== 'All').map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Image URL</Label>
        <Input 
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
          required
        />
      </div>
      
      <Button type="submit" className="w-full">
        {initialData ? 'Update Item' : 'Add Item'}
      </Button>
    </form>
  );
};

export default StockManagement;
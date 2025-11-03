import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, TriangleAlert as AlertTriangle, Package, RotateCcw } from 'lucide-react';
import { menuCategories } from '../../data/menuData';
import { useToast } from '@/hooks/use-toast';
import {
  getStockItems,
  updateItemStock as dbUpdateItemStock,
  toggleSoldOutOverride as dbToggleSoldOutOverride,
  addMenuItem,
  StockItem
} from '../../lib/database';

const StockManagement: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    loadStockItems();
  }, []);

  const loadStockItems = async () => {
    try {
      setLoading(true);
      const stockItems = await getStockItems();
      setItems(stockItems);
    } catch (error) {
      console.error('Error loading stock items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stock items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const updateItemStock = async (itemId: string, newStock: number) => {
    try {
      // Validate stock input
      if (newStock < 0) {
        toast({
          title: 'Invalid Stock Level',
          description: 'Stock cannot be negative',
          variant: 'destructive'
        });
        return;
      }

      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const oldStock = item.currentStock;
      
      // Optimistically update UI
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, currentStock: newStock } : item
        )
      );

      await dbUpdateItemStock(itemId, newStock);
      
      // Show appropriate toast message
      if (newStock === 0) {
        toast({
          title: 'Item marked as sold out',
          description: `${item.name} stock set to 0`,
          variant: 'destructive'
        });
      } else if (newStock < item.lowStockThreshold) {
        toast({
          title: 'Low stock alert',
          description: `${item.name} stock is now low (${newStock} remaining)`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Stock updated',
          description: `${item.name} stock updated from ${oldStock} to ${newStock}`,
        });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      // Revert optimistic update on error
      const item = items.find(i => i.id === itemId);
      if (item) {
        setItems(prevItems =>
          prevItems.map(i =>
            i.id === itemId ? { ...i, currentStock: item.currentStock } : i
          )
        );
      }
      toast({
        title: 'Error',
        description: 'Failed to update stock level',
        variant: 'destructive'
      });
    }
  };

  const toggleSoldOutOverride = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      
      const newOverride = !item.soldOutOverride;
      await dbToggleSoldOutOverride(itemId, newOverride);
      
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, soldOutOverride: newOverride } : item
        )
      );

      toast({
        title: newOverride ? 'Sold out override enabled' : 'Sold out override disabled',
        description: `${item.name} is now ${newOverride ? 'marked as sold out' : 'available'}`,
      });
    } catch (error) {
      console.error('Error toggling sold out override:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive'
      });
    }
  };

  const addNewItem = async (newItem: any) => {
    try {
      const addedItem = await addMenuItem({
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        category: newItem.category,
        image: newItem.image,
        is_available: true,
        preparation_time: newItem.preparationTime
      });
      
      // Add to local state with initial stock
      const stockItem: StockItem = {
        id: addedItem.id,
        name: addedItem.name,
        category: addedItem.category,
        currentStock: 0,
        lowStockThreshold: 5,
        isAvailable: addedItem.is_available,
        soldOutOverride: false,
        price: addedItem.price
      };
      
      setItems(prevItems => [...prevItems, stockItem]);
      setIsAddDialogOpen(false);
      
      toast({
        title: 'Item added',
        description: `${newItem.name} has been added to the menu`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add menu item',
        variant: 'destructive'
      });
    }
  };

  const getLowStockItems = () => items.filter(item => item.currentStock >= 0 && item.currentStock < 5);

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
            <Button onClick={loadStockItems} variant="outline" size="sm">
              Refresh
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="md:text-sm text-xs md:px-3 px-2">
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
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 px-3 border-b">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">{item.currentStock}</div>
                          <div className="text-xs text-gray-500">in stock</div>
                        </div>
                        {item.currentStock >= 0 && item.currentStock < 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Low
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
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
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                              onClick={() => updateItemStock(item.id, Math.max(0, item.currentStock - 1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.currentStock}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string while typing, treat as 0 on blur
                                const stockValue = value === '' ? 0 : parseInt(value);
                                if (!isNaN(stockValue) && stockValue >= 0) {
                                  updateItemStock(item.id, stockValue);
                                }
                              }}
                              onBlur={(e) => {
                                // Ensure non-negative number on blur
                                const value = parseInt(e.target.value);
                                if (isNaN(value) || value < 0) {
                                  updateItemStock(item.id, 0);
                                }
                              }}
                              className="w-16 h-8 text-center"
                              min="0"
                              placeholder="0"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                              onClick={() => updateItemStock(item.id, item.currentStock + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-8 h-8 p-0"
                              onClick={() => updateItemStock(item.id, 0)}
                              title="Set to sold out"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {filteredItems.length === 0 && !loading && (
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
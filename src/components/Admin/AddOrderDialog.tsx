import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, X } from 'lucide-react';
import { menuItems, MenuItem } from '../../data/menuData';

interface AddOrderDialogProps {
  onAddOrder: (customerName: string, customerEmail: string, items: Array<{ item: MenuItem; quantity: number; addOns: Array<{ item: MenuItem; quantity: number }> }>) => void;
}

interface OrderItem {
  item: MenuItem;
  quantity: number;
  addOns: Array<{ item: MenuItem; quantity: number }>;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({ onAddOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [showAddOnDialog, setShowAddOnDialog] = useState<{ isOpen: boolean; itemId: string }>({ isOpen: false, itemId: '' });

  const handleAddItem = (item: MenuItem) => {
    const existing = selectedItems.find(si => si.item.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(si =>
        si.item.id === item.id ? { ...si, quantity: si.quantity + 1 } : si
      ));
    } else {
      setSelectedItems([...selectedItems, { item, quantity: 1, addOns: [] }]);
    }
  };

  const handleAddAddOn = (addOn: MenuItem, mainItemId: string) => {
    setSelectedItems(selectedItems.map(si =>
      si.item.id === mainItemId
        ? {
            ...si,
            addOns: [...si.addOns, { item: addOn, quantity: 1 }]
          }
        : si
    ));
    setShowAddOnDialog({ isOpen: false, itemId: '' });
  };

  const handleRemoveAddOn = (addOnIndex: number, mainItemId: string) => {
    setSelectedItems(selectedItems.map(si =>
      si.item.id === mainItemId
        ? {
            ...si,
            addOns: si.addOns.filter((_, index) => index !== addOnIndex)
          }
        : si
    ));
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(si => si.item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setSelectedItems(selectedItems.map(si =>
        si.item.id === itemId ? { ...si, quantity } : si
      ));
    }
  };

  const handleSubmit = () => {
    if (customerName && customerEmail && selectedItems.length > 0) {
      onAddOrder(customerName, customerEmail, selectedItems);
      handleResetDialog();
    }
  };

  const handleResetDialog = () => {
    setIsOpen(false);
    setCustomerName('');
    setCustomerEmail('');
    setSelectedItems([]);
    setShowAddOnDialog({ isOpen: false, itemId: '' });
  };

  const total = selectedItems.reduce((sum, si) => {
    const itemTotal = si.item.price * si.quantity;
    const addOnsTotal = si.addOns.reduce((addOnSum, addOn) => addOnSum + (addOn.item.price * addOn.quantity), 0) * si.quantity;
    return sum + itemTotal + addOnsTotal;
  }, 0);

  const mainCourses = menuItems.filter(item => item.category === 'Main Courses');
  const drinks = menuItems.filter(item => item.category === 'Drinks');
  const kidsItems = menuItems.filter(item => item.category === 'Kids');
  const availableAddOns = menuItems.filter(item => item.category === 'Add-ons');

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Order
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader className="relative">
            <DialogTitle>Add New Order</DialogTitle>
            <X
              className="absolute right-0 top-0 h-6 w-6 cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => handleResetDialog()}
            />
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Menu Items */}
            <div className="space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter customer email"
                  />
                </div>
              </div>

              {/* Main Courses */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Main Courses</h3>
                <div className="grid grid-cols-1 gap-3">
                  {mainCourses.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{item.name}</CardTitle>
                          <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">£{item.price.toFixed(2)}</span>
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(item)}
                            disabled={!item.isAvailable}
                          >
                            Add to Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Kids Menu */}
              {kidsItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Kids Menu</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {kidsItems.map((item) => (
                      <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{item.name}</CardTitle>
                            <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">£{item.price.toFixed(2)}</span>
                            <Button
                              size="sm"
                              onClick={() => handleAddItem(item)}
                              disabled={!item.isAvailable}
                            >
                              Add to Order
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Drinks */}
              {drinks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Drinks</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {drinks.map((item) => (
                      <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{item.name}</CardTitle>
                            <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">£{item.price.toFixed(2)}</span>
                            <Button
                              size="sm"
                              onClick={() => handleAddItem(item)}
                              disabled={!item.isAvailable}
                            >
                              Add to Order
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No items added yet. Select items from the menu to build your order.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map((si) => (
                      <Card key={si.item.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{si.item.name}</CardTitle>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveItem(si.item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuantityChange(si.item.id, si.quantity - 1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{si.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuantityChange(si.item.id, si.quantity + 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">£{(si.item.price * si.quantity).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">£{si.item.price.toFixed(2)} each</p>
                              </div>
                            </div>

                            {/* Add Add-ons Button */}
                            {availableAddOns.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowAddOnDialog({ isOpen: true, itemId: si.item.id })}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Add-ons
                              </Button>
                            )}

                            {/* Current Add-ons */}
                            {si.addOns.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2 text-green-600">Add-ons:</p>
                                <div className="space-y-1">
                                  {si.addOns.map((addOn, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-green-50 p-2 rounded text-sm">
                                      <span>{addOn.item.name}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">£{addOn.item.price.toFixed(2)}</span>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleRemoveAddOn(idx, si.item.id)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">Total: £{total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleResetDialog()} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!customerName || !customerEmail || selectedItems.length === 0}
                  className="flex-1"
                >
                  Create Order
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add-ons Selection Dialog */}
      <Dialog open={showAddOnDialog.isOpen} onOpenChange={(open) => !open && setShowAddOnDialog({ isOpen: false, itemId: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Add-ons</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableAddOns.length === 0 ? (
              <p className="text-center text-muted-foreground">No add-ons available</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {availableAddOns.map((addOn) => (
                  <Card key={addOn.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{addOn.name}</CardTitle>
                        <Badge variant={addOn.isAvailable ? 'default' : 'secondary'}>
                          {addOn.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{addOn.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">£{addOn.price.toFixed(2)}</span>
                        <Button
                          size="sm"
                          onClick={() => handleAddAddOn(addOn, showAddOnDialog.itemId)}
                          disabled={!addOn.isAvailable}
                        >
                          Add Add-on
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowAddOnDialog({ isOpen: false, itemId: '' })}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddOrderDialog;
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { menuItems, MenuItem } from '../../data/menuData';

interface AddOrderDialogProps {
  onAddOrder: (customerName: string, customerEmail: string, items: Array<{ item: MenuItem; quantity: number }>) => void;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({ onAddOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ item: MenuItem; quantity: number; addOns: Array<{ item: MenuItem; quantity: number }> }>>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<{ [itemId: string]: Array<{ item: MenuItem; quantity: number }> }>({});
  const [currentStep, setCurrentStep] = useState<'items' | 'addons'>('items');

  const handleAddItem = (item: MenuItem) => {
    // Only add main items in the items step
    if (currentStep === 'items') {
      const existing = selectedItems.find(si => si.item.id === item.id);
      if (existing) {
        setSelectedItems(selectedItems.map(si =>
          si.item.id === item.id ? { ...si, quantity: si.quantity + 1 } : si
        ));
      } else {
        setSelectedItems([...selectedItems, { item, quantity: 1, addOns: [] }]);
      }
    }
  };

  const handleAddAddOn = (addOn: MenuItem, mainItemId: string) => {
    // Add add-on to a specific main item
    setSelectedAddOns(prev => ({
      ...prev,
      [mainItemId]: prev[mainItemId] ? [...prev[mainItemId], { item: addOn, quantity: 1 }] : [{ item: addOn, quantity: 1 }]
    }));
  };

  const handleRemoveAddOn = (addOnIndex: number, mainItemId: string) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [mainItemId]: prev[mainItemId].filter((_, index) => index !== addOnIndex)
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(si => si.item.id !== itemId));
    // Also remove any add-ons for this item
    const newAddOns = { ...selectedAddOns };
    delete newAddOns[itemId];
    setSelectedAddOns(newAddOns);
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

  const handleNextStep = () => {
    if (currentStep === 'items' && selectedItems.length > 0) {
      setCurrentStep('addons');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'addons') {
      setCurrentStep('items');
    }
  };

  const handleSubmit = () => {
    if (customerName && customerEmail && selectedItems.length > 0) {
      // Combine main items with their add-ons
      const itemsWithAddOns = selectedItems.map(item => ({
        item: item.item,
        quantity: item.quantity,
        addOns: selectedAddOns[item.item.id] || []
      }));
      onAddOrder(customerName, customerEmail, itemsWithAddOns);
      handleResetDialog();
    }
  };

  const handleResetDialog = () => {
    setIsOpen(false);
    setCustomerName('');
    setCustomerEmail('');
    setSelectedItems([]);
    setSelectedAddOns({});
    setCurrentStep('items');
  };

  const total = selectedItems.reduce((sum, si) => {
    const itemTotal = si.item.price * si.quantity;
    const addOnsTotal = (selectedAddOns[si.item.id] || []).reduce((addOnSum, addOn) => addOnSum + (addOn.item.price * addOn.quantity), 0) * si.quantity;
    return sum + itemTotal + addOnsTotal;
  }, 0);

  const availableAddOns = menuItems.filter(item => item.category === 'Add-ons');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="relative">
          <DialogTitle>Add New Order</DialogTitle>
          <X
            className="absolute right-0 top-0 h-6 w-6 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => handleResetDialog()}
          />
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 ${currentStep === 'items' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'items' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              1
            </div>
            <span className="font-medium">Items</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center space-x-2 ${currentStep === 'addons' ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'addons' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              2
            </div>
            <span className="font-medium">Add-ons</span>
          </div>
        </div>

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

          {/* Step 1: Items Selection */}
          {currentStep === 'items' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Menu Items</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">Main Courses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.filter(item => item.category === 'Main Courses').map((item) => (
                      <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{item.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">£{item.price.toFixed(2)}</span>
                            <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => handleAddItem(item)}
                            disabled={!item.isAvailable}
                          >
                            Add to Order
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add-ons Selection */}
          {currentStep === 'addons' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Add-ons to Items</h3>
              <div className="space-y-6">
                {selectedItems.map((selectedItem) => (
                  <Card key={selectedItem.item.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{selectedItem.item.name} x{selectedItem.quantity}</CardTitle>
                      <p className="text-xs text-muted-foreground">£{selectedItem.item.price.toFixed(2)} each</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Available Add-ons */}
                        <div>
                          <p className="text-sm font-medium mb-2">Available Add-ons:</p>
                          <div className="flex flex-wrap gap-2">
                            {availableAddOns.map((addOn) => (
                              <Button
                                key={addOn.id}
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddAddOn(addOn, selectedItem.item.id)}
                                disabled={!addOn.isAvailable}
                              >
                                + {addOn.name} (£{addOn.price.toFixed(2)})
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Selected Add-ons */}
                        {selectedAddOns[selectedItem.item.id] && selectedAddOns[selectedItem.item.id].length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 text-green-600">Selected Add-ons:</p>
                            <div className="space-y-2">
                              {selectedAddOns[selectedItem.item.id].map((addOn, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-green-50 p-2 rounded">
                                  <span className="text-sm">{addOn.item.name} x{addOn.quantity} - £{addOn.item.price.toFixed(2)}</span>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemoveAddOn(idx, selectedItem.item.id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                {selectedItems.map((si) => (
                  <div key={si.item.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <p className="font-medium">{si.item.name} x{si.quantity}</p>
                      <p className="text-sm text-muted-foreground">£{si.item.price.toFixed(2)} each</p>
                      {(selectedAddOns[si.item.id] || []).length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-muted-foreground">Add-ons:</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedAddOns[si.item.id] || []).map(addOn => `${addOn.item.name} x${addOn.quantity}`).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {currentStep === 'items' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(si.item.id, si.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{si.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(si.item.id, si.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveItem(si.item.id)}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <p className="text-lg font-semibold">Total: £{total.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-2">
            <div>
              {currentStep === 'addons' && (
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Items
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleResetDialog()}>
                Cancel
              </Button>
              {currentStep === 'items' ? (
                <Button
                  onClick={handleNextStep}
                  disabled={selectedItems.length === 0}
                >
                  Next: Add Add-ons
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!customerName || !customerEmail || selectedItems.length === 0}
                >
                  Create Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddOrderDialog;
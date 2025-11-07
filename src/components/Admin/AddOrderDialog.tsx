import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, X } from 'lucide-react';
import { menuItems, MenuItem } from '../../data/menuData';
import { useIsMobile } from '../../hooks/use-mobile';

interface AddOrderDialogProps {
  onAddOrder: (customerName: string, customerEmail: string, items: Array<{ item: MenuItem; quantity: number; addOns: Array<{ item: MenuItem; quantity: number }> }>) => void;
}

interface OrderItem {
  item: MenuItem;
  quantity: number;
  addOns: Array<{ item: MenuItem; quantity: number }>;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({ onAddOrder }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  // Single dialog with different modes instead of nested dialog
  const [dialogMode, setDialogMode] = useState<'select' | 'customize'>('select');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<{[key: string]: {item: MenuItem, quantity: number}}>({});
  const [selectedSauce, setSelectedSauce] = useState<string>('');

  const hasAddOns = (item: MenuItem) => {
    // Steak Only should not have add-ons (it's its own menu item)
    // Steak should be an add-on for Signature Fries, Steak & Fries, and Deluxe Steak & Fries
    const result = (item.category === 'Main Courses' && item.name !== 'Steak Only') || (item.category === 'Kids' && item.name === 'Kids Meal');
    console.log('hasAddOns check for', item.name, ':', result, '(category:', item.category, ')');
    return result;
  };

  const handleAddItem = (item: MenuItem) => {
    console.log('handleAddItem called with:', item.name, 'category:', item.category);
    console.log('hasAddOns result:', hasAddOns(item));

    if (hasAddOns(item)) {
      console.log('Switching to customize mode for:', item.name);
      // Switch to customization mode for items that have add-ons
      setSelectedItem(item);
      setSelectedAddOns({});
      setSelectedSauce('');
      setDialogMode('customize');
    } else {
      console.log('Adding directly for:', item.name);
      // Directly add items without add-ons as separate items
      setSelectedItems([...selectedItems, { item, quantity: 1, addOns: [] }]);
    }
  };

  // Removed unused handleAddAddOn function - add-ons are now handled in customize dialog

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
    if (customerName && selectedItems.length > 0) {
      onAddOrder(customerName, customerEmail, selectedItems);
      handleResetDialog();
    }
  };

  const handleResetDialog = () => {
    setIsOpen(false);
    setCustomerName('');
    setCustomerEmail('');
    setSelectedItems([]);
    setDialogMode('select');
    setSelectedItem(null);
    setSelectedAddOns({});
    setSelectedSauce('');
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

  const updateAddOnQuantity = (addOn: any, newQuantity: number) => {
    console.log('updateAddOnQuantity called with:', addOn.name, 'new quantity:', newQuantity);
    setSelectedAddOns(prev => {
      const newSelected = { ...prev };
      if (newQuantity === 0) {
        delete newSelected[addOn.id];
      } else {
        newSelected[addOn.id] = {
          item: addOn,
          quantity: newQuantity
        };
      }
      console.log('New selected add-ons:', newSelected);
      return newSelected;
    });
  };

  const handleConfirmCustomize = () => {
    let addOnsWithQuantities: Array<{ item: MenuItem; quantity: number }> = [];

    // Handle Kids Meal sauce selection
    if (selectedItem!.category === 'Kids' && selectedItem!.name === 'Kids Meal') {
      if (selectedSauce) {
        const selectedSauceItem = menuItems.find(item => item.id === selectedSauce);
        if (selectedSauceItem) {
          addOnsWithQuantities = [{
            item: selectedSauceItem,
            quantity: 1
          }];
        }
      }
    } else {
      // Handle regular add-ons for main courses
      addOnsWithQuantities = Object.values(selectedAddOns).map(({ item, quantity }) => ({
        item,
        quantity
      }));
    }

    // Add to selected items as separate item (keep original item name and price)
    setSelectedItems([...selectedItems, { item: selectedItem!, quantity: 1, addOns: addOnsWithQuantities }]);

    // Reset state and switch back to select mode
    setDialogMode('select');
    setSelectedItem(null);
    setSelectedAddOns({});
    setSelectedSauce('');
  };

  return (
    <>
      <style>
        {`
          .thin-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .thin-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .thin-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }
          .thin-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.7);
          }
          .custom-mobile-scroll::-webkit-scrollbar {
            width: 8px;
            margin-right: 1px;
          }
          .custom-mobile-scroll::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
          }
          .custom-mobile-scroll::-webkit-scrollbar-thumb {
            background: rgba(234, 179, 8, 0.6);
            border-radius: 4px;
          }
          .custom-mobile-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(234, 179, 8, 0.8);
          }
        `}
      </style>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Order
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-none sm:max-w-[90vw] overflow-hidden flex flex-col">
            <SheetHeader className="relative">
              <SheetTitle>
                {dialogMode === 'select' ? 'Add New Order' : 'Customize Order'}
              </SheetTitle>
              <div className="flex items-center gap-2">
                {dialogMode === 'customize' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogMode('select')}
                    className="cursor-pointer"
                  >
                    ← Back to Menu
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="flex flex-col h-full overflow-y-auto px-4 custom-mobile-scroll" style={{ paddingRight: '12px' }}>
              {/* Close button in far right corner */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetDialog()}
                className="absolute top-4 right-4 z-10 w-8 h-8 p-0 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background"
              >
                <X className="w-4 h-4" />
              </Button>
              {/* Select Mode Layout */}
              {dialogMode === 'select' && (
                <>
                  {/* Customer Details */}
                  <div className="mb-4">
                    <div className="grid grid-cols-1 gap-4">
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
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-6">
                    {/* Main Courses */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Main Courses</h3>
                      <div className="space-y-3">
                        {mainCourses.map((item) => (
                          <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow w-full flex flex-col">
                            <CardHeader className="pb-2 flex-1">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</CardTitle>
                                <Badge variant="outline" className={item.isAvailable ? 'bg-gray-800 text-white border-gray-800' : 'bg-red-600 text-white border-red-600'}>
                                  {item.isAvailable ? 'Available' : 'Unavailable'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">£{item.price.toFixed(2)}</span>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Add button clicked for:', item.name);
                                    handleAddItem(item);
                                  }}
                                  disabled={!item.isAvailable}
                                >
                                  Add
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Add-ons */}
                    {availableAddOns.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Add-ons</h3>
                        <div className="space-y-3">
                          {availableAddOns.map((item) => (
                            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow w-full flex flex-col">
                              <CardHeader className="pb-2 flex-1">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</CardTitle>
                                  <Badge variant="outline" className={item.isAvailable ? 'bg-gray-800 text-white border-gray-800' : 'bg-red-600 text-white border-red-600'}>
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">£{item.price.toFixed(2)}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddItem(item)}
                                    disabled={!item.isAvailable}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kids Menu */}
                    {kidsItems.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Kids Menu</h3>
                        <div className="space-y-3">
                          {kidsItems.map((item) => (
                            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow w-full flex flex-col">
                              <CardHeader className="pb-2 flex-1">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</CardTitle>
                                  <Badge variant="outline" className={item.isAvailable ? 'bg-gray-800 text-white border-gray-800' : 'bg-red-600 text-white border-red-600'}>
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">£{item.price.toFixed(2)}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddItem(item)}
                                    disabled={!item.isAvailable}
                                  >
                                    Add
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
                        <h3 className="text-lg font-semibold mb-3">Drinks</h3>
                        <div className="space-y-3">
                          {drinks.map((item) => (
                            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow w-full h-32 flex flex-col">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</CardTitle>
                                  <Badge variant="outline" className={item.isAvailable ? 'bg-gray-800 text-white border-gray-800' : 'bg-red-600 text-white border-red-600'}>
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">£{item.price.toFixed(2)}</span>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddItem(item)}
                                    disabled={!item.isAvailable}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

            {/* Customize Mode Layout - Full height, no scroll conflicts */}
            {dialogMode === 'customize' && selectedItem && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 thin-scrollbar">
                  <div className="space-y-6">
                    <div className="mb-4">
                      <p className="text-base font-semibold text-yellow-600">Base price: £{selectedItem.price.toFixed(2)}</p>
                    </div>

                    <div>
                      {selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' ? (
                        /* Kids Meal Sauce Selection */
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2 text-foreground">Choose Your Sauce</h3>
                        <p className="text-muted-foreground mb-3 text-sm">
                          Your Kids Meal includes a drink and one free sauce. Please choose your preferred sauce:
                        </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {menuItems.filter(item =>
                              item.category === 'Add-ons' && item.name.includes('Sauce')
                            ).map((sauce) => {
                              const isSelected = selectedSauce === sauce.id;
                              return (
                                <div
                                  key={sauce.id}
                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950 ring-2 ring-yellow-200'
                                      : 'border-border hover:border-yellow-400 hover:bg-accent dark:hover:bg-accent'
                                  }`}
                                  onClick={() => {
                                    console.log('Sauce clicked:', sauce.name);
                                    setSelectedSauce(sauce.id);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-semibold text-foreground">{sauce.name}</h5>
                                      <p className="text-muted-foreground text-sm">{sauce.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        isSelected
                                          ? 'border-yellow-500 bg-yellow-500'
                                          : 'border-muted-foreground'
                                      }`}>
                                        {isSelected && (
                                          <div className="w-2 h-2 rounded-full bg-foreground"></div>
                                        )}
                                      </div>
                                      <span className="font-bold text-yellow-600 text-sm">FREE</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {!selectedSauce && (
                            <p className="text-red-500 mt-3 text-sm font-medium">
                              Please select a sauce to continue
                            </p>
                          )}
                        </div>
                      ) : (
                        /* Main Course Add-ons */
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3 text-foreground">Add Extras</h3>

                          {/* Steak Add-ons */}
                          <div className="mb-4">
                            <h4 className="text-base font-semibold mb-2 text-foreground">Extra Steak</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {menuItems.filter(item => item.name === 'Steak Only').map((addOn) => {
                                  const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                                  return (
                                    <div key={addOn.id} className="flex items-center p-3 border-2 rounded-lg hover:bg-accent">
                                      <h5 className="font-semibold text-foreground text-sm text-center flex-1">{addOn.name}</h5>
                                      <div className="flex items-center gap-3 ml-3">
                                        <span className="font-bold text-yellow-600 text-sm">£{addOn.price.toFixed(2)}</span>
                                        <div className="flex items-center gap-1">
                                          {quantity > 0 && (
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                console.log('Steak minus button clicked for:', addOn.name);
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateAddOnQuantity(addOn, quantity - 1);
                                              }}
                                              className="w-7 h-7 p-0 text-xs cursor-pointer"
                                              style={{ pointerEvents: 'auto' }}
                                            >
                                              -
                                            </Button>
                                          )}
                                          {quantity > 0 && (
                                            <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                                          )}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant={quantity > 0 ? 'default' : 'outline'}
                                            onClick={(e) => {
                                              console.log('Steak plus button clicked for:', addOn.name);
                                              e.preventDefault();
                                              e.stopPropagation();
                                              updateAddOnQuantity(addOn, quantity + 1);
                                            }}
                                            className="w-7 h-7 p-0 text-xs cursor-pointer"
                                            style={{ pointerEvents: 'auto' }}
                                          >
                                            +
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Sauces */}
                            <div className="mb-4">
                              <h4 className="text-base font-semibold mb-2 text-foreground">Sauces</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {menuItems.filter(item => item.category === 'Add-ons' && item.name.includes('Sauce')).map((addOn) => {
                                  const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                                  return (
                                    <div key={addOn.id} className="flex items-center p-2 border-2 rounded-lg hover:bg-accent">
                                      <h5 className="font-semibold text-foreground text-xs text-center flex-1">{addOn.name}</h5>
                                      <div className="flex items-center gap-2 ml-2">
                                        <span className="font-bold text-yellow-600 text-xs">£{addOn.price.toFixed(2)}</span>
                                        <div className="flex items-center gap-1">
                                          {quantity > 0 && (
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                console.log('Sauce minus button clicked for:', addOn.name);
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateAddOnQuantity(addOn, quantity - 1);
                                              }}
                                              className="w-7 h-7 p-0 text-xs cursor-pointer"
                                              style={{ pointerEvents: 'auto' }}
                                            >
                                              -
                                            </Button>
                                          )}
                                          {quantity > 0 && (
                                            <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                                          )}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant={quantity > 0 ? 'default' : 'outline'}
                                            onClick={(e) => {
                                              console.log('Sauce plus button clicked for:', addOn.name);
                                              e.preventDefault();
                                              e.stopPropagation();
                                              updateAddOnQuantity(addOn, quantity + 1);
                                            }}
                                            className="w-7 h-7 p-0 text-xs cursor-pointer"
                                            style={{ pointerEvents: 'auto' }}
                                          >
                                            +
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Drinks */}
                            <div className="mb-4">
                              <h4 className="text-base font-semibold mb-2 text-foreground">Drinks</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {menuItems.filter(item => item.category === 'Drinks').map((addOn) => {
                                  const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                                  return (
                                    <div key={addOn.id} className="flex items-center p-2 border-2 rounded-lg hover:bg-accent">
                                      <h5 className="font-semibold text-foreground text-xs text-center flex-1">{addOn.name}</h5>
                                      <div className="flex items-center gap-2 ml-2">
                                        <span className="font-bold text-yellow-600 text-xs">£{addOn.price.toFixed(2)}</span>
                                        <div className="flex items-center gap-1">
                                          {quantity > 0 && (
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                console.log('Drink minus button clicked for:', addOn.name);
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateAddOnQuantity(addOn, quantity - 1);
                                              }}
                                              className="w-7 h-7 p-0 text-xs cursor-pointer"
                                              style={{ pointerEvents: 'auto' }}
                                            >
                                              -
                                            </Button>
                                          )}
                                          {quantity > 0 && (
                                            <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                                          )}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant={quantity > 0 ? 'default' : 'outline'}
                                            onClick={(e) => {
                                              console.log('Drink plus button clicked for:', addOn.name);
                                              e.preventDefault();
                                              e.stopPropagation();
                                              updateAddOnQuantity(addOn, quantity + 1);
                                            }}
                                            className="w-7 h-7 p-0 text-xs cursor-pointer"
                                            style={{ pointerEvents: 'auto' }}
                                          >
                                            +
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons for Customize Mode - Fixed at bottom */}
              <div className="pt-3 mt-3 pb-4 flex-shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-semibold text-foreground">Total:</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {(() => {
                        // For Kids Meal, show the fixed price as it includes drink and sauce
                        if (selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal') {
                          return `£${selectedItem.price.toFixed(2)} (includes drink & sauce)`;
                        }
                        // For other items, calculate based on add-ons
                        return `£${(selectedItem.price + Object.values(selectedAddOns).reduce((sum, { item, quantity }) => sum + (item.price * quantity), 0)).toFixed(2)}`;
                      })()}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        console.log('Customize Cancel button clicked');
                        e.preventDefault();
                        e.stopPropagation();
                        setDialogMode('select');
                        setSelectedAddOns({});
                        setSelectedSauce('');
                      }}
                      className="flex-1 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        console.log('Customize Add to Order button clicked');
                        e.preventDefault();
                        e.stopPropagation();
                        handleConfirmCustomize();
                      }}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
                      disabled={selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' && !selectedSauce}
                      style={{ pointerEvents: 'auto' }}
                    >
                      {selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' ? 'Add Kids Meal' : 'Add to Order'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary - Bottom - Hidden on mobile in customize mode */}
            {(!isMobile || dialogMode !== 'customize') && (
              <div className="border-t pt-4 mt-4 px-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Order Summary</h3>

                  {selectedItems.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No items added yet. Select items from the menu to build your order.</p>
                    </div>
                  ) : (
                    <>
                      {/* Order Items Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {selectedItems.map((si) => (
                          <div key={si.item.id} className="border border-border rounded-lg p-3 bg-card relative">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveItem(si.item.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </Button>

                            <div className="text-center">
                              <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">{si.item.name}</h4>
                              <div className="flex items-center justify-center gap-1 mb-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuantityChange(si.item.id, si.quantity - 1)}
                                  className="w-6 h-6 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-lg font-bold text-foreground min-w-[2rem] text-center">{si.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuantityChange(si.item.id, si.quantity + 1)}
                                  className="w-6 h-6 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-sm font-bold text-yellow-600">£{(si.item.price * si.quantity).toFixed(2)}</p>

                              {/* Add-ons */}
                              {si.addOns.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <p className="text-xs font-medium text-green-600 mb-1">Add-ons:</p>
                                  <div className="space-y-1">
                                    {si.addOns.map((addOn, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-xs">
                                        <span className="text-foreground truncate mr-1">{addOn.item.name} x{addOn.quantity}</span>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleRemoveAddOn(idx, si.item.id)}
                                          className="w-4 h-4 p-0 flex-shrink-0"
                                        >
                                          <X className="w-2 h-2" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="text-center border-t pt-3">
                        <p className="text-xl font-bold">Total: £{total.toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 px-4 pb-4">
                  <Button variant="outline" onClick={() => handleResetDialog()} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!customerName || selectedItems.length === 0}
                    className="flex-1"
                  >
                    Create Order
                  </Button>
                </div>
              </div>
            )}
          </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden [&>button]:hidden">
            <DialogHeader className="relative">
              <DialogTitle>
                {dialogMode === 'select' ? 'Add New Order' : 'Customize Order'}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {dialogMode === 'customize' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogMode('select')}
                    className="cursor-pointer"
                  >
                    ← Back to Menu
                  </Button>
                )}
                <X
                  className="absolute right-0 top-0 h-6 w-6 cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => handleResetDialog()}
                />
              </div>
            </DialogHeader>

            <div className="flex flex-col h-full max-h-[calc(95vh-8rem)]">
              {/* Select Mode Layout */}
              {dialogMode === 'select' && (
                <>
                  {/* Customer Details */}
                  <div className="mb-4">
                    <div className="grid grid-cols-1 gap-4">
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
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 overflow-y-auto pr-2 thin-scrollbar">
                    <div className="space-y-6">
                      {/* Main Courses */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Main Courses</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {mainCourses.map((item) => (
                            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow w-full flex flex-col">
                              <CardHeader className="pb-2 flex-1">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</CardTitle>
                                  <Badge variant="outline" className={item.isAvailable ? 'bg-gray-800 text-white border-gray-800' : 'bg-red-600 text-white border-red-600'}>
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">£{item.price.toFixed(2)}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      console.log('Add button clicked for:', item.name);
                                      handleAddItem(item);
                                    }}
                                    disabled={!item.isAvailable}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Add-ons */}
                      {availableAddOns.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Add-ons</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableAddOns.map((item) => (
                              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow w-full flex flex-col">
                                <CardHeader className="pb-2 flex-1">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</CardTitle>
                                    <Badge variant="outline" className={item.isAvailable ? 'bg-gray-800 text-white border-gray-800' : 'bg-red-600 text-white border-red-600'}>
                                      {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">£{item.price.toFixed(2)}</span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddItem(item)}
                                      disabled={!item.isAvailable}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Kids Menu */}
                      {kidsItems.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Kids Menu</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {kidsItems.map((item) => (
                              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow w-full flex flex-col">
                                <CardHeader className="pb-2 flex-1">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</CardTitle>
                                    <Badge variant="outline" className={item.isAvailable ? 'bg-gray-800 text-white border-gray-800' : 'bg-red-600 text-white border-red-600'}>
                                      {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">£{item.price.toFixed(2)}</span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddItem(item)}
                                      disabled={!item.isAvailable}
                                    >
                                      Add
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
                          <h3 className="text-lg font-semibold mb-3">Drinks</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {drinks.map((item) => (
                              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow w-full h-32 flex flex-col">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm line-clamp-2 min-h-[2.5rem]">{item.name}</CardTitle>
                                    <Badge variant="outline" className={item.isAvailable ? 'bg-gray-800 text-white border-gray-800' : 'bg-red-600 text-white border-red-600'}>
                                      {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">£{item.price.toFixed(2)}</span>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddItem(item)}
                                      disabled={!item.isAvailable}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Customize Mode Layout - Full height, no scroll conflicts */}
              {dialogMode === 'customize' && selectedItem && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto pr-2 thin-scrollbar">
                    <div className="space-y-6">
                      <div className="mb-4">
                        <p className="text-base font-semibold text-yellow-600">Base price: £{selectedItem.price.toFixed(2)}</p>
                      </div>

                      <div>
                        {selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' ? (
                          /* Kids Meal Sauce Selection */
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2 text-foreground">Choose Your Sauce</h3>
                            <p className="text-muted-foreground mb-3 text-sm">
                              Your Kids Meal includes a drink and one free sauce. Please choose your preferred sauce:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {menuItems.filter(item =>
                                item.category === 'Add-ons' && item.name.includes('Sauce')
                              ).map((sauce) => {
                                const isSelected = selectedSauce === sauce.id;
                                return (
                                  <div
                                    key={sauce.id}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                      isSelected
                                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950 ring-2 ring-yellow-200'
                                        : 'border-border hover:border-yellow-400 hover:bg-accent dark:hover:bg-accent'
                                    }`}
                                    onClick={() => {
                                      console.log('Sauce clicked:', sauce.name);
                                      setSelectedSauce(sauce.id);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h5 className="font-semibold text-foreground">{sauce.name}</h5>
                                        <p className="text-muted-foreground text-sm">{sauce.description}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                          isSelected
                                            ? 'border-yellow-500 bg-yellow-500'
                                            : 'border-muted-foreground'
                                        }`}>
                                          {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-foreground"></div>
                                          )}
                                        </div>
                                        <span className="font-bold text-yellow-600 text-sm">FREE</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {!selectedSauce && (
                              <p className="text-red-500 mt-3 text-sm font-medium">
                                Please select a sauce to continue
                              </p>
                            )}
                          </div>
                        ) : (
                          /* Main Course Add-ons */
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold mb-3 text-foreground">Add Extras</h3>

                            {/* Steak Add-ons */}
                            <div className="mb-4">
                              <h4 className="text-base font-semibold mb-2 text-foreground">Extra Steak</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {menuItems.filter(item => item.id === '8').map((addOn) => {
                                    const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                                    return (
                                      <div key={addOn.id} className="flex items-center p-3 border-2 rounded-lg hover:bg-accent">
                                        <h5 className="font-semibold text-foreground text-sm text-center flex-1">{addOn.name}</h5>
                                        <div className="flex items-center gap-3 ml-3">
                                          <span className="font-bold text-yellow-600 text-sm">£{addOn.price.toFixed(2)}</span>
                                          <div className="flex items-center gap-1">
                                            {quantity > 0 && (
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  console.log('Steak minus button clicked for:', addOn.name);
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  updateAddOnQuantity(addOn, quantity - 1);
                                                }}
                                                className="w-7 h-7 p-0 text-xs cursor-pointer"
                                                style={{ pointerEvents: 'auto' }}
                                              >
                                                -
                                              </Button>
                                            )}
                                            {quantity > 0 && (
                                              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                                            )}
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant={quantity > 0 ? 'default' : 'outline'}
                                              onClick={(e) => {
                                                console.log('Steak plus button clicked for:', addOn.name);
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateAddOnQuantity(addOn, quantity + 1);
                                              }}
                                              className="w-7 h-7 p-0 text-xs cursor-pointer"
                                              style={{ pointerEvents: 'auto' }}
                                            >
                                              +
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Sauces */}
                              <div className="mb-4">
                                <h4 className="text-base font-semibold mb-2 text-foreground">Sauces</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {menuItems.filter(item => item.category === 'Add-ons' && item.name.includes('Sauce')).map((addOn) => {
                                    const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                                    return (
                                      <div key={addOn.id} className="flex items-center p-3 border-2 rounded-lg hover:bg-accent">
                                        <h5 className="font-semibold text-foreground text-sm text-center flex-1">{addOn.name}</h5>
                                        <div className="flex items-center gap-3 ml-3">
                                          <span className="font-bold text-yellow-600 text-sm">£{addOn.price.toFixed(2)}</span>
                                          <div className="flex items-center gap-1">
                                            {quantity > 0 && (
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  console.log('Sauce minus button clicked for:', addOn.name);
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  updateAddOnQuantity(addOn, quantity - 1);
                                                }}
                                                className="w-7 h-7 p-0 text-xs cursor-pointer"
                                                style={{ pointerEvents: 'auto' }}
                                              >
                                                -
                                              </Button>
                                            )}
                                            {quantity > 0 && (
                                              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                                            )}
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant={quantity > 0 ? 'default' : 'outline'}
                                              onClick={(e) => {
                                                console.log('Sauce plus button clicked for:', addOn.name);
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateAddOnQuantity(addOn, quantity + 1);
                                              }}
                                              className="w-7 h-7 p-0 text-xs cursor-pointer"
                                              style={{ pointerEvents: 'auto' }}
                                            >
                                              +
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Drinks */}
                              <div className="mb-4">
                                <h4 className="text-base font-semibold mb-2 text-foreground">Drinks</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {menuItems.filter(item => item.category === 'Drinks').map((addOn) => {
                                    const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                                    return (
                                      <div key={addOn.id} className="flex items-center p-3 border-2 rounded-lg hover:bg-accent">
                                        <h5 className="font-semibold text-foreground text-sm text-center flex-1">{addOn.name}</h5>
                                        <div className="flex items-center gap-3 ml-3">
                                          <span className="font-bold text-yellow-600 text-sm">£{addOn.price.toFixed(2)}</span>
                                          <div className="flex items-center gap-1">
                                            {quantity > 0 && (
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  console.log('Drink minus button clicked for:', addOn.name);
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  updateAddOnQuantity(addOn, quantity - 1);
                                                }}
                                                className="w-7 h-7 p-0 text-xs cursor-pointer"
                                                style={{ pointerEvents: 'auto' }}
                                              >
                                                -
                                              </Button>
                                            )}
                                            {quantity > 0 && (
                                              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                                            )}
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant={quantity > 0 ? 'default' : 'outline'}
                                              onClick={(e) => {
                                                console.log('Drink plus button clicked for:', addOn.name);
                                                e.preventDefault();
                                                e.stopPropagation();
                                                updateAddOnQuantity(addOn, quantity + 1);
                                              }}
                                              className="w-7 h-7 p-0 text-xs cursor-pointer"
                                              style={{ pointerEvents: 'auto' }}
                                            >
                                              +
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Customize Mode - Fixed at bottom */}
                  <div className="pt-3 mt-3 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-base font-semibold text-foreground">Total:</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {(() => {
                          // For Kids Meal, show the fixed price as it includes drink and sauce
                          if (selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal') {
                            return `£${selectedItem.price.toFixed(2)} (includes drink & sauce)`;
                          }
                          // For other items, calculate based on add-ons
                          return `£${(selectedItem.price + Object.values(selectedAddOns).reduce((sum, { item, quantity }) => sum + (item.price * quantity), 0)).toFixed(2)}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          console.log('Customize Cancel button clicked');
                          e.preventDefault();
                          e.stopPropagation();
                          setDialogMode('select');
                          setSelectedAddOns({});
                          setSelectedSauce('');
                        }}
                        className="flex-1 cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={(e) => {
                          console.log('Customize Add to Order button clicked');
                          e.preventDefault();
                          e.stopPropagation();
                          handleConfirmCustomize();
                        }}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black cursor-pointer"
                        disabled={selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' && !selectedSauce}
                        style={{ pointerEvents: 'auto' }}
                      >
                        {selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' ? 'Add Kids Meal' : 'Add to Order'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary - Bottom - Hidden in customize mode */}
              {dialogMode !== 'customize' && (
                <div className="border-t pt-4 mt-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-3">Order Summary</h3>

                    {selectedItems.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No items added yet. Select items from the menu to build your order.</p>
                      </div>
                    ) : (
                      <>
                        {/* Order Items Grid */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {selectedItems.map((si) => (
                            <div key={si.item.id} className="border border-border rounded-lg p-3 bg-card relative">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveItem(si.item.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </Button>

                              <div className="text-center">
                                <h4 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">{si.item.name}</h4>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuantityChange(si.item.id, si.quantity - 1)}
                                    className="w-6 h-6 p-0"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="text-lg font-bold text-foreground min-w-[2rem] text-center">{si.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuantityChange(si.item.id, si.quantity + 1)}
                                    className="w-6 h-6 p-0"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                                <p className="text-sm font-bold text-yellow-600">£{(si.item.price * si.quantity).toFixed(2)}</p>

                                {/* Add-ons */}
                                {si.addOns.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-border">
                                    <p className="text-xs font-medium text-green-600 mb-1">Add-ons:</p>
                                    <div className="space-y-1">
                                      {si.addOns.map((addOn, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                          <span className="text-foreground truncate mr-1">{addOn.item.name} x{addOn.quantity}</span>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleRemoveAddOn(idx, si.item.id)}
                                            className="w-4 h-4 p-0 flex-shrink-0"
                                          >
                                            <X className="w-2 h-2" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total */}
                        <div className="text-center border-t pt-3">
                          <p className="text-xl font-bold">Total: £{total.toFixed(2)}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleResetDialog()} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!customerName || selectedItems.length === 0}
                      className="flex-1"
                    >
                      Create Order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AddOrderDialog;
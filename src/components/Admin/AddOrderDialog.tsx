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
  onAddOrder: (customerName: string, customerEmail: string, items: Array<{ item: MenuItem; quantity: number }>) => void;
}

const AddOrderDialog: React.FC<AddOrderDialogProps> = ({ onAddOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{ item: MenuItem; quantity: number; addOns: Array<{ item: MenuItem; quantity: number }> }>>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<{ [itemId: string]: Array<{ item: MenuItem; quantity: number }> }>({});

  const handleAddItem = (item: MenuItem, mainItemId?: string) => {
    if (item.category === 'Add-ons' && mainItemId) {
      // Add add-on to a specific main item
      setSelectedAddOns(prev => ({
        ...prev,
        [mainItemId]: prev[mainItemId] ? [...prev[mainItemId], { item, quantity: 1 }] : [{ item, quantity: 1 }]
      }));
    } else {
      // Add main item
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
      // Combine main items with their add-ons
      const itemsWithAddOns = selectedItems.map(item => ({
        item: item.item,
        quantity: item.quantity,
        addOns: selectedAddOns[item.item.id] || []
      }));
      onAddOrder(customerName, customerEmail, itemsWithAddOns);
      setIsOpen(false);
      setCustomerName('');
      setCustomerEmail('');
      setSelectedItems([]);
      setSelectedAddOns({});
    }
  };

  const total = selectedItems.reduce((sum, si) => {
    const itemTotal = si.item.price * si.quantity;
    const addOnsTotal = (selectedAddOns[si.item.id] || []).reduce((addOnSum, addOn) => addOnSum + (addOn.item.price * addOn.quantity), 0) * si.quantity;
    return sum + itemTotal + addOnsTotal;
  }, 0);

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
            onClick={() => setIsOpen(false)}
          />
        </DialogHeader>
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
         {/* Menu Items */}
         <div>
           <h3 className="text-lg font-semibold mb-4">Select Menu Items</h3>
           <div className="space-y-6">
             {/* Main Courses */}
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
                       {/* Add-ons for this main item */}
                       <div className="mt-4 pt-2 border-t">
                         <p className="text-xs font-medium mb-1 mt-1">Add-ons:</p>
                         <div className="flex flex-wrap gap-1">
                           {menuItems.filter(addOn => addOn.category === 'Add-ons').map((addOn) => (
                             <Button
                               key={addOn.id}
                               size="sm"
                               variant="outline"
                               className="text-xs px-2 py-1"
                               onClick={() => handleAddItem(addOn, item.id)}
                               disabled={!addOn.isAvailable}
                             >
                               + {addOn.name} (£{addOn.price.toFixed(2)})
                             </Button>
                           ))}
                         </div>
                         {selectedAddOns[item.id] && selectedAddOns[item.id].length > 0 && (
                           <div className="mt-2">
                             <p className="text-xs font-medium text-green-600">Selected add-ons:</p>
                             {selectedAddOns[item.id].map((addOn, idx) => (
                               <span key={idx} className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded mr-1">
                                 {addOn.item.name} x{addOn.quantity}
                               </span>
                             ))}
                           </div>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </div>

           </div>
         </div>

         {/* Selected Items */}
         {selectedItems.length > 0 && (
           <div>
             <h3 className="text-lg font-semibold mb-4">Selected Items</h3>
             <div className="space-y-2">
               {selectedItems.map((si) => (
                 <div key={si.item.id} className="flex items-center justify-between p-3 bg-muted rounded">
                   <div>
                     <p className="font-medium">{si.item.name}</p>
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
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-4 text-right">
               <p className="text-lg font-semibold">Total: £{total.toFixed(2)}</p>
             </div>
           </div>
         )}

         {/* Submit Button */}
         <div className="flex justify-end gap-2">
           <Button variant="outline" onClick={() => setIsOpen(false)}>
             Cancel
           </Button>
           <Button
             onClick={handleSubmit}
             disabled={!customerName || !customerEmail || selectedItems.length === 0}
           >
             Create Order
           </Button>
         </div>
       </div>
     </DialogContent>
   </Dialog>
 );
};

export default AddOrderDialog;
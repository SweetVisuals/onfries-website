import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dummyOrders } from '../../data/orderData';
import { isOrderingAllowed } from '../../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to login to place an order.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add some items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    if (!isOrderingAllowed()) {
      toast({
        title: 'Ordering not available',
        description: 'The food truck is currently closed. Please check our hours.',
        variant: 'destructive',
      });
      return;
    }

    // Create a new order (in real app, this would be an API call)
    // Generate sequential order ID starting from 005
    const nextOrderId = String(dummyOrders.length + 1).padStart(3, '0');
    const newOrder = {
      id: nextOrderId,
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      items: items.map(item => ({
        item: {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          category: item.category,
          isAvailable: item.isAvailable,
          preparationTime: item.preparationTime
        },
        quantity: item.quantity
      })),
      total: getTotal(),
      status: 'pending' as const,
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    // Add to dummy orders (in real app, this would be a database operation)
    dummyOrders.unshift(newOrder);

    clearCart();
    onClose();
    
    toast({
      title: 'Order placed successfully!',
      description: `Your order #${newOrder.id} has been placed and will be ready in 30 minutes.`,
    });
  };

  if (items.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Your Orders
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">Add some delicious items from our menu</p>
            <Button onClick={onClose}>Continue Browsing</Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="pr-12 pt-5">
          <SheetTitle className="flex items-center gap-3">
            <span className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              Your Orders
            </span>
            <Badge variant="secondary" className="ml-auto">
              {getItemCount()} items
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-2.5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-muted rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">£{item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="cursor-pointer p-1 hover:bg-accent rounded-md transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3 text-foreground" />
                      </div>
                      
                      <span className="text-sm font-medium w-8 text-center text-foreground">
                        {item.quantity}
                      </span>
                      
                      <div
                        className="cursor-pointer p-1 hover:bg-accent rounded-md transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3 text-foreground" />
                      </div>
                    </div>
                    
                    <div
                      className="cursor-pointer p-1 hover:bg-accent rounded-md transition-colors"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive hover:text-destructive" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4 px-2.5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-yellow-600">
              £{getTotal().toFixed(2)}
            </span>
          </div>
          
          <div className="space-y-2">
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
            >
              Checkout
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

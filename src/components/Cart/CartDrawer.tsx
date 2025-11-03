import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { isOrderingAllowed } from '../../lib/utils';
import SquarePaymentForm from '../Checkout/SquarePaymentForm';
import PaymentSuccessScreen from '../Checkout/PaymentSuccessScreen';
import { createOrder } from '../../lib/database';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderReference, setOrderReference] = useState('');
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const handleStartPayment = () => {
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

    // Generate order reference
    const orderRef = `ONF-${Date.now()}`;
    setOrderReference(orderRef);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (payment: any) => {
    try {
      // Create order in database
      const newOrder = await createOrder({
        customerId: user?.id || 'guest',
        customerName: user?.name || 'Guest',
        customerEmail: user?.email || '',
        items: items,
        total: getTotal(),
        notes: '',
        paymentId: payment.id,
        paymentStatus: payment.status
      });

      // Store order data for success screen
      setCreatedOrder({
        ...newOrder,
        items: items,
        payment: payment
      });

      // Clear cart and close drawer
      clearCart();
      onClose();
      
      // Show success screen
      setShowPayment(false);
      setShowSuccess(true);
      
      toast({
        title: 'Payment Successful!',
        description: `Order #${orderReference} has been placed successfully.`,
      });

    } catch (error: any) {
      console.error('Error creating order:', error);
      setShowPayment(false);
      setOrderReference('');
      toast({
        title: 'Order Creation Failed',
        description: 'Payment was successful but order creation failed. Please contact support.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentError = (error: string) => {
    setShowPayment(false);
    setOrderReference('');
    toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive',
    });
  };

  const handleBackToCart = () => {
    setShowPayment(false);
    setOrderReference('');
  };

  const handleBackToMenu = () => {
    setShowSuccess(false);
    setCreatedOrder(null);
  };

  const handleViewOrders = () => {
    setShowSuccess(false);
    setCreatedOrder(null);
    // Navigate to orders page or show customer dashboard
    // For now, just close the success screen
    onClose();
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
        {/* Only show header when not showing success screen */}
        {!showSuccess && (
          <SheetHeader className="pr-12 pt-5">
            <SheetTitle className="flex items-center gap-3">
              <span className="flex items-center gap-3">
                {showPayment ? <CreditCard className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                {showPayment ? 'Secure Payment' : 'Your Orders'}
              </span>
              {!showPayment && (
                <Badge variant="secondary" className="ml-auto">
                  {getItemCount()} items
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
        )}
        
        {/* Payment Success Screen */}
        {showSuccess && createdOrder ? (
          <PaymentSuccessScreen
            payment={createdOrder.payment}
            orderId={createdOrder.id}
            total={createdOrder.total}
            customerName={createdOrder.customer_name}
            items={createdOrder.items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))}
            estimatedDelivery={createdOrder.estimated_delivery}
            onBackToMenu={handleBackToMenu}
            onViewOrders={handleViewOrders}
          />
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            {showPayment ? (
              // Payment Form
              <div className="px-2.5">
                <SquarePaymentForm
                  amount={getTotal()}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  orderReference={orderReference}
                  customerEmail={user?.email}
                  disabled={false}
                />
                
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleBackToCart}
                    disabled={false}
                  >
                    Back to Cart
                  </Button>
                </div>
              </div>
            ) : (
              // Cart Contents
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
            )}
          </div>
        )}
        
        {!showPayment && (
          <div className="border-t pt-4 mt-4 px-2.5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-yellow-600">
                £{getTotal().toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                size="lg"
                onClick={handleStartPayment}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay Securely
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
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

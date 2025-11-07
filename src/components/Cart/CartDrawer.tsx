import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, ShoppingBag, CreditCard, CheckCircle } from 'lucide-react';
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
   onNavigateToOrders?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigateToOrders }) => {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderReference, setOrderReference] = useState('');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [showSuccessTick, setShowSuccessTick] = useState(false);

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
      console.log('Starting order creation process...', {
        customerId: user?.id || 'guest',
        customerName: user?.name || 'Guest',
        customerEmail: user?.email || '',
        items: items,
        total: getTotal(),
        orderReference
      });

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

      console.log('Order created successfully:', newOrder);

      // Store order data for success screen
      setCreatedOrder({
        ...newOrder,
        items: items,
        payment: payment
      });

      // Show success tick animation immediately
      setShowSuccessTick(true);

      // Clear cart and show success screen immediately
      clearCart();
      setShowPayment(false);
      setShowSuccess(true);
      setShowSuccessTick(false);

      toast({
        title: 'Payment Successful!',
        description: `Order #${orderReference} has been placed successfully.`,
      });

    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Order creation failed with details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      setShowPayment(false);
      setOrderReference('');
      setShowSuccessTick(false);
      toast({
        title: 'Order Creation Failed',
        description: `Payment was successful but order creation failed: ${error.message}`,
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

  // Show success screen even if cart is empty (after payment)
  if (showSuccess && createdOrder) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-md flex flex-col border-2 border-border">
          <PaymentSuccessScreen
            payment={createdOrder.payment}
            orderId={createdOrder.display_id || createdOrder.id}
            total={createdOrder.total}
            customerName={createdOrder.customer_name}
            items={createdOrder.items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))}
            estimatedDelivery={createdOrder.estimated_delivery}
            onBackToMenu={() => {
              setShowSuccess(false);
              setCreatedOrder(null);
              onClose();
            }}
            onViewOrders={() => {
              setShowSuccess(false);
              setCreatedOrder(null);
              onClose();
              if (onNavigateToOrders) {
                onNavigateToOrders();
              }
            }}
            isInDrawer={true}
          />
        </SheetContent>
      </Sheet>
    );
  }

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
      <SheetContent className="w-full sm:max-w-md flex flex-col border-2 border-border">
        {/* Only show header when not showing success screen */}
        {!showSuccess && (
          <SheetHeader className="pr-12 pt-5">
            <SheetTitle className="flex items-center gap-3">
              <span className="flex items-center gap-3">
                {showSuccessTick ? (
                  <>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    Payment Successful!
                  </>
                ) : showPayment ? (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Secure Payment
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Your Orders
                  </>
                )}
              </span>
              {!showPayment && !showSuccessTick && (
                <Badge variant="secondary" className="ml-auto">
                  {getItemCount()} items
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
        )}

        {/* Payment Success Screen */}
        {showSuccess && createdOrder && (
          <PaymentSuccessScreen
            payment={createdOrder.payment}
            orderId={createdOrder.display_id || createdOrder.id}
            total={createdOrder.total}
            customerName={createdOrder.customer_name}
            items={createdOrder.items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))}
            estimatedDelivery={createdOrder.estimated_delivery}
            onBackToMenu={() => {
              setShowSuccess(false);
              setCreatedOrder(null);
              onClose();
            }}
            onViewOrders={() => {
              setShowSuccess(false);
              setCreatedOrder(null);
              onClose();
              if (onNavigateToOrders) {
                onNavigateToOrders();
              }
            }}
            isInDrawer={true}
          />
        )}

        {!showSuccess && (
          <div className="flex-1 overflow-y-auto py-4 pl-6 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-transparent">
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
              <div className="px-2.5 grid grid-cols-1 gap-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-muted rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">£{item.price.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-2 ml-2">
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

                        <div
                          className="cursor-pointer p-1 hover:bg-accent rounded-md transition-colors"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive hover:text-destructive" />
                        </div>
                      </div>
                    </div>

                    {/* Display add-ons */}
                    {item.addOns && item.addOns.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-400 dark:border-gray-500">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Add-ons</p>
                        <div className="space-y-1">
                          {item.addOns.map((addon) => (
                            <div key={addon.item?.id || Math.random()} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700 dark:text-gray-300">
                                {addon.item?.name || 'Unknown'} x{addon.quantity}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                £{((addon.item?.price || 0) * addon.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display drinks */}
                    {item.drinks && item.drinks.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-400 dark:border-gray-500">
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1 uppercase tracking-wide">Drink</p>
                        <div className="space-y-1">
                          {item.drinks.map((drink) => (
                            <div key={drink.item?.id || Math.random()} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700 dark:text-gray-300">
                                {drink.item?.name || 'Unknown'} x{drink.quantity}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                £{((drink.item?.price || 0) * drink.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!showPayment && !showSuccess && (
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

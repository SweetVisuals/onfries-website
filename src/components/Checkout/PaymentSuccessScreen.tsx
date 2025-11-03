import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Receipt, Clock, CreditCard, ArrowLeft } from 'lucide-react';

interface PaymentSuccessScreenProps {
  payment: any;
  orderId: string;
  total: number;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  estimatedDelivery: string;
  onBackToMenu: () => void;
  onViewOrders: () => void;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({
  payment,
  orderId,
  total,
  customerName,
  items,
  estimatedDelivery,
  onBackToMenu,
  onViewOrders
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto-navigate to orders after 3 seconds
    setTimeout(() => {
      if (onViewOrders) {
        onViewOrders();
      }
    }, 3000);
  }, [onViewOrders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md transform transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your order has been placed successfully.</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Order #{orderId}</span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium text-green-600">{payment.status || 'COMPLETED'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium text-xs">{payment.id}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Items Ordered:</p>
              <div className="space-y-1">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-medium">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-3 flex justify-between font-semibold">
                <span>Total:</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Estimated Delivery</span>
            </div>
            <p className="text-blue-800 text-sm">
              {new Date(estimatedDelivery).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-blue-600 text-xs mt-1">(Approximately 30 minutes)</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <p className="text-sm text-green-600 text-center mb-4">
              Automatically navigating to your orders...
            </p>
            
            <Button
              variant="outline"
              onClick={onBackToMenu}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </div>

          {/* Payment Method */}
          {payment.cardDetails && (
            <div className="mt-4 pt-4 border-t text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <CreditCard className="w-4 h-4" />
                <span>
                  Paid with {payment.cardDetails.brand} •••• {payment.cardDetails.last4}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessScreen;
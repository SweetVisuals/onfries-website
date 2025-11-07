import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Receipt, Clock, CreditCard, ArrowLeft, Sparkles } from 'lucide-react';

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
  isInDrawer?: boolean;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({
  payment,
  orderId,
  total,
  customerName,
  items,
  estimatedDelivery,
  onBackToMenu,
  onViewOrders,
  isInDrawer = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Show confetti animation
    setTimeout(() => setShowConfetti(true), 300);
  }, []);

  const containerClasses = isInDrawer
    ? "h-full flex flex-col justify-center p-4"
    : "min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4";

  const cardClasses = `w-full ${isInDrawer ? 'max-w-none border-0 shadow-none bg-transparent' : 'max-w-md'} transform transition-all duration-700 ${
    isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
  }`;

  return (
    <div className={containerClasses}>

      <Card className={cardClasses}>
        <CardContent className={`${isInDrawer ? 'p-6' : 'p-8'} text-center relative`}>
          {/* Success Icon with Animation */}
          <div className="mb-6 relative">
            <div className={`w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-1000 ${
              isVisible ? 'scale-110 animate-pulse' : 'scale-0'
            }`}>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className={`text-2xl font-bold text-gray-900 dark:text-white mb-2 transform transition-all duration-700 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>Payment Successful!</h1>
            <p className={`text-gray-600 dark:text-gray-300 transform transition-all duration-700 delay-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>Your order has been placed successfully.</p>
          </div>

          {/* Order Details with Staggered Animation */}
          <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left transform transition-all duration-700 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">Order #{orderId}</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                <span className="font-medium text-gray-900 dark:text-white">{customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{payment.status || 'COMPLETED'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                <span className="font-medium text-xs text-gray-900 dark:text-white">{payment.id}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items Ordered:</p>
              <div className="space-y-1">
                {items.map((item, index) => (
                  <div key={index} className={`flex justify-between text-sm transform transition-all duration-500 ${
                    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`} style={{ transitionDelay: `${900 + index * 100}ms` }}>
                    <span className="text-gray-600 dark:text-gray-400">{item.name} x{item.quantity}</span>
                    <span className="font-medium text-gray-900 dark:text-white">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-3 flex justify-between font-semibold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Time with Animation */}
          <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 transform transition-all duration-700 delay-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">Estimated Delivery</span>
            </div>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {new Date(estimatedDelivery).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">(Approximately 30 minutes)</p>
          </div>

          {/* Action Buttons with Animation */}
          <div className={`space-y-3 transform transition-all duration-700 delay-1200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <Button
              onClick={onViewOrders}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              View My Orders
            </Button>

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
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
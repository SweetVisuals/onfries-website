import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Package, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import { getOrdersByCustomer } from '../../data/orderData';
import { useAuth } from '../../contexts/AuthContext';

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p className="text-xl text-gray-600">Please login to view your order history.</p>
      </div>
    );
  }

  const orders = getOrdersByCustomer(user.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <Package className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">Track your past and current orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500">Your order history will appear here once you place your first order.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {new Date(order.orderDate).toLocaleDateString()} at{' '}
                        {new Date(order.orderDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.items.map((orderItem, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <img
                          src={orderItem.item.image}
                          alt={orderItem.item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{orderItem.item.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {orderItem.quantity} × ${orderItem.item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(orderItem.item.price * orderItem.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-orange-600">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>

                    {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        Estimated delivery: {new Date(order.estimatedDelivery).toLocaleTimeString()}
                      </div>
                    )}

                    {order.notes && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium text-gray-700">Notes:</p>
                        <p className="text-sm text-gray-600">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
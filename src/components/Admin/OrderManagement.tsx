import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Package, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import { dummyOrders } from '../../data/orderData';
import { useToast } from '@/hooks/use-toast';

const OrderManagement: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState(dummyOrders);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      )
    );
    
    toast({
      title: 'Order updated',
      description: `Order #${orderId} status changed to ${newStatus}`,
    });
  };

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                  <p className="text-gray-600">{order.customerName} • {order.customerEmail}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-600">${order.total.toFixed(2)}</p>
                  <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <h4 className="font-medium">Order Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.item.name}</span>
                    <span>${(item.item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm font-medium">Notes:</p>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {order.status === 'pending' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                  >
                    Start Preparing
                  </Button>
                )}
                
                {order.status === 'preparing' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                  >
                    Mark Ready
                  </Button>
                )}
                
                {order.status === 'ready' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                  >
                    Mark Delivered
                  </Button>
                )}

                {(order.status === 'pending' || order.status === 'preparing') && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">No orders match your current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderManagement;
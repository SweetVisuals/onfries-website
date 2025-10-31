import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Clock } from 'lucide-react';
import { getOrdersByCustomer, dummyOrders } from '../../data/orderData';
import { useAuth } from '../../contexts/AuthContext';
import PastOrderCard from '../Orders/PastOrderCard'; // Adjusted path
import { Card, CardContent } from '@/components/ui/card'; // Keep Card and CardContent for the "No orders found" message

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Please login to view your order history.</p>
      </div>
    );
  }

  // For admin users, show all past orders; for customers, show their past orders
  const allOrders = user.role === 'admin' ? dummyOrders : getOrdersByCustomer(user.id);
  const orders = allOrders.filter(order => order.status === 'delivered' || order.status === 'ready');

  const filteredOrders = orders.filter(order =>
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.items.some(item => item.item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClearHistory = () => {
    // This would typically involve an API call to clear the user's order history
    // For now, we'll just clear the filtered results.
    setSearchTerm('');
    console.log('Clear history functionality would be implemented here.');
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Order History</h1>
        </div>

        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search name, order #, or item"
              className="pl-10 pr-4 py-2 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleClearHistory}
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">Your order history will appear here once you place your first order or match your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <PastOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
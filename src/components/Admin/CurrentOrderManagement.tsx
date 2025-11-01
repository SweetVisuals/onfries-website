import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Clock } from 'lucide-react';
import { getOrdersByCustomer, dummyOrders, addOrder, Order } from '../../data/orderData';
import { useAuth } from '../../contexts/AuthContext';
import CurrentOrderCard from '../Orders/CurrentOrderCard'; // Adjusted path
import { Card, CardContent } from '@/components/ui/card'; // Keep Card and CardContent for the "No orders found" message
import AddOrderDialog from './AddOrderDialog';
import { MenuItem } from '../../data/menuData';
import MeatCookingCards from './MeatCookingCards';

const CurrentOrderManagement: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>(dummyOrders);

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Please login to view your current orders.</p>
      </div>
    );
  }

  // For admin users, show all current orders; for customers, show their current orders
  const allOrders = user.role === 'admin' ? orders : getOrdersByCustomer(user.id);
  const currentOrders = allOrders.filter(order => order.status === 'preparing' || order.status === 'pending');

  const filteredOrders = currentOrders.filter(order =>
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

  const handleOrderComplete = (updatedOrder: Order) => {
    // Update the order in the state with completion information
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    
    console.log(`Order ${updatedOrder.id} completed. Time taken: ${updatedOrder.totalTimeTaken} minutes`);
  };

  const handleAddOrder = (customerName: string, customerEmail: string, items: Array<{ item: MenuItem; quantity: number; addOns?: Array<{ item: MenuItem; quantity: number }> }>) => {
    const newOrder = {
      id: (dummyOrders.length + 1).toString().padStart(3, '0'),
      customerId: 'admin-created', // Placeholder for admin-created orders
      customerName,
      customerEmail,
      items,
      total: items.reduce((sum, item) => {
        const itemTotal = item.item.price * item.quantity;
        const addOnsTotal = (item.addOns || []).reduce((addOnSum, addOn) => addOnSum + (addOn.item.price * addOn.quantity), 0) * item.quantity;
        return sum + itemTotal + addOnsTotal;
      }, 0),
      status: 'pending' as const,
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    };
    addOrder(newOrder);
    setOrders([...orders, newOrder]);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <MeatCookingCards orders={orders} />
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
          <AddOrderDialog onAddOrder={handleAddOrder} />
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
              <h3 className="text-lg font-medium text-foreground mb-2">No current orders found</h3>
              <p className="text-muted-foreground">Your current orders will appear here once you place your first order or match your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <CurrentOrderCard
                key={order.id}
                order={order}
                onComplete={handleOrderComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentOrderManagement;
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Clock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders, Order, deleteOrder } from '../../lib/database';
import CurrentOrderCard from './CurrentOrderCard';
import { Card, CardContent } from '@/components/ui/card';

interface OrderWithItems extends Order {
  order_items?: Array<{
    quantity: number;
    price: number;
    menu_items?: {
      name: string;
      description: string;
      category: string;
    };
  }>;
}

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return (
      <div className="bg-background py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-md mx-auto">
            <LogIn className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome Back</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Please login to view your order history and track your delicious meals.
            </p>
            <Button className="px-8 py-3 text-lg">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const customerOrders = await getCustomerOrders(user.id);
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.order_items?.some((item) => item.menu_items?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClearHistory = () => {
    setSearchTerm('');
    console.log('Clear history functionality would be implemented here.');
  };

  const transformOrderForCard = (order: OrderWithItems) => {
    // Transform database order format to match CurrentOrderCard expectations
    return {
      id: order.id,
      customerId: order.customer_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items: order.order_items?.map((item) => ({
        item: {
          id: '', // We don't have this in the query result
          name: item.menu_items?.name || 'Unknown Item',
          description: item.menu_items?.description || '',
          price: item.price,
          image: '',
          category: item.menu_items?.category || '',
          isAvailable: true,
          preparationTime: 0
        },
        quantity: item.quantity
      })) || [],
      total: order.total,
      status: order.status,
      orderDate: order.order_date,
      estimatedDelivery: order.estimated_delivery,
      notes: order.notes
    };
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      // Refresh the orders list after deletion
      loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8" style={{ marginRight: '-5px', paddingRight: '5px', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Order History</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your past orders</p>
        </div>

        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search name, order #, or item"
              className="pl-10 pr-4 py-3 rounded-md text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-6"
            onClick={handleClearHistory}
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading order history...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Clock className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-medium text-foreground mb-3">No orders found</h3>
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No orders match your search criteria.' : 'Your order history will appear here once you place your first order.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredOrders.map((order) => (
              <CurrentOrderCard
                key={order.id}
                order={transformOrderForCard(order)}
                isPastOrder={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

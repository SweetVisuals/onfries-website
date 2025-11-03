import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Clock } from 'lucide-react';
import { Order } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import CurrentOrderCard from '../Orders/CurrentOrderCard';
import { Card, CardContent } from '@/components/ui/card';
import { listenForOrderUpdates } from '../../lib/database';

interface OrderWithItems extends Order {
  order_items?: Array<{
    quantity: number;
    price: number;
    menu_items?: {
      name: string;
      description: string;
      category: string;
      price: number;
    };
  }>;
}

const OrderManagement: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p className="text-xl text-gray-600">Please login to view your order history.</p>
      </div>
    );
  }

  useEffect(() => {
    loadOrders();
    
    // Listen for new order updates
    const cleanup = listenForOrderUpdates(() => {
      console.log('New order detected in history, refreshing...');
      loadOrders();
    });
    
    return cleanup;
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Import dynamically to avoid circular dependencies
      const { supabase } = await import('../../lib/supabase');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            menu_items (
              name,
              description,
              category,
              price
            )
          )
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const handleClearHistory = () => {
    setSearchTerm('');
    console.log('Clear history functionality would be implemented here.');
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] py-8 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
        </div>

        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search name, order #, or item"
              className="pl-10 pr-4 py-2 rounded-md bg-[#2C2C2C] border-none text-white placeholder-gray-400 focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-[#2C2C2C]"
            onClick={handleClearHistory}
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-white">Loading order history...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="bg-[#2C2C2C] text-white border-none">
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
              <p className="text-gray-400">
                {searchTerm ? 'No orders match your search criteria.' : 'Your order history will appear here once you place your first order or match your search.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <CurrentOrderCard key={order.id} order={transformOrderForCard(order)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;

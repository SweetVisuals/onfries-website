import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Clock } from 'lucide-react';
import { Order } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import CurrentOrderCard from '../Orders/CurrentOrderCard';
import { Card, CardContent } from '@/components/ui/card';
import AddOrderDialog from './AddOrderDialog';
import { MenuItem } from '../../data/menuData';
import MeatCookingCards from './MeatCookingCards';

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

const CurrentOrderManagement: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Please login to view your current orders.</p>
      </div>
    );
  }

  useEffect(() => {
    loadOrders();
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
        .in('status', ['pending', 'preparing'])
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading current orders:', error);
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

  const transformOrderForMeatCards = (order: OrderWithItems) => {
    // Transform database order format to match MeatCookingCards expectations
    return {
      id: order.id,
      customerId: order.customer_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items: order.order_items?.map((item) => ({
        item: {
          id: '', // Not needed for meat cards
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

  const handleOrderComplete = (updatedOrder: any) => {
    // Handle order completion - this would typically update the database
    console.log(`Order ${updatedOrder.id} completed. Time taken: ${updatedOrder.totalTimeTaken} minutes`);
    // Reload orders to reflect the change
    loadOrders();
  };

  const handleAddOrder = (customerName: string, customerEmail: string, items: Array<{ item: MenuItem; quantity: number; addOns?: Array<{ item: MenuItem; quantity: number }> }>) => {
    // This would typically create a new order in the database
    console.log('Add order functionality would be implemented here');
    // Reload orders to reflect the change
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <MeatCookingCards orders={orders.map(transformOrderForMeatCards)} />
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
                order={transformOrderForCard(order)}
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
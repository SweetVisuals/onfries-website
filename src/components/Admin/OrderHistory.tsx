import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, Calendar } from 'lucide-react';
import { Order, deleteOrder } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import PastOrderCard from '../Orders/PastOrderCard';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listenForOrderUpdates } from '../../lib/database';

interface OrderWithItems extends Order {
  order_items?: Array<{
    quantity: number;
    price: number;
    menu_items?: {
      id: string;
      name: string;
      description: string;
      category: string;
      price: number;
    };
  }>;
  completed_at?: string;
}

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('all');

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Please login to view your order history.</p>
      </div>
    );
  }

  useEffect(() => {
    loadOrders();
    
    // Listen for order updates (new orders and completed orders)
    const cleanup = listenForOrderUpdates(() => {
      console.log('Order update detected in history, refreshing...');
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
              id,
              name,
              description,
              category,
              price
            )
          )
        `)
        .in('status', ['delivered', 'ready'])
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading past orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.order_items?.some((item) => item.menu_items?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedDate === 'all') return true;

    const orderDate = new Date(order.order_date);
    const today = new Date();

    switch (selectedDate) {
      case 'today':
        return orderDate.toDateString() === today.toDateString();
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return orderDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return orderDate >= monthAgo;
      default:
        return true;
    }
  });

  const transformOrderForCard = (order: OrderWithItems) => {
    // Group order items by main item, add-ons, and drinks
    const groupedItems: { [key: string]: { mainItem: any; addOns: any[]; drinks: any[] } } = {};
    const standaloneItems: any[] = [];
    let lastMainItemKey: string | null = null;

    order.order_items?.forEach((item, index) => {
      const menuItem = item.menu_items;
      if (!menuItem) return;

      const itemId = item.menu_items?.id || `item-${index}`;
      const category = menuItem.category;
      const name = menuItem.name;

      // Determine if this is a main item, add-on, or drink
      if (category === 'Main Courses' || category === 'Kids') {
        // Main item - check if it can have add-ons
        const canHaveAddOns = (category === 'Main Courses' && name !== 'Steak Only') || (category === 'Kids' && name === 'Kids Meal');

        if (canHaveAddOns) {
          // Main item that can have add-ons
          if (!groupedItems[itemId]) {
            groupedItems[itemId] = {
              mainItem: {
                item: {
                  id: itemId,
                  name: menuItem.name,
                  description: menuItem.description,
                  price: item.price,
                  image: '',
                  category: menuItem.category,
                  isAvailable: true,
                  preparationTime: 0
                },
                quantity: item.quantity
              },
              addOns: [],
              drinks: []
            };
          }
          lastMainItemKey = itemId; // Track the last main item that can have add-ons
        } else {
          // Standalone main item (like Steak Only)
          standaloneItems.push({
            item: {
              id: itemId,
              name: menuItem.name,
              description: menuItem.description,
              price: item.price,
              image: '',
              category: menuItem.category,
              isAvailable: true,
              preparationTime: 0
            },
            quantity: item.quantity,
            addOns: [],
            drinks: []
          });
          lastMainItemKey = null; // Reset since this item can't have add-ons
        }
      } else if (category === 'Add-ons') {
        // Add-on - associate with the last main item that can have add-ons
        if (lastMainItemKey && groupedItems[lastMainItemKey]) {
          groupedItems[lastMainItemKey].addOns.push({
            item: {
              id: itemId,
              name: menuItem.name,
              description: menuItem.description,
              price: item.price,
              image: '',
              category: menuItem.category,
              isAvailable: true,
              preparationTime: 0
            },
            quantity: item.quantity
          });
        } else {
          // No suitable main item found, treat as standalone
          standaloneItems.push({
            item: {
              id: itemId,
              name: menuItem.name,
              description: menuItem.description,
              price: item.price,
              image: '',
              category: menuItem.category,
              isAvailable: true,
              preparationTime: 0
            },
            quantity: item.quantity,
            addOns: [],
            drinks: []
          });
        }
      } else if (category === 'Drinks') {
        // Drink - associate with the last main item that can have add-ons
        if (lastMainItemKey && groupedItems[lastMainItemKey]) {
          groupedItems[lastMainItemKey].drinks.push({
            item: {
              id: itemId,
              name: menuItem.name,
              description: menuItem.description,
              price: item.price,
              image: '',
              category: menuItem.category,
              isAvailable: true,
              preparationTime: 0
            },
            quantity: item.quantity
          });
        } else {
          // No suitable main item found, treat as standalone
          standaloneItems.push({
            item: {
              id: itemId,
              name: menuItem.name,
              description: menuItem.description,
              price: item.price,
              image: '',
              category: menuItem.category,
              isAvailable: true,
              preparationTime: 0
            },
            quantity: item.quantity,
            addOns: [],
            drinks: []
          });
        }
      }
    });

    // Convert grouped items to the expected format
    const items = [
      ...Object.values(groupedItems).map(group => ({
        ...group.mainItem,
        addOns: group.addOns,
        drinks: group.drinks
      })),
      ...standaloneItems
    ];

    return {
      id: order.display_id || order.id,
      customerId: order.customer_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items: items,
      total: order.total,
      status: order.status,
      orderDate: order.order_date,
      estimatedDelivery: order.estimated_delivery,
      notes: order.notes,
      completedAt: order.completed_at
    };
  };


  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Find the actual database UUID from the display ID
      const order = orders.find(o => (o.display_id || o.id) === orderId);
      const actualOrderId = order?.id || orderId;

      await deleteOrder(actualOrderId);
      // Refresh the orders list after deletion
      loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Order History</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search name, order #, or item"
              className="pl-10 pr-4 py-2 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg">Loading order history...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No orders match your search criteria.' : 'Your order history will appear here once you place your first order or match your search.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
              <PastOrderCard
                key={order.id}
                order={transformOrderForCard(order)}
                onDelete={handleDeleteOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
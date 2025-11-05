import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Clock } from 'lucide-react';
import { Order, deleteOrder } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';
import CurrentOrderCard from '../Orders/CurrentOrderCard';
import { Card, CardContent } from '@/components/ui/card';
import AddOrderDialog from './AddOrderDialog';
import { MenuItem } from '../../data/menuData';
import MeatCookingCards from './MeatCookingCards';
import { listenForOrderUpdates, updateOrderStatus } from '../../lib/database';

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
}

const CurrentOrderManagement: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [_, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Please login to view your current orders.</p>
      </div>
    );
  }

  useEffect(() => {
    loadOrders();
    
    // Listen for new order updates
    const cleanup = listenForOrderUpdates(() => {
      console.log('New order detected, refreshing...');
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
      items: order.order_items?.map((item, index) => ({
        item: {
          id: item.menu_items?.id || `item-${index}`, // Use actual menu item ID or fallback
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

  const handleOrderComplete = async (updatedOrder: any) => {
    try {
      console.log(`Marking order ${updatedOrder.id} as completed. Time taken: ${updatedOrder.totalTimeTaken} minutes`);
      
      // Update order status to 'delivered' in the database
      await updateOrderStatus(updatedOrder.id, 'delivered');
      
      console.log('Order marked as delivered successfully');
      
      // Reload orders to reflect the change
      loadOrders();
      
    } catch (error) {
      console.error('Error marking order as completed:', error);
    }
  };

  const handleAddOrder = async (customerName: string, customerEmail: string, items: Array<{ item: MenuItem; quantity: number; addOns?: Array<{ item: MenuItem; quantity: number }> }>) => {
    try {
      // Use the admin's user ID as customer ID (don't create separate customer)
      if (!user) {
        throw new Error('Admin user not authenticated');
      }

      const customerId = user.id; // Use the admin's user ID as customer ID

      // Get actual menu items from database to ensure we have correct UUIDs
      const { getMenuItems } = await import('../../lib/database');
      const dbMenuItems = await getMenuItems();

      // Create a map of name to database item for lookup
      const menuItemMap = new Map();
      dbMenuItems.forEach(dbItem => {
        menuItemMap.set(dbItem.name, dbItem);
      });

      // Transform items to match CartItem interface using database IDs
      const cartItems = items.flatMap(orderItem => {
        // Handle main item
        const dbItem = menuItemMap.get(orderItem.item.name);
        if (!dbItem) {
          throw new Error(`Menu item "${orderItem.item.name}" not found in database`);
        }

        const mainItem = {
          id: dbItem.id, // Use database UUID
          name: orderItem.item.name,
          description: orderItem.item.description,
          price: orderItem.item.price,
          image: orderItem.item.image,
          category: orderItem.item.category,
          isAvailable: orderItem.item.isAvailable,
          preparationTime: orderItem.item.preparationTime,
          quantity: orderItem.quantity
        };

        // Handle add-ons as separate items
        const addOnItems = (orderItem.addOns || []).map(addOn => {
          const dbAddOn = menuItemMap.get(addOn.item.name);
          if (!dbAddOn) {
            console.warn(`Add-on "${addOn.item.name}" not found in database, skipping`);
            return null; // Skip this add-on instead of throwing error
          }
          return {
            id: dbAddOn.id,
            name: addOn.item.name,
            description: addOn.item.description,
            price: addOn.item.price,
            image: addOn.item.image,
            category: addOn.item.category,
            isAvailable: addOn.item.isAvailable,
            preparationTime: addOn.item.preparationTime,
            quantity: addOn.quantity * orderItem.quantity // Multiply by main item quantity
          };
        }).filter(item => item !== null); // Remove null items

        return [mainItem, ...addOnItems];
      });

      // Calculate total including add-ons
      const total = items.reduce((sum, orderItem) => {
        const itemTotal = orderItem.item.price * orderItem.quantity;
        const addOnsTotal = (orderItem.addOns || []).reduce((addOnSum, addOn) => addOnSum + (addOn.item.price * addOn.quantity), 0) * orderItem.quantity;
        return sum + itemTotal + addOnsTotal;
      }, 0);

      // Import supabase directly
      const { supabase } = await import('../../lib/supabase');

      // Get the next order number (sequential based on all orders)
      const { data: allOrders, error: countError } = await supabase
        .from('orders')
        .select('id')
        .order('created_at', { ascending: false });

      if (countError) {
        console.error('Error getting order count:', countError);
      }

      const nextOrderNumber = (allOrders?.length || 0) + 1;
      const orderId = crypto.randomUUID(); // Use UUID instead of ORDER-XXXX format

      // Create the order directly using the admin's user ID (skip customer creation entirely)
      const orderDate = new Date().toISOString();
      const estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now

      console.log('Inserting order record...', {
        id: orderId,
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail || user.email,
        total: total,
        status: 'pending',
        order_date: orderDate,
        estimated_delivery: estimatedDelivery,
        notes: 'Created by admin'
      });

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_id: customerId,
          customer_name: customerName,
          customer_email: customerEmail || user.email,
          total: total,
          status: 'pending',
          order_date: orderDate,
          estimated_delivery: estimatedDelivery,
          notes: 'Created by admin'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order record created successfully:', order);

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      console.log('Inserting order items...', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        // If order items creation fails, delete the order
        await supabase.from('orders').delete().eq('id', orderId);
        throw itemsError;
      }

      console.log('Order items created successfully');

      // Trigger refresh event for admin panels
      const { triggerOrderRefresh } = await import('../../lib/database');
      triggerOrderRefresh();

      console.log('Order created successfully by admin');
      // Reload orders to reflect the change
      loadOrders();
    } catch (error) {
      console.error('Error creating order:', error);
    }
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
            {filteredOrders.map((order, index) => (
              <CurrentOrderCard
                key={`${order.id}-${index}`}
                order={transformOrderForCard(order)}
                onComplete={handleOrderComplete}
                onDelete={handleDeleteOrder}
              />
            )).reverse()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentOrderManagement;
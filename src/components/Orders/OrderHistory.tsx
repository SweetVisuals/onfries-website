import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders, Order } from '../../lib/database';
import CurrentOrderCard from './CurrentOrderCard';
import { Card, CardContent } from '@/components/ui/card';

interface OrderWithItems extends Order {
  order_items?: Array<{
    quantity: number;
    price: number;
    menu_items?: {
      id: string;
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

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  const loadOrders = async () => {
    try {
      setLoading(true);
      const customerOrders = await getCustomerOrders(user.id);
      // Sort orders by display_id (newest first) to show sequential numbering
      const sortedOrders = customerOrders.sort((a, b) => {
        const aNum = parseInt(a.display_id || '0') || 0;
        const bNum = parseInt(b.display_id || '0') || 0;
        return bNum - aNum; // Newest (highest number) first
      });
      setOrders(sortedOrders);
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


  const transformOrderForCard = (order: OrderWithItems, allOrders: OrderWithItems[]) => {
    // Handle both admin-created orders (separate order_items) and customer-created orders (customized items)
    const items: any[] = [];

    // Check if this is a customer order by looking for items with addOns/drinks properties
    const hasCustomizedItems = order.order_items?.some(item =>
      (item as any).addOns || (item as any).drinks
    );

    if (hasCustomizedItems) {
      // Customer orders - items already have the correct structure
      order.order_items?.forEach((orderItem) => {
        const item = orderItem as any;
        if (item.addOns || item.drinks) {
          items.push({
            item: {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              image: item.image || '',
              category: item.category,
              isAvailable: true,
              preparationTime: 0
            },
            quantity: item.quantity,
            addOns: item.addOns || [],
            drinks: item.drinks || []
          });
        } else {
          // Regular items without add-ons/drinks
          items.push({
            item: {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              image: item.image || '',
              category: item.category,
              isAvailable: true,
              preparationTime: 0
            },
            quantity: item.quantity,
            addOns: [],
            drinks: []
          });
        }
      });
    } else {
      // Admin orders - need to group items by their relationships
      const groupedItems: { [key: string]: { mainItem: any; addOns: any[]; drinks: any[] } } = {};
      const standaloneItems: any[] = [];
      let lastMainItemKey: string | null = null;

      // Process all items in this order for grouping
      order.order_items?.forEach((orderItem, itemIndex) => {
        const menuItemData = orderItem.menu_items;
        if (!menuItemData) return;

        const itemIdData = orderItem.menu_items?.id || `item-${itemIndex}`;
        const categoryData = menuItemData.category;
        const nameData = menuItemData.name;

        // Determine if this is a main item, add-on, or drink
        if (categoryData === 'Main Courses' || categoryData === 'Kids') {
          // Main item - check if it can have add-ons
          const canHaveAddOns = (categoryData === 'Main Courses' && nameData !== 'Steak Only') || (categoryData === 'Kids' && nameData === 'Kids Meal');

          if (canHaveAddOns) {
            // Main item that can have add-ons
            if (!groupedItems[itemIdData]) {
              groupedItems[itemIdData] = {
                mainItem: {
                  item: {
                    id: itemIdData,
                    name: menuItemData.name,
                    description: menuItemData.description,
                    price: orderItem.price,
                    image: '',
                    category: menuItemData.category,
                    isAvailable: true,
                    preparationTime: 0
                  },
                  quantity: orderItem.quantity
                },
                addOns: [],
                drinks: []
              };
            }
            lastMainItemKey = itemIdData; // Track the last main item that can have add-ons
          } else {
            // Standalone main item (like Steak Only)
            standaloneItems.push({
              item: {
                id: itemIdData,
                name: menuItemData.name,
                description: menuItemData.description,
                price: orderItem.price,
                image: '',
                category: menuItemData.category,
                isAvailable: true,
                preparationTime: 0
              },
              quantity: orderItem.quantity,
              addOns: [],
              drinks: []
            });
            lastMainItemKey = null; // Reset since this item can't have add-ons
          }
        } else if (categoryData === 'Add-ons') {
          // Add-on - associate with the last main item that can have add-ons
          if (lastMainItemKey && groupedItems[lastMainItemKey]) {
            groupedItems[lastMainItemKey].addOns.push({
              item: {
                id: itemIdData,
                name: menuItemData.name,
                description: menuItemData.description,
                price: orderItem.price,
                image: '',
                category: menuItemData.category,
                isAvailable: true,
                preparationTime: 0
              },
              quantity: orderItem.quantity
            });
          } else {
            // No suitable main item found, treat as standalone
            standaloneItems.push({
              item: {
                id: itemIdData,
                name: menuItemData.name,
                description: menuItemData.description,
                price: orderItem.price,
                image: '',
                category: menuItemData.category,
                isAvailable: true,
                preparationTime: 0
              },
              quantity: orderItem.quantity,
              addOns: [],
              drinks: []
            });
          }
        } else if (categoryData === 'Drinks') {
          // Drink - associate with the last main item that can have add-ons
          if (lastMainItemKey && groupedItems[lastMainItemKey]) {
            groupedItems[lastMainItemKey].drinks.push({
              item: {
                id: itemIdData,
                name: menuItemData.name,
                description: menuItemData.description,
                price: orderItem.price,
                image: '',
                category: menuItemData.category,
                isAvailable: true,
                preparationTime: 0
              },
              quantity: orderItem.quantity
            });
          } else {
            // No suitable main item found, treat as standalone
            standaloneItems.push({
              item: {
                id: itemIdData,
                name: menuItemData.name,
                description: menuItemData.description,
                price: orderItem.price,
                image: '',
                category: menuItemData.category,
                isAvailable: true,
                preparationTime: 0
              },
              quantity: orderItem.quantity,
              addOns: [],
              drinks: []
            });
          }
        }
      });

      // Convert grouped items to the expected format
      const groupedResult = [
        ...Object.values(groupedItems).map((group: any) => ({
          ...group.mainItem,
          addOns: group.addOns,
          drinks: group.drinks
        })),
        ...standaloneItems
      ];

      items.push(...groupedResult);
    }

    // Calculate queue position - count orders ahead in queue (pending/preparing)
    const pendingOrders = allOrders.filter(o =>
      (o.status === 'pending' || o.status === 'preparing') &&
      new Date(o.order_date) < new Date(order.order_date)
    );
    const queuePosition = pendingOrders.length + 1;

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
      queuePosition: order.status === 'delivered' ? undefined : queuePosition,
      completedAt: order.status === 'delivered' ? order.order_date : undefined // Use order_date as completedAt for delivered orders
    };
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
                order={transformOrderForCard(order, orders)}
                isPastOrder={order.status === 'delivered'}
                isCustomerView={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

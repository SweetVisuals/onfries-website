import { supabase } from './supabase';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  is_available: boolean;
  preparation_time?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
   id: string;
   customer_id: string;
   customer_name: string;
   customer_email: string;
   total: number;
   status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
   order_date: string;
   estimated_delivery?: string;
   notes?: string;
   display_id?: string;
   created_at: string;
   updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  created_at: string;
  menu_item?: MenuItem;
}

export interface CustomerLog {
  id: string;
  customer_id: string;
  action: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Dashboard Statistics
export interface DashboardStats {
  todayRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  averageOrderChange: number;
  customersChange: number;
  averageOrderTime: number;
}

// Revenue data for charts
export interface RevenueData {
  date: string;
  revenue: number;
}

// Revenue by item data
export interface RevenueByItem {
  name: string;
  revenue: number;
}

// Database query functions
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Get today's orders
  const { data: todayOrders, error: todayError } = await supabase
    .from('orders')
    .select('*')
    .gte('order_date', today);

  if (todayError) throw todayError;

  // Get yesterday's orders
  const { data: yesterdayOrders, error: yesterdayError } = await supabase
    .from('orders')
    .select('total, customer_id')
    .gte('order_date', yesterday)
    .lt('order_date', today);

  if (yesterdayError) throw yesterdayError;

  // Calculate today's stats
  const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalOrders = todayOrders?.length || 0;
  const averageOrderValue = totalOrders > 0 ? todayRevenue / totalOrders : 0;
  const totalCustomers = new Set(todayOrders?.map(order => order.customer_id)).size;

  // Calculate yesterday's stats
  const yesterdayRevenue = yesterdayOrders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const yesterdayOrderCount = yesterdayOrders?.length || 0;
  const yesterdayAverageOrder = yesterdayOrderCount > 0 ? yesterdayRevenue / yesterdayOrderCount : 0;
  const yesterdayCustomers = new Set(yesterdayOrders?.map(order => order.customer_id)).size;

  // Calculate percentage changes
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  const ordersChange = yesterdayOrderCount > 0 ? ((totalOrders - yesterdayOrderCount) / yesterdayOrderCount) * 100 : 0;
  const averageOrderChange = yesterdayAverageOrder > 0 ? ((averageOrderValue - yesterdayAverageOrder) / yesterdayAverageOrder) * 100 : 0;
  const customersChange = yesterdayCustomers > 0 ? ((totalCustomers - yesterdayCustomers) / yesterdayCustomers) * 100 : 0;

  // Calculate average order time for completed orders
  const completedOrders = todayOrders?.filter(order => order.status === 'delivered' && order.completedAt) || [];
  const averageOrderTime = completedOrders.length > 0
    ? completedOrders.reduce((sum: number, order: any) => {
        const orderDate = new Date(order.order_date);
        const completedAt = new Date(order.completedAt!);
        const timeTaken = (completedAt.getTime() - orderDate.getTime()) / (1000 * 60); // in minutes
        return sum + timeTaken;
      }, 0) / completedOrders.length
    : 0;

  return {
    todayRevenue,
    totalOrders,
    averageOrderValue,
    totalCustomers,
    revenueChange,
    ordersChange,
    averageOrderChange,
    customersChange,
    averageOrderTime,
  };
};

export const getRevenueByItemToday = async (): Promise<RevenueByItem[]> => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      total,
      order_items (
        quantity,
        price,
        menu_items (
          name
        )
      )
    `)
    .gte('order_date', today)
    .eq('status', 'delivered');

  if (error) throw error;

  const revenueMap = new Map<string, number>();

  data?.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const itemName = item.menu_items?.name || 'Unknown Item';
      const revenue = item.quantity * item.price;
      revenueMap.set(itemName, (revenueMap.get(itemName) || 0) + revenue);
    });
  });

  return Array.from(revenueMap.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

export const getRevenueOverTime = async (period: string): Promise<RevenueData[]> => {
  let days: number;

  switch (period) {
    case '1d':
      days = 1;
      break;
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    default:
      days = 7;
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days + 1);

  const { data, error } = await supabase
    .from('orders')
    .select('total, order_date')
    .gte('order_date', startDate.toISOString().split('T')[0])
    .lte('order_date', endDate.toISOString().split('T')[0])
    .eq('status', 'delivered');

  if (error) throw error;

  if (period === '1d') {
    // Hourly data for today
    const hourlyData: { [key: string]: number } = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[`${hour.toString().padStart(2, '0')}:00`] = 0;
    }

    data?.forEach(order => {
      const orderDate = new Date(order.order_date);
      const hour = orderDate.getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hourlyData[hourKey] += order.total;
    });

    return Object.entries(hourlyData).map(([time, revenue]) => ({
      date: time,
      revenue,
    }));
  } else {
    // Daily data
    const dailyData: { [key: string]: number } = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData[dateKey] = 0;
    }

    data?.forEach(order => {
      const orderDate = new Date(order.order_date);
      const dateKey = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyData.hasOwnProperty(dateKey)) {
        dailyData[dateKey] += order.total;
      }
    });

    return Object.entries(dailyData).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }
};

export const getRecentOrders = async (limit: number = 5): Promise<Order[]> => {
  // Get orders from 1am today onwards
  const today = new Date();
  today.setHours(1, 0, 0, 0); // Set to 1:00 AM today
  const startDate = today.toISOString();

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .gte('order_date', startDate)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const getTotalCustomers = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
};

// Menu management functions
export const getMenuItems = async (): Promise<MenuItem[]> => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*');

  if (error) throw error;
  
  // Filter out any old steak variations that shouldn't be there
  const filteredData = (data || []).filter(item => {
    const isOldItem = item.name.includes('Centurion') ||
                     item.name === 'Premium Steak & Fries' ||
                     item.name.includes('Quadzilla');
    return !isOldItem;
  });
  
  // Custom ordering: sort by category, then by priority within Main Courses
  const sortedData = filteredData.sort((a, b) => {
    // First sort by category
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    
    // Within the same category, use custom ordering
    if (a.category === 'Main Courses') {
      // Prioritize steak items over fries items
      const aIsSteak = a.name.toLowerCase().includes('steak');
      const bIsSteak = b.name.toLowerCase().includes('steak');
      
      if (aIsSteak && !bIsSteak) return -1;
      if (!aIsSteak && bIsSteak) return 1;
      
      // Both are steak items or both are fries, sort by name
      return a.name.localeCompare(b.name);
    }
    
    // For other categories, sort by name
    return a.name.localeCompare(b.name);
  });
  
  console.log('Database returned items after filtering and sorting:', sortedData);
  return sortedData;
};

export const addMenuItem = async (menuItem: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([menuItem])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMenuItem = async (id: string, menuItem: Partial<MenuItem>): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .update(menuItem)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const toggleMenuItemAvailability = async (id: string, isAvailable: boolean): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .update({ is_available: isAvailable })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Store settings functions
export const getStoreStatus = async (): Promise<boolean> => {
  // Force store to always be open
  console.log('Store status forced to: true');
  return true;
};

export const setStoreStatus = async (isOpen: boolean): Promise<void> => {
  const { error } = await supabase
    .from('store_settings')
    .upsert({
      key: 'store_open',
      value: isOpen.toString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating store status:', error);
    throw error;
  }
};

// Customer management functions
export const getAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getCustomerDetails = async (customerId: string): Promise<{
  customer: Customer;
  orders: Order[];
  loyaltyPoints: number;
  totalSpent: number;
  favoriteOrder?: string;
  recentOrder?: Order;
}> => {
  // Get customer details from customers table
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (customerError) {
    // If customer doesn't exist in customers table, try to get from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', customerId)
      .single();

    if (userError) throw userError;

    // Create a customer object from user data
    const customerFromUser: Customer = {
      id: user.id,
      name: user.full_name || user.email || 'Unknown',
      email: user.email,
      phone: undefined,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.created_at || new Date().toISOString()
    };

    return {
      customer: customerFromUser,
      orders: [],
      loyaltyPoints: 0,
      totalSpent: 0,
      favoriteOrder: 'No orders yet',
      recentOrder: undefined
    };
  }

  // Get customer's orders with order items
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        price,
        menu_items (
          name,
          price
        )
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;

  // Calculate stats for delivered orders only
  const completedOrders = orders?.filter(order => order.status === 'delivered') || [];
  const totalSpent = completedOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);
  const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per £10

  // Find favorite order (most frequently ordered item)
  const orderItemCounts: { [key: string]: number } = {};
  completedOrders.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const itemName = item.menu_items?.name || 'Unknown';
      orderItemCounts[itemName] = (orderItemCounts[itemName] || 0) + item.quantity;
    });
  });

  const favoriteOrder = Object.entries(orderItemCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No favorite order yet';

  const recentOrder = orders?.[0] || null;

  return {
    customer,
    orders: orders || [],
    loyaltyPoints,
    totalSpent,
    favoriteOrder,
    recentOrder
  };
};

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        price,
        menu_items (
          name,
          price,
          category
        )
      )
    `)
    .eq('customer_id', customerId)
    .order('order_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Stock management functions
export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  soldOutOverride: boolean;
  price: number;
}

export const getStockItems = async (): Promise<StockItem[]> => {
  const { data: menuItems, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('name');

  if (error) throw error;

  // Get stock levels
  const { data: stockLevels, error: stockError } = await supabase
    .from('menu_item_stock')
    .select('*');

  if (stockError && stockError.code !== 'PGRST116') { // Table might not exist yet
    console.warn('Stock table error:', stockError);
  }

  // Create stock map for quick lookup
  const stockMap = new Map();
  if (stockLevels) {
    stockLevels.forEach(stock => {
      stockMap.set(stock.menu_item_id, stock.current_stock);
    });
  }

  return (menuItems || []).map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    currentStock: stockMap.get(item.id) || 0,
    lowStockThreshold: 5,
    isAvailable: item.is_available,
    soldOutOverride: false,
    price: item.price
  }));
};

export const updateItemStock = async (itemId: string, newStock: number): Promise<void> => {
  const { error } = await supabase
    .from('menu_item_stock')
    .upsert({
      menu_item_id: itemId,
      current_stock: newStock,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
};

export const toggleSoldOutOverride = async (itemId: string, override: boolean): Promise<void> => {
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: !override })
    .eq('id', itemId);

  if (error) throw error;
};

// Get customers with their stats for overview
export const getCustomersWithStats = async (): Promise<Array<{
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  loyaltyPoints: number;
  status: string;
}>> => {
  // First, get all customers from the customers table
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (customersError) throw customersError;

  // Also get all users who might not have customer records
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (usersError) throw usersError;

  // Create a map to combine customers and users (no duplicates)
  const userMap = new Map();
  
  // Add all users first
  (users || []).forEach(user => {
    userMap.set(user.id, {
      id: user.id,
      name: user.full_name || user.email || 'Unknown',
      email: user.email,
      created_at: user.created_at
    });
  });
  
  // Override with customer data if available (customers take precedence)
  (customers || []).forEach(customer => {
    userMap.set(customer.id, {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      created_at: customer.created_at
    });
  });

  const allUsers = Array.from(userMap.values());

  const customersWithStats = await Promise.all(
    allUsers.map(async (user) => {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total, order_date, status')
        .eq('customer_id', user.id)
        .eq('status', 'delivered');

      if (ordersError) throw ordersError;

      // Also get all orders (regardless of status) for total count
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('total, order_date, status')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (allOrdersError) throw allOrdersError;

      const totalSpent = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      const loyaltyPoints = Math.floor(totalSpent / 10);
      const lastOrderDate = orders?.[0]?.order_date || user.created_at;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        totalOrders: allOrders?.length || 0,
        totalSpent,
        lastOrderDate,
        loyaltyPoints,
        status: 'active'
      };
    })
  );

  return customersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);
};

// Order management functions
export interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  preparationTime?: number;
  quantity: number;
}

export const createOrder = async (orderData: {
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  notes?: string;
  paymentId: string;
  paymentStatus: string;
}): Promise<Order> => {
  try {
    console.log('Database createOrder called with data:', orderData);

    // Get the next order number (sequential based on all orders)
    const { data: existingOrders } = await supabase
      .from('orders')
      .select('display_id')
      .order('created_at', { ascending: false })
      .limit(1);

    const nextOrderNumber = existingOrders && existingOrders.length > 0
      ? (parseInt(existingOrders[0].display_id) || 0) + 1
      : 1;

    // First, ensure customer exists in customers table
    console.log('Checking if customer exists...');
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', orderData.customerId)
      .single();

    let customerId = orderData.customerId;

    if (!existingCustomer) {
      console.log('Customer does not exist, creating new customer record...');
      // Create customer record if it doesn't exist
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          id: orderData.customerId,
          name: orderData.customerName,
          email: orderData.customerEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (customerError) {
        console.error('Customer creation error:', customerError);
        throw customerError;
      }

      customerId = newCustomer.id;
      console.log('Customer created successfully:', customerId);
    } else {
      console.log('Customer already exists:', customerId);
    }

    // Create the main order record
    const orderDate = new Date().toISOString();
    const estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now

    console.log('Inserting order record...', {
      customer_id: customerId,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      total: orderData.total,
      status: 'pending',
      order_date: orderDate,
      estimated_delivery: estimatedDelivery,
      notes: orderData.notes || null
    });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        total: orderData.total,
        status: 'pending',
        order_date: orderDate,
        estimated_delivery: estimatedDelivery,
        notes: orderData.notes || null,
        display_id: nextOrderNumber.toString().padStart(3, '0')
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    console.log('Order record created successfully:', order);

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
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
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    console.log('Order items created successfully');

    // Trigger refresh event for admin panels
    triggerOrderRefresh();

    console.log('Order creation completed successfully:', order.id);
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Database error details:', {
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      code: (error as any)?.code
    });
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  const updateData: any = { status, updated_at: new Date().toISOString() };

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;

  // Trigger refresh event for admin panels
  triggerOrderRefresh();

  return data;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  // First delete all order items associated with this order
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId);

  if (itemsError) throw itemsError;

  // Then delete the order itself
  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (orderError) throw orderError;

  // Trigger refresh event for admin panels
  triggerOrderRefresh();
};

// Order refresh mechanism for admin panels
const ORDER_REFRESH_EVENT = 'order_refresh_needed';

export const triggerOrderRefresh = () => {
  // Trigger a custom event to refresh admin panels
  if (typeof window !== 'undefined') {
    localStorage.setItem('last_order_update', Date.now().toString());
    window.dispatchEvent(new CustomEvent(ORDER_REFRESH_EVENT));
  }
};

export const listenForOrderUpdates = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleOrderUpdate = () => {
    callback();
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'last_order_update') {
      callback();
    }
  };

  window.addEventListener(ORDER_REFRESH_EVENT, handleOrderUpdate);
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener(ORDER_REFRESH_EVENT, handleOrderUpdate);
    window.removeEventListener('storage', handleStorageChange);
  };
};
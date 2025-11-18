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
  stock_requirements?: Array<{ stockItem: string; quantity: number }>;
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
  const completedOrders = todayOrders?.filter(order => order.status === 'delivered') || [];
  const averageOrderTime = completedOrders.length > 0
    ? completedOrders.reduce((sum: number, order: any) => {
        const orderDate = new Date(order.order_date);
        const completedAt = new Date(order.updated_at);
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

export const getRevenueByItem = async (period: string = 'today'): Promise<RevenueByItem[]> => {
  let startDate: string;
  let endDate: string;

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (period) {
    case 'today':
      startDate = today;
      endDate = today;
      break;
    case '7d':
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6); // Include today, so -6
      startDate = sevenDaysAgo.toISOString().split('T')[0];
      endDate = today;
      break;
    case '30d':
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 29);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
      endDate = today;
      break;
    case '90d':
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 89);
      startDate = ninetyDaysAgo.toISOString().split('T')[0];
      endDate = today;
      break;
    default:
      startDate = today;
      endDate = today;
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      order_date,
      status,
      order_items (
        id,
        quantity,
        price,
        menu_items (
          id,
          name
        )
      )
    `)
    .gte('order_date', `${startDate}T00:00:00.000Z`)
    .lt('order_date', `${endDate}T23:59:59.999Z`);

  // Debug: Check all orders to see what's in the database
  const { data: allOrders } = await supabase
    .from('orders')
    .select('id, total, order_date, status')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log('All recent orders in database:', allOrders);

  console.log('Revenue by item query:', {
    period,
    startDate,
    endDate,
    dataCount: data?.length,
    data
  });

  if (error) throw error;

  const revenueMap = new Map<string, number>();

  data?.forEach(order => {
    console.log('Processing order:', order.id, 'items:', order.order_items);
    order.order_items?.forEach((item: any) => {
      console.log('Processing item:', item);
      const itemName = item.menu_items?.name || 'Unknown Item';
      const revenue = item.quantity * item.price;
      console.log('Item:', itemName, 'revenue:', revenue);
      revenueMap.set(itemName, (revenueMap.get(itemName) || 0) + revenue);
    });
  });

  const result = Array.from(revenueMap.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  console.log('Revenue by item data:', result);
  return result;
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
    .gte('order_date', `${startDate.toISOString().split('T')[0]}T00:00:00.000Z`)
    .lt('order_date', `${endDate.toISOString().split('T')[0]}T23:59:59.999Z`);

  console.log('Revenue over time raw query result:', {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dataCount: data?.length,
    data
  });

  console.log('Revenue over time query:', {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dataCount: data?.length,
    data,
    period
  });

  if (period === '1d') {
    // Hourly data for today from 9am to 11pm
    const hourlyData: { [key: string]: number } = {};
    for (let hour = 9; hour <= 23; hour++) {
      hourlyData[`${hour.toString().padStart(2, '0')}:00`] = 0;
    }

    data?.forEach(order => {
      const orderDate = new Date(order.order_date);
      const hour = orderDate.getHours();
      if (hour >= 9 && hour <= 23) {
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        hourlyData[hourKey] += order.total;
      }
    });

    const result = Object.entries(hourlyData).map(([time, revenue]) => ({
      date: time,
      revenue,
    }));

    console.log('Revenue over time 1d result:', result);
    return result;
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

    const result = Object.entries(dailyData).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    console.log('Revenue over time daily result:', result);
    return result;
  }

  if (error) throw error;

  if (period === '1d') {
    // Hourly data for today from 9am to 11pm
    const hourlyData: { [key: string]: number } = {};
    for (let hour = 9; hour <= 23; hour++) {
      hourlyData[`${hour.toString().padStart(2, '0')}:00`] = 0;
    }

    data?.forEach(order => {
      const orderDate = new Date(order.order_date);
      const hour = orderDate.getHours();
      if (hour >= 9 && hour <= 23) {
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        hourlyData[hourKey] += order.total;
      }
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
  try {
    const stored = localStorage.getItem('store_open');
    if (stored !== null) {
      return stored === 'true';
    }
    // Default to true if not set
    return true;
  } catch (error) {
    console.error('Error reading store status from localStorage:', error);
    return true; // Default to open on error
  }
};

export const setStoreStatus = async (isOpen: boolean): Promise<void> => {
  try {
    localStorage.setItem('store_open', isOpen.toString());
    console.log('Store status saved to localStorage:', isOpen);
  } catch (error) {
    console.error('Error saving store status to localStorage:', error);
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
    const averageOrderTime = await getAverageOrderTime();
    const estimatedDelivery = new Date(Date.now() + averageOrderTime * 60 * 1000).toISOString();

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

    // Create order items - handle main items, add-ons, and drinks
    const orderItems: any[] = [];

    orderData.items.forEach(item => {
      // Add the main item
      orderItems.push({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      });

      // Add add-ons if they exist
      if ((item as any).addOns && Array.isArray((item as any).addOns)) {
        (item as any).addOns.forEach((addOn: any) => {
          orderItems.push({
            order_id: order.id,
            menu_item_id: addOn.id || addOn.item?.id,
            quantity: addOn.quantity,
            price: addOn.price || addOn.item?.price || 0
          });
        });
      }

      // Add drinks if they exist
      if ((item as any).drinks && Array.isArray((item as any).drinks)) {
        (item as any).drinks.forEach((drink: any) => {
          orderItems.push({
            order_id: order.id,
            menu_item_id: drink.id || drink.item?.id,
            quantity: drink.quantity,
            price: drink.price || drink.item?.price || 0
          });
        });
      }
    });

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

    // Deduct stock for the ordered items
    try {
      await deductStockForOrder(orderData.items);
      console.log('Stock deducted successfully for order:', order.id);
    } catch (stockError) {
      console.error('Error deducting stock:', stockError);
      // Don't fail the order for stock deduction errors, but log it
    }

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
  // First restore stock for the order items before deleting
  try {
    await restoreStockForOrder(orderId);
    console.log('Stock restored successfully for cancelled order:', orderId);
  } catch (stockError) {
    console.error('Error restoring stock for cancelled order:', stockError);
    // Continue with order deletion even if stock restoration fails
  }

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
const MENU_REFRESH_EVENT = 'menu_refresh_needed';

export const triggerOrderRefresh = () => {
  // Trigger a custom event to refresh admin panels
  if (typeof window !== 'undefined') {
    localStorage.setItem('last_order_update', Date.now().toString());
    window.dispatchEvent(new CustomEvent(ORDER_REFRESH_EVENT));
  }
};

export const triggerMenuRefresh = () => {
  // Trigger a custom event to refresh menu components
  if (typeof window !== 'undefined') {
    localStorage.setItem('last_menu_update', Date.now().toString());
    window.dispatchEvent(new CustomEvent(MENU_REFRESH_EVENT));
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

export const listenForMenuUpdates = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleMenuUpdate = () => {
    callback();
  };

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'last_menu_update') {
      callback();
    }
  };

  window.addEventListener(MENU_REFRESH_EVENT, handleMenuUpdate);
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener(MENU_REFRESH_EVENT, handleMenuUpdate);
    window.removeEventListener('storage', handleStorageChange);
  };
};

// Stock inventory management functions
export interface StockInventoryItem {
  id: string;
  stock_item: string;
  category: string;
  lockup_quantity: number;
  trailer_quantity: number;
  signed_lockup?: string;
  signed_trailer?: string;
  supplier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
// Coupon interfaces
export interface Coupon {
  id: string;
  name: string;
  description?: string;
  type: 'free_item' | 'percent_off' | 'bogo' | 'min_order_discount';
  value: string;
  points_cost: number;
  duration_hours: number;
  max_per_account: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerCoupon {
  id: string;
  customer_id: string;
  coupon_id: string;
  claimed_at: string;
  expires_at: string;
  is_used: boolean;
  used_at?: string;
  order_id?: string;
  created_at: string;
  coupon: Coupon;
}

export const getStockInventory = async (): Promise<StockInventoryItem[]> => {
  const { data, error } = await supabase
    .from('stock')
    .select('*')
    .order('category', { ascending: true })
    .order('stock_item', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const updateStockInventoryItem = async (id: string, updates: Partial<StockInventoryItem>): Promise<StockInventoryItem> => {
  const { data, error } = await supabase
    .from('stock')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update menu availability after stock changes
  try {
    await updateMenuAvailability();
  } catch (availabilityError) {
    console.error('Error updating menu availability after stock change:', availabilityError);
    // Don't fail the stock update if menu availability update fails
  }

  return data;
};

export const createStockInventoryItem = async (item: Omit<StockInventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<StockInventoryItem> => {
  // Set default values for quantities to 0, preserving signed fields
  const itemWithDefaults = {
    ...item,
    lockup_quantity: item.lockup_quantity ?? 0,
    trailer_quantity: item.trailer_quantity ?? 0,
  };

  const { data, error } = await supabase
    .from('stock')
    .insert([itemWithDefaults])
    .select()
    .single();

  if (error) throw error;

  // Update menu availability after creating new stock item
  try {
    await updateMenuAvailability();
  } catch (availabilityError) {
    console.error('Error updating menu availability after creating stock item:', availabilityError);
    // Don't fail the creation if menu availability update fails
  }

  return data;
};

export const deleteStockInventoryItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('stock')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const resetAllStockQuantities = async (): Promise<void> => {
  try {
    // Get all stock items
    const { data: stockItems, error: fetchError } = await supabase
      .from('stock')
      .select('id, signed_lockup, signed_trailer');

    if (fetchError) throw fetchError;

    if (!stockItems || stockItems.length === 0) {
      console.log('No stock items to reset');
      return;
    }

    // Reset quantities to 0 for all items, preserving signed fields
    const resetPromises = stockItems.map(item =>
      supabase
        .from('stock')
        .update({
          lockup_quantity: 0,
          trailer_quantity: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(resetPromises);

    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Errors resetting stock quantities:', errors);
      throw new Error('Failed to reset some stock quantities');
    }

    console.log(`Reset quantities to 0 for ${stockItems.length} stock items`);

    // Update menu availability after resetting stock
    await updateMenuAvailability();

  } catch (error) {
    console.error('Error resetting stock quantities:', error);
    throw error;
  }
};
// Coupon management functions
export const getCoupons = async (): Promise<Coupon[]> => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createCoupon = async (coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at'>): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .insert([coupon])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getCustomerCoupons = async (customerId: string): Promise<CustomerCoupon[]> => {
  const { data, error } = await supabase
    .from('customer_coupons')
    .select(`
      *,
      coupon:coupons(*)
    `)
    .eq('customer_id', customerId)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .order('claimed_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const claimCoupon = async (couponId: string, customerId: string): Promise<CustomerCoupon> => {
  // First check if customer has enough points and hasn't exceeded max per account
  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', couponId)
    .single();

  if (couponError) throw couponError;

  // Check customer's loyalty points
  const customerDetails = await getCustomerDetails(customerId);
  if (customerDetails.loyaltyPoints < coupon.points_cost) {
    throw new Error('Insufficient loyalty points');
  }

  // Check if customer hasn't exceeded max per account for today
  const today = new Date().toISOString().split('T')[0];
  const { data: todayClaims, error: claimsError } = await supabase
    .from('customer_coupons')
    .select('id')
    .eq('customer_id', customerId)
    .eq('coupon_id', couponId)
    .gte('claimed_at', `${today}T00:00:00.000Z`)
    .lt('claimed_at', `${today}T23:59:59.999Z`);

  if (claimsError) throw claimsError;

  if (todayClaims && todayClaims.length >= coupon.max_per_account) {
    throw new Error(`Maximum ${coupon.max_per_account} claims per day exceeded`);
  }

  // Create the customer coupon
  const expiresAt = new Date(Date.now() + coupon.duration_hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('customer_coupons')
    .insert({
      customer_id: customerId,
      coupon_id: couponId,
      expires_at: expiresAt
    })
    .select(`
      *,
      coupon:coupons(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const useCoupon = async (customerCouponId: string, orderId?: string): Promise<void> => {
  const updateData: any = {
    is_used: true,
    used_at: new Date().toISOString()
  };

  if (orderId) {
    updateData.order_id = orderId;
  }

  const { error } = await supabase
    .from('customer_coupons')
    .update(updateData)
    .eq('id', customerCouponId);

  if (error) throw error;
};

// Stock mapping for menu items to stock inventory items
const getStockRequirements = async (menuItemId: string, quantity: number = 1): Promise<Array<{ stockItem: string; quantity: number }>> => {
  const requirements: Array<{ stockItem: string; quantity: number }> = [];

  try {
    // First try to get requirements from database
    const { data: menuItem, error } = await supabase
      .from('menu_items')
      .select('stock_requirements')
      .eq('id', menuItemId)
      .single();

    if (!error && menuItem?.stock_requirements) {
      // Use database requirements
      menuItem.stock_requirements.forEach((req: { stockItem: string; quantity: number }) => {
        requirements.push({
          stockItem: req.stockItem,
          quantity: req.quantity * quantity
        });
      });
    } else {
      // Fallback to hardcoded map for backward compatibility
      const stockMap: Record<string, Array<{ stockItem: string; quantity: number }>> = {
        // Main Courses
        '567b6a07-f08a-48dc-8401-350900404a5a': [ // Deluxe Steak & Fries
          { stockItem: 'Steaks', quantity: 1 },
          { stockItem: 'Fries', quantity: 1 }
        ],
        'bafb0ca1-7a7d-477c-95db-8340750d5073': [ // Steak & Fries
          { stockItem: 'Steaks', quantity: 1 },
          { stockItem: 'Fries', quantity: 1 }
        ],
        'dcdedc23-359a-4120-9c3c-488386410364': [ // Steak Only
          { stockItem: 'Steaks', quantity: 1 }
        ],
        '135dda9e-ce09-480a-b7cc-fa48a202fa0b': [ // Signature Fries
          { stockItem: 'Fries', quantity: 1 }
        ],

        // Add-ons
        'f119d64e-3340-4552-a207-58171cf328f0': [ // Green Sauce
          { stockItem: 'Green Sauce', quantity: 1 }
        ],
        'f9d7308a-399c-4abe-a125-237fc4722824': [ // Red Sauce
          { stockItem: 'Red Sauce', quantity: 1 }
        ],
        '4d26334c-0d1e-4c3e-8b87-1075c66b678b': [ // Steak (add-on)
          { stockItem: 'Steaks', quantity: 1 }
        ],
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890': [ // Short Rib
          { stockItem: 'Short Rib', quantity: 1 }
        ],
        'b2c3d4e5-f6a7-8901-bcde-f23456789012': [ // Lamb Chop
          { stockItem: 'Lamb', quantity: 1 }
        ],

        // Kids Menu
        '2836bb5e-3d5e-4a8a-8b63-64b55786b5d4': [ // Kids Meal (includes steak and fries)
          { stockItem: 'Steaks', quantity: 1 },
          { stockItem: 'Fries', quantity: 1 }
        ],
        '40902b4c-4e1e-46b3-8d91-e44b0bb800cf': [ // Kids Fries
          { stockItem: 'Fries', quantity: 1 }
        ],
        '73919a44-13f5-4976-9cd5-9ab2ec6a9aef': [ // £1 Steak Cone
          { stockItem: 'Steaks', quantity: 1 }
        ],
    
        // Drinks
        '4495999f-0737-43c2-a961-9601a2677a66': [ // Coke
          { stockItem: 'Coke / Pepsi', quantity: 1 }
        ],
        '4664385c-0601-4496-94c9-57fbb007a34d': [ // Coke Zero
          { stockItem: 'Coke Zero', quantity: 1 }
        ],
        '992f34f6-6bda-475d-8273-4ba06e115fca': [ // Tango Mango
          { stockItem: 'Tango Mango', quantity: 1 }
        ]
      };

      const itemRequirements = stockMap[menuItemId];
      if (itemRequirements) {
        itemRequirements.forEach(req => {
          requirements.push({
            stockItem: req.stockItem,
            quantity: req.quantity * quantity
          });
        });
      }
    }
  } catch (error) {
    console.error('Error fetching stock requirements:', error);
  }

  console.log(`Stock requirements for ${menuItemId}:`, requirements);
  return requirements;
};

// Deduct stock when an order is placed
export const deductStockForOrder = async (items: CartItem[]): Promise<void> => {
  try {
    // Collect all stock requirements
    const stockUpdates: Record<string, number> = {};

    for (const item of items) {
      const requirements = await getStockRequirements(item.id, item.quantity);

      // Handle main item
      requirements.forEach(req => {
        stockUpdates[req.stockItem] = (stockUpdates[req.stockItem] || 0) + req.quantity;
      });

      // Handle add-ons
      if ((item as any).addOns) {
        for (const addOn of (item as any).addOns) {
          const addOnRequirements = await getStockRequirements(addOn.id || addOn.item?.id, addOn.quantity);
          addOnRequirements.forEach(req => {
            stockUpdates[req.stockItem] = (stockUpdates[req.stockItem] || 0) + req.quantity;
          });
        }
      }

      // Handle drinks (drinks don't consume stock for now)
    }

    // Update stock inventory
    for (const [stockItem, quantityToDeduct] of Object.entries(stockUpdates)) {
      const { data: stockRecord } = await supabase
        .from('stock')
        .select('id, trailer_quantity')
        .eq('stock_item', stockItem)
        .single();

      if (stockRecord) {
        const newQuantity = Math.max(0, stockRecord.trailer_quantity - quantityToDeduct);
        await updateStockInventoryItem(stockRecord.id, {
          trailer_quantity: newQuantity
        });
      }
    }

    // Update menu availability based on new stock levels
    await updateMenuAvailability();

  } catch (error) {
    console.error('Error deducting stock:', error);
    throw error;
  }
};

// Update menu item availability based on stock levels
export const updateMenuAvailability = async (): Promise<void> => {
  try {
    // Get all stock items
    const stockItems = await getStockInventory();
    console.log('All stock items in database:', stockItems);

    // Create stock map for quick lookup
    const stockMap = new Map<string, number>();
    stockItems.forEach(item => {
      stockMap.set(item.stock_item, item.trailer_quantity || 0);
    });

    // Get all menu items
    const menuItems = await getMenuItems();

    // Update availability for each menu item
    for (const menuItem of menuItems) {
      const requirements = await getStockRequirements(menuItem.id);
      let isAvailable = true;

      console.log(`Checking availability for ${menuItem.name} (ID: ${menuItem.id})`);
      console.log(`Requirements:`, requirements);

      // Check if all required stock items have sufficient quantity
      // Use total stock (trailer + lockup) like the stock management interface does
      for (const req of requirements) {
        const stockItem = stockItems.find(item => item.stock_item === req.stockItem);
        const totalStock = stockItem ? ((stockItem.trailer_quantity || 0) + (stockItem.lockup_quantity || 0)) : 0;
        console.log(`Stock item ${req.stockItem}: required ${req.quantity}, available ${totalStock}`);
        if (totalStock < req.quantity) {
          isAvailable = false;
          console.log(`Insufficient stock for ${req.stockItem}`);
          break;
        }
      }

      console.log(`Setting ${menuItem.name} availability to ${isAvailable} (was ${menuItem.is_available})`);

      // Update menu item availability if it has changed
      if (menuItem.is_available !== isAvailable) {
        await updateMenuItem(menuItem.id, { is_available: isAvailable });
        console.log(`Updated ${menuItem.name} availability to ${isAvailable} (total stock check)`);
      }
    }

    // Trigger menu refresh for customer-facing components
    triggerMenuRefresh();

  } catch (error) {
    console.error('Error updating menu availability:', error);
  }
};

// Restore stock when an order is cancelled
export const restoreStockForOrder = async (orderId: string): Promise<void> => {
  try {
    // Get order items
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        menu_items (
          id,
          name
        )
      `)
      .eq('order_id', orderId);

    if (error) throw error;

    // Collect stock to restore
    const stockRestores: Record<string, number> = {};

    for (const item of orderItems || []) {
      const menuItem = item.menu_items as any; // Type assertion for Supabase relation
      const requirements = await getStockRequirements(menuItem?.id || '', item.quantity);
      requirements.forEach(req => {
        stockRestores[req.stockItem] = (stockRestores[req.stockItem] || 0) + req.quantity;
      });
    }

    // Update stock inventory
    for (const [stockItem, quantityToRestore] of Object.entries(stockRestores)) {
      const { data: stockRecord } = await supabase
        .from('stock')
        .select('id, trailer_quantity')
        .eq('stock_item', stockItem)
        .single();

      if (stockRecord) {
        const newQuantity = stockRecord.trailer_quantity + quantityToRestore;
        await updateStockInventoryItem(stockRecord.id, {
          trailer_quantity: newQuantity
        });
      }
    }

    // Update menu availability
    await updateMenuAvailability();

  } catch (error) {
    console.error('Error restoring stock:', error);
    throw error;
  }
};

// Calculate average order completion time from previous orders
export const getAverageOrderTime = async (): Promise<number> => {
  try {
    // Get all delivered orders from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: deliveredOrders, error } = await supabase
      .from('orders')
      .select('order_date, updated_at')
      .eq('status', 'delivered')
      .gte('order_date', thirtyDaysAgo.toISOString());

    if (error) throw error;

    if (!deliveredOrders || deliveredOrders.length === 0) {
      // Default to 30 minutes if no previous orders
      return 30;
    }

    // Calculate completion times in minutes
    const completionTimes = deliveredOrders.map(order => {
      const startTime = new Date(order.order_date).getTime();
      // Use updated_at as completion time (when order was marked as delivered)
      const endTime = new Date(order.updated_at).getTime();

      const timeDiffMinutes = (endTime - startTime) / (1000 * 60);
      return Math.max(5, Math.min(120, timeDiffMinutes)); // Clamp between 5-120 minutes
    });

    // Calculate average
    const averageTime = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;

    // Round to nearest 5 minutes and ensure minimum 10 minutes
    return Math.max(10, Math.round(averageTime / 5) * 5);
  } catch (error) {
    console.error('Error calculating average order time:', error);
    // Fallback to 30 minutes on error
    return 30;
  }
};
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
    .order('order_date', { ascending: false })
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
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  
  // Filter out any old steak variations that shouldn't be there
  const filteredData = (data || []).filter(item => {
    const isOldItem = item.name.includes('Centurion') ||
                     item.name === 'Deluxe Steak & Fries' ||
                     item.name === 'Premium Steak & Fries' ||
                     item.name.includes('Quadzilla');
    return !isOldItem;
  });
  
  console.log('Database returned items after filtering:', filteredData);
  return filteredData;
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
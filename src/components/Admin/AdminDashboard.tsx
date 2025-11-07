import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import Header from '../Layout/Header';
import CurrentOrderManagement from './CurrentOrderManagement';
import OrderHistory from './OrderHistory';
import StockManagement from './StockManagement';
import CustomerOverview from './CustomerOverview';
import { Tabs } from '../ui/vercel-tabs';
import logo from '../../images/OnFries-Logo.png';
import {
  getDashboardStats,
  getRevenueByItem,
  getRevenueOverTime,
  getRecentOrders,
  listenForOrderUpdates,
  DashboardStats,
  RevenueData,
  RevenueByItem,
  Order
} from '../../lib/database';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  initialTab?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, initialTab = 'overview' }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [timeframe, setTimeframe] = useState('7d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueByItem, setRevenueByItem] = useState<RevenueByItem[]>([]);
  const [revenueOverTime, setRevenueOverTime] = useState<RevenueData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemTimeframe, setItemTimeframe] = useState('today');

  const adminTabs = [
    { id: "overview", label: "Overview" },
    { id: "current-orders", label: "Current Orders" },
    { id: "past-orders", label: "Past Orders" },
    { id: "stock", label: "Stock" },
    { id: "customers", label: "Customers" }
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, revenueByItemData, revenueOverTimeData, recentOrdersData] = await Promise.all([
          getDashboardStats(),
          getRevenueByItem(itemTimeframe),
          getRevenueOverTime(timeframe),
          getRecentOrders(5),
        ]);

        setStats(statsData);
        setRevenueByItem(revenueByItemData);
        setRevenueOverTime(revenueOverTimeData);
        setRecentOrders(recentOrdersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up live updates every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);

    // Listen for order updates to refresh immediately
    const cleanup = listenForOrderUpdates(() => {
      console.log('Order update detected, refreshing dashboard...');
      fetchDashboardData();
    });

    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, [timeframe, itemTimeframe]);


  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Overview';
      case 'current-orders':
        return 'Current Orders';
      case 'past-orders':
        return 'Past Orders';
      case 'stock':
        return 'Stock Management';
      case 'customers':
        return 'Customer Overview';
      default:
        return 'Admin Dashboard';
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case 'overview':
        return 'Track your restaurant performance and key metrics';
      case 'current-orders':
        return '';
      case 'past-orders':
        return '';
      case 'stock':
        return 'Monitor and manage inventory levels';
      case 'customers':
        return 'View customer information and analytics';
      default:
        return 'Manage your restaurant operations and track performance';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onNavigate={handleNavigate}
        hideLogo={true}
        adminTabs={adminTabs}
        selectedAdminTab={selectedTab}
        onAdminTabChange={setSelectedTab}
      />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
            <div className="flex flex-col md:grid md:grid-cols-3 md:items-center mb-4">
              <img src={logo} alt="OnFries Logo" className="w-auto h-40 md:h-48 mb-4 md:mb-0 md:col-start-1 md:justify-self-start md:mt-4 object-contain" />
              <div className="text-center md:col-start-2 md:justify-self-center">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{getTabTitle(selectedTab)}</h1>
                <p className="text-sm md:text-base text-muted-foreground">{getTabDescription(selectedTab)}</p>
              </div>
            </div>
          </div>

        {!isMobile && (
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="mb-4">
                <Tabs
                  tabs={adminTabs}
                  onTabChange={(tabId) => setSelectedTab(tabId)}
                />
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'overview' && (
          <div className="space-y-6 mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg">Loading dashboard data...</div>
              </div>
            ) : stats ? (
              <>
                {/* KPI Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">£{stats.todayRevenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}% from yesterday
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalOrders}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange.toFixed(1)}% from yesterday
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">£{stats.averageOrderValue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.averageOrderChange >= 0 ? '+' : ''}{stats.averageOrderChange.toFixed(1)}% from yesterday
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.customersChange >= 0 ? '+' : ''}{stats.customersChange.toFixed(1)} new today
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Order Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.averageOrderTime.toFixed(1)}m</div>
                      <p className="text-xs text-muted-foreground">
                        Average completion time
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Revenue by Item
                        <Select value={itemTimeframe} onValueChange={setItemTimeframe}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                            <SelectItem value="90d">90 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{ revenue: { label: 'Revenue (£)', color: 'hsl(var(--chart-1))' } }}>
                        <BarChart data={revenueByItem}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `£${Number(value).toFixed(0)}`} />
                          <Tooltip content={<ChartTooltipContent />} formatter={(value) => [`£${value.toFixed(2)}`, 'Revenue']} />
                          <Bar dataKey="revenue" fill="var(--color-revenue)" />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Revenue Over Time
                        <Select value={timeframe} onValueChange={setTimeframe}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1d">1 Day</SelectItem>
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                            <SelectItem value="90d">90 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{ revenue: { label: 'Revenue (£)', color: 'hsl(var(--chart-2))' } }}>
                        <LineChart data={revenueOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `£${Number(value).toFixed(0)}`} />
                          <Tooltip content={<ChartTooltipContent />} formatter={(value) => [`£${value.toFixed(2)}`, 'Revenue']} />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--color-revenue)"
                            strokeWidth={3}
                            dot={{ fill: 'var(--color-revenue)', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: 'var(--color-revenue)', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ChartContainer>
                      <div className="text-xs text-muted-foreground mt-2 text-center">
                        Updates live every minute
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.length > 0 ? (
                        recentOrders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded">
                            <div>
                              <p className="font-medium">Order #{order.display_id || order.id}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">£{order.total.toFixed(2)}</p>
                              <Badge className={
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No recent orders</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg text-red-600">Failed to load dashboard data</div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'current-orders' && <CurrentOrderManagement />}
        {selectedTab === 'past-orders' && <OrderHistory />}

        {selectedTab === 'stock' && <StockManagement />}


        {selectedTab === 'customers' && <CustomerOverview onNavigate={handleNavigate} />}
      </div>
    </div>
  );
};

export default AdminDashboard;

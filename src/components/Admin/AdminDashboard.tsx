import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, DollarSign, Users, TrendingUp, Package, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';
import { dummyOrders, getOrderStats } from '../../data/orderData';
import { menuItems } from '../../data/menuData';
import { useAuth } from '../../contexts/AuthContext';
import OrderManagement from './OrderManagement';
import StockManagement from './StockManagement';
import CustomerOverview from './CustomerOverview';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p className="text-xl text-gray-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const stats = getOrderStats();
  const todayOrders = dummyOrders.filter(order => 
    new Date(order.orderDate).toDateString() === new Date().toDateString()
  );

  const totalCustomers = new Set(dummyOrders.map(order => order.customerId)).size;
  const averageOrderValue = stats.total > 0 ? stats.sales / stats.total : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your restaurant operations and track performance</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.sales.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    +5% from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 new today
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Status Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span>Pending</span>
                      </div>
                      <Badge variant="secondary">{stats.pending}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span>Preparing</span>
                      </div>
                      <Badge variant="secondary">{stats.preparing}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Ready</span>
                      </div>
                      <Badge variant="secondary">{stats.ready}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-600" />
                        <span>Delivered</span>
                      </div>
                      <Badge variant="secondary">{stats.delivered}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Items Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {menuItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <Badge variant="outline">{Math.floor(Math.random() * 10) + 1} sold</Badge>
                      </div>
                    ))}
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
                  {todayOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">#{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="stock">
            <StockManagement />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, ShoppingCart, DollarSign, Search, Mail } from 'lucide-react';
import { dummyOrders } from '../../data/orderData';

const CustomerOverview: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Generate customer data from orders
  const customers = React.useMemo(() => {
    const customerMap = new Map();
    
    dummyOrders.forEach(order => {
      const customerId = order.customerId;
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: order.customerName,
          email: order.customerEmail,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.orderDate,
          status: 'active'
        });
      }
      
      const customer = customerMap.get(customerId);
      customer.totalOrders += 1;
      customer.totalSpent += order.total;
      
      if (new Date(order.orderDate) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = order.orderDate;
      }
    });
    
    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const averageOrderValue = totalRevenue / dummyOrders.length;
  const repeatCustomers = customers.filter(customer => customer.totalOrders > 1).length;

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent > 100) return { label: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (totalSpent > 50) return { label: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Silver', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="space-y-6">
      {/* Customer Statistics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per order value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repeatCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {((repeatCustomers / totalCustomers) * 100).toFixed(1)}% retention rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Management */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Customer List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => {
          const tier = getCustomerTier(customer.totalSpent);
          
          return (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-orange-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Orders:</span> {customer.totalOrders}
                      </div>
                      <div>
                        <span className="font-medium">Total Spent:</span> ${customer.totalSpent.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Last Order:</span> {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <Badge className={tier.color}>
                      {tier.label}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline">
                        View Orders
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500">No customers match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerOverview;
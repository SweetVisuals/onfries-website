import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, ShoppingCart, DollarSign, Search, Mail, Star } from 'lucide-react';
import { getCustomersWithStats } from '../../lib/database';

interface CustomerOverviewProps {
  onNavigate: (page: string) => void;
}

interface CustomerWithStats {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  loyaltyPoints: number;
  status: string;
}

const CustomerOverview: React.FC<CustomerOverviewProps> = ({ onNavigate }) => {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const customersData = await getCustomersWithStats();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const averageOrderValue = totalCustomers > 0 ? totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0) : 0;
  const repeatCustomers = customers.filter(customer => customer.totalOrders > 1).length;

  

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6">
      {/* Customer Statistics */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomers}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">£{totalRevenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              From all customers
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">£{averageOrderValue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Per order value
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Repeat Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{repeatCustomers}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : 0}% retention rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Management */}
      <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Customer Management</CardTitle>
          <div className="flex justify-between items-center">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadCustomers} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Customer List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Loading customers...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCustomers.map((customer) => {
            return (
              <Card key={customer.id} className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                          <span className="font-semibold text-xl text-orange-600 dark:text-orange-300">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-xl truncate">{customer.name}</h3>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg">{customer.totalOrders}</div>
                          <div className="text-muted-foreground">Total Orders</div>
                        </div>
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg">£{customer.totalSpent.toFixed(2)}</div>
                          <div className="text-muted-foreground">Total Spent</div>
                        </div>
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {customer.loyaltyPoints}
                          </div>
                          <div className="text-muted-foreground">Loyalty Points</div>
                        </div>
                        <div className="bg-background/30 border border-border/30 p-3 rounded-lg">
                          <div className="font-medium text-lg">
                            {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                          </div>
                          <div className="text-muted-foreground">Last Order</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigate(`customer-detail:${customer.id}`)}
                        >
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
      )}

      {filteredCustomers.length === 0 && !loading && (
        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-16">
            <Users className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-medium mb-3">No customers found</h3>
            <p className="text-muted-foreground text-lg">No customers match your search criteria.</p>
          </CardContent>
        </Card>
      )}
  </div>
);
};

export default CustomerOverview;
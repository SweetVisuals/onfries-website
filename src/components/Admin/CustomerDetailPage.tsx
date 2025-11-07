import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Calendar, DollarSign, ShoppingCart, Mail } from 'lucide-react';
import { 
  getCustomerDetails, 
  Customer, 
  Order 
} from '../../lib/database';
import Header from '../Layout/Header';

interface CustomerDetailPageProps {
  customerId: string;
  onNavigate: (page: string) => void;
}

const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({ customerId, onNavigate }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [favoriteOrder, setFavoriteOrder] = useState<string>('');
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerDetails();
  }, [customerId]);

  const loadCustomerDetails = async () => {
    try {
      setLoading(true);
      const details = await getCustomerDetails(customerId);
      setCustomer(details.customer);
      setOrders(details.orders);
      setLoyaltyPoints(details.loyaltyPoints);
      setTotalSpent(details.totalSpent);
      setFavoriteOrder(details.favoriteOrder || 'No favorite order yet');
      setRecentOrder(details.recentOrder || null);
    } catch (error) {
      console.error('Error loading customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="text-lg">Loading customer details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="text-lg text-red-600">Customer not found</div>
            <Button onClick={() => onNavigate('admin-customers')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} hideLogo={true} />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => onNavigate('admin-customers')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
          <div className="flex-1" />
          <Button onClick={loadCustomerDetails} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {/* Customer Header */}
        <Card className="mb-6 shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shadow-inner">
                <span className="font-semibold text-2xl text-orange-600 dark:text-orange-300">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{customer.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email}</span>
                  {customer.phone && (
                    <>
                      <span>•</span>
                      <span>{customer.phone}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{loyaltyPoints} Loyalty Points</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime value
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loyaltyPoints}</div>
              <p className="text-xs text-muted-foreground">
                1 point per £10 spent
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(customer.created_at).toLocaleDateString('en-GB', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Customer since
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent and Favorite Orders */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Recent Order */}
          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardHeader>
              <CardTitle>Most Recent Order</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrder ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Order #{recentOrder.id}</span>
                    <Badge className={getStatusColor(recentOrder.status)}>
                      {recentOrder.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>{new Date(recentOrder.order_date).toLocaleDateString()}</div>
                    <div>Total: £{recentOrder.total.toFixed(2)}</div>
                  </div>
                  {recentOrder.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Notes:</span> {recentOrder.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent orders
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorite Order */}
          <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
            <CardHeader>
              <CardTitle>Favorite Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium">{favoriteOrder}</div>
                  <div className="text-sm text-muted-foreground">
                    Most frequently ordered item
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-border/80 transition-colors bg-background/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">Order #{order.id}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>{new Date(order.order_date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2">
                          <span>Total:</span>
                          <span className="font-medium">£{order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {orders.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground pt-4">
                    Showing 10 of {orders.length} orders
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No orders found for this customer
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
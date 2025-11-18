import React, { useState, useEffect } from 'react';
import { Tabs } from '../ui/vercel-tabs';
import MenuPage from '../Menu/MenuPage';
import OrderHistory from '../Orders/OrderHistory';
import LoyaltyPage from './LoyaltyPage';
import OnFriesLogo from '@/images/OnFries-Logo.png';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Settings, Sun, Moon, Star, DollarSign, ShoppingBag, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import CartDrawer from '../Cart/CartDrawer';
import { Component as FloatingAuthModal } from '../ui/sign-in-flo';
import { getCustomerDetails } from '../../lib/database';

interface PromotionalBanner {
  enabled: boolean;
  title: string;
  message: string;
  backgroundColor: string;
  textColor: string;
}

interface CustomerDashboardProps {
  initialTab?: string;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ initialTab = 'menu' }) => {
   const [selectedTab, setSelectedTab] = React.useState(initialTab);
   const { user, logout } = useAuth();
   const { getItemCount, isCartOpen, openCart, closeCart } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [promotionalBanner, setPromotionalBanner] = useState<PromotionalBanner>({
    enabled: false,
    title: '',
    message: '',
    backgroundColor: '#ff6b35',
    textColor: '#ffffff'
  });
  const [customerStats, setCustomerStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    loyaltyPoints: 0,
    favoriteOrder: '',
    recentOrder: null as any
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setIsDarkMode(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  useEffect(() => {
    loadPromotionalBanner();
  }, []);

  const loadPromotionalBanner = () => {
    try {
      const settings = localStorage.getItem('adminSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        if (parsedSettings.promotionalBanner) {
          setPromotionalBanner(parsedSettings.promotionalBanner);
        }
      }
    } catch (error) {
      console.error('Error loading promotional banner settings:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
  };

  const handleNavigateToOrders = () => {
    setSelectedTab('orders');
  };

  useEffect(() => {
    if (user && selectedTab === 'profile') {
      loadCustomerData();
    }
  }, [user, selectedTab]);

  const loadCustomerData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Try to get customer details, but fall back to auth user data if no customer record exists
      try {
        const details = await getCustomerDetails(user.id);
        setCustomerStats({
          totalSpent: details.totalSpent,
          totalOrders: details.orders.length,
          loyaltyPoints: details.loyaltyPoints,
          favoriteOrder: details.favoriteOrder || 'No favorite order yet',
          recentOrder: details.recentOrder
        });
      } catch (customerError) {
        // If customer details fail, use auth user data with empty stats
        console.log('No customer record found, using auth user data');
        setCustomerStats({
          totalSpent: 0,
          totalOrders: 0,
          loyaltyPoints: 0,
          favoriteOrder: 'No orders yet',
          recentOrder: null
        });
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
      // Set default values on error
      setCustomerStats({
        totalSpent: 0,
        totalOrders: 0,
        loyaltyPoints: 0,
        favoriteOrder: 'No orders yet',
        recentOrder: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-background relative" style={{ marginRight: '-5px', paddingRight: '5px', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      {/* Promotional Banner */}
      {promotionalBanner.enabled && (
        <div
          className="py-2 px-4 text-center"
          style={{
            backgroundColor: promotionalBanner.backgroundColor,
            color: promotionalBanner.textColor
          }}
        >
          <div className="container mx-auto">
            <p className="text-sm font-bold" dangerouslySetInnerHTML={{ __html: promotionalBanner.message }} />
          </div>
        </div>
      )}

      {/* Logo Section */}
      <div className="bg-background pt-[10px] pb-[5px]">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="text-center mb-6">
              <img
                src={OnFriesLogo}
                alt="OnFries Logo"
                className="mx-auto w-48 h-auto mb-4 md:mb-4 pt-[60px] md:pt-0"
              />
              <div className="mb-8">
                <Tabs
                  tabs={[
                    { id: "menu", label: "Menu" },
                    { id: "orders", label: "Orders" },
                    ...(user ? [{ id: "loyalty", label: "Loyalty" }] : []),
                    { id: "profile", label: "Profile" }
                  ]}
                  onTabChange={(tabId) => setSelectedTab(tabId)}
                />
              </div>
            </div>

            {/* Controls aligned to right edge */}
            <div className="absolute top-0 right-0 flex items-center gap-4">
              {/* Theme Toggle */}
              <div
                className="cursor-pointer p-2 hover:bg-accent rounded-md"
                onClick={toggleTheme}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </div>

              {/* Cart Button */}
              <div
                className="cursor-pointer p-2 relative hover:bg-accent rounded-md"
                onClick={openCart}
                data-cart-icon
              >
                <ShoppingCart className="h-4 w-4" />
                {getItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getItemCount()}
                  </Badge>
                )}
              </div>

              {user ? (
                // Show user avatar and dropdown when authenticated
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary dark:bg-gray-700 dark:text-white">
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {}}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Show sign up/sign in buttons when not authenticated
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-4">
        <div className="container mx-auto px-4">
          {selectedTab === 'menu' && <MenuPage />}
          {selectedTab === 'orders' && <OrderHistory />}
          {selectedTab === 'loyalty' && user && <LoyaltyPage />}
          {selectedTab === 'profile' && (
            <div className="max-w-7xl mx-auto px-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-lg">Loading customer data...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Customer Profile Header */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center dark:bg-orange-900 flex-shrink-0">
                          <span className="font-semibold text-2xl text-orange-600 dark:text-orange-300">
                            {user?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-foreground text-left">{user?.name}</h1>
                            <p className="text-sm text-muted-foreground text-left">{user?.email}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">{customerStats.loyaltyPoints} Loyalty Points</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          Total Spent
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold">£{customerStats.totalSpent.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Lifetime value
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          Total Orders
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold">{customerStats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          All time orders
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          Loyalty Points
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold">{customerStats.loyaltyPoints}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          1 point per £10 spent
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Member Since
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold text-lg">
                          {user ? new Date(user.created_at || Date.now()).toLocaleDateString('en-GB', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Customer since
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent and Favorite Orders */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Recent Order */}
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Most Recent Order</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {customerStats.recentOrder ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Order #{customerStats.recentOrder.id}</span>
                              <Badge variant="outline" className="text-xs">
                                {customerStats.recentOrder.status}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground text-sm">
                              <div className="mb-1">{new Date(customerStats.recentOrder.order_date).toLocaleDateString()}</div>
                              <div className="font-medium">Total: £{customerStats.recentOrder.total.toFixed(2)}</div>
                            </div>
                            {customerStats.recentOrder.notes && (
                              <div className="text-sm">
                                <span className="font-medium">Notes:</span> {customerStats.recentOrder.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">No recent orders</p>
                            <p className="text-xs">Start ordering to see your order history here</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Favorite Order */}
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Favorite Order</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <Star className="w-6 h-6 text-yellow-500" />
                          <div>
                            <div className="font-semibold">{customerStats.favoriteOrder}</div>
                            <div className="text-muted-foreground text-xs">
                              Most frequently ordered item
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account Information */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                          <div className="font-medium">{user?.name}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                          <div className="font-medium">{user?.email}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Type</label>
                          <div className="font-medium">{user?.role || 'Customer'}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer ID</label>
                          <div className="font-mono text-sm">{user?.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        onNavigateToOrders={handleNavigateToOrders}
      />

      {/* Floating Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute -top-4 -right-4 z-[60] w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent text-xl"
            >
              ×
            </button>
            <div className="max-h-[90vh] overflow-y-auto">
              <FloatingAuthModal onClose={() => setIsAuthModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
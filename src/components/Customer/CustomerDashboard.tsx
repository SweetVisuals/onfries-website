import React, { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Tabs } from '../ui/vercel-tabs';
import MenuPage from '../Menu/MenuPage';
import OrderHistory from '../Orders/OrderHistory';
import OnFriesLogo from '@/images/OnFriesLogo.webp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import CartDrawer from '../Cart/CartDrawer';

const CustomerDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState('menu');
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setIsDarkMode(theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 text-center">
        <div className="container mx-auto">
          <p className="text-lg font-bold">TODAY'S DEAL: £1 STEAK AND CHIPS - USE CODE STEAK AT CHECKOUT</p>
        </div>
      </div>

      {/* Logo Section */}
      <div className="bg-background py-8 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <img src={OnFriesLogo} alt="OnFries Logo" className="mx-auto w-64 h-auto mb-2" />
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our menu and manage your orders
            </p>
          </div>

          {/* Top Right Controls - Positioned absolutely */}
          <div className="absolute top-4 right-4 flex items-center gap-4">
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
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              {getItemCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {getItemCount()}
                </Badge>
              )}
            </div>

            {/* User Avatar and Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-center">
            <Tabs
              tabs={[
                { id: "menu", label: "Menu" },
                { id: "orders", label: "Orders" }
              ]}
              onTabChange={(tabId) => setSelectedTab(tabId)}
            />
          </div>

          {selectedTab === 'menu' && <MenuPage />}
          {selectedTab === 'orders' && <OrderHistory />}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default CustomerDashboard;
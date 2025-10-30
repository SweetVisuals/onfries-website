import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Settings, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import AuthModal from '../Auth/AuthModal';
import CartDrawer from '../Cart/CartDrawer';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  return (
    <>
      <header className="bg-white shadow-md border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Foodie</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Button
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => onNavigate('home')}
              >
                Home
              </Button>
              <Button
                variant={currentPage === 'menu' ? 'default' : 'ghost'}
                onClick={() => onNavigate('menu')}
              >
                Menu
              </Button>
              {user?.role === 'admin' && (
                <Button
                  variant={currentPage === 'admin' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('admin')}
                >
                  Admin Dashboard
                </Button>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="w-4 h-4" />
                {getItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getItemCount()}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onNavigate('profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    {user.role === 'customer' && (
                      <DropdownMenuItem onClick={() => onNavigate('orders')}>
                        <History className="w-4 h-4 mr-2" />
                        Order History
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onNavigate('settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setIsAuthModalOpen(true)}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
};

export default Header;
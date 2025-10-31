import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Layout/Header';
import LandingPage from './components/Landing/LandingPage';
import MenuPage from './components/Menu/MenuPage';
import OrderHistory from './components/Orders/OrderHistory';
import AdminDashboard from './components/Admin/AdminDashboard';
import CustomerDashboard from './components/Customer/CustomerDashboard';
import { Component as SignInForm } from './components/ui/sign-in-flo';
import './App.css';

function AppContent() {
   const { user, isLoading } = useAuth();
   const [currentPage, setCurrentPage] = useState('customer');

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role after authentication
      if (user.isAdmin) {
        setCurrentPage('admin');
      } else {
        setCurrentPage('customer');
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // No need to set default page here - CustomerDashboard handles authentication internally

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage />;
      case 'menu':
        return <MenuPage />;
      case 'orders':
        return <OrderHistory />;
      case 'admin':
        return <AdminDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      case 'profile':
        return (
          <div className="min-h-screen bg-background py-8 flex items-center justify-center">
            <p className="text-xl text-muted-foreground">Profile page - Coming soon!</p>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen bg-background py-8 flex items-center justify-center">
            <p className="text-xl text-muted-foreground">Settings page - Coming soon!</p>
          </div>
        );
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main>
        {renderCurrentPage()}
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
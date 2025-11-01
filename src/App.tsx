import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from './components/Landing/LandingPage';
import MenuPage from './components/Menu/MenuPage';
import OrderHistory from './components/Orders/OrderHistory';
import AdminDashboard from './components/Admin/AdminDashboard';
import CustomerDashboard from './components/Customer/CustomerDashboard';
import CustomerDetailPage from './components/Admin/CustomerDetailPage';
import './App.css';

function AppContent() {
    const { user, isLoading } = useAuth();
    const [currentPage, setCurrentPage] = useState('customer');

  useEffect(() => {
    // Check for hash-based navigation (e.g., customer-detail:123)
    const hash = window.location.hash;
    if (hash.startsWith('#customer-detail:')) {
      const customerId = hash.replace('#customer-detail:', '');
      setCurrentPage(`customer-detail:${customerId}`);
      return;
    }

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
        return <AdminDashboard onNavigate={setCurrentPage} />;
      case 'customer':
        return <CustomerDashboard />;
      case 'customer-detail':
        return <CustomerDetailPage customerId={currentPage.split(':')[1]} onBack={() => setCurrentPage('admin')} />;
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
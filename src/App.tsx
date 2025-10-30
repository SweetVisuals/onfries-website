import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Layout/Header';
import LandingPage from './components/Landing/LandingPage';
import MenuPage from './components/Menu/MenuPage';
import OrderHistory from './components/Orders/OrderHistory';
import AdminDashboard from './components/Admin/AdminDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'menu':
        return <MenuPage />;
      case 'orders':
        return <OrderHistory />;
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return (
          <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
            <p className="text-xl text-gray-600">Profile page - Coming soon!</p>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
            <p className="text-xl text-gray-600">Settings page - Coming soon!</p>
          </div>
        );
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-white">
          <Header onNavigate={setCurrentPage} currentPage={currentPage} />
          <main>
            {renderCurrentPage()}
          </main>
          <Toaster />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
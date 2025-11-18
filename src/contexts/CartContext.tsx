import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../data/menuData';
import { CustomerCoupon } from '../lib/database';

export interface CartItem extends MenuItem {
  quantity: number;
  addOns?: { item: MenuItem; quantity: number }[];
  drinks?: { item: MenuItem; quantity: number }[];
}

interface CartContextType {
   items: CartItem[];
   appliedCoupon: CustomerCoupon | null;
   isCartOpen: boolean;
   addItem: (item: MenuItem) => void;
   removeItem: (itemId: string) => void;
   updateQuantity: (itemId: string, quantity: number) => void;
   clearCart: () => void;
   applyCoupon: (coupon: CustomerCoupon) => void;
   removeCoupon: () => void;
   openCart: () => void;
   closeCart: () => void;
   getTotal: () => number;
   getDiscountedTotal: () => number;
   getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [items, setItems] = useState<CartItem[]>([]);
   const [appliedCoupon, setAppliedCoupon] = useState<CustomerCoupon | null>(null);
   const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
    const storedCoupon = localStorage.getItem('appliedCoupon');
    if (storedCoupon) {
      setAppliedCoupon(JSON.parse(storedCoupon));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);

  const addItem = (item: MenuItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (coupon: CustomerCoupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountedTotal = () => {
    let total = getTotal();

    if (appliedCoupon && appliedCoupon.coupon) {
      const coupon = appliedCoupon.coupon;
      switch (coupon.type) {
        case 'free_item':
          // For simplicity, assume free item discount is a fixed amount
          // In a real implementation, you'd check if the free item is in cart
          total -= parseFloat(coupon.value) || 0;
          break;
        case 'percent_off':
          total -= total * (parseFloat(coupon.value) / 100);
          break;
        case 'bogo':
          // Simplified BOGO logic - 50% off the cheapest item
          const sortedItems = [...items].sort((a, b) => a.price - b.price);
          if (sortedItems.length > 0) {
            total -= sortedItems[0].price * sortedItems[0].quantity * 0.5;
          }
          break;
        case 'min_order_discount':
          if (total >= parseFloat(coupon.value)) {
            total -= parseFloat(coupon.value.split(',')[1] || '0'); // amount,discount format
          }
          break;
      }
    }

    return Math.max(0, total); // Ensure total doesn't go negative
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      appliedCoupon,
      isCartOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      openCart,
      closeCart,
      getTotal,
      getDiscountedTotal,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
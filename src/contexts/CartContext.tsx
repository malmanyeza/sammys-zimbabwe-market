import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModals } from '@/components/auth/AuthModals';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number; image: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getCartTotal: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { openSignInModal, AuthModalsComponent } = useAuthModals();

  const addItem = (product: { id: string; name: string; price: number; image: string }) => {
    if (!isAuthenticated) {
      openSignInModal();
      return;
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { ...product, quantity: 1 }];
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      getCartTotal,
      clearCart 
    }}>
      {children}
      <AuthModalsComponent />
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

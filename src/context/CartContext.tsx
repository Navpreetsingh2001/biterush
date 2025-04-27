"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { CartItem, MenuItem } from '@/types'; // Use type import
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void; // Add function to clear cart
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { toast } = useToast(); // Initialize toast

  // Load cart from localStorage on initial render (client-side only)
  useEffect(() => {
    const storedCart = localStorage.getItem('campusGrubCart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
           setCartItems(parsedCart);
        }
      } catch (error) {
         console.error("Failed to parse cart from localStorage", error);
         localStorage.removeItem('campusGrubCart'); // Clear invalid data
      }
    }
  }, []);

  // Update totals and save to localStorage whenever cartItems changes
  useEffect(() => {
    const newTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const newTotalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalItems(newTotalItems);
    setTotalPrice(newTotalPrice);

    // Persist cart to localStorage (client-side only)
    if (typeof window !== 'undefined') {
        localStorage.setItem('campusGrubCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (itemToAdd: MenuItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...itemToAdd, quantity: 1 }];
      }
    });
     toast({ // Add toast notification
            title: "Item Added",
            description: `${itemToAdd.name} added to your cart.`,
        });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
        const itemToRemove = prevItems.find(item => item.id === itemId);
        const updatedItems = prevItems.filter(item => item.id !== itemId);
        if (itemToRemove) {
           toast({
                title: "Item Removed",
                description: `${itemToRemove.name} removed from your cart.`,
                variant: "destructive",
            });
        }
        return updatedItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
        setCartItems([]);
        toast({
            title: "Cart Cleared",
            description: "Your cart has been emptied.",
        });
    };


  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

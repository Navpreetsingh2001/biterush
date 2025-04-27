
"use client";

import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast"; // Import useToast

// Define the shape of a menu item
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  foodCourtId: string;
  foodCourtName: string;
  imageUrl?: string; // Optional image URL
}

// Define the shape of an item in the cart (extends MenuItem and adds quantity)
export interface CartItem extends MenuItem {
  quantity: number;
}

// Define the shape of the Cart Context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  deliveryLocation: string | null;
  setDeliveryLocation: (location: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [deliveryLocation, setDeliveryLocationState] = useState<string | null>(null); // Internal state for location
  const { toast } = useToast(); // Initialize toast

  // Load cart and location from localStorage on initial render (client-side only)
  useEffect(() => {
    // Check window existence for SSR safety
    if (typeof window !== 'undefined') {
        const storedCart = localStorage.getItem('campusGrubCart');
        if (storedCart) {
          try {
            const parsedCart: unknown = JSON.parse(storedCart);
            if (Array.isArray(parsedCart)) {
               // Basic validation (can be improved)
               const validCart = parsedCart.filter((item): item is CartItem =>
                 typeof item === 'object' &&
                 item !== null &&
                 typeof item.id === 'string' &&
                 typeof item.name === 'string' &&
                 typeof item.price === 'number' &&
                 typeof item.quantity === 'number' && item.quantity > 0
               );
               setCartItems(validCart);
            }
          } catch (error) {
             console.error("Failed to parse cart from localStorage", error);
             localStorage.removeItem('campusGrubCart'); // Clear invalid data
          }
        }

        const storedLocation = localStorage.getItem('campusGrubLocation');
        if (storedLocation) {
            setDeliveryLocationState(storedLocation);
        }
    }
  }, []);

  // Update totals and save cart to localStorage whenever cartItems changes
  useEffect(() => {
    const newTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const newTotalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalItems(newTotalItems);
    setTotalPrice(newTotalPrice);

    // Persist cart to localStorage (client-side only)
    // Check window existence for SSR safety
    if (typeof window !== 'undefined') {
        localStorage.setItem('campusGrubCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

   // Save location to localStorage whenever deliveryLocation changes
   useEffect(() => {
     // Check window existence for SSR safety
    if (typeof window !== 'undefined') {
        if (deliveryLocation) {
            localStorage.setItem('campusGrubLocation', deliveryLocation);
        } else {
            localStorage.removeItem('campusGrubLocation'); // Remove if null
        }
    }
  }, [deliveryLocation]);


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
        setDeliveryLocationState(null); // Clear location when cart is cleared
        toast({
            title: "Cart Cleared",
            description: "Your cart has been emptied.",
        });
    };

  const setDeliveryLocation = (location: string) => {
      if(location.trim() === "") {
           setDeliveryLocationState(null);
            toast({
                title: "Location Cleared",
                description: "Delivery location removed.",
                variant: "destructive",
            });
           return;
      }
      setDeliveryLocationState(location);
      toast({
            title: "Location Updated",
            description: `Delivery location set to: ${location}`,
        });
  };


  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, deliveryLocation, setDeliveryLocation }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the Cart Context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

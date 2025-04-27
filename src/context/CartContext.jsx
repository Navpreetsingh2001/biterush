
"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
// Removed type imports for CartItem, MenuItem, ReactNode
import { useToast } from "@/hooks/use-toast"; // Import useToast

// Removed CartContextType interface

const CartContext = createContext(undefined); // Removed type annotation

// Removed type annotation for props
export const CartProvider = ({ children }) => {
  // Removed type annotations for state variables
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryLocation, setDeliveryLocationState] = useState(null); // Internal state for location
  const { toast } = useToast(); // Initialize toast

  // Load cart and location from localStorage on initial render (client-side only)
  useEffect(() => {
    // Check window existence for SSR safety
    if (typeof window !== 'undefined') {
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


  const addToCart = (itemToAdd) => { // Removed type annotation
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

  const removeFromCart = (itemId) => { // Removed type annotation
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

  const updateQuantity = (itemId, quantity) => { // Removed type annotations
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

  const setDeliveryLocation = (location) => { // Removed type annotation
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

// Removed return type annotation
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

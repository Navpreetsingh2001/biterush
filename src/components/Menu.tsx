
"use client"; // Mark as a Client Component

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from 'react'; // Keep client-side hooks
import { useCart, type MenuItem } from '@/context/CartContext'; // Import useCart hook and MenuItem type
import { ShoppingCart, Sandwich, Pizza, Salad, Utensils, Loader2 } from 'lucide-react'; // Replaced Burger with Sandwich, added Loader2
import Image from 'next/image'; // Import Image component
import { gsap } from 'gsap'; // Import GSAP

// Mock data fetching and details are now handled server-side in the page component

const getCategoryIcon = (category: string): JSX.Element => {
  switch (category.toLowerCase()) {
    case 'burger':
      return <Sandwich className="h-6 w-6 text-amber-600" />;
    case 'pizza':
      return <Pizza className="h-6 w-6 text-red-600" />;
    case 'salad':
      return <Salad className="h-6 w-6 text-green-600" />;
    case 'sandwich':
       return <Sandwich className="h-6 w-6 text-yellow-700" />;
    default:
      return <Utensils className="h-6 w-6 text-muted-foreground" />;
  }
};

interface MenuProps {
  foodCourtId: string;
  initialMenuItems: MenuItem[]; // Receive initial data from server component
  initialFoodCourtName: string; // Receive initial data from server component
}

const Menu: FC<MenuProps> = ({ foodCourtId, initialMenuItems, initialFoodCourtName }) => {
   // Initialize state with props, manage loading state locally for animations/UI feedback
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [foodCourtName, setFoodCourtName] = useState<string>(initialFoodCourtName);
  const [isLoading, setIsLoading] = useState<boolean>(!initialMenuItems); // Start loading only if no initial data
  const { addToCart } = useCart(); // Get addToCart function from context
  const gridRef = useRef<HTMLDivElement>(null); // Ref for the grid container

   // Effect to update state if props change (e.g., navigation between menus without full page reload)
   useEffect(() => {
    setMenuItems(initialMenuItems);
    setFoodCourtName(initialFoodCourtName);
    setIsLoading(!initialMenuItems); // Update loading state based on new props
  }, [initialMenuItems, initialFoodCourtName]);


  // GSAP Stagger Animation Effect for Menu Items
  useEffect(() => {
    // Run animation only when not loading and items are present
    if (!isLoading && gridRef.current && menuItems.length > 0) {
      const cards = gridRef.current.querySelectorAll<HTMLDivElement>('.menu-item-card');
       // GSAP Context for cleanup
      const ctx = gsap.context(() => {
         // Initial state (hidden and slightly scaled down)
         gsap.set(cards, { autoAlpha: 0, scale: 0.95, y: 10, visibility: 'visible' });

         // Stagger animation
         gsap.to(cards, {
           autoAlpha: 1,
           scale: 1,
           y: 0,
           duration: 0.4,
           stagger: 0.08, // Stagger the animation for each card
           ease: "power2.out",
           delay: 0.1 // Small delay after loading
         });
      }, gridRef); // Scope context to the grid

       return () => ctx.revert(); // Cleanup GSAP animations on unmount or when menu items change
    } else if (gridRef.current) {
        // If loading or no items, ensure cards are hidden
         const cards = gridRef.current.querySelectorAll<HTMLDivElement>('.menu-item-card');
         gsap.set(cards, { visibility: 'hidden' });
    }
  }, [isLoading, menuItems]); // Re-run animation when loading finishes or menuItems change

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item); // Use context function to add item (imageUrl is already part of item)
  };

  // Show loading indicator if isLoading is true
  if (isLoading) {
    return (
        <div className="text-center p-10 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading menu for {initialFoodCourtName || 'selected food court'}...</p>
        </div>
    );
  }

  // This condition is less likely needed now as the parent page handles missing data,
  // but kept as a fallback.
   if (!foodCourtId || menuItems.length === 0) {
        return <div className="text-center p-10 text-muted-foreground">Menu not available for this food court.</div>;
    }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Menu for {foodCourtName}</h2>
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> {/* Increased gap */}
        {menuItems.map((item, index) => ( // Added index for priority logic
          <Card
            key={item.id}
            className="menu-item-card flex flex-col hover:shadow-lg transition-shadow duration-200 overflow-hidden invisible" // Add class and start invisible
             style={{ visibility: 'hidden' }} // Start hidden
            >
            {/* Add Image component here */}
            {item.imageUrl && (
              <div className="relative w-full h-40"> {/* Fixed height for image container */}
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={index < 3} // Prioritize loading the first few images
                  loading={index < 3 ? 'eager': 'lazy'} // Load first few eagerly
                />
              </div>
            )}
            <CardHeader className="pt-4"> {/* Adjusted padding */}
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                 </div>
                 {getCategoryIcon(item.category)}
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end pt-2 pb-4 px-4"> {/* Adjusted padding */}
              <p className="font-semibold text-lg mb-3">₹{item.price.toFixed(2)}</p> {/* Changed $ to ₹ */}
              <Button className="w-full mt-auto" onClick={() => handleAddToCart(item)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Menu;

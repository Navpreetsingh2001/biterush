
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Loader2 } from "lucide-react"; // Added Loader2
import { useRouter } from 'next/navigation'; // Import useRouter
import { useEffect, useRef } from 'react'; // Import useEffect and useRef
import { gsap } from 'gsap'; // Import GSAP

// Export the type so it can be used in the parent component
export interface FoodCourt {
  id: string;
  name: string;
  description: string;
}

interface FoodCourtListProps {
  block: string;
  foodCourts: FoodCourt[]; // Accept food courts as props
  isLoading: boolean; // Accept loading state as props
}

const FoodCourtList: FC<FoodCourtListProps> = ({ block, foodCourts, isLoading }) => {
  const router = useRouter(); // Initialize router
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the container div

  // Mock data is now fetched in the parent component (Home)

  // GSAP Stagger Animation Effect
  useEffect(() => {
     // Run animation only when not loading and food courts are available
    if (!isLoading && containerRef.current && foodCourts.length > 0) {
      const cards = containerRef.current.querySelectorAll<HTMLDivElement>('.food-court-card');
       // GSAP Context for cleanup
      const ctx = gsap.context(() => {
         // Initial state (hidden and slightly down)
         // Important: Ensure elements are visible before animation if previously hidden
         gsap.set(cards, { autoAlpha: 0, y: 30, visibility: 'visible' });


         // Stagger animation
         gsap.to(cards, {
           autoAlpha: 1,
           y: 0,
           duration: 0.5,
           stagger: 0.1, // Stagger the animation for each card
           ease: "power3.out",
           // Delay slightly to ensure elements are ready and visible
           delay: 0.1 // Reduced delay as data fetching delay is separate
         });
      }, containerRef); // Scope context to the container

       return () => ctx.revert(); // Cleanup GSAP animations on unmount or block change
    } else if (containerRef.current) {
        // If loading or no items, ensure cards are hidden to avoid flash of unstyled content
         const cards = containerRef.current.querySelectorAll<HTMLDivElement>('.food-court-card');
         gsap.set(cards, { visibility: 'hidden' }); // Use visibility instead of autoAlpha to prevent layout shifts
    }
  }, [block, foodCourts, isLoading]); // Re-run animation when block, foodCourts, or isLoading changes


  // Function to handle navigation
  const handleViewMenuClick = (foodCourtId: string) => {
    router.push(`/menu/${foodCourtId}`); // Navigate to the dynamic menu page
  };

  return (
    <div ref={containerRef} className="mb-8 min-h-[200px] relative"> {/* Add min-height and relative positioning */}
      <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Food Courts in {block}</h2>
      {isLoading ? (
         <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <span className="ml-2">Loading Food Courts...</span>
         </div>
      ) : foodCourts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodCourts.map((foodCourt) => (
            <Card
              key={foodCourt.id}
              className="food-court-card hover:shadow-lg transition-shadow duration-200 flex flex-col invisible" // Start invisible for GSAP
              style={{ visibility: 'hidden' }} // Start hidden, GSAP will make it visible
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                 <Building className="w-8 h-8 text-primary" />
                 <div>
                  <CardTitle>{foodCourt.name}</CardTitle>
                  <CardDescription>{foodCourt.description}</CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <Button className="w-full" onClick={() => handleViewMenuClick(foodCourt.id)}>
                  View Menu
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <p className="text-muted-foreground text-center py-10">No food courts found in this block.</p>
      )}
    </div>
  );
};

export default FoodCourtList;
// Export the type again at the bottom for clarity (optional, but good practice)
export type { FoodCourt };

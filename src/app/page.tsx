
"use client";

import type { FC } from 'react';
import BlockSelection from '@/components/BlockSelection';
import FoodCourtList from '@/components/FoodCourtList';
import Hero from '@/components/Hero'; // Import the new Hero component
import FeedbackSection from '@/components/FeedbackSection'; // Import FeedbackSection
import { useState, useRef, useEffect } from 'react';
import type { FoodCourt } from '@/components/FoodCourtList'; // Import type

// Mock data fetching function (simulates server-side fetching)
// In a real app, this would fetch from an API or database
const fetchFoodCourtsForBlock = async (blockId: string): Promise<FoodCourt[]> => {
  // Mock data - same as in FoodCourtList.tsx
  const allFoodCourts: Record<string, FoodCourt[]> = {
    "Block A": [
      { id: "fc1a", name: "The Hungry Ram", description: "Quick bites and snacks" },
      { id: "fc2a", name: "Green Leaf Cafe", description: "Salads and healthy options" }
    ],
    "Block B": [
      { id: "fc1b", name: "Pizza Point", description: "Classic pizzas and sides" },
      { id: "fc2b", name: "Curry Corner", description: "Authentic Indian cuisine" }
    ],
    "Block C": [
      { id: "fc1c", name: "Burger Hub", description: "Gourmet burgers and fries" },
      { id: "fc2c", name: "Noodle Bar", description: "Asian stir-fries and soups" }
    ],
    "Block D": [
      { id: "fc1d", name: "Sub Station", description: "Customizable sandwiches" },
      { id: "fc2d", name: "Coffee Stop", description: "Coffee, pastries, and light meals" }
    ],
  };
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate 100ms delay
  return allFoodCourts[blockId] || [];
};


const Home: FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [foodCourts, setFoodCourts] = useState<FoodCourt[]>([]);
  const [isLoadingFoodCourts, setIsLoadingFoodCourts] = useState<boolean>(false);
  const foodCourtListRef = useRef<HTMLDivElement>(null); // Ref for the food court list section

  // Effect to fetch food courts when block changes
  useEffect(() => {
    if (selectedBlock) {
      setIsLoadingFoodCourts(true);
      fetchFoodCourtsForBlock(selectedBlock)
        .then(data => {
          setFoodCourts(data);
          setIsLoadingFoodCourts(false);
          // Scroll after data is loaded
          // Consider a slight delay to ensure elements are in the DOM
          setTimeout(() => {
             if (foodCourtListRef.current && typeof window !== 'undefined' && !window.location.hash) {
                foodCourtListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }
          }, 100); // Adjust delay if needed

        })
        .catch(error => {
          console.error("Failed to fetch food courts:", error);
          setIsLoadingFoodCourts(false);
          setFoodCourts([]); // Clear food courts on error
        });
    } else {
      setFoodCourts([]); // Clear if no block selected
    }
  }, [selectedBlock]);



  return (
    <> {/* Use Fragment instead of div */}
      <Hero /> {/* Add the Hero section here */}
      {/* Add id="block-selection" to this div */}
      <div id="block-selection">
         <h1 className="text-3xl font-bold mb-6 text-center md:text-left text-primary">Order Food on Campus</h1>
        <BlockSelection
          selectedBlock={selectedBlock} // Pass selected block state
          onBlockSelect={(block: string) => {
            setSelectedBlock(block);
            // Data fetching and scrolling are handled by useEffect
          }}
        />
      </div>

      {/* Wrap FoodCourtList in a div and attach the ref */}
      <div ref={foodCourtListRef}>
        {selectedBlock && (
          <FoodCourtList
             block={selectedBlock}
             foodCourts={foodCourts} // Pass fetched data
             isLoading={isLoadingFoodCourts} // Pass loading state
           />
        )}
      </div>

       {/* Move the Feedback Section here, to be rendered last in the main content */}
       <FeedbackSection />
    </>
  );
}

export default Home;

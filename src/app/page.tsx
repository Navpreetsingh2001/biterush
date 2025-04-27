
"use client";

import type { FC } from 'react';
import BlockSelection from '@/components/BlockSelection'; // Corrected import path if necessary
import FoodCourtList from '@/components/FoodCourtList';
import Hero from '@/components/Hero'; // Import the new Hero component
import { useState, useRef, useEffect } from 'react';

const Home: FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const foodCourtListRef = useRef<HTMLDivElement>(null); // Ref for the food court list section

  // Scroll to the food court list when a block is selected
  useEffect(() => {
    if (selectedBlock && foodCourtListRef.current) {
      // Check if the navigation wasn't triggered by the back button with a hash
      if (typeof window !== 'undefined' && !window.location.hash) {
        foodCourtListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedBlock]); // Dependency array ensures this runs when selectedBlock changes

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
            // No need to reset food court state here anymore
          }}
        />
      </div>
      {/* Wrap FoodCourtList in a div and attach the ref */}
      <div ref={foodCourtListRef}>
        {selectedBlock && (
          // FoodCourtList will now handle navigation internally
          <FoodCourtList block={selectedBlock} />
        )}
      </div>
      {/* Removed Menu component rendering from here */}
    </>
  );
}

export default Home;
